#!/usr/bin/env python3
from datetime import datetime, timezone
from logging import Logger, getLogger
from typing import Any
from zoneinfo import ZoneInfo

from bs4 import BeautifulSoup
from requests import Session

from electricitymap.contrib.config import ZoneKey
from electricitymap.contrib.lib.models.event_lists import (
    ExchangeList,
    ProductionBreakdownList,
)
from electricitymap.contrib.lib.models.events import ProductionMix
from parsers.lib.exceptions import ParserException

# The table shown on the "Daily Report" page
# (https://www.nspower.ca/oasis/system-reports-messages/daily-report) is inside
# an iframe which refers to the following URL.
EXCHANGE_URL = (
    "https://resourcesprd-nspower.aws.silvertech.net/oasis/current_report.shtml"
)
LOAD_URL = "https://www.nspower.ca/library/CurrentLoad/CurrentLoad.json"
MIX_URL = "https://www.nspower.ca/library/CurrentLoad/CurrentMix.json"
PARSER = "CA_NS.py"
SOURCE = "nspower.ca"
ZONE_KEY = ZoneKey("CA-NS")


def _parse_timestamp(timestamp: str) -> datetime:
    """
    Construct a datetime object from a date string formatted as, e.g.,
    "/Date(1493924400000)/" by extracting the Unix timestamp 1493924400. Note
    that the three trailing zeros are cut out as well).
    """
    return datetime.fromtimestamp(int(timestamp[6:-5]), tz=timezone.utc)


def fetch_production(
    zone_key: ZoneKey = ZONE_KEY,
    session: Session | None = None,
    target_datetime: datetime | None = None,
    logger: Logger = getLogger(__name__),
) -> list[dict[str, Any]]:
    """Requests the last known production mix (in MW) of a given country."""
    if target_datetime:
        raise ParserException(PARSER, "Unable to fetch historical data", zone_key)

    if zone_key != ZONE_KEY:
        raise ParserException(PARSER, f"Cannot parse zone '{zone_key}'", zone_key)

    # Request data from the source. Skip the first element of each JSON array
    # because the reported base load is always 0 MW.
    session = session or Session()
    loads = {  # A lookup table mapping timestamps to base loads (in MW)
        _parse_timestamp(load["datetime"]): load["Base Load"]
        for load in session.get(LOAD_URL).json()[1:]
    }
    mixes = session.get(MIX_URL).json()[1:]  # Electricity mix breakdowns in %

    production_breakdowns = ProductionBreakdownList(logger)
    for mix in mixes:
        timestamp = _parse_timestamp(mix["datetime"])
        if timestamp in loads:
            load = loads[timestamp]
        else:
            # If a base load corresponding with this timestamp is not found,
            # assume 1244 MW based on the average yearly electricity available
            # for use in 2014 and 2015 (Statistics Canada table 127-0008 for
            # Nova Scotia).
            load = 1244
            logger.warning(
                f"unable to find load for {timestamp}; assuming 1244 MW",
                extra={"key": ZONE_KEY},
            )

        production_mix = ProductionMix()
        production_mix.add_value("biomass", load * mix["Biomass"] / 100)
        production_mix.add_value("coal", load * mix["Solid Fuel"] / 100)
        production_mix.add_value("gas", load * mix["HFO/Natural Gas"] / 100)
        production_mix.add_value("gas", load * mix["LM 6000's"] / 100)
        production_mix.add_value("hydro", load * mix["Hydro"] / 100)
        production_mix.add_value("oil", load * mix["CT's"] / 100)
        production_mix.add_value("wind", load * mix["Wind"] / 100)
        # Sanity checks: verify that reported production doesn't exceed listed
        # capacity by a lot. In particular, we've seen error cases where hydro
        # production ends up calculated as 900 MW which greatly exceeds known
        # capacity of around 520 MW.
        if (
            100 < (production_mix.biomass or 0)
            or 1300 < (production_mix.coal or 0)
            or 700 < (production_mix.gas or 0)
            or 600 < (production_mix.hydro or 0)
            or 300 < (production_mix.oil or 0)
            or 700 < (production_mix.wind or 0)
        ):
            logger.warning(
                f"discarding datapoint at {timestamp} because some mode's "
                f"production is infeasible: {production_mix}",
                extra={"key": ZONE_KEY},
            )
            continue
        production_breakdowns.append(
            datetime=timestamp,
            production=production_mix,
            source=SOURCE,
            zoneKey=ZONE_KEY,
        )

    return production_breakdowns.to_list()


def fetch_exchange(
    zone_key1: ZoneKey,
    zone_key2: ZoneKey,
    session: Session | None = None,
    target_datetime: datetime | None = None,
    logger: Logger = getLogger(__name__),
) -> list[dict[str, Any]]:
    """
    Requests the last known power exchange (in MW) between two regions.
    """
    if target_datetime:
        raise ParserException(PARSER, "Unable to fetch historical data", ZONE_KEY)

    sorted_zone_keys = ZoneKey("->".join(sorted((zone_key1, zone_key2))))
    if sorted_zone_keys not in (ZoneKey("CA-NB->CA-NS"), ZoneKey("CA-NL-NF->CA-NS")):
        raise ParserException(PARSER, "Unimplemented exchange pair", sorted_zone_keys)

    session = session or Session()
    soup = BeautifulSoup(session.get(EXCHANGE_URL).text, "html.parser")

    # Extract the timestamp from the table header.
    timestamp = datetime.strptime(
        soup.find(string="Current System Conditions").find_next("td").em.i.string,
        "%d-%b-%y %H:%M:%S",
    ).replace(tzinfo=ZoneInfo("America/Halifax"))

    # Choose the appropriate exchange figure for the requested zone pair.
    exchange = (
        -float(soup.find(string="NS Export ").find_next("td").string)
        if sorted_zone_keys == ZoneKey("CA-NB->CA-NS")
        else float(soup.find(string="Maritime Link Import ").find_next("td").string)
    )

    exchanges = ExchangeList(logger)
    exchanges.append(
        datetime=timestamp,
        netFlow=exchange,
        source=SOURCE,
        zoneKey=sorted_zone_keys,
    )
    return exchanges.to_list()


if __name__ == "__main__":
    # Never used by the Electricity Map backend, but handy for testing.
    from pprint import pprint

    print("fetch_production() ->")
    pprint(fetch_production())
    print('fetch_exchange("CA-NS", "CA-NB") ->')
    pprint(fetch_exchange("CA-NS", "CA-NB"))
    print('fetch_exchange("CA-NL-NF", "CA-NS") ->')
    pprint(fetch_exchange("CA-NL-NF", "CA-NS"))
