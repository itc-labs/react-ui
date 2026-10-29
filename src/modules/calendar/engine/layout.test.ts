import { TZDate } from '@date-fns/tz';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  filterEvents,
  layoutList,
  layoutMonth,
  layoutTimeGrid,
  normalizeEvent,
  sortEvents,
  type CalendarEvent,
  type CalendarRange,
} from '../index';

const day = (date: number, hour = 0, minute = 0) =>
  new Date(2026, 9, date, hour, minute);

const range = (start = 5, end = 12): CalendarRange => ({
  start: day(start),
  end: day(end),
});

const event = (id: string, start: Date, end: Date, allDay = false) =>
  normalizeEvent({ id, title: '', start, end, allDay });

const ids = (events: { id: string }[]) => events.map(({ id }) => id);

describe('event filtering and sorting', () => {
  it('uses exclusive intersection, includes enclosing events, and stably sorts without mutation', () => {
    const events = Object.freeze([
      event('touch-end', day(12), day(13)),
      event('short', day(5, 10), day(5, 11)),
      event('long', day(5, 10), day(5, 12)),
      event('tie', day(5, 10), day(5, 12)),
      event('enclosing', day(1), day(20)),
      event('touch-start', day(4), day(5)),
    ]);
    expect(ids(filterEvents(events, range()))).toEqual([
      'enclosing',
      'long',
      'tie',
      'short',
    ]);
    expect(ids(sortEvents(events))).toEqual([
      'enclosing',
      'touch-start',
      'long',
      'tie',
      'short',
      'touch-end',
    ]);
    expect(events[0]!.id).toBe('touch-end');
    expect(filterEvents(events, range())[0]).toBe(events[4]);
  });

  it('preserves generic metadata through each layout', () => {
    const input: CalendarEvent<{ value: number }> = {
      id: 'a',
      title: '',
      start: day(5),
      data: { value: 0 },
    };
    const events = [normalizeEvent(input)];
    expectTypeOf(filterEvents(events, range())[0]!.data).toEqualTypeOf<
      { value: number } | undefined
    >();
    expectTypeOf(
      layoutMonth(events, range())[0]!.segments[0]!.event.data,
    ).toEqualTypeOf<{ value: number } | undefined>();
    expectTypeOf(layoutList(events, range())[0]!.segments[0]!.event.data).toEqualTypeOf<
      { value: number } | undefined
    >();
    expectTypeOf(
      layoutTimeGrid(events, range()).days[0]!.segments[0]!.event.data,
    ).toEqualTypeOf<{ value: number } | undefined>();
  });
});

describe('month packing', () => {
  it('slices at row/view boundaries and keeps exact-midnight ends exclusive', () => {
    const events = [
      event('span', day(3), day(14), true),
      event('midnight', day(11, 22), day(12)),
    ];
    const rows = layoutMonth(events, range(5, 19));
    expect(rows).toHaveLength(2);
    expect(rows[0]!.segments).toMatchObject([
      {
        start: day(5),
        end: day(12),
        startColumn: 0,
        endColumn: 7,
        isStart: false,
        isEnd: false,
        level: 0,
      },
      { startColumn: 6, endColumn: 7, isStart: true, isEnd: true, level: 1 },
    ]);
    expect(rows[1]!.segments).toMatchObject([
      {
        start: day(12),
        end: day(14),
        startColumn: 0,
        endColumn: 2,
        isStart: false,
        isEnd: true,
      },
    ]);
    expect(
      layoutMonth([event('at-boundary', day(5), day(12), true)], range())[0]!
        .segments[0],
    ).toMatchObject({ isStart: true, isEnd: true });
  });

  it('packs longer equal-start spans first, reuses levels and counts hidden events on every covered date', () => {
    const events = [
      event('short', day(5), day(6), true),
      event('long', day(5), day(8), true),
      event('tie', day(5), day(8), true),
      event('reuse', day(6), day(7), true),
      event('after', day(8), day(9), true),
    ];
    const row = layoutMonth(events, range(), { dayMaxEvents: 1 })[0]!;
    expect(
      row.segments.map(({ event, level, hidden }) => [event.id, level, hidden]),
    ).toEqual([
      ['long', 0, false],
      ['tie', 1, true],
      ['short', 2, true],
      ['reuse', 2, true],
      ['after', 0, false],
    ]);
    expect(row.levelCount).toBe(3);
    expect(row.hiddenCounts).toEqual([2, 2, 1, 0, 0, 0, 0]);
    expect(layoutMonth(events, range(), { dayMaxEvents: 0 })[0]!.hiddenCounts).toEqual([
      3, 3, 2, 1, 0, 0, 0,
    ]);
    expect(
      layoutMonth(events, range())[0]!.segments.every(({ hidden }) => !hidden),
    ).toBe(true);
  });

  it('packs timed events by occupied dates and supports partial last rows and empty rows', () => {
    const rows = layoutMonth(
      [
        event('morning', day(5, 8), day(5, 9)),
        event('evening', day(5, 20), day(5, 21)),
        event('overnight', day(6, 23), day(7, 1)),
      ],
      range(5, 14),
    );
    expect(rows.map(({ days }) => days.length)).toEqual([7, 2]);
    expect(
      rows[0]!.segments.map(({ level, startColumn, endColumn }) => [
        level,
        startColumn,
        endColumn,
      ]),
    ).toEqual([
      [0, 0, 1],
      [1, 0, 1],
      [0, 1, 3],
    ]);
    expect(rows[1]).toMatchObject({
      segments: [],
      hiddenCounts: [0, 0],
      levelCount: 0,
    });
  });
});

