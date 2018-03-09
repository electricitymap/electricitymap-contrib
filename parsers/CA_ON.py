#!/usr/bin/env python3

# The arrow library is used to handle datetimes
import arrow
# The request library is used to fetch content through HTTP
import requests

from bs4 import BeautifulSoup

MAP_GENERATION = {
    'BIOFUEL': 'biomass',
    'GAS': 'gas',
    'HYDRO': 'hydro',
    'NUCLEAR': 'nuclear',
    'SOLAR': 'solar',
    'WIND': 'wind'
}

timezone = 'Canada/Eastern'


def fetch_production(zone_key='CA-ON', session=None, target_datetime=None, logger=None):
    """Requests the last known production mix (in MW) of a given country

    Arguments:
    zone_key (optional) -- used in case a parser is able to fetch multiple countries
    session (optional)      -- request session passed in order to re-use an existing session

    Return:
    A dictionary in the form:
    {
      'zoneKey': 'FR',
      'datetime': '2017-01-01T00:00:00Z',
      'production': {
          'biomass': 0.0,
          'coal': 0.0,
          'gas': 0.0,
          'hydro': 0.0,
          'nuclear': null,
          'oil': 0.0,
          'solar': 0.0,
          'wind': 0.0,
          'geothermal': 0.0,
          'unknown': 0.0
      },
      'storage': {
          'hydro': -10.0,
      },
      'source': 'mysource.com'
    }
    """
    if target_datetime:
        raise NotImplementedError('This parser is not yet able to parse past dates')
    
    r = session or requests.session()
    url = 'http://www.ieso.ca/-/media/files/ieso/uploaded/chart/generation_fuel_type_multiday.xml?la=en'
    response = r.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    data = {}

    start_datetime = arrow.get(
        arrow.get(soup.find_all('startdate')[0].contents[0]).datetime, timezone)

    # Iterate over all datasets (production types)
    for item in soup.find_all('dataset'):
        key = item.attrs['series']
        for rowIndex, row in enumerate(item.find_all('value')):
            if not len(row.contents):
                continue
            if rowIndex not in data:
                data[rowIndex] = {
                    'datetime': start_datetime.replace(hours=+rowIndex).datetime,
                    'zoneKey': zone_key,
                    'production': {
                        'coal': 0
                    },
                    'storage': {},
                    'source': 'ieso.ca',
                }
            data[rowIndex]['production'][MAP_GENERATION[key]] = \
                float(row.contents[0])

    return [data[k] for k in sorted(data.keys())]


def fetch_price(zone_key='CA-ON', session=None, target_datetime=None, logger=None):
    """Requests the last known power price of a given country

    Arguments:
    zone_key (optional) -- used in case a parser is able to fetch multiple countries
    session (optional)      -- request session passed in order to re-use an existing session

    Return:
    A dictionary in the form:
    {
      'zoneKey': 'FR',
      'currency': EUR,
      'datetime': '2017-01-01T00:00:00Z',
      'price': 0.0,
      'source': 'mysource.com'
    }
    """
    if target_datetime:
        raise NotImplementedError('This parser is not yet able to parse past dates')

    r = session or requests.session()
    url = 'http://www.ieso.ca/-/media/files/ieso/uploaded/chart/price_multiday.xml?la=en'
    response = r.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    data = {}

    start_datetime = arrow.get(
        arrow.get(soup.find_all('startdate')[0].contents[0]).datetime, timezone)

    # Iterate over all datasets (production types)
    for item in soup.find_all('dataset'):
        key = item.attrs['series']
        if key != 'HOEP':
            continue
        for rowIndex, row in enumerate(item.find_all('value')):
            if not len(row.contents):
                continue
            if rowIndex not in data:
                data[rowIndex] = {
                    'datetime': start_datetime.replace(hours=+rowIndex).datetime,
                    'zoneKey': zone_key,
                    'currency': 'CAD',
                    'source': 'ieso.ca',
                }
            data[rowIndex]['price'] = \
                float(row.contents[0])

    return [data[k] for k in sorted(data.keys())]

    return data


def fetch_exchange(zone_key1, zone_key2, session=None, target_datetime=None, logger=None):
    """Requests the last known power exchange (in MW) between two countries

    Arguments:
    zone_key (optional) -- used in case a parser is able to fetch multiple countries
    session (optional)      -- request session passed in order to re-use an existing session

    Return:
    A dictionary in the form:
    {
      'sortedZoneKeys': 'DK->NO',
      'datetime': '2017-01-01T00:00:00Z',
      'netFlow': 0.0,
      'source': 'mysource.com'
    }
    """
    if target_datetime:
        raise NotImplementedError('This parser is not yet able to parse past dates')

    r = session or requests.session()
    url = 'http://live.gridwatch.ca/WebServices/GridWatchWebApp.asmx/GetHomeViewData_v2'
    response = r.get(url)
    obj = response.json()
    exchanges = obj['intertieLineData']

    sortedZoneKeys = '->'.join(sorted([zone_key1, zone_key2]))
    # Everything -> CA_ON corresponds to an import to ON
    # In the data, "net" represents an export
    # So everything -> CA_ON must be reversed
    if sortedZoneKeys == 'CA-MB->CA-ON':
        keys = ['MANITOBA', 'MANITOBA SK']
        direction = -1
    elif sortedZoneKeys == 'CA-ON->US-NY':
        keys = ['NEW-YORK']
        direction = 1
    elif sortedZoneKeys == 'CA-ON->US-MISO':
        keys = ['MICHIGAN', 'MINNESOTA']
        direction = 1
    elif sortedZoneKeys == 'CA-ON->CA-QC':
        keys = filter(lambda k: k[:2] == 'PQ', exchanges.keys())
        direction = 1
    else:
        raise NotImplementedError('This exchange pair is not implemented')

    data = {
        'datetime': max(map(lambda x: arrow.get(arrow.get(
            exchanges[x]['dateReported']).datetime, timezone).datetime, keys)),
        'sortedZoneKeys': sortedZoneKeys,
        'netFlow': sum(map(lambda x: float(exchanges[x]['net'].replace(',', '')), keys)) * direction,
        'source': 'gridwatch.ca'
    }

    return data


if __name__ == '__main__':
    """Main method, never used by the Electricity Map backend, but handy for testing."""

    print('fetch_production() ->')
    print(fetch_production())
    print('fetch_price() ->')
    print(fetch_price())
    print('fetch_exchange("CA-ON", "US-NY") ->')
    print(fetch_exchange("CA-ON", "US-NY"))
