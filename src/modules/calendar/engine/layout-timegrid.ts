import { addDays } from 'date-fns';
import { filterEvents } from './filter';
import { layoutMonth } from './layout-month';
import { atTime, clipRange, layoutDays, timeSeconds } from './layout-utils';
import type {
  CalendarRange,
  CalendarTimeGridLayout,
  CalendarTimeGridOptions,
  CalendarTimeSegment,
  NormalizedEvent,
} from './types';

function wallSeconds(date: Date, end: Date): number {
  return +date === +end
    ? 86400
    : date.getHours() * 3600 +
        date.getMinutes() * 60 +
        date.getSeconds() +
        date.getMilliseconds() / 1000;
}

/** Connected overlap clusters share a width; touching endpoints reuse columns. */
function packColumns<TData>(segments: CalendarTimeSegment<TData>[]): void {
  let cluster: CalendarTimeSegment<TData>[] = [];
  let ends: number[] = [];
  let clusterEnd = -Infinity;

  const finish = () => {
    for (const segment of cluster) segment.columnCount = ends.length;
  };

  for (const segment of segments) {
    if (+segment.start >= clusterEnd) {
      finish();
      cluster = [];
      ends = [];
    }
    let column = ends.findIndex((end) => end <= +segment.start);
    if (column < 0) column = ends.length;
    ends[column] = +segment.end;
    segment.column = column;
    cluster.push(segment);
    clusterEnd = Math.max(...ends);
  }
  finish();
}

export function layoutTimeGrid<TData>(
  events: readonly NormalizedEvent<TData>[],
  range: CalendarRange,
  options: CalendarTimeGridOptions = {},
): CalendarTimeGridLayout<TData> {
  const dates = layoutDays(range);
  const min = timeSeconds(options.slotMinTime ?? '00:00');
  const max = timeSeconds(options.slotMaxTime ?? '24:00');
  if (min >= max) throw new RangeError('slotMaxTime must follow slotMinTime.');
  const filtered = filterEvents(events, range);
  const timed = filtered.filter((event) => !event.allDay);
  const days = dates.map((date) => {
    const nextDay = addDays(date, 1);
    const bounds = { start: atTime(date, min), end: atTime(date, max) };
    const segments: CalendarTimeSegment<TData>[] = timed
      .filter((event) => event.start < bounds.end && event.end > bounds.start)
      .map((event) => {
        const clipped = clipRange(event, bounds);
        const startSeconds = wallSeconds(clipped.start, nextDay);
        const endSeconds = wallSeconds(clipped.end, nextDay);

        return {
          event,
          ...clipped,
          isStart: +clipped.start === +event.start,
          isEnd: +clipped.end === +event.end,
          top: (startSeconds - min) / (max - min),
          height: (endSeconds - startSeconds) / (max - min),
          column: 0,
          columnCount: 1,
        };
      })
      .sort((a, b) => +a.start - +b.start || +b.end - +a.end);
    packColumns(segments);

    return { date, segments };
  });

  return {
    days,
    allDay: layoutMonth(
      filtered.filter((event) => event.allDay),
      range,
      options,
    ),
  };
}
