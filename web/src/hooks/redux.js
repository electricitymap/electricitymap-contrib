import moment from 'moment';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  flatMap,
  keys,
  sortBy,
  uniq,
} from 'lodash';

import { useCustomDatetime } from '../helpers/router';

export function useCurrentZoneHistory() {
  const { zoneId } = useParams();
  const histories = useSelector(state => state.data.histories);

  return useMemo(
    () => histories[zoneId] || [],
    [histories, zoneId],
  );
}

export function useCurrentZoneHistoryDatetimes() {
  const zoneHistory = useCurrentZoneHistory();

  return useMemo(
    () => zoneHistory.map(d => moment(d.stateDatetime).toDate()),
    [zoneHistory],
  );
}

export function useCurrentZoneExchangeKeys() {
  const zoneHistory = useCurrentZoneHistory();
  const isConsumption = useSelector(state => state.application.electricityMixMode === 'consumption');

  return useMemo(
    () => (isConsumption ? sortBy(uniq(flatMap(zoneHistory, d => keys(d.exchange)))) : []),
    [isConsumption, zoneHistory]
  );
}

// Use current time as the end time of the graph time scale explicitly
// as we want to make sure we account for the missing data at the end of
// the graph (when not inferable from historyData timestamps).
export function useCurrentZoneHistoryEndTime() {
  const customDatetime = useCustomDatetime();
  const gridDatetime = useSelector(state => (state.data.grid || {}).datetime);

  return useMemo(
    () => moment(customDatetime || gridDatetime).format(),
    [customDatetime, gridDatetime],
  );
}

// TODO: Likewise, we should be passing an explicit startTime set to 24h
// in the past to make sure we show data is missing at the beginning of
// the graph, but right now that would create UI inconsistency with the
// other neighbouring graphs showing data over a bit longer time scale
// (see https://github.com/tmrowco/electricitymap-contrib/issues/2250).
export function useCurrentZoneHistoryStartTime() {
  return null;
}

export function useCurrentZoneData() {
  const { zoneId } = useParams();
  const zoneHistory = useCurrentZoneHistory();
  const zoneTimeIndex = useSelector(state => state.application.selectedZoneTimeIndex);
  const grid = useSelector(state => state.data.grid);

  return useMemo(
    () => {
      if (!zoneId || !grid) {
        return null;
      }
      if (zoneTimeIndex === null) {
        return grid.zones[zoneId];
      }
      return zoneHistory[zoneTimeIndex];
    },
    [zoneId, zoneHistory, zoneTimeIndex, grid],
  );
}
