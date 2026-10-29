'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  createTranslator,
  resolveUILocale,
  type UITranslations,
  type UICalendarLocales,
  viVN,
  type UILocale,
  type UIMessages,
} from './index';
const defaultValue = {
  locale: viVN,
  overrides: {} as Partial<UIMessages>,
  t: createTranslator(viVN),
  translations: [] as UITranslations,
  fallbackLocale: 'en-US',
  calendarLocales: {} as UICalendarLocales,
};
const LocaleContext = createContext(defaultValue);

export function UILocaleProvider({
  locale,
  messages,
  translations,
  fallbackLocale,
  calendarLocales,
  children,
}: {
  locale?: string | UILocale | undefined;
  translations?: UITranslations | undefined;
  fallbackLocale?: string | undefined;
  calendarLocales?: UICalendarLocales | undefined;
  messages?: Partial<UIMessages> | undefined;
  children: ReactNode;
}) {
  const parent = useContext(LocaleContext);
  const value = useMemo(() => {
    const catalog = translations ?? parent.translations;
    const fallback = fallbackLocale ?? parent.fallbackLocale;
    const calendars = { ...parent.calendarLocales, ...calendarLocales };
    const selected =
      typeof locale === 'object'
        ? locale
        : typeof locale === 'string' ||
            translations ||
            calendarLocales ||
            fallbackLocale
          ? resolveUILocale(
              typeof locale === 'string' ? locale : parent.locale.code,
              catalog,
              { fallbackLocale: fallback, calendarLocales: calendars },
            )
          : parent.locale;
    const overrides = {
      ...(selected.code !== parent.locale.code ||
      (typeof locale === 'object' && locale !== parent.locale)
        ? {}
        : parent.overrides),
      ...messages,
    };

    return {
      locale: selected,
      translations: catalog,
      fallbackLocale: fallback,
      calendarLocales: calendars,
      overrides,
      t: createTranslator(selected, overrides),
    };
  }, [parent, locale, messages, translations, fallbackLocale, calendarLocales]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useUILocale() {
  return useContext(LocaleContext);
}
