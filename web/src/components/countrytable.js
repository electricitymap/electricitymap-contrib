import React, { useRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { scaleLinear } from 'd3-scale';
import { max as d3Max, min as d3Min } from 'd3-array';
import { precisionPrefix, formatPrefix } from 'd3-format';
import { isFinite } from 'lodash';

import { dispatchApplication } from '../store';
import { getCo2Scale } from '../helpers/scales';
import { modeOrder, modeColor } from '../helpers/constants';
import { getSelectedZoneExchangeKeys } from '../helpers/history';
import { getCurrentZoneData } from '../helpers/redux';
import { flagUri } from '../helpers/flags';
import { __ } from '../helpers/translation';

import NoDataOverlay from './nodataoverlay';

const LABEL_MAX_WIDTH = 102;
const TEXT_ADJUST_Y = 11;
const ROW_HEIGHT = 13;
const PADDING_Y = 7;
const PADDING_X = 5;
const FLAG_SIZE = 16;
const RECT_OPACITY = 0.8;
const X_AXIS_HEIGHT = 15;
const SCALE_TICKS = 4;

function handleRowMouseMove(isMobile, mode, data, ev) {
  // If in mobile mode, put the tooltip to the top of the screen for
  // readability, otherwise float it depending on the cursor position.
  const tooltipPosition = !isMobile
    ? { x: ev.clientX - 7, y: ev.clientY - 7 }
    : { x: 0, y: 0 };
  dispatchApplication('tooltipPosition', tooltipPosition);
  dispatchApplication('tooltipZoneData', data);
  dispatchApplication('tooltipDisplayMode', mode);
}

function handleRowMouseOut() {
  dispatchApplication('tooltipDisplayMode', null);
}

const getSortedProductionData = data => modeOrder
  .map(k => ({ 'mode': k, 'isStorage': k.indexOf('storage') !== -1 }))
  .map((d) => {
    let footprint;
    let storage = d.isStorage ? (data.storage || {})[d.mode.replace(' storage', '')] : undefined;
    const production = !d.isStorage ? (data.production || {})[d.mode] : undefined;
    if (d.isStorage) {
      storage = (data.storage || {})[d.mode.replace(' storage', '')];
      if (storage > 0) {
        // Storage
        footprint = (data.storageCo2Intensities || {})[d.mode.replace(' storage', '')];
      } else {
        // Discharge
        // if (this._data.dischargeCo2Intensities) { debugger }
        footprint = (data.dischargeCo2Intensities || {})[d.mode.replace(' storage', '')];
      }
    } else {
      footprint = (data.productionCo2Intensities || {})[d.mode];
    }
    const capacity = (data.capacity || {})[d.mode];
    return {
      production,
      storage,
      isStorage: d.isStorage,
      capacity,
      mode: d.mode,
      text: __(d.mode),
      gCo2eqPerkWh: footprint,
      gCo2eqPerH: footprint * 1000.0 * Math.max(d.isStorage ? Math.abs(storage) : production, 0),
    };
  });

const RowBackground = ({ width, height, isMobile, data, mode }) => (
  <rect
    y="-1"
    fill="transparent"
    width={width}
    height={height}
    onFocus={ev => handleRowMouseMove(isMobile, mode, data, ev)}
    onMouseOver={ev => handleRowMouseMove(isMobile, mode, data, ev)}
    onMouseMove={ev => handleRowMouseMove(isMobile, mode, data, ev)}
    onMouseOut={handleRowMouseOut}
    onBlur={handleRowMouseOut}
  />
);

const RowLabel = ({ label }) => (
  <text
    className="name"
    style={{ pointerEvents: 'none', textAnchor: 'end' }}
    transform={`translate(${LABEL_MAX_WIDTH - 1.5 * PADDING_Y}, ${TEXT_ADJUST_Y})`}
  >
    {label}
  </text>
);

const HorizontalBar = ({ className, fill, range, scale }) => {
  if (!range) return null;

  return (
    <rect
      className={className}
      height={ROW_HEIGHT}
      height={ROW_HEIGHT}
      opacity={RECT_OPACITY}
      shapeRendering="crispEdges"
      style={{ pointerEvents: 'none' }}
      fill={fill}
      x={LABEL_MAX_WIDTH + scale(range[0])}
      width={scale(range[1]) - scale(range[0])}
    />
  );
};

const UnknownValue = ({ datapoint, scale }) => {
  // const visible = displayByEmissions && getExchangeCo2eq(datapoint) === undefined;
  const visible = (datapoint.capacity === undefined || datapoint.capacity > 0)
    && datapoint.mode !== 'unknown'
    && (datapoint.isStorage ? datapoint.storage === undefined : datapoint.production === undefined);

  if (!visible) return null;

  return (
    <text
      className="unknown"
      transform={`translate(1, ${TEXT_ADJUST_Y})`}
      style={{ pointerEvents: 'none', fill: 'darkgray' }}
      x={LABEL_MAX_WIDTH + scale(0)}
    >
      ?
    </text>
  );
}

const mapStateToProps = state => ({
  colorBlindModeEnabled: state.application.colorBlindModeEnabled,
  displayByEmissions: state.application.tableDisplayEmissions,
  data: getCurrentZoneData(state),
  electricityMixMode: state.application.electricityMixMode,
  exchangeKeys: getSelectedZoneExchangeKeys(state),
  isMobile: state.application.isMobile,
});

const CountryTable = ({
  colorBlindModeEnabled,
  data,
  displayByEmissions,
  electricityMixMode,
  exchangeKeys,
  isMobile,
}) => {
  const ref = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Container resize hook
  useEffect(() => {
    const updateContainerWidth = () => {
      if (ref.current) {
        setContainerWidth(ref.current.getBoundingClientRect().width);
      }
    };
    // Initialize width if it's not set yet
    if (!containerWidth) {
      updateContainerWidth();
    }
    // Update container width on every resize
    window.addEventListener('resize', updateContainerWidth);
    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  });

  const isMissingParser = !data.hasParser;
  const hasProductionData = data.production && Object.keys(data.production).length > 0;
  const exchangeData = exchangeKeys.map(key => ({
    mode: key,
    value: hasProductionData ? (data.exchange || {})[key] : undefined,
  }));

  const co2ColorScale = getCo2Scale(colorBlindModeEnabled);
  const sortedProductionData = getSortedProductionData(data);
  const barMaxWidth = containerWidth - LABEL_MAX_WIDTH - PADDING_X;

  const getExchangeCo2eq = (d) => {
    const co2intensity = electricityMixMode === 'consumption'
      ? data.co2intensity
      : data.co2intensityProduction;
    const { exchangeCo2Intensities } = data;
    return d.value > 0
      ? ((exchangeCo2Intensities !== undefined && exchangeCo2Intensities[d.mode] !== undefined)
        ? exchangeCo2Intensities[d.mode]
        : undefined)
      : ((co2intensity !== undefined) ? co2intensity : undefined);
  };

  const powerScale = scaleLinear()
    .domain([
      Math.min(
        -data.maxStorageCapacity || 0,
        -data.maxStorage || 0,
        -data.maxExport || 0,
        -data.maxExportCapacity || 0
      ),
      Math.max(
        data.maxCapacity || 0,
        data.maxProduction || 0,
        data.maxDischarge || 0,
        data.maxStorageCapacity || 0,
        data.maxImport || 0,
        data.maxImportCapacity || 0
      ),
    ])
    .range([0, barMaxWidth]);

  const maxCO2eqExport = d3Max(exchangeData, (d) => {
    const co2intensity = electricityMixMode === 'consumption'
      ? data.co2intensity
      : data.co2intensityProduction;
    return d.value >= 0 ? 0 : (data.co2intensity / 1e3 * -d.value / 60.0 || 0);
  });
  const maxCO2eqImport = d3Max(exchangeData, (d) => {
    const { exchangeCo2Intensities } = data;
    if (!exchangeCo2Intensities) return 0;
    return d.value <= 0 ? 0 : exchangeCo2Intensities[d.mode] / 1e3 * d.value / 60.0;
  });
  
  const co2Scale = scaleLinear() // in tCO2eq/min
    .domain([
      -maxCO2eqExport || 0,
      Math.max(
        d3Max(sortedProductionData, d => d.gCo2eqPerH / 1e6 / 60.0) || 0,
        maxCO2eqImport || 0
      ),
    ])
    .range([0, barMaxWidth]);
  
  const valueScale = displayByEmissions ? co2Scale : powerScale;

  const formatTick = (t) => {
    const factor = displayByEmissions ? 1 : 1e6;
    const domain = valueScale.domain();

    const maxValue = d3Max(domain) * factor;
    const precision = precisionPrefix((d3Max(domain) - d3Min(domain)) / (SCALE_TICKS - 1) * factor, maxValue);
    
    const format = formatPrefix(`.${precision}`, maxValue);
    const formattedValue = format(t * factor);

    return displayByEmissions
      ? (maxValue <= 1 ? `${t * 1000} kg / min` : `${formattedValue} t / min`)
      : `${formattedValue}W`;
  };

  const ticks = valueScale.ticks(SCALE_TICKS);

  const productionHeight = sortedProductionData.length * (ROW_HEIGHT + PADDING_Y);
  const exchangesHeight = exchangeData.length * (ROW_HEIGHT + PADDING_Y);

  const productionY = X_AXIS_HEIGHT + PADDING_Y;
  const exchangesY = productionY + productionHeight + ROW_HEIGHT + PADDING_Y;
  
  const containerHeight = exchangesY + exchangesHeight;

  return (
    <div className="country-table-container">
      <svg className="country-table" height={containerHeight} style={{ overflow: 'visible' }} ref={ref}>
        <g
          className="x axis"
          fill="none"
          fontSize="10"
          fontFamily="sans-serif"
          textAnchor="middle"
          transform={`translate(${valueScale.range()[0] + LABEL_MAX_WIDTH}, ${X_AXIS_HEIGHT})`}
        >
          <path className="domain" stroke="currentColor" d={`M${valueScale.range()[0] + 0.5},0.5H${valueScale.range()[1] + 0.5}`} />
          {ticks.map(t => (
            <g
              key={t}
              className="tick"
              opacity="1"
              transform={`translate(${valueScale(t)}, 0)`}
            >
              <line stroke="currentColor" y2={containerHeight - X_AXIS_HEIGHT} />
              <text fill="currentColor" y="-3" dy="0">{formatTick(t)}</text>
            </g>
          ))}
        </g>
        <g transform={`translate(0, ${productionY})`}>
          {sortedProductionData.map((d, ind) => (
            <g key={d.mode} className="row" transform={`translate(0, ${ind * (ROW_HEIGHT + PADDING_Y)})`}>
              <RowBackground
                width={containerWidth}
                height={ROW_HEIGHT + PADDING_Y}
                isMobile={isMobile}
                mode={d.mode}
                data={data}
              />

              <RowLabel label={__(d.mode)} />

              {displayByEmissions ? (
                <HorizontalBar
                  className="production"
                  fill={modeColor[d.mode]}
                  range={isFinite(d.gCo2eqPerH) ? [0, d.gCo2eqPerH / 1e6 / 60.0] : undefined}
                  scale={valueScale}
                />
              ) : (
                <React.Fragment>
                  <HorizontalBar
                    className="capacity"
                    fill="rgba(0, 0, 0, 0.15)"
                    range={isFinite(d.capacity) ? [d.isStorage ? -d.capacity : 0, d.capacity] : undefined}
                    scale={valueScale}
                  />
                  <HorizontalBar
                    className="production"
                    fill={modeColor[d.mode]}
                    range={isFinite(d.production) ? [d.isStorage ? -d.storage : 0, d.production] : undefined}
                    scale={valueScale}
                  />
                </React.Fragment>
              )}

              <UnknownValue
                datapoint={d}
                scale={valueScale}
              />
            </g>
          ))}
        </g>
        <g transform={`translate(0, ${exchangesY})`}>
          {exchangeData.map((d, ind) => {
            const labelLength = d3Max(exchangeData, ed => ed.mode.length) * 8;
            const co2intensity = getExchangeCo2eq(d);
            return (
              <g key={d.mode} className="row" transform={`translate(0, ${ind * (ROW_HEIGHT + PADDING_Y)})`}>
                <RowBackground
                  width={containerWidth}
                  height={ROW_HEIGHT + PADDING_Y}
                  isMobile={isMobile}
                  mode={d.mode}
                  data={data}
                />

                <image
                  width={FLAG_SIZE}
                  height={FLAG_SIZE}
                  style={{ pointerEvents: 'none' }}
                  x={LABEL_MAX_WIDTH - 4.0 * PADDING_X - FLAG_SIZE - labelLength}
                  xlinkHref={flagUri(d.mode, FLAG_SIZE)}
                />
                <RowLabel label={d.mode} />

                {displayByEmissions ? (
                  <HorizontalBar
                    className="exchange"
                    fill="gray"
                    range={isFinite(d.value) && isFinite(co2intensity)
                      ? (d.value < 0 ? [d.value / 1e3 / 60.0 * co2intensity, 0] : [0, d.value / 1e3 / 60.0 * co2intensity])
                      : undefined}
                    scale={valueScale}
                  />
                ) : (
                  <React.Fragment>
                    <HorizontalBar
                      className="capacity"
                      fill="rgba(0, 0, 0, 0.15)"
                      range={(data.exchangeCapacities || {})[d.mode]}
                      scale={valueScale}
                    />
                    <HorizontalBar
                      className="exchange"
                      fill={co2intensity ? co2ColorScale(co2intensity) : 'gray'}
                      range={isFinite(d.value) ? (d.value < 0 ? [d.value, 0] : [0, d.value]) : undefined}
                      scale={valueScale}
                    />
                  </React.Fragment>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <NoDataOverlay />
    </div>
  );
};

export default connect(mapStateToProps)(CountryTable);
