import { TZDate } from '@date-fns/tz';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  fractionToTime,
  moveEvent,
  normalizeEvent,
  rangeFromSelection,
  resizeEvent,
  snapTime,
  type NormalizedEvent,
} from '../index';

const day = (date: number, hour = 0, minute = 0, second = 0) =>
  new Date(2026, 9, date, hour, minute, second);

const event = (allDay = false) =>
  normalizeEvent({
    id: 'event',
    title: '',
    start: allDay ? day(29) : day(29, 10),
    end: allDay ? day(31) : day(29, 11, 30),
    allDay,
    data: { count: 0 },
    editable: false,
    resourceId: 'room',
    className: 'event',
  });

describe('slot interaction math', () => {
  it('snaps to the nearest midnight-based slot with forward ties and date rollover', () => {
    expect(snapTime(day(29, 10, 14, 59))).toEqual(day(29, 10));
    expect(snapTime(day(29, 10, 15))).toEqual(day(29, 10, 30));
    expect(snapTime(day(29, 10, 8), 15)).toEqual(day(29, 10, 15));
    expect(snapTime(day(31, 23, 59))).toEqual(new Date(2026, 10, 1));
    expect(snapTime(day(29, 12), 1440)).toEqual(day(30));
    const input = day(29, 10, 14);
    snapTime(input).setDate(1);
    expect(input).toEqual(day(29, 10, 14));
  });

  it('maps and clamps full-day and restricted window fractions', () => {
    expect(fractionToTime(day(29, 12), 0)).toEqual(day(29));
    expect(fractionToTime(day(29), 1)).toEqual(day(30));
    expect(fractionToTime(day(29), -2)).toEqual(day(29));
    expect(fractionToTime(day(29), 2)).toEqual(day(30));
    expect(fractionToTime(day(29), 0.5)).toEqual(day(29, 12));
    const options = { slotMinTime: '08:00', slotMaxTime: '18:00', slotDuration: 15 };
    expect(fractionToTime(day(29), 0.25, options)).toEqual(day(29, 10, 30));
    const unaligned = { slotMinTime: '08:10:15', slotMaxTime: '18:10:15' };
    expect(fractionToTime(day(29), 0, unaligned)).toEqual(day(29, 8, 10, 15));
    expect(fractionToTime(day(29), 1, unaligned)).toEqual(day(29, 18));
  });

  it.each([0, -1, 1.5, 7, 1441, NaN, Infinity])(
    'rejects invalid slot duration %s',
    (slotDuration) => {
      expect(() => snapTime(day(29), slotDuration)).toThrow(RangeError);
      expect(() => fractionToTime(day(29), 0.5, { slotDuration })).toThrow(RangeError);
      expect(() => rangeFromSelection(day(29), day(29), { slotDuration })).toThrow(
        RangeError,
      );
    },
  );

  it('rejects invalid dates, fractions and windows', () => {
    expect(() => snapTime(new Date(NaN))).toThrow(RangeError);
    expect(() => fractionToTime(new Date(NaN), 0)).toThrow(RangeError);
    for (const fraction of [NaN, Infinity, -Infinity]) {
      expect(() => fractionToTime(day(29), fraction)).toThrow(RangeError);
    }
    for (const options of [
      { slotMinTime: '8:00' },
      { slotMaxTime: '24:01' },
      { slotMinTime: '12:00', slotMaxTime: '12:00' },
      { slotMinTime: '18:00', slotMaxTime: '08:00' },
    ]) {
      expect(() => fractionToTime(day(29), 0.5, options)).toThrow(RangeError);
    }
  });
});

