import { isValid } from 'date-fns';
import type { CalendarRange, NormalizedEvent } from './types';

export function assertRange(range: CalendarRange): void {
  if (!isValid(range.start) || !isValid(range.end) || range.end <= range.start) {
    throw new RangeError('Calendar range end must follow a valid start.');
  }
}

/** Start ascending, duration descending; equal keys retain input order. */
export function sortEvents<TData>(
  events: readonly NormalizedEvent<TData>[],
): NormalizedEvent<TData>[] {
  for (const event of events) assertRange(event);

  return [...events].sort((a, b) => +a.start - +b.start || +b.end - +a.end);
}

/** Half-open intersection: touching boundaries do not intersect. */
export function filterEvents<TData>(
  events: readonly NormalizedEvent<TData>[],
  range: CalendarRange,
): NormalizedEvent<TData>[] {
  assertRange(range);

  return sortEvents(events).filter(
    (event) => event.start < range.end && event.end > range.start,
  );
}
