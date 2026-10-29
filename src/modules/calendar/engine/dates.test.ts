import { TZDate } from '@date-fns/tz';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { navigate, normalizeEvent, viewRange, viewTitle, weekStart } from '../index';
import type { CalendarEvent, NormalizedEvent } from '../index';

afterEach(() => vi.useRealTimers());

describe('normalizeEvent', () => {
  it('preserves typed metadata and clones input boundaries', () => {
    const start = new Date(2026, 9, 29, 10);
    const end = new Date(2026, 9, 29, 12);
    const event: CalendarEvent<{ count: number }> = {
      id: 'event',
      title: 'Event',
      start,
      end,
      data: { count: 0 },
      tone: 'info',
      color: 'var(--color-accent)',
      editable: false,
      startEditable: true,
      durationEditable: false,
      resourceId: 'room',
      className: 'event',
    };
    const result = normalizeEvent(event);
    expectTypeOf(result).toEqualTypeOf<NormalizedEvent<{ count: number }>>();
    expect(result).toEqual({ ...event, allDay: false });
    expect(result.start).not.toBe(start);
    expect(result.end).not.toBe(end);
    result.start.setDate(1);
    expect(start.getDate()).toBe(29);
  });

  it('parses ISO offsets and defaults timed events to one elapsed hour', () => {
    const result = normalizeEvent({
      id: 'a',
      title: '',
      start: '2026-10-29T10:30:00+07:00',
    });
    expect(result.start.toISOString()).toBe('2026-10-29T03:30:00.000Z');
    expect(result.end.getTime() - result.start.getTime()).toBe(3_600_000);
    expect(
      normalizeEvent({
        id: 'b',
        title: '',
        start: '2026-10-29T03:30:00Z',
        end: '2026-10-29T04:00:00Z',
      }).end.toISOString(),
    ).toBe('2026-10-29T04:00:00.000Z');
  });

  it('uses local midnight for date-only/all-day input and keeps explicit ends exclusive', () => {
    const result = normalizeEvent({
      id: 'a',
      title: '',
      start: '2026-10-29',
      allDay: true,
    });
    expect(result.start).toEqual(new Date(2026, 9, 29));
    expect(result.end).toEqual(new Date(2026, 9, 30));
    expect(
      normalizeEvent({
        id: 'a',
        title: '',
        start: new Date(2026, 9, 29, 10),
        end: '2026-11-02',
        allDay: true,
      }),
    ).toMatchObject({ start: new Date(2026, 9, 29), end: new Date(2026, 10, 2) });
    expect(normalizeEvent({ id: 'a', title: '', start: '2026-10-29' }).start).toEqual(
      new Date(2026, 9, 29),
    );
  });

  it.each([
    { start: 'invalid' },
    { start: '2026-02-30' },
    { start: new Date(NaN) },
    { start: '2026-10-29', end: 'invalid' },
    { start: '2026-10-29', end: '2026-10-29' },
    { start: '2026-10-29', end: '2026-10-28' },
    { start: '2026-10-29T10:00', end: '2026-10-29T11:00', allDay: true },
  ])('rejects invalid boundaries: %o', (dates) => {
    expect(() => normalizeEvent({ id: 'a', title: '', ...dates })).toThrow(RangeError);
  });
});

describe('weekStart and viewRange', () => {
  it.each([
    [0, 25],
    [1, 26],
    [6, 24],
  ] as const)('starts weeks on %i', (weekStartsOn, day) => {
    const input = new Date(2026, 9, 29, 15, 30);
    expect(weekStart(input, weekStartsOn)).toEqual(new Date(2026, 9, day));
    expect(viewRange('week', input, { weekStartsOn })).toEqual({
      start: new Date(2026, 9, day),
      end: new Date(2026, 10, day - 24),
    });
    expect(input).toEqual(new Date(2026, 9, 29, 15, 30));
  });

  it.each([0, 1, 6] as const)(
    'includes the whole month and aligned weeks for start %i',
    (weekStartsOn) => {
      for (let month = 0; month < 12; month++) {
        const range = viewRange('month', new Date(2026, month, 15), { weekStartsOn });
        expect(range.start.getDay()).toBe(weekStartsOn);
        expect(range.end.getDay()).toBe(weekStartsOn);
        expect(range.start.getTime()).toBeLessThanOrEqual(
          new Date(2026, month, 1).getTime(),
        );
        expect(range.end.getTime()).toBeGreaterThanOrEqual(
          new Date(2026, month + 1, 1).getTime(),
        );
        const expected = new Date(range.start);
        expected.setDate(expected.getDate() + 42);
        expect(range.end).toEqual(expected);
      }
    },
  );

  it('supports compact four/five/six-week grids, leap years and year boundaries', () => {
    expect(
      viewRange('month', new Date(2021, 1, 15), { fixedWeekCount: false }),
    ).toEqual({ start: new Date(2021, 1, 1), end: new Date(2021, 2, 1) });
    expect(
      viewRange('month', new Date(2026, 9, 15), { fixedWeekCount: false }),
    ).toEqual({ start: new Date(2026, 8, 28), end: new Date(2026, 10, 2) });
    expect(
      viewRange('month', new Date(2026, 10, 15), { fixedWeekCount: false }),
    ).toEqual({ start: new Date(2026, 9, 26), end: new Date(2026, 11, 7) });
    expect(viewRange('day', new Date(2024, 1, 29, 23))).toEqual({
      start: new Date(2024, 1, 29),
      end: new Date(2024, 2, 1),
    });
    expect(viewRange('list', new Date(2026, 11, 29))).toEqual({
      start: new Date(2026, 11, 29),
      end: new Date(2027, 0, 5),
    });
    expect(viewRange('list', new Date(2026, 9, 29), { listDays: 1 })).toEqual(
      viewRange('day', new Date(2026, 9, 29)),
    );
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER])(
    'rejects invalid listDays %s',
    (listDays) => {
      expect(() => viewRange('list', new Date(), { listDays })).toThrow(RangeError);
    },
  );

  it('rejects invalid dates and week starts', () => {
    expect(() => weekStart(new Date(NaN))).toThrow(RangeError);
    expect(() => weekStart(new Date(), 7 as 0)).toThrow(RangeError);
    expect(() => weekStart(new Date(), 1.5 as 0)).toThrow(RangeError);
    expect(() => viewRange('month', new Date(NaN))).toThrow(RangeError);
  });
});

