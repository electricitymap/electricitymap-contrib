import { addMinutes } from 'date-fns';

import constructTopos from '../helpers/topos';
import * as translation  from '../helpers/translation';

import exchangesConfig from '../../../config/exchanges.json';
import zonesConfig from '../../../config/zones.json';

console.log('Using History Feature reducer!');

// ** Prepare initial zone data
const zones = constructTopos();
Object.entries(zonesConfig).forEach((d) => {
  const [key, zoneConfig] = d;
  const zone = zones[key];
  if (!zone) {
    console.warn(`Zone ${key} from configuration is not found. Ignoring..`);
    return;
  }
  // copy attributes ("capacity", "contributors"...)
  zone.capacity = zoneConfig.capacity;
  zone.contributors = zoneConfig.contributors;
  zone.timezone = zoneConfig.timezone;
  zone.shortname = translation.getZoneNameWithCountry(key);
  zone.hasParser = (zoneConfig.parsers || {}).production !== undefined;
  zone.hasData = zone.hasParser;
  zone.delays = zoneConfig.delays;
  zone.disclaimer = zoneConfig.disclaimer;
});
// Add id to each zone
Object.keys(zones).forEach((k) => { zones[k].countryCode = k; });

// ** Prepare initial exchange data
const exchanges = Object.assign({}, exchangesConfig);
Object.entries(exchanges).forEach((entry) => {
  const [key, value] = entry;
  value.countryCodes = key.split('->').sort();
  if (key.split('->')[0] !== value.countryCodes[0]) {
    console.warn(`Exchange sorted key pair ${key} is not sorted alphabetically`);
  }
});

const initialDataState = {
  // Here we will store data items
  grid: { zones, exchanges },
  hasConnectionWarning: false,
  hasInitializedGrid: false,
  histories: {},
  isLoadingHistories: false,
  isLoadingGrid: false,
  isLoadingSolar: false,
  isLoadingWind: false,
  solar: null,
  wind: null,
  solarDataError: null,
  windDataError: null,
};

const reducer = (state = initialDataState, action) => {
  switch (action.type) {
    case 'GRID_DATA_FETCH_REQUESTED': {
      return { ...state, hasConnectionWarning: false, isLoadingGrid: true };
    }

    case 'GRID_DATA_FETCH_SUCCEEDED': {
      // Create new grid object
      const newGrid = Object.assign({}, {
        zones: Object.assign({}, state.grid.zones),
        exchanges: Object.assign({}, state.grid.exchanges),
      });
      // Create new state
      const newState = Object.assign({}, state);
      newState.grid = newGrid;

      // Reset histories that expired
      newState.histories = Object.assign({}, state.histories);
      Object.keys(state.histories).forEach((k) => {
        const history = state.histories[k];
        const lastHistoryMoment = new Date(history.at(-1).stateDatetime);
        const stateMoment = new Date(action.payload.datetime);
        if (addMinutes(lastHistoryMoment, 15) < stateMoment) {
          delete newState.histories[k];
        }
      });

      // Set date
      newGrid.datetime = action.payload.datetime;

      // Reset all data we want to update (for instance, not maxCapacity)
      Object.keys(newGrid.zones).forEach((key) => {
        const zone = Object.assign({}, newGrid.zones[key]);
        zone.co2intensity = undefined;
        zone.fossilFuelRatio = undefined;
        zone.fossilFuelRatioProduction = undefined;
        zone.renewableRatio = undefined;
        zone.renewableRatioProduction = undefined;
        zone.exchange = {};
        zone.production = {};
        zone.productionCo2Intensities = {};
        zone.productionCo2IntensitySources = {};
        zone.dischargeCo2Intensities = {};
        zone.dischargeCo2IntensitySources = {};
        zone.storage = {};
        zone.source = undefined;
        newGrid.zones[key] = zone;
      });
      Object.keys(newGrid.exchanges).forEach((key) => {
        newGrid.exchanges[key].netFlow = undefined;
      });

      // Populate with realtime country data
      Object.entries(action.payload.countries).forEach((entry) => {
        const [zoneId, zoneHistory] = entry;
        const zone = newGrid.zones[zoneId];
        if (!zone) {
          console.warn(`${zoneId} has no zone configuration. Ignoring..`);
          return;
        }


        const lastValue = zoneHistory.at(-1);
        // Assign data from payload
        Object.keys(lastValue).forEach((k) => {
          // Warning: k takes all values, even those that are not meant
          // to be updated (like maxCapacity)
          zone[k] = lastValue[k];
        });

        const zoneHistoryWithAdditionalFields = zoneHistory.map(z => ({...z, hasDetailedData: false, hasData: zones[zoneId].hasParser, hasParser: zones[zoneId].hasParser}))
        newState.histories[zoneId] = zoneHistoryWithAdditionalFields;


        // Set date
        zone.datetime = action.payload.datetime;

        const hasNoData = !zone.production || Object.values(zone.production).every(v => v === null);
        if (hasNoData) {
          return;
        }

        // By default hasData is only true if there is a parser - here we overwrite that value
        // if there is data despite no parser (for CONSTRUCT_BREAKDOWN estimation models)
        zone.hasData = zone.hasParser || !hasNoData;
      });


      // Populate exchange pairs for exchange layer
      Object.entries(action.payload.exchanges).forEach((entry) => {
        const [key, value] = entry;
        const exchange = newGrid.exchanges[key];
        if (!exchange || !exchange.lonlat) {
          console.warn(`Missing exchange configuration for ${key}. Ignoring..`);
          return;
        }
        // Assign all data
        Object.keys(value).forEach((k) => {
          exchange[k] = value[k];
        });
      });

      newState.hasInitializedGrid = true;
      newState.isLoadingGrid = false;
      return newState;
    }

    case 'GRID_DATA_FETCH_FAILED': {
      // TODO: Implement error handling
      return { ...state, hasConnectionWarning: true, isLoadingGrid: false };
    }

    case 'ZONE_HISTORY_FETCH_REQUESTED': {
      return { ...state, isLoadingHistories: true };
    }

    case 'ZONE_HISTORY_FETCH_SUCCEEDED': {
      return {
        ...state,
        isLoadingHistories: false,
        histories: {
          ...state.histories,
          [action.zoneId]: action.payload.map(datapoint => ({
            ...datapoint,
            hasDetailedData: true,
            hasData: !Object.values(datapoint.production).every(v => v === null)
          })),
        },
      };
    }

    case 'ZONE_HISTORY_FETCH_FAILED': {
      // TODO: Implement error handling
      return { ...state, isLoadingHistories: false };
    }

    case 'SOLAR_DATA_FETCH_REQUESTED': {
      return { ...state, isLoadingSolar: true, solarDataError: null };
    }

    case 'SOLAR_DATA_FETCH_SUCCEEDED': {
      return { ...state, isLoadingSolar: false, solar: action.payload };
    }

    case 'SOLAR_DATA_FETCH_FAILED': {
      // TODO: create specialized messages based on http error response
      return { ...state, isLoadingSolar: false, solar: null, solarDataError: translation.translate('solarDataError') };
    }

    case 'WIND_DATA_FETCH_REQUESTED': {
      return { ...state, isLoadingWind: true, windDataError: null };
    }

    case 'WIND_DATA_FETCH_SUCCEEDED': {
      return { ...state, isLoadingWind: false, wind: action.payload };
    }

    case 'WIND_DATA_FETCH_FAILED': {
      // TODO: create specialized messages based on http error response
      return { ...state, isLoadingWind: false, wind: null, windDataError: translation.translate('windDataError') };
    }

    default:
      return state;
  }
};

export default reducer;
