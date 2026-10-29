import type { DayPickerProps } from 'react-day-picker';
import type { enMessages } from './en';
export type UIMessageKey = keyof typeof enMessages;
export type UIMessage =
  string | ({ other: string } & Partial<Record<Intl.LDMLPluralRule, string>>);
export type UIMessages = Record<UIMessageKey, UIMessage>;
export type UIMessageValues = Readonly<Record<string, string | number>>;
export type UITranslate = (key: UIMessageKey, values?: UIMessageValues) => string;
export interface UILocale {
  readonly code: string;
  readonly messages: Readonly<UIMessages>;
  readonly calendarLocale: NonNullable<DayPickerProps['locale']>;
}

/** JSON-serializable catalog entry. Keep date-library functions in calendarLocales. */
export interface UITranslation {
  readonly locale: string;
  readonly messages: Readonly<Partial<UIMessages>>;
}
export type UITranslations = readonly UITranslation[];
export type UICalendarLocales = Readonly<Record<string, UILocale['calendarLocale']>>;
