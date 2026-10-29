import {
  addDays,
  addMilliseconds,
  addMinutes,
  differenceInCalendarDays,
  isValid,
  startOfDay,
  toDate,
} from 'date-fns';
import { assertRange } from './filter';
import { atTime, timeSeconds } from './layout-utils';
import type {
  CalendarEventDelta,
  CalendarFractionOptions,
  CalendarMoveOptions,
  CalendarRange,
  CalendarSelectionOptions,
  NormalizedEvent,
} from './types';

function validDate(date: Date): Date {
  if (!isValid(date)) throw new RangeError('Invalid calendar date.');

  return toDate(date);
}

function positiveMinutes(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError('Duration must be positive whole minutes.');
  }

  return value;
}

function slotMinutes(value: number): number {
  positiveMinutes(value);
  if (1440 % value !== 0) {
    throw new RangeError('slotDuration must divide one day.');
  }

  return value;
}

function assertEvent<TData>(event: NormalizedEvent<TData>): void {
  assertRange(event);
  if (
    event.allDay &&
    (+startOfDay(event.start) !== +event.start || +startOfDay(event.end) !== +event.end)
  ) {
    throw new RangeError('All-day event boundaries must be local midnight.');
  }
}

/** Nearest local wall-clock slot from midnight; ties round forward. */
export function snapTime(date: Date, slotDuration = 30): Date {
  const current = validDate(date);
  const slot = slotMinutes(slotDuration) * 60;
  const seconds =
    current.getHours() * 3600 +
    current.getMinutes() * 60 +
    current.getSeconds() +
    current.getMilliseconds() / 1000;

  return validDate(atTime(startOfDay(current), Math.round(seconds / slot) * slot));
}

/** Clamps a pointer fraction to the visible window, then snaps from midnight. */
export function fractionToTime(
  date: Date,
  fraction: number,
  options: CalendarFractionOptions = {},
): Date {
  const day = startOfDay(validDate(date));
  if (!Number.isFinite(fraction)) throw new RangeError('Fraction must be finite.');
  const min = timeSeconds(options.slotMinTime ?? '00:00');
  const max = timeSeconds(options.slotMaxTime ?? '24:00');
  if (min >= max) throw new RangeError('slotMaxTime must follow slotMinTime.');
  const raw = atTime(day, min + Math.min(1, Math.max(0, fraction)) * (max - min));
  const snapped = snapTime(raw, options.slotDuration);
  const start = atTime(day, min);
  const end = atTime(day, max);

  return validDate(snapped < start ? start : snapped > end ? end : snapped);
}

/** Preserves elapsed timed duration or all-day date count; conversion is explicit. */
export function moveEvent<TData>(
  event: NormalizedEvent<TData>,
  delta: CalendarEventDelta,
  options: CalendarMoveOptions = {},
): NormalizedEvent<TData> {
  assertEvent(event);
  const days = delta.days ?? 0;
  const minutes = delta.minutes ?? 0;
  if (!Number.isSafeInteger(days) || !Number.isSafeInteger(minutes)) {
    throw new RangeError('Event deltas must be whole days and minutes.');
  }
  const allDay = options.allDay ?? event.allDay;
  const timedDuration = positiveMinutes(options.defaultTimedDuration ?? 60);
  if (allDay && minutes !== 0) {
    throw new RangeError('All-day moves accept calendar days only.');
  }
  let start: Date;
  let end: Date;
  if (allDay) {
    start = addDays(startOfDay(event.start), days);
    const endDay = startOfDay(event.end);
    const exclusiveEnd = +endDay === +event.end ? endDay : addDays(endDay, 1);
    const count = differenceInCalendarDays(exclusiveEnd, startOfDay(event.start));
    end = addDays(start, count);
  } else {
    start = addMinutes(addDays(event.start, days), minutes);
    end = event.allDay
      ? addMinutes(start, timedDuration)
      : addMilliseconds(start, +event.end - +event.start);
  }
  const result = { ...event, start, end, allDay };
  assertEvent(result);

  return result;
}

/** Changes one boundary, clamping at the minimum while leaving the other fixed. */
export function resizeEvent<TData>(
  event: NormalizedEvent<TData>,
  edge: 'start' | 'end',
  date: Date,
  minDuration = 30,
): NormalizedEvent<TData> {
  assertEvent(event);
  const target = validDate(date);
  positiveMinutes(minDuration);
  if (edge !== 'start' && edge !== 'end') throw new RangeError('Invalid resize edge.');
  const boundary = event.allDay ? startOfDay(target) : target;

  // All-day minimums round up to whole calendar dates, with a one-date floor.
  const minimum = (base: Date, direction: number) =>
    event.allDay
      ? addDays(base, direction * Math.ceil(minDuration / 1440))
      : addMinutes(base, direction * minDuration);

  const limit = validDate(
    minimum(edge === 'start' ? event.end : event.start, edge === 'start' ? -1 : 1),
  );
  const start =
    edge === 'start' ? (boundary > limit ? limit : boundary) : toDate(event.start);
  const end =
    edge === 'end' ? (boundary < limit ? limit : boundary) : toDate(event.end);
  const result = { ...event, start, end };
  assertEvent(result);

  return result;
}

/** Both endpoints identify selected cells; output end is exclusive in either direction. */
export function rangeFromSelection(
  anchor: Date,
  focus: Date,
  options: CalendarSelectionOptions = {},
): CalendarRange {
  const slot = slotMinutes(options.slotDuration ?? 30);
  const first = options.allDay ? startOfDay(validDate(anchor)) : snapTime(anchor, slot);
  const last = options.allDay ? startOfDay(validDate(focus)) : snapTime(focus, slot);
  const start = first < last ? first : last;
  const finalCell = first > last ? first : last;
  const end = options.allDay ? addDays(finalCell, 1) : addMinutes(finalCell, slot);
  const range = { start, end };
  assertRange(range);

  return range;
}
