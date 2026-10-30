---
'@itclabs/react-ui': minor
---

Smaller bundles and shared peer dependencies.

**Breaking:** `valibot`, `date-fns`, `@date-fns/tz`, `@tanstack/react-form` and `@tanstack/react-table` are now required peer dependencies, so the app and the kit share one copy. Install them next to the kit:

```sh
pnpm add @itclabs/react-ui valibot date-fns @date-fns/tz @tanstack/react-form @tanstack/react-table
```

**Breaking:** `UILocale.calendarLocale` is now optional and the built-in `viVN`/`enUS` locales no longer carry a date-fns locale. Date components resolve it themselves; `calendarLocales` on `UIProvider` and `defineLocale({ calendarLocale })` still override it.

- `Form`, `FormField` and `FormSubmit` no longer pull every form control: about 135 KB → 16 KB gzip. `useAppForm` is unchanged.
- Components that do not show dates no longer bundle date-fns locales (Button about 28 KB → 17 KB gzip).
- Kit components import only the icon glyphs they render; the public `Icon` still resolves any registered name and theme overrides keep working.
- The DataTable page-size control and the event calendar's compact view switcher are now dropdown menus instead of `Select`, so neither bundles react-select (DataTable about 127 KB → 82 KB, event calendar about 120 KB → 94 KB gzip).
- Gzip budgets for common imports are enforced in tests.
