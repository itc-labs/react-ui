# UI localization contract

The kit owns typed default messages for controls, ARIA labels and generated validation. Consumer copy, option labels, column headers, toast content and business schemas remain consumer-owned.

## Usage

```json
[
  { "locale": "vi-VN", "messages": { "button.processing": "Đang lưu" } },
  { "locale": "en-US", "messages": { "button.processing": "Saving changes" } },
  { "locale": "ja-JP", "messages": { "button.processing": "保存中" } }
]
```

```tsx
'use client';
import { UIProvider, type UITranslations } from '@itclabs/react-ui';
import catalog from './translations.json';

const translations = catalog satisfies UITranslations;
export function App({ locale }: { locale: string }) {
  return (
    <UIProvider locale={locale} translations={translations} fallbackLocale="en-US">
      {/* application */}
    </UIProvider>
  );
}
```

Add an entry/file per language; the provider chooses it by locale code. No booleans, message ternaries or switch statements per language. UITranslation is one JSON entry; UITranslations is the readonly array; UIMessages/UIMessageKey/UIMessage describe the dictionary and plural values. Imported JSON is checked with satisfies UITranslations. A complete dictionary can separately satisfy UIMessages. The built-in vi/en messages fill their omitted keys; custom-language missing keys use fallbackLocale's dictionary, then English. Unknown locale codes resolve to fallbackLocale (or en-US when the fallback is unavailable).

Translations are plain JSON; calendarLocales is a separate optional map of date-library locale objects, keyed by the same locale codes. Locale identifiers and duplicate canonical IDs, unknown message keys and invalid plural values are validated. resolveUILocale exposes the same resolution outside React. Nested providers inherit the catalog/fallback/calendar map; single-language messages overrides remain available for a specific subtree. Passing a prebuilt UILocale object is still supported.

UIProvider can be used with or without theme. Theme controls visuals/icons; locale/translations/fallbackLocale and optional local messages overrides are runtime props. Pure exports are also available at @itclabs/react-ui/i18n, useUILocale at @itclabs/react-ui/i18n/react. There is no new app-level translation/router dependency, network request, localStorage or global mutable locale.

Precedence: explicit component text prop → nearest provider message override → selected catalog/built-in dictionary → configured fallback dictionary → English. Default remains viVN. Nested providers merge overrides for the same inherited locale; explicitly changing locale clears inherited-language overrides. Changes update labels without remounting fields, editor or table; controlled values/row IDs/page state remain caller-owned.

Component overrides include existing label/placeholder/aria-label/error/emptyText/emptyState props, Spinner.label, new Button.loadingLabel and DialogContent/DrawerContent.closeLabel. Override any other internal label through a nested provider with messages, typed as Partial<UIMessages>.

## Add languages / connect an existing app translator

```tsx
import { defineLocale, type UIMessages } from '@itclabs/react-ui/i18n';
import { fr } from 'react-day-picker/locale';
const french = defineLocale({
  code: 'fr-FR',
  calendarLocale: fr,
  messages: {
    'button.processing': 'Traitement',
    'select.count': { one: '{count} option.', other: '{count} options.' },
  } satisfies Partial<UIMessages>,
});
```

Custom locale dictionaries can be partial; English fallback is explicit. For production, supply all keys to avoid mixed-language text. UIMessages provides the complete typed contract. Partial message overrides are appropriate for one screen/control. The code must be a valid BCP 47 locale; unsupported but well-formed locales follow Intl fallback behavior. Supply the matching calendarLocale for new languages; otherwise the date library weekdays fall back to English. No automatic download of dictionaries.

Templates interpolate named string/number values as text, never HTML. Number values use Intl.NumberFormat. Plural message objects use Intl.PluralRules with values.count; always provide other, with zero/one/two/few/many as applicable. No ICU/select/rich-message parser is included. If an app already uses next-intl/i18next, adapt its translations into this dictionary or pass translated props; the kit does not select the app's locale or retranslate arbitrary strings.

## Audited surfaces

Loading/button/avatar status, dialog/drawer/toast close and viewport labels, breadcrumb/sidebar/stepper/tree labels; Select placeholder/empty/error/loading/load-more/retry/multi-value remove and live guidance; DataTable search/selection/sort/resize/empty/error/loading/results/page-size/page status; Pagination controls; Calendar month/year/day ARIA; Date/DateRange/Time picker placeholders and validation; upload/preview/avatar upload defaults and file validation; Editor label and toolbar.

The static text guard scans components/modules/templates for new visible JSX text or direct label/placeholder/title/aria-label literals, with the fixed KB unit exempted. Runtime-generated/programmer diagnostic strings (invalid configuration, library errors), CSS identifiers and caller content are outside translation. No default Vietnamese strings remain in production component/module/template implementation; dictionary strings and Storybook examples are intentional.

## Values, formatting and errors

- Calendar/date display follows Intl locale and DayPicker locale; date-only values/hidden submitted fields stay YYYY-MM-DD and never become UTC timestamps.
- Time values stay HH:mm. The 12-hour label uses dictionary day-period markers; minute intervals and validation remain unchanged.
- Numbers in summaries/messages are localized; selection IDs, BE query values, page size and zero-based pageIndex remain canonical.
- File rejection state stores key/params; an already-visible rejection is translated on each render. validateFiles remains a pure backward-compatible string helper with optional third translator argument; getFileIssue exposes structural issues. onReject receives a string in the locale active at the event.
- Business Valibot/server validation should use code/params or app-owned locale-aware schema creation. A string previously returned by a backend/schema cannot be reliably translated by the kit. Pass the app-translated error into the field.

UIProvider adds no wrapper or document mutation: set html.lang/dir in the host, including Storybook example wrappers. No navigator-based auto-detection, no SSR locale singleton. Locale codes and translation JSON are serializable and can be passed from a server composition root. Prebuilt UILocale objects and calendarLocales contain date-library functions; configure those in a client module. vi/en are supplied; RTL layout has not been implemented/tested. Icon adapters and classes remain independent.

## Validation

Tests cover dictionary/plural/number fallback, provider scoping and text prop priority, rendered table/pagination/empty/selection labels, Calendar ARIA/date display and unchanged submitted ISO values, Select multi-value remove labels, structural file errors and the literal-text audit. Storybook Foundations/Localization includes vi/en, runtime switching, local overrides and partial locale fallback. Its play checks retained draft/selection/page after changing language. Browser visual review and play execution are separate from builds and unit tests.

InputPassword and InputOTP use password.show/password.hide/otp.label. Labels may be overridden explicitly; passwords, OTP strings and numeric values are never translated.

NumberInput step actions use number.increase/number.decrease in the typed dictionaries. Formatting convention is explicitly fixed in the wrapper rather than inferred from language or navigator.

Tag and Badge contracts, localization and migration are documented in [Tag and Badge](UI_TAG_BADGE.md).
