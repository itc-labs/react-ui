import { expect, it } from 'vitest';
import {
  calendarDateString,
  dateSpan,
  parseCalendarDate,
  timeMinutes,
  timeSlots,
} from './model';

it('rejects normalized invalid dates while preserving leap days and strict date-only values', () => {
  expect(parseCalendarDate('2023-02-29')).toBeNull();
  expect(parseCalendarDate('2026-04-31')).toBeNull();
  expect(parseCalendarDate('2026-2-03')).toBeNull();
  for (const date of ['2024-02-29', '2026-10-27', '0099-12-31'])
    expect(calendarDateString(parseCalendarDate(date)!)).toBe(date);
});

it('counts inclusive days across DST and early-year boundaries without elapsed-hour math', () => {
  expect(dateSpan('2026-03-07', '2026-03-09')).toBe(3);
  expect(dateSpan('0099-12-31', '0100-01-01')).toBe(2);
  expect(dateSpan('2026-10-27', '2026-10-27')).toBe(1);
  expect(dateSpan('bad', '2026-10-27')).toBeNaN();
});

it('keeps time slots bounded, aligned to min and represented as canonical wall-clock strings', () => {
  expect(timeSlots('09:10', '10:00', 15)).toEqual(['09:10', '09:25', '09:40', '09:55']);
  expect(timeMinutes('23:59')).toBe(1439);
  expect(timeMinutes('24:00')).toBeNull();
  expect(timeMinutes('9:30')).toBeNull();
  expect(() => timeSlots('18:00', '09:00')).toThrow(RangeError);
  expect(() => timeSlots('00:00', '23:59', 0)).toThrow(RangeError);
});
