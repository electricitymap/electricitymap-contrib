import i18next from './i18n';

export const translateIfExists = (key: string) => {
  return i18next.exists(key) ? i18next.t(key) : '';
};

export const getZoneName = (zoneCode: string) =>
  translateIfExists(`zoneShortName.${zoneCode}.zoneName`);
export const getCountryName = (zoneCode: string) =>
  translateIfExists(`zoneShortName.${zoneCode}.countryName`);

/**
 * Gets the full name of a zone with the country name in parentheses.
 * @param {string} zoneCode
 * @returns string
 */
export function getZoneNameWithCountry(zoneCode: string) {
  const zoneName = getZoneName(zoneCode);
  if (!zoneName) {
    return zoneCode;
  }
  const countryName = getCountryName(zoneCode);
  if (!countryName) {
    return zoneName;
  }

  return `${zoneName} (${countryName})`;
}

const DEFAULT_ZONE_NAME_LIMIT = 40;
/**
 * Gets the name of a zone with the country name in parentheses and zone-name ellipsified if too long.
 * @param {string} zoneCode
 * @returns string
 */
export function getShortenedZoneNameWithCountry(
  zoneCode: string,
  limit = DEFAULT_ZONE_NAME_LIMIT
) {
  const zoneName = getZoneName(zoneCode);
  if (!zoneName) {
    return zoneCode;
  }
  const countryName = getCountryName(zoneCode);
  if (!countryName) {
    return zoneName;
  }

  let countryText = ` (${countryName})`;

  // If zoneName contains countryName, we don't need to show countryName again
  if (zoneName.toLowerCase().includes(countryName.toLowerCase())) {
    countryText = '';
  }

  if (limit && zoneName.length > limit) {
    return `${zoneName.slice(0, Math.max(0, limit))}...${countryText}`;
  }

  return `${zoneName}${countryText}`;
}
