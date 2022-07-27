"""
Israel's electricity system load parser.

Source: Israel Electric Corporation
URL: https://www.iec.co.il/en/pages/default.aspx

Shares of Electricity production in 2019:
    64.0% Gas
    31.0% Coal
    1.0% oil,
    4.0% Renewables
    (source: IEA; https://www.iea.org/data-and-statistics?country=ISRAEL&fuel=Electricity%20and%20heat&indicator=Electricity%20generation%20by%20source)

Israel's electricity system capacity parser.
Source: IRENA
URL: https://pxweb.irena.org/pxweb/en/IRENASTAT/IRENASTAT__Power%20Capacity%20and%20Generation/ELECCAP_2022_cycle2.px/
"""

from logging import getLogger
import re

import arrow
import numpy as np
import pandas as pd
from bs4 import BeautifulSoup
from requests import get, post

logger = getLogger(__name__)

IEC_URL = "www.iec.co.il"
IEC_PRODUCTION = (
    "https://www.iec.co.il/_layouts/iec/applicationpages/lackmanagment.aspx"
)
IEC_PRICE = "https://www.iec.co.il/homeclients/pages/tariffs.aspx"
IRENA_CAPACITY_URL = "https://pxweb.irena.org:443/api/v1/en/IRENASTAT/Power Capacity and Generation/ELECCAP_2022_cycle2.px"
IRENA_SOLAR_THERMAL_QUERY = {
    "query": [
        {"code": "Country/area", "selection": {"filter": "item", "values": ["ISR"]}},
        {"code": "Technology", "selection": {"filter": "item", "values": ["1"]}},
        {"code": "Grid connection", "selection": {"filter": "item", "values": ["0"]}},
    ],
    "response": {"format": "json"},
}

IRENA_SOLAR_PV_QUERY = {
    "query": [
        {"code": "Country/area", "selection": {"filter": "item", "values": ["ISR"]}},
        {"code": "Technology", "selection": {"filter": "item", "values": ["0"]}},
        {"code": "Grid connection", "selection": {"filter": "item", "values": ["0"]}},
    ],
    "response": {"format": "json"},
}

TZ = "Asia/Jerusalem"


def fetch_IRENA_capacity(irena_url: str, irena_query: str) -> pd.DataFrame:
    """Fetch renewable capacity from IRENA API"""
    # Request data from IRENA
    response = post(url=irena_url, json=irena_query)
    response_json = response.json()
    # Format json to human readable list
    data = [[item["key"][3]] + item["values"] for item in response_json["data"]]
    # Convert to pandas dataframe
    df = pd.DataFrame(
        data,
        columns=["year", "capacity"],
    )
    # Convert to numeric
    df.replace("..", np.nan, inplace=True)
    df["year"] = df["year"].astype(int) + 2000
    df["capacity"] = df["capacity"].astype(float)
    return df


def fetch_all() -> list:
    """Fetch info from IEC dashboard."""
    first = get(IEC_PRODUCTION)
    first.cookies
    second = get(IEC_PRODUCTION, cookies=first.cookies)
    soup = BeautifulSoup(second.content, "lxml")

    values: list = soup.find_all("span", class_="statusVal")
    if len(values) == 0:
        raise ValueError("Could not parse IEC dashboard")
    del values[1]

    cleaned_list = []
    for value in values:
        value = re.findall("\d+", value.text.replace(",", ""))
        cleaned_list.append(value)

    def flatten_list(_2d_list) -> list:
        """Flatten the list."""
        flat_list = []
        for element in _2d_list:
            if type(element) is list:
                for item in element:
                    flat_list.append(item)
            else:
                flat_list.append(element)
        return flat_list

    return flatten_list(cleaned_list)


def fetch_price(zone_key="IL", session=None, target_datetime=None, logger=None) -> dict:
    """Fetch price from IEC table."""
    if target_datetime is not None:
        raise NotImplementedError("This parser is not yet able to parse past dates")

    with get(IEC_PRICE) as response:
        soup = BeautifulSoup(response.content, "lxml")

    price = soup.find("td", class_="ms-rteTableEvenCol-6")

    return {
        "zoneKey": zone_key,
        "currency": "NIS",
        "datetime": extract_price_date(soup),
        "price": float(price.p.text),
        "source": IEC_URL,
    }


def extract_price_date(soup):
    """Fetch updated price date."""
    span_soup = soup.find("span", lang="HE")
    if span_soup:
        date_str = span_soup.text
    else:
        raise ValueError("Could not parse IEC price date")
    date_str = date_str.split(sep=" - ")
    date_str = date_str.pop(1)

    date = arrow.get(date_str, "DD.MM.YYYY").datetime

    return date


def fetch_production(
    zone_key="IL", session=None, target_datetime=None, logger=None
) -> dict:

    data = {"zoneKey": zone_key, "datetime": arrow.now(TZ).datetime}

    # fetch pv capacity from IRENA

    try:
        assert (
            post(url=IRENA_CAPACITY_URL, json=IRENA_SOLAR_PV_QUERY).status_code == 200
        ), "IRENA solar PV url is not accessible"
        if target_datetime:
            data["datetime"] = arrow.get(target_datetime).datetime
        solar_pv = fetch_IRENA_capacity(
            irena_url=IRENA_CAPACITY_URL, irena_query=IRENA_SOLAR_PV_QUERY
        )

    except AssertionError:
        solar_pv = pd.DataFrame()

    # fetch  solar thermal capacity from IRENA
    try:
        assert (
            post(url=IRENA_CAPACITY_URL, json=IRENA_SOLAR_THERMAL_QUERY).status_code
            == 200
        ), "IRENA solar thermal url is not accessible"
        if target_datetime:
            data["datetime"] = arrow.get(target_datetime).datetime
        solar_thermal = fetch_IRENA_capacity(
            irena_url=IRENA_CAPACITY_URL, irena_query=IRENA_SOLAR_THERMAL_QUERY
        )
    except AssertionError:
        solar_thermal = pd.DataFrame()

    solar = pd.concat([solar_pv, solar_thermal]).groupby("year").sum()

    # load solar capacity to data
    try:
        data["capacity"] = {"solar": solar.loc[data["datetime"].year, "capacity"]}
    except KeyError:
        logger.warning(
            f"Solar capacity for {zone_key} at {data['datetime']} not available"
        )

    # fetch production from IEC

    try:
        assert (
            get(IEC_PRODUCTION).status_code == 200
        ), "IEC production url is not accessible"
        # current production parser is not able to parse past dates
        if target_datetime:
            raise NotImplementedError("This parser is not yet able to parse past dates")
        production_data = fetch_all()
        production = [float(item) for item in production_data]
        # all mapped to unknown as there is no available breakdown
        data["production"] = {"unknown": production[0] + production[1]}

    except AssertionError:
        logger.warning(f"{zone_key} production url not fetched ")

    return data


def fetch_consumption(
    zone_key="IL", session=None, target_datetime=None, logger=None
) -> dict:
    if target_datetime:
        raise NotImplementedError("This parser is not yet able to parse past dates")

    data = fetch_all()
    consumption = [float(item) for item in data]

    # all mapped to unknown as there is no available breakdown
    return {
        "zoneKey": zone_key,
        "datetime": arrow.now(TZ).datetime,
        "consumption": consumption[0],
        "source": IEC_URL,
    }


if __name__ == "__main__":
    """Main method, never used by the Electricity Map backend, but handy for testing."""
    print("fetch_production() ->")
    print(fetch_production())
    print("fetch_consumption() ->")
    print(fetch_consumption())
    print("fetch_price() ->")
    print(fetch_price())
