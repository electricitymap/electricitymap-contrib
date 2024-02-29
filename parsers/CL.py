#!/usr/bin/env python3

"""Parser for the electricity grid of Chile"""


from collections import defaultdict
from datetime import datetime, timedelta
from logging import Logger, getLogger
from operator import itemgetter
from zoneinfo import ZoneInfo

from requests import Session

from parsers.lib.config import refetch_frequency

from .lib.exceptions import ParserException
from .lib.validation import validate

# Historical API
API_BASE_URL = "https://sipub.coordinador.cl/api/v1/recursos/generacion_centrales_tecnologia_horario?"
# Live API
API_BASE_URL_LIVE_TOT = "http://panelapp.coordinadorelectrico.cl/api/chart/demanda"
API_BASE_URL_LIVE_REN = "http://panelapp.coordinadorelectrico.cl/api/chart/ernc"  # ERNC = energias renovables no convencionales

TIMEZONE = ZoneInfo("Chile/Continental")

# Live parser disabled because of a insuffcient breakdown of Unknown.
# It lumps Hydro & Geothermal into unknown which makes it difficult to calculate a proper CFE%/co2 intensity
# We can reenable if we find a way to get the Hydro production
ENABLE_LIVE_PARSER = False

TYPE_MAPPING = {
    "hidraulica": "hydro",
    "termica": "unknown",
    "eolica": "wind",
    "solar": "solar",
    "geotermica": "geothermal",
}


def get_data_live(session: Session | None, logger: Logger):
    """Requests live generation data in json format."""

    s = session or Session()
    json_total = s.get(API_BASE_URL_LIVE_TOT).json()
    json_ren = s.get(API_BASE_URL_LIVE_REN).json()

    return json_total, json_ren


def production_processor_live(json_tot, json_ren):
    """
    Extracts generation data and timestamp into dictionary.
    Returns a list of dictionaries for all of the available "live" data, usually that day.
    """

    gen_total = json_tot["data"][0]["values"]

    if json_ren["data"][1]["key"] == "ENERGÍA SOLAR":
        rawgen_sol = json_ren["data"][1]["values"]
    else:
        raise ParserException(
            "CL.py",
            f"Unexpected data label. Expected 'ENERGÍA SOLAR' and got {json_ren['data'][1]['key']}",
            "CL",
        )

    if json_ren["data"][0]["key"] == "ENERGÍA EÓLICA":
        rawgen_wind = json_ren["data"][0]["values"]
    else:
        raise ParserException(
            "CL.py",
            f"Unexpected data label. Expected 'ENERGÍA EÓLICA' and got {json_ren['data'][0]['key']}",
            "CL",
        )

    mapped_totals = []

    for total in gen_total:
        datapoint = {}

        dt = total[0]
        for pair in rawgen_sol:
            if pair[0] == dt:
                solar = pair[1]
                break
        for pair in rawgen_wind:
            if pair[0] == dt:
                wind = pair[1]
                break

        datapoint["datetime"] = datetime.fromtimestamp(dt / 1000, tz=TIMEZONE)
        datapoint["unknown"] = total[1] - wind - solar
        datapoint["wind"] = wind
        datapoint["solar"] = solar
        mapped_totals.append(datapoint)

    return mapped_totals


def production_processor_historical(raw_data):
    """Takes raw json data and groups by datetime while mapping generation to type.
    Returns a list of dictionaries.
    """

    clean_datapoints = []
    for datapoint in raw_data:
        clean_datapoint = {}
        date, hour = datapoint["fecha"], datapoint["hora"]
        hour -= 1  # `hora` starts at 1
        parsed_datetime = datetime.fromisoformat(date).replace(
            tzinfo=TIMEZONE
        ) + timedelta(hours=hour)
        clean_datapoint["datetime"] = parsed_datetime

        gen_type_es = datapoint["tipo_central"]
        mapped_gen_type = TYPE_MAPPING[gen_type_es]
        value_mw = float(datapoint["generacion_sum"])

        clean_datapoint[mapped_gen_type] = value_mw

        clean_datapoints.append(clean_datapoint)

    combined = defaultdict(dict)
    for elem in clean_datapoints:
        combined[elem["datetime"]].update(elem)

    ordered_data = sorted(combined.values(), key=itemgetter("datetime"))

    if ENABLE_LIVE_PARSER:
        # For consistency with live API, hydro and geothermal must be squeezed into unknown
        for datapoint in ordered_data:
            if "unknown" not in datapoint:
                datapoint["unknown"] = 0
            if "hydro" in datapoint:
                datapoint["unknown"] += datapoint["hydro"]
                del datapoint["hydro"]
            if "geothermal" in datapoint:
                datapoint["unknown"] += datapoint["geothermal"]
                del datapoint["geothermal"]

    return ordered_data


@refetch_frequency(timedelta(days=1))
def fetch_production(
    zone_key: str = "CL-SEN",
    session: Session | None = None,
    target_datetime: datetime | None = None,
    logger: Logger = getLogger(__name__),
):
    if target_datetime is None and ENABLE_LIVE_PARSER:
        gen_tot, gen_ren = get_data_live(session, logger)

        processed_data = production_processor_live(gen_tot, gen_ren)

        data = []

        for production_data in processed_data:
            dt = production_data.pop("datetime")

            datapoint = {
                "zoneKey": zone_key,
                "datetime": dt,
                "production": production_data,
                "storage": {
                    "hydro": None,
                },
                "source": "coordinadorelectrico.cl",
            }
            datapoint = validate(datapoint, logger, remove_negative=True, floor=1000)

            data.append(datapoint)

        return data

    if target_datetime:
        target_datetime_aware = target_datetime.replace(tzinfo=TIMEZONE)
    else:
        target_datetime_aware = datetime.now(tz=TIMEZONE)
    start = (target_datetime_aware + timedelta(days=-1)).date().isoformat()
    end = target_datetime_aware.date().isoformat()

    date_component = f"fecha__gte={start}&fecha__lte={end}"

    # required for access
    headers = {
        "Referer": "https://www.coordinador.cl/operacion/graficos/operacion-real/generacion-real-del-sistema/",
        "Origin": "https://www.coordinador.cl",
    }

    s = session or Session()
    url = API_BASE_URL + date_component

    req = s.get(url, headers=headers)
    raw_data = req.json()["aggs"]
    processed_data = production_processor_historical(raw_data)

    data = []
    for production_data in processed_data:
        dt = production_data.pop("datetime")

        datapoint = {
            "zoneKey": zone_key,
            "datetime": dt,
            "production": production_data,
            "storage": {
                "hydro": None,
            },
            "source": "coordinador.cl",
        }

        data.append(datapoint)

    return data[:-9]
    """The last 9 datapoints should be omitted because they usually are incomplete and shouldn't appear on the map."""


if __name__ == "__main__":
    """Main method, never used by the Electricity Map backend, but handy for testing."""
    print("fetch_production() ->")
    print(fetch_production())
    # For fetching historical data instead, try:
    print(fetch_production(target_datetime=datetime.strptime("20200220", "%Y%m%d")))