describe('navigate', () => {
  it('clamps month ends and crosses leap/year boundaries without mutating input', () => {
    const input = new Date(2024, 0, 31, 13);
    expect(navigate('month', input, 'next')).toEqual(new Date(2024, 1, 29, 13));
    expect(navigate('month', new Date(2026, 2, 31), 'prev')).toEqual(
      new Date(2026, 1, 28),
    );
    expect(navigate('month', new Date(2026, 11, 15), 'next')).toEqual(
      new Date(2027, 0, 15),
    );
    expect(input).toEqual(new Date(2024, 0, 31, 13));
  });

  it.each(['day', 'week', 'list'] as const)(
    'navigates %s in both directions',
    (view) => {
      const input = new Date(2026, 9, 29, 13);
      const days = view === 'day' ? 1 : 7;
      expect(navigate(view, input, 'next')).toEqual(new Date(2026, 9, 29 + days, 13));
      expect(navigate(view, input, 'prev')).toEqual(new Date(2026, 9, 29 - days, 13));
    },
  );

  it('returns current local midnight for today in every view', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 29, 15));
    for (const view of ['month', 'week', 'day', 'list'] as const) {
      expect(navigate(view, new Date(2020, 0, 1), 'today')).toEqual(
        new Date(2026, 9, 29),
      );
    }
    expect(() => navigate('day', new Date(NaN), 'next')).toThrow(RangeError);
  });
});

describe('DST-safe calendar arithmetic', () => {
  it.each([
    [2026, 2, 8, 23],
    [2026, 10, 1, 25],
  ])('keeps local boundaries across %i-%i-%i', (year, month, day, hours) => {
    const input = new TZDate(year, month, day, 0, 0, 0, 'America/New_York');
    const range = viewRange('day', input);
    expect(range.end.getHours()).toBe(0);
    expect(range.end.getDate()).toBe(day + 1);
    expect(range.end.getTime() - range.start.getTime()).toBe(hours * 3_600_000);
    expect(navigate('day', input, 'next').getHours()).toBe(0);
    const week = viewRange('week', input, { weekStartsOn: 0 });
    expect(week.end.getHours()).toBe(0);
    expect(week.end.getTime() - week.start.getTime()).toBe(
      (6 * 24 + hours) * 3_600_000,
    );
    const list = viewRange('list', input);
    expect(list.end.getTime()).toBe(week.end.getTime());
    expect(weekStart(input, 0).getTime()).toBe(input.getTime());
    const allDay = normalizeEvent({
      id: 'all-day',
      title: '',
      start: input,
      allDay: true,
    });
    expect(allDay.end.getTime()).toBe(range.end.getTime());
    expect(allDay.end.getHours()).toBe(0);
    const timed = normalizeEvent({ id: 'timed', title: '', start: input });
    expect(timed.end.getTime() - timed.start.getTime()).toBe(3_600_000);
    const monthRange = viewRange('month', input);
    expect(monthRange.end.getHours()).toBe(0);
    expect(monthRange.end.getDay()).toBe(1);
    expect(navigate('day', range.end, 'prev').getTime()).toBe(input.getTime());
  });
});

describe('viewTitle', () => {
  it.each(['vi', 'vi-VN', 'en', 'en-US'])('formats month titles for %s', (locale) => {
    expect(viewTitle('month', viewRange('month', new Date(2026, 9, 29)), locale)).toBe(
      locale.startsWith('vi') ? 'Tháng 10, 2026' : 'October 2026',
    );
  });

  it('formats compact months, same-month, cross-month and cross-year ranges', () => {
    expect(
      viewTitle(
        'month',
        viewRange('month', new Date(2021, 1, 1), { fixedWeekCount: false }),
        'en',
      ),
    ).toBe('February 2021');
    expect(viewTitle('week', viewRange('week', new Date(2026, 9, 29)), 'en')).toBe(
      'Oct 26 – Nov 1, 2026',
    );
    expect(viewTitle('week', viewRange('week', new Date(2026, 9, 5)), 'en')).toBe(
      'Oct 5 – 11, 2026',
    );
    expect(viewTitle('list', viewRange('list', new Date(2026, 11, 29)), 'en')).toBe(
      'Dec 29, 2026 – Jan 4, 2027',
    );
    expect(viewTitle('day', viewRange('day', new Date(2026, 9, 29)), 'en')).toBe(
      'October 29, 2026',
    );
    expect(
      viewTitle(
        'list',
        viewRange('list', new Date(2026, 9, 29), { listDays: 1 }),
        'en',
      ),
    ).toBe('Oct 29, 2026');
    expect(() =>
      viewTitle('day', { start: new Date(), end: new Date(NaN) }, 'en'),
    ).toThrow(RangeError);
    expect(() =>
      viewTitle(
        'week',
        { start: new Date(2026, 9, 2), end: new Date(2026, 9, 1) },
        'en',
      ),
    ).toThrow(RangeError);
  });
});
