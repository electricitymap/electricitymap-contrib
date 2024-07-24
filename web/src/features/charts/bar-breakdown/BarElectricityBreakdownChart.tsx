import { max as d3Max, min as d3Min } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { useCo2ColorScale } from 'hooks/theme';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { ElectricityModeType, ZoneDetail, ZoneDetails, ZoneKey } from 'types';
import { formatEnergy, formatPower } from 'utils/formatting';
import { isHourlyAtom } from 'utils/state/atoms';

import BarElectricityExchangeChart from './BarElectricityExchangeChart';
import { BarElectricityProductionChart } from './BarElectricityProductionChart';
import { EXCHANGE_PADDING, LABEL_MAX_WIDTH, PADDING_X } from './constants';
import { ExchangeDataType, getDataBlockPositions, ProductionDataType } from './utils';

interface BarElectricityBreakdownChartProps {
  height: number;
  width: number;
  data: ZoneDetails;
  currentData: ZoneDetail;
  exchangeData: ExchangeDataType[];
  productionData: ProductionDataType[];
  isMobile: boolean;
  onProductionRowMouseOver: (
    rowKey: ElectricityModeType,
    data: ZoneDetail,
    event: React.MouseEvent<SVGPathElement, MouseEvent>
  ) => void;
  onProductionRowMouseOut: () => void;
  onExchangeRowMouseOver: (
    rowKey: ZoneKey,
    data: ZoneDetail,
    event: React.MouseEvent<SVGPathElement, MouseEvent>
  ) => void;
  onExchangeRowMouseOut: () => void;
  graphUnit: string | undefined;
  hasNegativeValuesInData: boolean;
}

function BarElectricityBreakdownChart({
  data,
  currentData,
  exchangeData,
  height,
  isMobile,
  productionData,
  onProductionRowMouseOver,
  onProductionRowMouseOut,
  onExchangeRowMouseOver,
  onExchangeRowMouseOut,
  width,
  graphUnit,
  hasNegativeValuesInData,
}: BarElectricityBreakdownChartProps) {
  const co2ColorScale = useCo2ColorScale();
  const { productionY, exchangeHeight } = getDataBlockPositions(
    productionData.length,
    exchangeData
  );
  const isHourly = useAtomValue(isHourlyAtom);

  // Use the whole history to determine the min/max values in order to avoid
  // graph jumping while sliding through the time range.
  const [minPower, maxPower] = useMemo(() => {
    return [
      d3Min(
        Object.values(data.zoneStates).map((zoneData) =>
          Math.min(
            -zoneData.maxStorageCapacity || 0,
            -zoneData.maxStorage || 0,
            -zoneData.maxExport || 0,
            -zoneData.maxExportCapacity || 0
          )
        )
      ) || 0,
      d3Max(
        Object.values(data.zoneStates).map((zoneData) =>
          Math.max(
            zoneData.maxCapacity || 0,
            zoneData.maxProduction || 0,
            zoneData.maxDischarge || 0,
            zoneData.maxStorageCapacity || 0,
            zoneData.maxImport || 0,
            zoneData.maxImportCapacity || 0
          )
        )
      ) || 0,
    ];
  }, [data]);

  // Power in MW
  const powerScale = scaleLinear()
    .domain([minPower, maxPower])
    .range([0, width - LABEL_MAX_WIDTH - PADDING_X]);

  const formatTick = (t: number) => {
    // Use same unit as max value for tick with value 0
    if (t === 0) {
      const tickValue = isHourly ? formatPower(maxPower, 1) : formatEnergy(maxPower, 1);
      return tickValue.toString().replace(/[\d.]+/, '0');
    }
    return isHourly ? formatPower(t, 2) : formatEnergy(t, 2);
  };

  return (
    <>
      <BarElectricityProductionChart
        powerScale={powerScale}
        height={height}
        formatTick={formatTick}
        productionY={productionY}
        productionData={productionData}
        currentData={currentData}
        width={width}
        onProductionRowMouseOver={onProductionRowMouseOver}
        onProductionRowMouseOut={onProductionRowMouseOut}
        isMobile={isMobile}
        hasNegativeValuesInData={hasNegativeValuesInData}
      />
      <BarElectricityExchangeChart
        height={exchangeHeight + EXCHANGE_PADDING}
        onExchangeRowMouseOut={onExchangeRowMouseOut}
        onExchangeRowMouseOver={onExchangeRowMouseOver}
        exchangeData={exchangeData}
        data={currentData}
        width={width}
        powerScale={powerScale}
        formatTick={formatTick}
        co2ColorScale={co2ColorScale}
        graphUnit={graphUnit}
      />
    </>
  );
}

export default BarElectricityBreakdownChart;
