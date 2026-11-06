import type { FormatNumberOptions } from './number';

export type CurrencyCode = 'VND' | 'USD' | 'EUR' | 'GBP' | 'JPY' | (string & {});

export type FormatCurrencyOptions = Omit<FormatNumberOptions, 'style' | 'currency'>;

/** Currency is explicit: a locale does not identify the money's denomination. */
export function formatCurrency(
  value: number | null | undefined,
  currency: CurrencyCode,
  { locale = 'vi-VN', fallback = '—', ...options }: FormatCurrencyOptions = {},
): string {
  if (value == null || !Number.isFinite(value)) return fallback;

  return new Intl.NumberFormat(locale, {
    ...options,
    style: 'currency',
    currency,
  }).format(value);
}
