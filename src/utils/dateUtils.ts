import moment from 'moment-jalaali';

// Set moment locale to Persian/Jalali
moment.loadPersian({ dialect: 'persian-modern' });

/**
 * Converts a Gregorian Date object or string to Jalali date string (YYYY.MM.DD)
 * @param date - Date object or string (defaults to today)
 */
export function toJalaliDate(date?: Date | string): string {
  if (!date) {
    return moment().format('YYYY.MM.DD');
  }
  return moment(date).format('YYYY.MM.DD');
}

/**
 * Converts Jalali date string (YYYY.MM.DD) to a standard Date object.
 */
export function fromJalaliDate(jalaliDate: string): Date {
  // moment-jalaali handles parsing YYYY.MM.DD format correctly
  return moment(jalaliDate, 'YYYY.MM.DD').toDate();
}

/**
 * Calculates duration between two HH:MM:SS strings and returns duration in HH:MM:SS format.
 * If 'to' is less than 'from', it assumes 'to' is on the next day (up to 24 hours difference).
 */
export function calculateDuration(fromTime: string, toTime: string): string {
  const parseTime = (timeStr: string) => {
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };

  let fromSeconds = parseTime(fromTime);
  let toSeconds = parseTime(toTime);

  // If To time is earlier than From time, assume it spans midnight (24 hours)
  if (toSeconds < fromSeconds) {
    toSeconds += 24 * 3600;
  }

  let durationSeconds = toSeconds - fromSeconds;

  if (durationSeconds < 0) {
    durationSeconds = 0;
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}