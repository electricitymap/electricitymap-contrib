import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { CARBON_GRAPH_LAYER_KEY } from '../helpers/constants';
import { getTooltipPosition } from '../helpers/graph';
import { getCo2Scale } from '../helpers/scales';
import {
  getSelectedZoneHistory,
  getZoneHistoryStartTime,
  getZoneHistoryEndTime,
} from '../selectors';
import { dispatchApplication } from '../store';

import MapCountryTooltip from './tooltips/mapcountrytooltip';
import AreaGraph from './graph/areagraph';

const prepareGraphData = (historyData, colorBlindModeEnabled, electricityMixMode) => {
  if (!historyData || !historyData[0]) return {};

  const co2ColorScale = getCo2Scale(colorBlindModeEnabled);
  const data = historyData.map(d => ({
    [CARBON_GRAPH_LAYER_KEY]: electricityMixMode === 'consumption'
      ? d.co2intensity
      : d.co2intensityProduction,
    datetime: moment(d.stateDatetime).toDate(),
    // Keep a pointer to original data
    meta: d,
  }));
  const layerKeys = [CARBON_GRAPH_LAYER_KEY];
  const layerFill = key => d => co2ColorScale(d.data[key]);
  return { data, layerKeys, layerFill };
};

const mapStateToProps = state => ({
  colorBlindModeEnabled: state.application.colorBlindModeEnabled,
  electricityMixMode: state.application.electricityMixMode,
  startTime: getZoneHistoryStartTime(state),
  endTime: getZoneHistoryEndTime(state),
  historyData: getSelectedZoneHistory(state),
  isMobile: state.application.isMobile,
  selectedTimeIndex: state.application.selectedZoneTimeIndex,
});

const CountryHistoryCarbonGraph = ({
  colorBlindModeEnabled,
  electricityMixMode,
  startTime,
  endTime,
  historyData,
  isMobile,
  selectedTimeIndex,
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(null);

  // Recalculate graph data only when the history data is changed
  const { data, layerKeys, layerFill } = useMemo(
    () => prepareGraphData(historyData, colorBlindModeEnabled, electricityMixMode),
    [historyData, colorBlindModeEnabled, electricityMixMode]
  );

  // Mouse action handlers
  const mouseMoveHandler = useMemo(
    () => (timeIndex, layerIndex, getLayer, marker) => {
      dispatchApplication('selectedZoneTimeIndex', timeIndex);
      setSelectedLayerIndex(0);
      setTooltip({
        zoneData: getLayer(0).datapoints[timeIndex].data.meta,
        position: getTooltipPosition(isMobile, marker),
      });
    },
    [isMobile, setTooltip, setSelectedLayerIndex]
  );
  const mouseOutHandler = useMemo(
    () => () => {
      dispatchApplication('selectedZoneTimeIndex', null);
      setSelectedLayerIndex(null);
      setTooltip(null);
    },
    [setTooltip, setSelectedLayerIndex]
  );

  return (
    <React.Fragment>
      <AreaGraph
        data={data}
        layerKeys={layerKeys}
        layerFill={layerFill}
        startTime={startTime}
        endTime={endTime}
        valueAxisLabel="g / kWh"
        backgroundMouseMoveHandler={mouseMoveHandler}
        backgroundMouseOutHandler={mouseOutHandler}
        layerMouseMoveHandler={mouseMoveHandler}
        layerMouseOutHandler={mouseOutHandler}
        selectedTimeIndex={selectedTimeIndex}
        selectedLayerIndex={selectedLayerIndex}
        isMobile={isMobile}
        height="8em"
      />
      {tooltip && (
        <MapCountryTooltip
          position={tooltip.position}
          zoneData={tooltip.zoneData}
        />
      )}
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(CountryHistoryCarbonGraph);