describe('time grid', () => {
  it('splits overnight events, clips slot windows and retains boundary flags', () => {
    const events = [
      event('span', day(4, 23), day(6, 10)),
      event('midnight', day(5, 23), day(6)),
    ];
    const full = layoutTimeGrid(events, range(5, 7));
    expect(full.days[0]!.segments[0]).toMatchObject({
      start: day(5),
      end: day(6),
      top: 0,
      height: 1,
      isStart: false,
      isEnd: false,
    });
    expect(full.days[0]!.segments[1]).toMatchObject({ isStart: true, isEnd: true });
    expect(full.days[1]!.segments).toHaveLength(1);
    expect(full.days[1]!.segments[0]).toMatchObject({
      top: 0,
      height: 10 / 24,
      isStart: false,
      isEnd: true,
    });
    const clipped = layoutTimeGrid(events, range(5, 7), {
      slotMinTime: '08:00',
      slotMaxTime: '18:00',
    });
    expect(clipped.days[0]!.segments[0]).toMatchObject({
      start: day(5, 8),
      end: day(5, 18),
      top: 0,
      height: 1,
      isStart: false,
      isEnd: false,
    });
    expect(clipped.days[1]!.segments[0]).toMatchObject({
      top: 0,
      height: 0.2,
      isEnd: true,
    });
  });

  it('assigns columns to transitive clusters, nested intervals and touching endpoints', () => {
    const result = layoutTimeGrid(
      [
        event('b', day(5, 9), day(5, 10)),
        event('outer', day(5, 9), day(5, 12)),
        event('nested', day(5, 9, 30), day(5, 10, 30)),
        event('reuse', day(5, 10), day(5, 11)),
        event('tail', day(5, 11), day(5, 13)),
        event('separate', day(5, 13), day(5, 14)),
      ],
      range(5, 6),
    ).days[0]!.segments;
    expect(
      result.map(({ event, column, columnCount }) => [event.id, column, columnCount]),
    ).toEqual([
      ['outer', 0, 3],
      ['b', 1, 3],
      ['nested', 2, 3],
      ['reuse', 1, 3],
      ['tail', 1, 3],
      ['separate', 0, 1],
    ]);
    const chain = layoutTimeGrid(
      [
        event('a', day(5, 8), day(5, 10)),
        event('b', day(5, 9), day(5, 11)),
        event('c', day(5, 10), day(5, 12)),
      ],
      range(5, 6),
    ).days[0]!.segments;
    expect(chain.map(({ column, columnCount }) => [column, columnCount])).toEqual([
      [0, 2],
      [1, 2],
      [0, 2],
    ]);
  });

  it('packs only visible intersections, uses fractional seconds and reuses month packing for all-day events', () => {
    const allDay = [
      event('all', day(5), day(8), true),
      event('hidden', day(6), day(7), true),
    ];
    const result = layoutTimeGrid(
      [
        ...allDay,
        event('before', day(5, 7), day(5, 8)),
        event('after', day(5, 18), day(5, 19)),
        event('visible', day(5, 10, 30), day(5, 11)),
      ],
      range(),
      { slotMinTime: '08:00:00', slotMaxTime: '18:00:00', dayMaxEvents: 1 },
    );
    expect(result.days[0]!.segments).toHaveLength(1);
    expect(result.days[0]!.segments[0]).toMatchObject({
      top: 0.25,
      height: 0.05,
      columnCount: 1,
      isStart: true,
      isEnd: true,
    });
    expect(result.allDay).toEqual(layoutMonth(allDay, range(), { dayMaxEvents: 1 }));
    expect(result.days[1]!.segments).toEqual([]);
  });
});

