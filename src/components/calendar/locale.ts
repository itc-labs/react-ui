'use client';
import { enUS, vi } from 'react-day-picker/locale';
import { useUILocale } from '../../i18n/provider';
import type { UILocale, UICalendarLocales } from '../../i18n';

export function resolveCalendarLocale(
  locale: UILocale,
  fallbackLocale: string,
  calendarLocales: UICalendarLocales = {},
) {
  const canonical = (code: string) => Intl.getCanonicalLocales(code)[0]!;

  const selected = canonical(locale.code),
    fallback = canonical(fallbackLocale);
  const calendars = Object.fromEntries(
    Object.entries(calendarLocales).map(([code, value]) => [canonical(code), value]),
  );

  const builtin = (code: string) =>
    code.split('-')[0] === 'vi' ? vi : code.split('-')[0] === 'en' ? enUS : undefined;

  return (
    calendars[selected] ??
    locale.calendarLocale ??
    builtin(selected) ??
    calendars[fallback] ??
    builtin(fallback) ??
    enUS
  );
}

export function useCalendarLocale() {
  const { locale, fallbackLocale, calendarLocales } = useUILocale();

  return resolveCalendarLocale(locale, fallbackLocale, calendarLocales);
}
