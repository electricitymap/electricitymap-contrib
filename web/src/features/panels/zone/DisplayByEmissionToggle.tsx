import ToggleButton from 'components/ToggleButton';
import { useAtom, useAtomValue } from 'jotai';
import type { ReactElement } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import trackEvent from 'utils/analytics';
import { LeftPanelToggleOptions, TrackEvent } from 'utils/constants';
import { displayByEmissionsAtom, isConsumptionAtom } from 'utils/state/atoms';

export default function EmissionToggle(): ReactElement {
  const isConsumption = useAtomValue(isConsumptionAtom);
  const [displayByEmissions, setDisplayByEmissions] = useAtom(displayByEmissionsAtom);
  const navigate = useNavigate();
  const { zoneId } = useParams();
  const [searchParameters] = useSearchParams();
  const location = useLocation();
  // TODO: perhaps togglebutton should accept boolean values
  const options = [
    {
      value: LeftPanelToggleOptions.ELECTRICITY,
      translationKey: isConsumption
        ? 'country-panel.electricityconsumption'
        : 'country-panel.electricityproduction',
    },
    {
      value: LeftPanelToggleOptions.EMISSIONS,
      translationKey: 'country-panel.emissions',
    },
  ];

  const onSetCurrentMode = (option: string) => {
    if (displayByEmissions) {
      trackEvent(TrackEvent.PANEL_PRODUCTION_BUTTON_CLICKED);
    } else {
      trackEvent(TrackEvent.PANEL_EMISSION_BUTTON_CLICKED);
    }
    if (
      (option === LeftPanelToggleOptions.ELECTRICITY && displayByEmissions) ||
      (option === LeftPanelToggleOptions.EMISSIONS && !displayByEmissions)
    ) {
      // TODO(cady): clean up
      const splitHash = location.hash.split('?');
      const searchParameters_ =
        (splitHash.length > 0 && splitHash.at(1)) || searchParameters;
      navigate(
        `/zone/${zoneId}/${option}${searchParameters_ ? `?${searchParameters_}` : ''}`,
        { replace: true }
      );
    }
  };

  return (
    <div className="my-4">
      <ToggleButton
        options={options}
        selectedOption={
          displayByEmissions
            ? LeftPanelToggleOptions.EMISSIONS
            : LeftPanelToggleOptions.ELECTRICITY
        }
        onToggle={onSetCurrentMode}
      />
    </div>
  );
}
