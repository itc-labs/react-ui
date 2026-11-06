'use client';

import { useMemo } from 'react';
import { useUILocale } from '../i18n/provider';
import {
  formatDate as date,
  formatNumber as number,
  formatCurrency as currency,
  type CurrencyCode,
  type FormatNumberOptions,
  type FormatCurrencyOptions,
  type FormatDateOptions,
  type FormatDatePatternOptions,
  type FormatDateValue,
  type DateFormatPattern,
} from '../format';

export type UseFormattersOptions = {
  locale?: string;
  timeZone?: string;
  fallback?: string;
  dateLocale?: FormatDatePatternOptions['dateLocale'];
};

export interface LocaleFormatters {
  formatNumber: (
    value: number | null | undefined,
    options?: FormatNumberOptions,
  ) => string;
  formatCurrency: (
    value: number | null | undefined,
    code: CurrencyCode,
    options?: FormatCurrencyOptions,
  ) => string;
  formatDate: {
    (
      value: FormatDateValue,
      pattern?: DateFormatPattern,
      options?: FormatDatePatternOptions,
    ): string;
    (value: FormatDateValue, options: FormatDateOptions): string;
  };
}

/** Per-render locale binding, with hook and per-call overrides. No global mutation. */
export function useFormatters(options: UseFormattersOptions = {}): LocaleFormatters {
  const { locale: providerLocale } = useUILocale();
  const locale = options.locale ?? providerLocale.code;
  const timeZone = options.timeZone ?? 'UTC';
  const fallback = options.fallback ?? '—';
  const dateLocale = options.dateLocale;

  return useMemo(() => {
    function formatDate(
      value: FormatDateValue,
      pattern?: DateFormatPattern,
      settings?: FormatDatePatternOptions,
    ): string;

    function formatDate(value: FormatDateValue, settings: FormatDateOptions): string;

    function formatDate(
      value: FormatDateValue,
      patternOrSettings?: DateFormatPattern | FormatDateOptions,
      settings?: FormatDatePatternOptions,
    ) {
      if (typeof patternOrSettings === 'object')
        return date(value, { locale, timeZone, fallback, ...patternOrSettings });

      const effective = {
        locale,
        timeZone,
        fallback,
        ...(dateLocale ? { dateLocale } : {}),
        ...settings,
      };
      // A per-call locale must not inherit a date-fns locale from a different provider.
      if (settings?.locale && !settings.dateLocale) delete effective.dateLocale;

      return date(value, patternOrSettings, effective);
    }

    return {
      formatNumber: (value, settings) =>
        number(value, { locale, fallback, ...settings }),
      formatCurrency: (value, code, settings) =>
        currency(value, code, { locale, fallback, ...settings }),
      formatDate,
    } satisfies LocaleFormatters;
  }, [locale, timeZone, fallback, dateLocale]);
}
