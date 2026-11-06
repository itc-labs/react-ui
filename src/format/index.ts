/** Stateless formatters for server and browser code. No React or global locale. */
export type FormatNumberOptions = Intl.NumberFormatOptions & {
  locale?: string;
  fallback?: string;
};
export type FormatCurrencyOptions = Omit<FormatNumberOptions, 'style' | 'currency'>;
export type FormatDateOptions = Intl.DateTimeFormatOptions & {
  locale?: string;
  fallback?: string;
};
export type FormatDateValue = Date | string | number | null | undefined;

export function formatNumber(
  value: number | null | undefined,
  { locale = 'vi-VN', fallback = '—', ...options }: FormatNumberOptions = {},
): string {
  if (value == null || !Number.isFinite(value)) return fallback;

  return new Intl.NumberFormat(locale, options).format(value);
}

/** Currency is explicit: a locale does not identify the money's denomination. */
export function formatCurrency(
  value: number | null | undefined,
  currency: string,
  { locale = 'vi-VN', fallback = '—', ...options }: FormatCurrencyOptions = {},
): string {
  if (value == null || !Number.isFinite(value)) return fallback;

  return new Intl.NumberFormat(locale, {
    ...options,
    style: 'currency',
    currency,
  }).format(value);
}

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

/** Date-only ISO values keep their calendar day. Instants default to UTC. */
export function formatDate(
  value: FormatDateValue,
  {
    locale = 'vi-VN',
    fallback = '—',
    timeZone = 'UTC',
    ...options
  }: FormatDateOptions = {},
): string {
  if (value == null) return fallback;
  const date = parseDate(value);
  if (!date) return fallback;
  const calendarOnly = typeof value === 'string' && value.length === 10;

  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: calendarOnly ? 'UTC' : timeZone,
  }).format(date);
}
