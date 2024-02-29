import * as Portal from '@radix-ui/react-portal';
import useGetState from 'api/getState';
import Badge from 'components/Badge';
import CarbonIntensitySquare from 'components/CarbonIntensitySquare';
import { CircularGauge } from 'components/CircularGauge';
import { getSafeTooltipPosition } from 'components/tooltips/utilities';
import { ZoneName } from 'components/ZoneName';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { StateZoneData } from 'types';
import { Mode } from 'utils/constants';
import { formatDate } from 'utils/formatting';
import { getCarbonIntensity, getFossilFuelRatio, getRenewableRatio } from 'utils/helpers';
import {
  productionConsumptionAtom,
  selectedDatetimeIndexAtom,
  timeAverageAtom,
} from 'utils/state/atoms';

import { hoveredZoneAtom, mapMovingAtom, mousePositionAtom } from './mapAtoms';

function TooltipInner({
  zoneData,
  date,
  zoneId,
}: {
  date: string;
  zoneId: string;
  zoneData: StateZoneData;
}) {
  const {
    co2intensity,
    co2intensityProduction,
    estimationMethod,
    hasOutage,
    fossilFuelRatio,
    fossilFuelRatioProduction,
    renewableRatio,
    renewableRatioProduction,
  } = zoneData;
  const { t } = useTranslation();

  const [currentMode] = useAtom(productionConsumptionAtom);
  const isConsumption = currentMode === Mode.CONSUMPTION;
  const intensity = getCarbonIntensity(
    isConsumption,
    co2intensity,
    co2intensityProduction
  );
  const fossilFuelPercentage = getFossilFuelRatio(
    isConsumption,
    fossilFuelRatio,
    fossilFuelRatioProduction
  );
  const renewable = getRenewableRatio(
    isConsumption,
    renewableRatio,
    renewableRatioProduction
  );
  return (
    <div className="w-full text-center">
      <div className="p-3">
        <div className="flex w-full flex-row justify-between">
          <div className="pl-2">
            <ZoneName
              zone={zoneId}
              textStyle="font-medium text-base font-poppins"
              zoneNameMaxLength={18}
            />
            <div className="flex self-start text-sm text-neutral-600 dark:text-neutral-400">
              {date}
            </div>{' '}
          </div>
          <DataValidityBadge
            hasOutage={hasOutage}
            isEstimated={estimationMethod != undefined}
          />
        </div>
        <div className="flex w-full flex-grow py-1 pt-4 sm:pr-2">
          <div className="flex w-full flex-grow flex-row justify-around">
            <CarbonIntensitySquare intensity={intensity} />
            <div className="pl-2 pr-6">
              <CircularGauge
                name={t('country-panel.lowcarbon')}
                ratio={fossilFuelPercentage}
              />
            </div>
            <CircularGauge name={t('country-panel.renewable')} ratio={renewable} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DataValidityBadge({
  hasOutage,
  isEstimated,
}: {
  hasOutage: boolean;
  isEstimated: boolean;
}) {
  if (hasOutage) {
    return (
      <Badge
        type={'warning'}
        icon={
          "h-[12px] w-[12px] mt-[1px] bg-[url('/images/warning_light.svg')] bg-center dark:bg-[url('/images/warning_dark.svg')]"
        }
        pillText={'Unavailable'}
      ></Badge>
    );
  }
  if (isEstimated) {
    return (
      <Badge
        type={'warning'}
        icon={
          "h-[16px] w-[16px] bg-[url('/images/estimated_light.svg')] bg-center dark:bg-[url('/images/estimated_dark.svg')]"
        }
        pillText={'Estimated'}
      ></Badge>
    );
  }
  return null;
}

export default function MapTooltip() {
  const [mousePosition] = useAtom(mousePositionAtom);
  const [hoveredZone] = useAtom(hoveredZoneAtom);
  const [selectedDatetime] = useAtom(selectedDatetimeIndexAtom);
  const [timeAverage] = useAtom(timeAverageAtom);
  const [isMapMoving] = useAtom(mapMovingAtom);
  const { i18n, t } = useTranslation();
  const { data } = useGetState();

  if (!hoveredZone || isMapMoving) {
    return null;
  }

  const { x, y } = mousePosition;
  const hoveredZoneData = data?.data?.zones[hoveredZone.zoneId] ?? undefined;
  const zoneData = hoveredZoneData
    ? data?.data?.zones[hoveredZone.zoneId][selectedDatetime.datetimeString]
    : undefined;

  const screenWidth = window.innerWidth;
  const tooltipWithDataPositon = getSafeTooltipPosition(x, y, screenWidth, 300, 170);
  const emptyTooltipPosition = getSafeTooltipPosition(x, y, screenWidth, 176, 70);

  const formattedDate = formatDate(
    new Date(selectedDatetime.datetimeString),
    i18n.language,
    timeAverage
  );

  if (zoneData) {
    return (
      <Portal.Root className="absolute left-0 top-0 hidden h-0 w-0 md:block">
        <div
          className="pointer-events-none relative w-[361px] rounded-2xl border border-neutral-200 bg-white text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 "
          style={{ left: tooltipWithDataPositon.x, top: tooltipWithDataPositon.y }}
        >
          <div>
            <TooltipInner
              zoneData={zoneData}
              zoneId={hoveredZone.zoneId}
              date={formattedDate}
            />
          </div>
        </div>
      </Portal.Root>
    );
  }
  return (
    <Portal.Root className="absolute left-0 top-0 hidden h-0 w-0 md:block">
      <div
        className="pointer-events-none relative w-[176px] rounded border bg-zinc-50 p-3 text-center text-sm drop-shadow-sm dark:border dark:border-gray-700 dark:bg-gray-800"
        style={{ left: emptyTooltipPosition.x, top: emptyTooltipPosition.y }}
      >
        <div>
          <ZoneName zone={hoveredZone.zoneId} textStyle="font-medium" />
          <div className="flex self-start text-xs">{formattedDate}</div>
          <p className="text-start">{t('tooltips.noParserInfo')}</p>
        </div>
      </div>
    </Portal.Root>
  );
}
