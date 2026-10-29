import { addDays } from 'date-fns';
import { filterEvents } from './filter';
import { clipRange, layoutDays } from './layout-utils';
import type { CalendarListDay, CalendarRange, NormalizedEvent } from './types';

/** Includes empty dates; spanning events appear on every intersected date. */
export function layoutList<TData>(
  events: readonly NormalizedEvent<TData>[],
  range: CalendarRange,
): CalendarListDay<TData>[] {
  const days = layoutDays(range);
  const filtered = filterEvents(events, range);

  return days.map((date) => ({
    date,
    segments: filtered
      .filter((event) => event.start < addDays(date, 1) && event.end > date)
      .sort((a, b) => Number(b.allDay) - Number(a.allDay))
      .map((event) => {
        const clipped = clipRange(event, { start: date, end: addDays(date, 1) });

        return {
          event,
          ...clipped,
          isStart: +clipped.start === +event.start,
          isEnd: +clipped.end === +event.end,
        };
      }),
  }));
}
