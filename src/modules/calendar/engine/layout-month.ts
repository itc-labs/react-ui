import { addDays } from 'date-fns';
import { filterEvents } from './filter';
import { clipRange, layoutDays } from './layout-utils';
import type {
  CalendarMonthOptions,
  CalendarMonthRow,
  CalendarMonthSegment,
  CalendarRange,
  NormalizedEvent,
} from './types';

/** Packs all supplied events into consecutive rows of at most seven dates. */
export function layoutMonth<TData>(
  events: readonly NormalizedEvent<TData>[],
  range: CalendarRange,
  options: CalendarMonthOptions = {},
): CalendarMonthRow<TData>[] {
  const days = layoutDays(range);
  const max = options.dayMaxEvents ?? Infinity;
  if (options.dayMaxEvents !== undefined && (!Number.isSafeInteger(max) || max < 0)) {
    throw new RangeError('dayMaxEvents must be a nonnegative integer.');
  }
  const filtered = filterEvents(events, range);
  const rows: CalendarMonthRow<TData>[] = [];
  for (let offset = 0; offset < days.length; offset += 7) {
    const rowDays = days.slice(offset, offset + 7);
    const start = rowDays[0]!;
    const end = addDays(rowDays[rowDays.length - 1]!, 1);
    const bounds = { start, end };
    const candidates = filtered
      .filter((event) => event.start < end && event.end > start)
      .map((event) => {
        const clipped = clipRange(event, bounds);
        const startColumn = rowDays.findIndex((day) => addDays(day, 1) > clipped.start);
        const endColumn = rowDays.filter((day) => day < clipped.end).length;

        return { event, ...clipped, startColumn, endColumn };
      })
      .sort(
        (a, b) =>
          a.startColumn - b.startColumn ||
          b.endColumn - b.startColumn - (a.endColumn - a.startColumn) ||
          +a.start - +b.start ||
          +b.end - +a.end,
      );
    const levelEnds: number[] = [];
    const hiddenCounts = rowDays.map(() => 0);
    const segments: CalendarMonthSegment<TData>[] = candidates.map((segment) => {
      let level = levelEnds.findIndex((endColumn) => endColumn <= segment.startColumn);
      if (level < 0) level = levelEnds.length;
      levelEnds[level] = segment.endColumn;
      const hidden = level >= max;
      if (hidden) {
        for (let column = segment.startColumn; column < segment.endColumn; column++) {
          hiddenCounts[column] = hiddenCounts[column]! + 1;
        }
      }

      return {
        ...segment,
        level,
        hidden,
        isStart: +segment.start === +segment.event.start,
        isEnd: +segment.end === +segment.event.end,
      };
    });
    rows.push({
      start,
      end,
      days: rowDays,
      segments,
      hiddenCounts,
      levelCount: levelEnds.length,
    });
  }

  return rows;
}
