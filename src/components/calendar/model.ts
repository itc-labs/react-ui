/** Date-only values and wall-clock times, never UTC timestamps. */
export function parseCalendarDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  if (year < 1) return null;
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}

export function calendarDateString(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function displayCalendarDate(value: string, locale = 'vi-VN'): string {
  const date = parseCalendarDate(value);

  return date
    ? new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    : value;
}

export function dateSpan(from: string, to: string): number {
  const a = parseCalendarDate(from),
    b = parseCalendarDate(to);
  if (!a || !b) return NaN;

  const ordinal = (d: Date) => {
    const utc = new Date(0);
    utc.setUTCFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    utc.setUTCHours(0, 0, 0, 0);

    return utc.getTime();
  };

  return Math.round((ordinal(b) - ordinal(a)) / 86_400_000) + 1;
}

export function timeMinutes(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;

  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
}

export function timeSlots(min = '00:00', max = '23:59', step = 15): string[] {
  const start = timeMinutes(min),
    end = timeMinutes(max);
  if (
    start == null ||
    end == null ||
    start > end ||
    !Number.isInteger(step) ||
    step < 1 ||
    step > 60
  )
    throw new RangeError(
      'TimePicker requires valid HH:mm min <= max and an integer minuteStep from 1 to 60.',
    );
  const result: string[] = [];
  for (let minute = start; minute <= end; minute += step)
    result.push(
      `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`,
    );

  return result;
}

export function atMonth(year: number, index: number): Date {
  const date = new Date(0);
  date.setFullYear(year, index, 1);
  date.setHours(12, 0, 0, 0);

  return date;
}

export function monthKey(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}
