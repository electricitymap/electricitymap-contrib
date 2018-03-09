#!/usr/bin/env python3
import re
from ast import literal_eval

import arrow
from requests import Session
from .lib import zonekey
from .lib import web
from operator import itemgetter

station_map = {
    "hydro": ["Ukai  (Hydro)", "Kadana (Hydro)", "SSP(RBPH)"],
    "thermal": ["Ukai(3-5)+Ukai6", "Wanakbori", "Gandhinagar", "Sikka(3-4)", "KLTPS(1-3)+KLTPS4",
                "SLPP(I+II)", "Akrimota", "JHANOR"],
    "wind": ["GMR"],
    "gas": ["Utran(Gas)(II)", "Dhuvaran (Gas)(I)+(II)", "GIPCL(I)", "GIPCL(II)", "GSEG(I+II)", "GPPC", "CLPI",
            "KAWAS", "Sugen+ Unosgn"],
    "nuclear": ["KAPP"],
    "coal": ["TPAECo", "EPGL(I+II)", "Adani(I+II+III)", "BECL(I+II)", "CGPL"]
}


def fetch_data(zone_key, session=None, logger=None):
    zonekey.assert_zone_key(zone_key, 'IN-GJ')

    solar_html = web.get_response_soup(
        zone_key, 'https://www.sldcguj.com/RealTimeData/GujSolar.php', session)
    wind_html = web.get_response_soup(
        zone_key, 'https://www.sldcguj.com/RealTimeData/wind.php', session)

    india_date = arrow.get(
        solar_html.find_all('tr')[0].text.split('\t')[-1].strip() + ' Asia/Kolkata',
        ['DD-MM-YYYY H:m:s ZZZ', 'D-MM-YYYY H:m:s ZZZ'])

    solar_value = float(literal_eval(solar_html.find_all('tr')[-1].find_all('td')[-1].text.strip()))
    wind_value = float(literal_eval(wind_html.find_all('tr')[-1].find_all('td')[-1].text.strip()))

    hydro_value = thermal_value = gas_value = coal_value = 0.0

    value_map = {
        "date": india_date.datetime,
        "solar": solar_value,
        "hydro": hydro_value,
        "thermal": thermal_value,
        "wind": wind_value,
        "gas": gas_value,
        "coal": coal_value
    }

    cookies_params = {
        'ASPSESSIONIDSUQQQTRD': 'ODMNNHADJFGCMLFFGFEMOGBL',
        'PHPSESSID': 'a301jk6p1p8d50dduflceeg6l1'
    }

    # other_html = requests.get('https://www.sldcguj.com/RealTimeData/RealTimeDemand.php', params=cookies_params)
    rows = web.get_response_soup(zone_key, 'https://www.sldcguj.com/RealTimeData/RealTimeDemand.php',
                                 session).find_all('tr')

    for row in rows:
        if len(row.find_all('td')) > 3:
            v1, v2 = (re.sub(r'[\n\t\r]', r'', x.text.strip()) for x in itemgetter(*[0, 3])(row.find_all('td')))
            energy_type = [k for k, v in station_map.items() if v1 in v]
            if len(energy_type) > 0:
                value_map[energy_type[0]] += float(literal_eval(v2))
        elif len(row.find_all('td')) == 3:
            v1, v2 = (re.sub(r'[\n\t\r]', r'', x.text.strip()) for x in itemgetter(*[0, 2])(row.find_all('td')))
            energy_type = [k for k, v in station_map.items() if v1 in v]
            if len(energy_type) > 0:
                value_map[energy_type[0]] += float(literal_eval(v2))
            if v1 == 'Gujarat Catered':
                value_map['total consumption'] = float(literal_eval(v2.split(' ')[0]))

    return value_map


def fetch_production(zone_key='IN-GJ', session=None, target_datetime=None, logger=None):
    """
    Method to get production data of Gujarat
    :param zone_key:
    :param session:
    :return:
    """
    if target_datetime:
        raise NotImplementedError('This parser is not yet able to parse past dates')

    value_map = fetch_data(zone_key, session, logger=logger)

    data = {
        'zoneKey': zone_key,
        'datetime': value_map['date'],
        'production': {
            'biomass': None,
            'coal': value_map['coal'],
            'gas': value_map['gas'],
            'hydro': value_map['hydro'],
            'nuclear': None,
            'oil': None,
            'solar': value_map['solar'],
            'wind': value_map['wind'],
            'geothermal': None,
            'unknown': None
        },
        'storage': {
            'hydro': None
        },
        'source': 'sldcguj.com',
    }

    return data


def fetch_consumption(zone_key='IN-GJ', session=None, target_datetime=None, logger=None):
    """
    Method to get consumption data of Gujarat
    :param zone_key:
    :param session:
    :return:
    """
    if target_datetime:
        raise NotImplementedError('This parser is not yet able to parse past dates')

    value_map = fetch_data(zone_key, session)

    data = {
        'zoneKey': zone_key,
        'datetime': value_map['date'],
        'consumption': value_map['total consumption'],
        'source': 'sldcguj.com'
    }

    return data


if __name__ == '__main__':
    session = Session()
    print(fetch_production('IN-GJ', session))
    print(fetch_consumption('IN-GJ', session))
