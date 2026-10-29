import { addDays, set, startOfDay, toDate } from 'date-fns';
import { assertRange } from './filter';
import type { CalendarRange } from './types';

/** Layout ranges are whole local dates, as returned by viewRange. */
export function layoutDays(range: CalendarRange): Date[] {
  assertRange(range);
  if (
    +startOfDay(range.start) !== +range.start ||
    +startOfDay(range.end) !== +range.end
  ) {
    throw new RangeError('Calendar layout boundaries must be local midnight.');
  }
  const days: Date[] = [];
  for (let day = toDate(range.start); day < range.end; day = addDays(day, 1)) {
    days.push(day);
  }

  return days;
}

export function clipRange(range: CalendarRange, bounds: CalendarRange): CalendarRange {
  return {
    start: toDate(range.start < bounds.start ? bounds.start : range.start),
    end: toDate(range.end > bounds.end ? bounds.end : range.end),
  };
}

export function timeSeconds(value: string): number {
  const match = /^(\d{2}):([0-5]\d)(?::([0-5]\d))?$/.exec(value);
  if (!match) throw new RangeError('Slot times must use HH:mm or HH:mm:ss.');
  const seconds =
    Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] ?? 0);
  if (seconds > 86400) throw new RangeError('Slot times must be within one day.');

  return seconds;
}

export function atTime(date: Date, seconds: number): Date {
  return seconds === 86400
    ? addDays(date, 1)
    : set(date, {
        hours: Math.floor(seconds / 3600),
        minutes: Math.floor(seconds / 60) % 60,
        seconds: seconds % 60,
        milliseconds: 0,
      });
}
