import { format as formatPattern, type Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { vi } from 'date-fns/locale/vi';
import { tz } from '@date-fns/tz';

export type FormatDateOptions = Intl.DateTimeFormatOptions & {
  locale?: string;
  fallback?: string;
};
export type FormatDateValue = Date | string | number | null | undefined;

function parseDate(
  value: Exclude<FormatDateValue, null | undefined>,
): Date | undefined {
  if (value instanceof Date)
    return Number.isFinite(value.getTime()) ? value : undefined;
  if (typeof value === 'number') {
    const date = new Date(value);

    return Number.isFinite(date.getTime()) ? date : undefined;
  }
  // Reject ambiguous local strings and datetimes without an explicit offset.
  if (
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(
      value,
    )
  )
    return undefined;
  const day = value.slice(0, 10);
  const calendar = new Date(`${day}T00:00:00.000Z`);
  if (
    !Number.isFinite(calendar.getTime()) ||
    calendar.toISOString().slice(0, 10) !== day
  )
    return undefined;
  const date = new Date(value.length === 10 ? calendar.getTime() : value);

  return Number.isFinite(date.getTime()) ? date : undefined;
}

export enum DateFormat {
  DMY = 'dd/MM/yyyy',
  YMD = 'yyyy-MM-dd',
  DMY_TIME = 'dd/MM/yyyy HH:mm',
  DMY_SECONDS = 'dd/MM/yyyy HH:mm:ss',
  TIME = 'HH:mm',
}

/** Keep predefined formats in editor suggestions while allowing custom patterns. */
export type DateFormatPattern = DateFormat | (string & {});
export type FormatDatePatternOptions = {
  locale?: string;
  timeZone?: string;
  fallback?: string;
  /** date-fns locale for custom languages; built-in pattern labels support vi/en. */
  dateLocale?: Locale;
};

const patternLocales: Readonly<Record<string, Locale>> = { vi, en: enUS };

/** Date-only ISO values keep their calendar day. Instants default to UTC. */
export function formatDate(
  value: FormatDateValue,
  pattern?: DateFormatPattern,
  options?: FormatDatePatternOptions,
): string;

export function formatDate(value: FormatDateValue, options: FormatDateOptions): string;

export function formatDate(
  value: FormatDateValue,
  patternOrOptions: DateFormatPattern | FormatDateOptions = DateFormat.DMY,
  patternOptions: FormatDatePatternOptions = {},
): string {
  const settings =
    typeof patternOrOptions === 'string' ? patternOptions : patternOrOptions;
  const { locale = 'vi-VN', fallback = '—', timeZone = 'UTC' } = settings;
  if (value == null) return fallback;
  const date = parseDate(value);
  if (!date) return fallback;
  const calendarOnly = typeof value === 'string' && value.length === 10;
  const zone = calendarOnly ? 'UTC' : timeZone;

  if (typeof patternOrOptions === 'string') {
    // Validate configuration rather than swallowing malformed locale/time-zone options.
    new Intl.DateTimeFormat(locale, { timeZone: zone });
    const dateLocale =
      patternOptions.dateLocale ??
      patternLocales[new Intl.Locale(locale).language] ??
      enUS;

    return formatPattern(date, patternOrOptions, { locale: dateLocale, in: tz(zone) });
  }
  const {
    locale: _locale,
    fallback: _fallback,
    timeZone: _zone,
    ...options
  } = patternOrOptions;

  return new Intl.DateTimeFormat(locale, { ...options, timeZone: zone }).format(date);
}
