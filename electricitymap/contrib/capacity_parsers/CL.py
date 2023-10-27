from datetime import datetime

import pandas as pd
from bs4 import BeautifulSoup
from requests import Response, Session

from electricitymap.contrib.config import ZoneKey

MODE_MAPPING = {
    "Hídrico": "hydro",
    "Carbón": "unknown",
    "Diésel": "unknown",
    "Gas Natural": "unknown",
    "Eólico": "wind",
    "Solar": "solar",
    "Termosolar": "solar",
    "Geotérmico": "geothermal",
    "Otros*": "unknown",
}


def fetch_production_capacity(zone_key: ZoneKey, target_datetime: datetime) -> dict:
    url = "https://www.coordinador.cl/reportes-y-estadisticas/#Estadisticas"
    r: Response = Session().get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    links = soup.find_all("a", string="[por tecnología (desde 2000)]")
    for link in links:
        if "hist_cap" in link["href"]:
            capacity_link = link["href"]

    df = pd.read_excel(
        capacity_link, sheet_name="Capacidad por Tecnología", header=2, skipfooter=2
    )
    df = df.drop(columns=["Unnamed: 0", "TOTAL"])
    df = df.rename(columns={"Año": "datetime"})
    df = df.melt(id_vars=["datetime"], var_name="mode", value_name="value")
    df["mode"] = df["mode"].apply(lambda x: MODE_MAPPING[x.strip()])

    df = df.groupby(["datetime", "mode"])[["value"]].sum().reset_index()
    if target_datetime.year in df["datetime"].unique():
        df = df.loc[df["datetime"] == target_datetime.year]
        capacity = {}
        for idx, data in df.iterrows():
            mode_capacity = {}
            mode_capacity["datetime"] = target_datetime.strftime("%Y-%m-%d")
            mode_capacity["value"] = round(data["value"], 0)
            mode_capacity["source"] = "coordinador.cl"
            capacity[data["mode"]] = mode_capacity
        print(
            f"Fetched capacity for {zone_key} on {target_datetime.date()}: \n {capacity}"
        )
        return capacity
    else:
        raise ValueError(
            f"{zone_key}: No capacity data available for year {target_datetime.year}"
        )


if __name__ == "__main__":
    fetch_production_capacity("CL-SEN", datetime(2022, 1, 1))