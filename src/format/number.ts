export type FormatNumberOptions = Intl.NumberFormatOptions & {
  locale?: string;
  fallback?: string;
};

export function formatNumber(
  value: number | null | undefined,
  { locale = 'vi-VN', fallback = '—', ...options }: FormatNumberOptions = {},
): string {
  if (value == null || !Number.isFinite(value)) return fallback;

  return new Intl.NumberFormat(locale, options).format(value);
}