describe('moveEvent and conversions', () => {
  it('moves by positive, negative and zero deltas, keeping duration and typed metadata', () => {
    const input = Object.freeze(event());
    const moved = moveEvent(input, { days: 1, minutes: -30 });
    expectTypeOf(moved).toEqualTypeOf<NormalizedEvent<{ count: number }>>();
    expect(moved).toEqual({ ...input, start: day(30, 9, 30), end: day(30, 11) });
    expect(moved.data).toBe(input.data);
    expect(moveEvent(input, { days: -1, minutes: 30 })).toMatchObject({
      start: day(28, 10, 30),
      end: day(28, 12),
    });
    const clone = moveEvent(input, {});
    clone.start.setDate(1);
    clone.end.setDate(1);
    expect(input.start).toEqual(day(29, 10));
    expect(input.end).toEqual(day(29, 11, 30));
    expect(moveEvent(event(true), { days: 3 })).toMatchObject({
      start: new Date(2026, 10, 1),
      end: new Date(2026, 10, 3),
      allDay: true,
    });
  });

  it('converts timed events to occupied all-day dates with exclusive midnight ends', () => {
    expect(moveEvent(event(), {}, { allDay: true })).toMatchObject({
      start: day(29),
      end: day(30),
      allDay: true,
    });
    const overnight = normalizeEvent({
      id: 'a',
      title: '',
      start: day(29, 23),
      end: day(31, 1),
    });
    expect(moveEvent(overnight, { days: -1 }, { allDay: true })).toMatchObject({
      start: day(28),
      end: day(31),
    });
    expect(moveEvent({ ...overnight, end: day(31) }, {}, { allDay: true }).end).toEqual(
      day(31),
    );
  });

  it('converts all-day to timed using an explicit default duration and target minute offset', () => {
    expect(
      moveEvent(event(true), { days: 1, minutes: 9 * 60 }, { allDay: false }),
    ).toMatchObject({ start: day(30, 9), end: day(30, 10), allDay: false });
    expect(
      moveEvent(event(true), {}, { allDay: false, defaultTimedDuration: 90 }),
    ).toMatchObject({ start: day(29), end: day(29, 1, 30) });
  });

  it('rejects invalid deltas, durations and all-day time deltas', () => {
    for (const delta of [
      { days: 0.5 },
      { minutes: NaN },
      { days: Infinity },
      { minutes: 0.5 },
    ]) {
      expect(() => moveEvent(event(), delta)).toThrow(RangeError);
    }
    expect(() => moveEvent(event(true), { minutes: 30 })).toThrow(RangeError);
    expect(() => moveEvent(event(), {}, { defaultTimedDuration: 0 })).toThrow(
      RangeError,
    );
    expect(() => moveEvent(event(), { days: Number.MAX_SAFE_INTEGER })).toThrow(
      RangeError,
    );
  });
});

describe('resizeEvent', () => {
  it('resizes either edge, clamping crossing and short ranges while fixing the opposite edge', () => {
    const input = event();
    expect(resizeEvent(input, 'end', day(29, 13))).toMatchObject({
      start: day(29, 10),
      end: day(29, 13),
    });
    expect(resizeEvent(input, 'end', day(28))).toMatchObject({
      start: day(29, 10),
      end: day(29, 10, 30),
    });
    expect(resizeEvent(input, 'start', day(30))).toMatchObject({
      start: day(29, 11),
      end: day(29, 11, 30),
    });
    expect(resizeEvent(input, 'start', day(28, 9), 60).start).toEqual(day(28, 9));
    expect(resizeEvent(input, 'end', day(29, 10, 15), 60).end).toEqual(day(29, 11));
    const result = resizeEvent(input, 'end', day(30));
    expectTypeOf(result).toEqualTypeOf<NormalizedEvent<{ count: number }>>();
    expect(result.data).toBe(input.data);
    result.start.setDate(1);
    expect(input.start).toEqual(day(29, 10));
  });

  it('uses midnight boundaries and rounds all-day minimums up to whole dates', () => {
    expect(resizeEvent(event(true), 'end', day(28, 12)).end).toEqual(day(30));
    expect(resizeEvent(event(true), 'start', day(31, 12)).start).toEqual(day(30));
    expect(resizeEvent(event(true), 'end', day(29), 1441).end).toEqual(day(31));
  });

  it.each([0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER])(
    'rejects invalid minimum duration %s',
    (duration) => {
      expect(() => resizeEvent(event(), 'end', day(30), duration)).toThrow(RangeError);
    },
  );
});

