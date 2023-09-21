# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot

snapshots = Snapshot()

snapshots["test_production[PH-LU] 1"] = [
    {
        "datetime": "2023-09-13T23:00:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5637.4225,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 645.5,
            "oil": 27.8338,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 8.4,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:05:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5628.8619,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 645.5,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 9.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:10:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5579.0433,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 645.5,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 9.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:15:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5530.5807,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 645.5,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 10.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:20:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5496.31,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 645.5,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 10.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:25:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5469.13,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 644.8,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 9.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:30:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5445.12,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 644.8,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 9.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:35:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5424.35,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 639.8,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 8.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:40:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5403.3,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 639.8,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 8.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:45:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5386.1,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 639.8,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 8.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:50:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5351.7597,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 639.8,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 8.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
    {
        "datetime": "2023-09-13T23:55:00+08:00",
        "production": {
            "biomass": 34.9,
            "coal": 5351.6,
            "gas": 2628.4,
            "geothermal": 484.0,
            "hydro": 639.8,
            "oil": 0.0,
            "solar": 0.0,
            "unknown": 50.0,
            "wind": 9.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0, "hydro": 306.0},
        "zoneKey": "PH-LU",
    },
]

snapshots["test_production[PH-MI] 1"] = [
    {
        "datetime": "2023-09-13T23:00:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 1039.0631,
            "geothermal": 83.2,
            "hydro": 645.4,
            "oil": 134.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:05:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 1039.8314,
            "geothermal": 83.2,
            "hydro": 645.4,
            "oil": 134.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:10:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 1024.039,
            "geothermal": 83.2,
            "hydro": 645.4,
            "oil": 134.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:15:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 1030.8,
            "geothermal": 83.2,
            "hydro": 645.4,
            "oil": 125.5,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:20:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 1008.601,
            "geothermal": 83.2,
            "hydro": 645.4,
            "oil": 125.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:25:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 1002.6,
            "geothermal": 83.2,
            "hydro": 645.4,
            "oil": 125.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:30:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 1001.6925,
            "geothermal": 83.2,
            "hydro": 645.4,
            "oil": 125.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:35:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 986.69,
            "geothermal": 83.2,
            "hydro": 645.4,
            "oil": 116.5,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:40:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 976.8124,
            "geothermal": 83.2,
            "hydro": 644.4,
            "oil": 115.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:45:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 961.936,
            "geothermal": 83.2,
            "hydro": 644.4,
            "oil": 115.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:50:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 942.28,
            "geothermal": 83.2,
            "hydro": 644.4,
            "oil": 115.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
    {
        "datetime": "2023-09-13T23:55:00+08:00",
        "production": {
            "biomass": 22.5,
            "coal": 927.1405,
            "geothermal": 83.2,
            "hydro": 644.4,
            "oil": 115.0,
            "solar": 0.0,
            "unknown": 0.0,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -0.0},
        "zoneKey": "PH-MI",
    },
]

snapshots["test_production[PH-VI] 1"] = [
    {
        "datetime": "2023-09-13T23:00:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 984.4905,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 15.8,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 6.3,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:05:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 1008.2105,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 14.8,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 6.3,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:10:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 1018.81,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 14.8,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 6.3,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:15:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 1003.81,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 14.8,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 7.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:20:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 979.31,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 14.8,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 7.4,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:25:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 975.2524,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 15.08,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 7.5,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:30:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 968.0,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 15.77,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 7.3,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:35:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 949.7086,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 16.73,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 7.3,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:40:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 943.0,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 16.7,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 7.3,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:45:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 930.4156,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 16.49,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 7.3,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:50:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 915.65,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 16.85,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 7.3,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
    {
        "datetime": "2023-09-13T23:55:00+08:00",
        "production": {
            "biomass": 31.0,
            "coal": 899.99,
            "geothermal": 309.4,
            "hydro": 15.3,
            "oil": 16.37,
            "solar": 0.0,
            "unknown": 320.0,
            "wind": 7.3,
        },
        "source": "iemop.ph",
        "sourceType": "measured",
        "storage": {"battery": -10.0},
        "zoneKey": "PH-VI",
    },
]
