import { expect, it } from 'vitest';
import { DateFormat, formatCurrency, formatDate, formatNumber } from './index';

it('formats numbers per explicit locale, preserves zero and supports Intl precision and percentage options', () => {
  expect(formatNumber(1234567.89)).toBe('1.234.567,89');
  expect(formatNumber(1234567.89, { locale: 'en-US' })).toBe('1,234,567.89');
  expect(formatNumber(0)).toBe('0');
  expect(formatNumber(-12.345, { locale: 'en-US', maximumFractionDigits: 2 })).toBe(
    '-12.35',
  );
  expect(formatNumber(0.25, { locale: 'en-US', style: 'percent' })).toBe('25%');
});

it('uses explicit currencies and their minor-unit defaults rather than guessing from locale', () => {
  expect(formatCurrency(1234.5, 'USD', { locale: 'en-US' })).toBe('$1,234.50');
  expect(formatCurrency(1234.5, 'VND', { locale: 'en-US' })).toBe('₫1,235');
  expect(formatCurrency(0, 'USD', { locale: 'en-US' })).toBe('$0.00');
  expect(
    formatCurrency(10, 'EUR', { locale: 'en-US', currencyDisplay: 'code' }),
  ).toContain('EUR');
});

it('renders absent/nonfinite values as missing, supports explicit fallback and rejects invalid formatter configuration', () => {
  for (const value of [null, undefined, NaN, Infinity, -Infinity]) {
    expect(formatNumber(value)).toBe('—');
    expect(formatCurrency(value, 'USD')).toBe('—');
  }
  expect(formatNumber(null, { fallback: 'Not available' })).toBe('Not available');
  expect(() => formatCurrency(1, 'invalid')).toThrow(RangeError);
  expect(() =>
    formatNumber(1, { minimumFractionDigits: 3, maximumFractionDigits: 1 }),
  ).toThrow(RangeError);
});

it('formats instants deterministically and honors requested time zones without mutating Date input', () => {
  const value = new Date('2026-11-06T01:30:00Z');
  const options = {
    locale: 'en-US',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  } as const;
  expect(formatDate(value, options)).toBe('11/06/2026');
  expect(formatDate(value.getTime(), options)).toBe('11/06/2026');
  expect(formatDate('2026-11-06T08:30:00+07:00', options)).toBe('11/06/2026');
  expect(formatDate(value, { ...options, timeZone: 'America/Los_Angeles' })).toBe(
    '11/05/2026',
  );
  expect(value.toISOString()).toBe('2026-11-06T01:30:00.000Z');
  expect(formatDate(0, options)).toBe('01/01/1970');
});

it('preserves ISO calendar dates across time zones and accepts leap days only in leap years', () => {
  const options = {
    locale: 'en-US',
    dateStyle: 'medium',
    timeZone: 'America/Los_Angeles',
  } as const;
  expect(formatDate('2026-11-06', options)).toBe('Nov 6, 2026');
  expect(formatDate('2024-02-29', options)).toBe('Feb 29, 2024');
  expect(formatDate('2025-02-29', options)).toBe('—');
  expect(formatDate('2026-02-30T12:00:00Z', options)).toBe('—');
});

it('rejects missing, invalid and ambiguous dates, while leaving invalid configuration visible', () => {
  for (const value of [
    null,
    undefined,
    '',
    '11/06/2026',
    '2026-11-06T12:00:00',
    'bad',
    NaN,
    Infinity,
    new Date(NaN),
  ])
    expect(formatDate(value)).toBe('—');
  expect(formatDate('bad', { fallback: '' })).toBe('');
  expect(() => formatDate(0, { timeZone: 'Not/AZone' })).toThrow(RangeError);
});

it('supports typed predefined formats and custom date-fns patterns with explicit zones', () => {
  expect(formatDate('2026-11-06')).toBe('06/11/2026');
  expect(formatDate('2026-11-06', DateFormat.YMD)).toBe('2026-11-06');
  expect(
    formatDate('2026-11-06T08:30:00Z', 'dd/MM/yyyy HH:mm', {
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  ).toBe('06/11/2026 15:30');
  expect(formatDate('2026-11-06', 'MMMM', { locale: 'en-US' })).toBe('November');
  expect(formatDate('2026-11-06', 'MMMM', { locale: 'vi-VN' })).toBe('tháng 11');
  expect(
    formatDate('2026-11-06', DateFormat.DMY, { timeZone: 'America/Los_Angeles' }),
  ).toBe('06/11/2026');
  expect(formatDate(null, DateFormat.DMY, { fallback: '' })).toBe('');
  expect(() => formatDate(0, DateFormat.DMY, { timeZone: 'Not/AZone' })).toThrow(
    RangeError,
  );
});
