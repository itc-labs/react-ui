'use client';
import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import type { UITheme, ResolvedUITheme } from './index';
import { themeColors } from './colors';
import { themeTokenRule, validateThemeTokens } from './tokens';

import { UILocaleProvider } from '../i18n/provider';
import type { UILocale, UIMessages, UITranslations, UICalendarLocales } from '../i18n';
const emptyTheme: UITheme = {};
const ThemeContext = createContext<UITheme>({});

/** Token strings are serializable RSC props; icon components need a client root. */
export function UIProvider({
  theme = emptyTheme,
  locale,
  messages,
  translations,
  fallbackLocale,
  calendarLocales,
  children,
}: {
  theme?: UITheme;
  locale?: string | UILocale;
  translations?: UITranslations;
  fallbackLocale?: string;
  calendarLocales?: UICalendarLocales;
  messages?: Partial<UIMessages>;
  children: ReactNode;
}) {
  const parent = useContext(ThemeContext);
  const tokens = useMemo(
    () => (theme.tokens ? validateThemeTokens(theme.tokens) : undefined),
    [theme.tokens],
  );
  const hasTokens = tokens !== undefined && Object.keys(tokens).length > 0;
  const warned = useRef(false);
  if (
    process.env.NODE_ENV !== 'production' &&
    parent.tokens &&
    hasTokens &&
    !warned.current
  ) {
    warned.current = true;
    console.warn(
      'Nested UIProvider theme.tokens are ignored. Use a CSS selector scope on <html> instead; UIProvider has no element to scope variables and overlays portal to body.',
    );
  }
  const value = useMemo<UITheme>(
    () => ({
      ...(parent.tokens ? { tokens: parent.tokens } : hasTokens ? { tokens } : {}),
      icons: {
        ...parent.icons,
        ...theme.icons,
        packs: { ...parent.icons?.packs, ...theme.icons?.packs },
        overrides: { ...parent.icons?.overrides, ...theme.icons?.overrides },
      },
    }),
    [parent, theme, tokens, hasTokens],
  );

  return (
    <ThemeContext.Provider value={value}>
      <UILocaleProvider
        locale={locale}
        messages={messages}
        translations={translations}
        fallbackLocale={fallbackLocale}
        calendarLocales={calendarLocales}
      >
        {/* Ordinary styles follow this owner's lifetime; React must not hoist them. */}
        {!parent.tokens && hasTokens && tokens && (
          <style>{themeTokenRule(tokens)}</style>
        )}
        {children}
      </UILocaleProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ResolvedUITheme {
  const theme = useContext(ThemeContext);

  return useMemo(() => Object.freeze({ ...theme, colors: themeColors }), [theme]);
}
