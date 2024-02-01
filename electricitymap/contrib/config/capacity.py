from datetime import datetime
from pathlib import Path

from electricitymap.contrib.config.reading import read_zones_config
from electricitymap.contrib.lib.types import ZoneKey

CONFIG_DIR = Path(__file__).parent.parent.parent.parent.joinpath("config").resolve()

ZONES_CONFIG = read_zones_config(CONFIG_DIR)
# Get productionCapacity source to zones mapping
CAPACITY_PARSER_SOURCE_TO_ZONES: dict[str, list[ZoneKey]] = {}
for zone_id, zone_config in ZONES_CONFIG.items():
    if zone_config.get("parsers", {}).get("productionCapacity") is None:
        continue
    source = zone_config.get("parsers", {}).get("productionCapacity").split(".")[0]
    if source not in CAPACITY_PARSER_SOURCE_TO_ZONES:
        CAPACITY_PARSER_SOURCE_TO_ZONES[source] = []
    CAPACITY_PARSER_SOURCE_TO_ZONES[source].append(zone_id)

ZONE_TO_CAPACITY_PARSER_SOURCE = {
    zone: source
    for source, zones in CAPACITY_PARSER_SOURCE_TO_ZONES.items()
    for zone in zones
}


def get_capacity_data(capacity_config: dict, dt: datetime) -> dict[str, float]:
    """Gets the capacity data for a given zone and datetime from ZONES_CONFIG."""
    capacity = {}
    for mode, capacity_value in capacity_config.items():
        if isinstance(capacity_value, int | float):
            # TODO: This part is used for the old capacity format. It shoud be removed once all capacity configs are updated
            capacity[mode] = capacity_value
        else:
            capacity[mode] = get_capacity_from_dict_or_list(capacity_value, dt)[0]
    return capacity


def get_capacity_data_with_source(
    capacity_config: dict, dt: datetime
) -> dict[str, dict[str, float | str | None]]:
    """Gets the capacity data for a given zone and datetime from ZONES_CONFIG."""
    capacity = {}
    for mode, capacity_value in capacity_config.items():
        if isinstance(capacity_value, int | float):
            # TODO: This part is used for the old capacity format. It shoud be removed once all capacity configs are updated
            capacity[mode] = {"value": capacity_value, "source": None}
        else:
            capacity[mode] = {
                "value": get_capacity_from_dict_or_list(capacity_value, dt)[0],
                "source": get_capacity_from_dict_or_list(capacity_value, dt)[1],
            }

    return capacity


def get_capacity_from_dict_or_list(
    mode_capacity: list | dict, dt: datetime
) -> tuple[float, str] | float | None:
    if isinstance(mode_capacity, dict):
        return (mode_capacity["value"], mode_capacity.get("source", "unknown source"))
    elif isinstance(mode_capacity, list):
        capacity_tuples = [(d["datetime"], d["value"], d.get("source", "unknown source")) for d in mode_capacity]

        if dt.isoformat() <= min(capacity_tuples)[0]:
            return (min(capacity_tuples)[1], min(capacity_tuples)[2])
        else:
            # valid datetime is the max datetime that is lower than the given datetime
            # In other words, it is the most recent value that is valid for the given dt
            max_tuple = max([(d, v, s) for d, v,s in capacity_tuples if d <= dt.isoformat()])
            return (max_tuple[1], max_tuple[2])