describe('rangeFromSelection', () => {
  it('includes both endpoint cells, supporting backwards and same-cell selection', () => {
    const expected = { start: day(29, 10), end: day(29, 11, 30) };
    expect(rangeFromSelection(day(29, 10), day(29, 11))).toEqual(expected);
    expect(rangeFromSelection(day(29, 11), day(29, 10))).toEqual(expected);
    expect(
      rangeFromSelection(day(29, 10, 2), day(29, 10, 3), { slotDuration: 15 }),
    ).toEqual({ start: day(29, 10), end: day(29, 10, 15) });
    expect(rangeFromSelection(day(29, 23, 30), day(30))).toEqual({
      start: day(29, 23, 30),
      end: day(30, 0, 30),
    });
  });

  it('selects inclusive all-day dates and clones boundaries', () => {
    const anchor = day(31, 12);
    const focus = day(29, 8);
    const result = rangeFromSelection(anchor, focus, { allDay: true });
    expect(result).toEqual({ start: day(29), end: new Date(2026, 10, 1) });
    expect(rangeFromSelection(focus, focus, { allDay: true })).toEqual({
      start: day(29),
      end: day(30),
    });
    result.start.setDate(1);
    expect(focus).toEqual(day(29, 8));
    expect(anchor).toEqual(day(31, 12));
  });
});

describe('interaction boundary validation', () => {
  it('rejects invalid normalized events and selection/resize dates', () => {
    for (const input of [
      { ...event(), end: day(28) },
      { ...event(), start: new Date(NaN) },
      { ...event(), allDay: true },
    ]) {
      expect(() => moveEvent(input, {})).toThrow(RangeError);
      expect(() => resizeEvent(input, 'end', day(30))).toThrow(RangeError);
    }
    expect(() => resizeEvent(event(), 'end', new Date(NaN))).toThrow(RangeError);
    expect(() => rangeFromSelection(new Date(NaN), day(30))).toThrow(RangeError);
    expect(() => rangeFromSelection(day(29), new Date(NaN), { allDay: true })).toThrow(
      RangeError,
    );
  });
});

describe('local date interaction arithmetic across daylight-saving changes', () => {
  it.each([
    [2, 8, 23],
    [10, 1, 25],
  ])(
    'preserves calendar dates and timed elapsed duration in month %i',
    (month, date, hours) => {
      const local = (offset = 0, hour = 0) =>
        new TZDate(2026, month!, date! + offset, hour, 0, 0, 'America/New_York');

      const allDay = normalizeEvent({
        id: 'a',
        title: '',
        start: local(-1),
        allDay: true,
      });
      const moved = moveEvent(allDay, { days: 1 });
      expect(moved.start.getHours()).toBe(0);
      expect(moved.end.getHours()).toBe(0);
      expect(+moved.end - +moved.start).toBe(hours! * 3_600_000);
      expect(+rangeFromSelection(local(), local(), { allDay: true }).end).toBe(
        +local(1),
      );
      expect(+fractionToTime(local(), 1)).toBe(+local(1));
      expect(snapTime(local(0, 9)).getHours()).toBe(9);
      const timed = normalizeEvent({
        id: 't',
        title: '',
        start: local(-1, 1),
        end: local(-1, 4),
      });
      const movedTimed = moveEvent(timed, { days: 1 });
      expect(+movedTimed.end - +movedTimed.start).toBe(3 * 3_600_000);
      expect(+resizeEvent(moved, 'end', local(-1)).end).toBe(+local(1));
    },
  );
});
