import { CarbonIntensityDisplay } from 'components/CarbonIntensityDisplay';
import { ZoneName } from 'components/ZoneName';
import { useDimensions } from 'hooks/dimensions';
import { useAtom } from 'jotai';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ExchangeArrowData } from 'types';
import { TimeAverages } from 'utils/constants';
import { formatEnergy, formatPower } from 'utils/formatting';
import { timeAverageAtom } from 'utils/state/atoms';

interface ExchangeTooltipProperties {
  exchangeData: ExchangeArrowData;
}

export default function ExchangeTooltip(
  properties: ExchangeTooltipProperties
): ReactElement {
  const { key, netFlow, co2intensity } = properties.exchangeData;
  const { t } = useTranslation();
  const isExporting = netFlow > 0;
  const roundedNetFlow = Math.abs(Math.round(netFlow));
  const zoneFrom = key.split('->')[isExporting ? 0 : 1];
  const zoneTo = key.split('->')[isExporting ? 1 : 0];
  const [timeAverage] = useAtom(timeAverageAtom);
  const isHourly = timeAverage === TimeAverages.HOURLY;
  const { isMobile } = useDimensions();

  const divClass = `${isMobile ? 'flex-col' : 'flex'} items-center pb-2`;
  return (
    <div className="text-start text-base font-medium">
      {t('tooltips.crossborderexport')}:
      <div>
        <div className={divClass}>
          <ZoneName zone={zoneFrom} textStyle="max-w-[165px]" />
          {isMobile ? <p className="ml-0.5">↓</p> : <p className="mx-2">→</p>}{' '}
          <ZoneName zone={zoneTo} textStyle="max-w-[165px]" />
          <b className="font-bold">
            {isMobile ? '' : ':'}{' '}
            {isHourly ? formatPower(roundedNetFlow) : formatEnergy(roundedNetFlow)}
          </b>
        </div>
      </div>
      {t('tooltips.carbonintensityexport')}:
      <div className="pt-1">
        {co2intensity > 0 && (
          <div className="inline-flex items-center gap-x-1">
            <CarbonIntensityDisplay withSquare co2Intensity={co2intensity} />
          </div>
        )}
      </div>
    </div>
  );
}