describe('list grouping', () => {
  it('includes empty dates, repeats spanning events, sorts all-day first and preserves ties', () => {
    const events = [
      event('timed', day(5, 9), day(5, 10)),
      event('tie', day(5, 9), day(5, 10)),
      event('overnight', day(4, 23), day(6)),
      event('all', day(5), day(7), true),
    ];
    const days = layoutList(events, range(5, 8));
    expect(days.map(({ segments }) => segments.map(({ event }) => event.id))).toEqual([
      ['all', 'overnight', 'timed', 'tie'],
      ['all'],
      [],
    ]);
    expect(days[0]!.segments[1]).toMatchObject({
      start: day(5),
      end: day(6),
      isStart: false,
      isEnd: true,
    });
    expect(days[1]!.segments[0]).toMatchObject({ isStart: false, isEnd: true });
  });
});

describe('layout boundaries and validation', () => {
  it.each([layoutMonth, layoutList, layoutTimeGrid])(
    'rejects invalid and non-midnight layout ranges',
    (layout) => {
      for (const input of [
        range(5, 5),
        range(6, 5),
        { start: new Date(NaN), end: day(6) },
        { start: day(5, 1), end: day(6) },
        { start: day(5), end: day(6, 1) },
      ]) {
        expect(() => layout([], input)).toThrow(RangeError);
      }
    },
  );

  it('rejects invalid normalized events even outside the requested range', () => {
    const invalid = { ...event('invalid', day(1), day(2)), end: new Date(NaN) };
    expect(() => filterEvents([invalid], range())).toThrow(RangeError);
    expect(() => sortEvents([invalid])).toThrow(RangeError);
    expect(() => filterEvents([], range(5, 5))).toThrow(RangeError);
  });

  it.each([-1, 1.5, Infinity, NaN])(
    'rejects invalid dayMaxEvents %s',
    (dayMaxEvents) => {
      expect(() => layoutMonth([], range(), { dayMaxEvents })).toThrow(RangeError);
      expect(() => layoutTimeGrid([], range(), { dayMaxEvents })).toThrow(RangeError);
    },
  );

  it.each([
    { slotMinTime: '8:00' },
    { slotMaxTime: '25:00' },
    { slotMaxTime: '24:01' },
    { slotMinTime: '-01:00' },
    { slotMaxTime: '10:60' },
    { slotMinTime: '12:00', slotMaxTime: '12:00' },
    { slotMinTime: '18:00', slotMaxTime: '08:00' },
    { slotMinTime: '00:00:60' },
  ])('rejects invalid time windows %o', (options) => {
    expect(() => layoutTimeGrid([], range(), options)).toThrow(RangeError);
  });

  it.each([
    [2026, 2, 8],
    [2026, 10, 1],
  ])(
    'keeps local date rows and wall-clock fractions across DST',
    (year, month, date) => {
      const start = new TZDate(year!, month!, date!, 0, 0, 0, 'America/New_York');
      const end = new TZDate(year!, month!, date! + 1, 0, 0, 0, 'America/New_York');
      const events = [
        event('all', start, end, true),
        event(
          'timed',
          new TZDate(year!, month!, date!, 9, 0, 0, 'America/New_York'),
          new TZDate(year!, month!, date!, 10, 0, 0, 'America/New_York'),
        ),
      ];
      const bounds = { start, end };
      expect(layoutMonth(events, bounds)[0]!.days).toHaveLength(1);
      expect(layoutList(events, bounds)).toHaveLength(1);
      expect(layoutTimeGrid(events, bounds).days[0]!.segments[0]).toMatchObject({
        top: 9 / 24,
        height: 1 / 24,
      });
    },
  );

  it('does not mutate event boundaries or range dates and clones segment boundaries', () => {
    const input = event('a', day(5, 9), day(5, 10));
    const bounds = range();
    const snapshot = JSON.stringify({ input, bounds });
    for (const segment of [
      layoutMonth([input], bounds)[0]!.segments[0]!,
      layoutList([input], bounds)[0]!.segments[0]!,
      layoutTimeGrid([input], bounds).days[0]!.segments[0]!,
    ]) {
      segment.start.setDate(1);
      segment.end.setDate(1);
    }
    expect(JSON.stringify({ input, bounds })).toBe(snapshot);
  });
});
