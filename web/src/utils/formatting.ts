import * as d3 from 'd3-format';

import { TimeAverages } from './constants';
import { EnergyUnits, PowerUnits } from './units';

const DEFAULT_NUM_DIGITS = 3;

export interface FormatParameters {
  value: number;
  total?: number | null;
  numberDigits?: number;
}

export const formatPower = ({
  value,
  total,
  numberDigits = DEFAULT_NUM_DIGITS,
}: FormatParameters) => {
  // Assume MW input
  if (value == undefined || Number.isNaN(value)) {
    return value;
  }
  if (value == 0) {
    return '0 W';
  }
  if (value < 1e-6) {
    return '~0 W';
  }

  const valueInWatt = value * 1e6;
  const totalInWatt = total ? total * 1e6 : undefined;

  return format({ value: valueInWatt, total: totalInWatt, numberDigits }) + 'W';
};

const format = ({
  value,
  total,
  numberDigits = DEFAULT_NUM_DIGITS,
}: FormatParameters) => {
  if (value == undefined || Number.isNaN(value)) {
    return value;
  }
  const checkAgainst = Math.abs(Math.round(total ?? value));

  if (checkAgainst < 1e3) {
    return d3.format(`.${numberDigits}~r`)(value) + ' ';
  }
  if (checkAgainst < 1e6) {
    return d3.format(`.${numberDigits}~r`)(value / 1e3) + ' k';
  }
  if (checkAgainst < 1e9) {
    return d3.format(`.${numberDigits}~r`)(value / 1e6) + ' M';
  }
  if (checkAgainst < 1e12) {
    return d3.format(`.${numberDigits}~r`)(value / 1e9) + ' G';
  }
  return d3.format(`.${numberDigits}~r`)(value / 1e12) + ' T';
};

export const formatEnergy = ({
  value,
  total,
  numberDigits = DEFAULT_NUM_DIGITS,
}: FormatParameters) => {
  const power = formatPower({ value, total, numberDigits });
  // Assume MW input
  if (power == undefined || Number.isNaN(power)) {
    return power;
  }
  return power + 'h';
};

export const formatCo2 = ({ value, total, numberDigits }: FormatParameters) => {
  // Validate input
  if (value == null || Number.isNaN(value)) {
    return '?';
  }

  const checkAgainst = total ?? value;

  if (Math.abs(Math.round(checkAgainst)) < 1e6) {
    return format({ value: value, total: total, numberDigits: numberDigits }) + 'g';
  }

  return (
    format({
      value: value / 1e6,
      total: total ? total / 1e6 : undefined,
      numberDigits: numberDigits,
    }) + 't'
  );
};

const scalePower = (maxPower: number | undefined, isPower = false) => {
  // Assume MW input
  if (maxPower == undefined) {
    return {
      unit: '?',
      formattingFactor: 1e3,
    };
  }

  const thresholds: [number, EnergyUnits | PowerUnits][] = isPower
    ? [
        [1e9, PowerUnits.PETAWATTS],
        [1e6, PowerUnits.TERAWATTS],
        [1e3, PowerUnits.GIGAWATTS],
        [1, PowerUnits.MEGAWATTS],
        [1e-3, PowerUnits.KILOWATTS],
      ]
    : [
        [1e9, EnergyUnits.PETAWATT_HOURS],
        [1e6, EnergyUnits.TERAWATT_HOURS],
        [1e3, EnergyUnits.GIGAWATT_HOURS],
        [1, EnergyUnits.MEGAWATT_HOURS],
        [1e-3, EnergyUnits.KILOWATT_HOURS],
      ];

  // Use absolute value to handle negative values
  const value = Math.abs(maxPower);

  for (const [threshold, unit] of thresholds) {
    if (value >= threshold) {
      return {
        unit,
        formattingFactor: threshold,
      };
    }
  }

  // Fallback if none of the thresholds are met
  return {
    unit: EnergyUnits.PETAWATT_HOURS,
    formattingFactor: 1e9,
  };
};

export const getDateTimeFormatOptions = (
  timeAverage: TimeAverages
): Intl.DateTimeFormatOptions => {
  switch (timeAverage) {
    case TimeAverages.HOURLY: {
      return {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
      };
    }
    case TimeAverages.DAILY: {
      return {
        dateStyle: 'long',
        timeZone: 'UTC',
      };
    }
    case TimeAverages.MONTHLY: {
      return {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      };
    }
    case TimeAverages.YEARLY: {
      return {
        year: 'numeric',
        timeZone: 'UTC',
      };
    }
    default: {
      console.error(`${timeAverage} is not implemented`);
      return {};
    }
  }
};

const formatDate = (date: Date, lang: string, timeAverage: TimeAverages) => {
  if (!isValidDate(date) || !timeAverage) {
    return '';
  }
  return new Intl.DateTimeFormat(lang, getDateTimeFormatOptions(timeAverage)).format(
    date
  );
};

const formatDateTick = (date: Date, lang: string, timeAggregate: TimeAverages) => {
  if (!isValidDate(date) || !timeAggregate) {
    return '';
  }

  switch (timeAggregate) {
    case TimeAverages.HOURLY: {
      return new Intl.DateTimeFormat(lang, {
        timeStyle: 'short',
      }).format(date);
    }
    // Instantiate below DateTimeFormat objects using UTC to avoid displaying
    // misleading time slider labels for users in UTC-negative offset timezones
    case TimeAverages.DAILY: {
      return new Intl.DateTimeFormat(lang, {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(date);
    }
    case TimeAverages.MONTHLY: {
      return lang === 'et'
        ? new Intl.DateTimeFormat(lang, {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          })
            .formatToParts(date)
            .find((part) => part.type === 'month')?.value
        : new Intl.DateTimeFormat(lang, {
            month: 'short',
            timeZone: 'UTC',
          }).format(date);
    }
    case TimeAverages.YEARLY: {
      return new Intl.DateTimeFormat(lang, {
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date);
    }
    default: {
      console.error(`${timeAggregate} is not implemented`);
      return '';
    }
  }
};

function isValidDate(date: Date) {
  if (!date || !(date instanceof Date)) {
    return false;
  }

  if (!date?.getTime() || date?.getTime() <= 1) {
    return false;
  }

  return true;
}
/**
 * @param {string[]} dataSources - array of data sources.
 * @param {string} language - ISO 639-1 language code (`en`) or ISO 639-1 language code + ISO 3166-1 alpha-2 country code (`en-GB`).
 * @returns {string} formatted string of data sources.
 */
function formatDataSources(dataSources: string[], language: string) {
  return Intl.ListFormat === undefined
    ? dataSources.join(', ')
    : new Intl.ListFormat(language, { style: 'long', type: 'conjunction' }).format(
        dataSources
      );
}

export { formatDataSources, formatDate, formatDateTick, scalePower };
