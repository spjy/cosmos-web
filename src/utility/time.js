import { DateTime } from 'luxon';

export function mjdToString(mjd) {
  return DateTime
    .fromSeconds((((mjd + 2400000.5) - 2440587.5) * 86400.0))
    .toUTC()
    .toFormat('yyyy-MM-dd\'T\'TTZZZ');
}
