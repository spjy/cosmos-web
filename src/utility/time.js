import dayjs from 'dayjs';

export function mjdToString(mjd) {
  return dayjs
    .unix((((mjd + 2400000.5) - 2440587.5) * 86400.0))
    .utc()
    .format();
}

export function dateToMJD(date) {
  return (date.unix() / 86400.0) + 2440587.5 - 2400000.5;
}

export function MJDtoJavaScriptDate(mjd) {
  return dayjs
    .unix((((mjd + 2400000.5) - 2440587.5) * 86400.0))
    .toDate();
}
