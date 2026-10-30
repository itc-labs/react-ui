import { enMessages } from './en';
import { viMessages } from './vi';
import type { UILocale, UIMessages, UIMessageKey, UITranslate } from './types';
export type {
  UILocale,
  UIMessages,
  UIMessage,
  UIMessageKey,
  UIMessageValues,
  UITranslate,
} from './types';

/** Add a locale without coupling the UI kit to an app translation framework. Missing keys fall back to English. */
export function defineLocale({
  code,
  messages,
  calendarLocale,
}: {
  code: string;
  messages: Partial<UIMessages>;
  calendarLocale?: UILocale['calendarLocale'];
}): UILocale {
  new Intl.NumberFormat(code); // Fail early on an invalid locale identifier.
  const merged = { ...enMessages, ...messages };

  return Object.freeze({
    code,
    ...(calendarLocale ? { calendarLocale } : {}),
    messages: Object.freeze(
      Object.fromEntries(
        Object.entries(merged).map(([key, message]) => [
          key,
          typeof message === 'string' ? message : Object.freeze({ ...message }),
        ]),
      ) as UIMessages,
    ),
  });
}

export const viVN = defineLocale({
  code: 'vi-VN',
  messages: viMessages,
});
export const enUS = defineLocale({
  code: 'en-US',
  messages: enMessages,
});

export function createTranslator(
  locale: UILocale,
  overrides: Partial<UIMessages> = {},
): UITranslate {
  const plural = new Intl.PluralRules(locale.code),
    number = new Intl.NumberFormat(locale.code);

  return (key: UIMessageKey, values = {}) => {
    const message = overrides[key] ?? locale.messages[key] ?? enMessages[key];
    const template =
      typeof message === 'string'
        ? message
        : (message[plural.select(Number(values.count ?? 0))] ?? message.other);

    return template.replace(/\{(\w+)\}/g, (token, name: string) => {
      const value = values[name];

      return value === undefined
        ? token
        : typeof value === 'number'
          ? number.format(value)
          : value;
    });
  };
}

export type { UITranslation, UITranslations, UICalendarLocales } from './types';
import type { UITranslations, UICalendarLocales } from './types';

/** Resolve a JSON catalog by locale code. No conditionals per message and no global registration. */
export function resolveUILocale(
  code: string,
  translations: UITranslations = [],
  {
    fallbackLocale = 'en-US',
    calendarLocales = {},
  }: { fallbackLocale?: string; calendarLocales?: UICalendarLocales } = {},
): UILocale {
  const canonical = (value: string) => Intl.getCanonicalLocales(value)[0]!;

  const requested = canonical(code),
    fallback = canonical(fallbackLocale);
  const entries = new Map<string, Readonly<Partial<UIMessages>>>();
  for (const entry of translations) {
    const key = canonical(entry.locale);
    if (entries.has(key)) throw new Error(`Duplicate UI locale: ${key}`);
    for (const [name, message] of Object.entries(entry.messages)) {
      if (!Object.hasOwn(enMessages, name))
        throw new Error(`Unknown UI message key: ${name}`);
      if (typeof message !== 'string') {
        if (
          !message ||
          Array.isArray(message) ||
          typeof message !== 'object' ||
          typeof message.other !== 'string' ||
          Object.entries(message).some(
            ([form, value]) =>
              !['zero', 'one', 'two', 'few', 'many', 'other'].includes(form) ||
              typeof value !== 'string',
          )
        )
          throw new Error(`Invalid UI message: ${name}`);
      }
    }
    entries.set(key, entry.messages);
  }

  const builtin = (value: string) =>
    value.split('-')[0] === 'vi'
      ? viVN
      : value.split('-')[0] === 'en'
        ? enUS
        : undefined;

  const known = (value: string) => entries.has(value) || Boolean(builtin(value));

  const selected = known(requested) ? requested : known(fallback) ? fallback : 'en-US';
  const calendars = Object.fromEntries(
    Object.entries(calendarLocales).map(([key, value]) => [canonical(key), value]),
  );

  return defineLocale({
    code: selected,
    messages: {
      ...(builtin(fallback)?.messages ?? enMessages),
      ...entries.get(fallback),
      ...builtin(selected)?.messages,
      ...entries.get(selected),
    },
    calendarLocale: calendars[selected],
  });
}
