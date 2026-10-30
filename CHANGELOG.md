# Changelog

## 0.4.0

### Minor Changes

- [#10](https://github.com/itc-labs/react-ui/pull/10) [`83036f8`](https://github.com/itc-labs/react-ui/commit/83036f83bffce0d193a364d0016c7ed1e3102531) Thanks [@vungbt](https://github.com/vungbt)! - Smaller bundles and shared peer dependencies.

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

## 0.3.0

### Minor Changes

- [#8](https://github.com/itc-labs/react-ui/pull/8) [`b60ba1a`](https://github.com/itc-labs/react-ui/commit/b60ba1a2a75ac4ccdf9497ae6e8eb178e57ac733) Thanks [@vungbt](https://github.com/vungbt)! - Improve EventCalendar month, time-grid and list readability with ellipsized event text, readable overlapping columns, centered tone dots, a larger today marker and compact list dates. Add the overridable calendar.listDayLabel message and consistent localized time ranges with calendar-day offsets for overnight events. Existing props, class slots and selectors are preserved.

- [#8](https://github.com/itc-labs/react-ui/pull/8) [`b60ba1a`](https://github.com/itc-labs/react-ui/commit/b60ba1a2a75ac4ccdf9497ae6e8eb178e57ac733) Thanks [@vungbt](https://github.com/vungbt)! - Add an event calendar at `@itclabs/react-ui/calendar` (`Calendar` there; `EventCalendar` from the root and `modules`, since `Calendar` remains the date picker).

  - **Views:** month (week numbers, "+N more" popover), week as a time grid or day grid, day, and list; all-day and multi-day events, business hours, now indicator, localized titles and week start.
  - **Interactions:** select-to-create (`selectable`, `onSelect`), drag to move and resize (`editable`, `onEventChange` with `revert` for optimistic updates, `eventAllow`), touch long-press, and a full keyboard model with live announcements.
  - **Data:** controlled or uncontrolled `date`/`view`, `onRangeChange` for range-based loading, `loading`, `renderEvent`, `toolbarStart` actions and typed `classNames`/test IDs.
  - **Engine:** React-free helpers (`viewRange`, `navigate`, `layoutMonth`, `layoutTimeGrid`, `layoutList`, `moveEvent`, `resizeEvent`, …) for custom views.

  Recurrence, time zones and resource timelines are planned for later phases.

## 0.2.0

### Minor Changes

- [#5](https://github.com/itc-labs/react-ui/pull/5) [`78e87fe`](https://github.com/itc-labs/react-ui/commit/78e87fe7794afdfd4b5d4317066de4e39ca4f32f) Thanks [@vungbt](https://github.com/vungbt)! - Add Progress with linear and circular variants plus ProgressList and SegmentedProgress modules, with localized values, accessible progress/distribution summaries, theme tones, thresholds, sorting, typed class slots and stable test selectors.

- [#5](https://github.com/itc-labs/react-ui/pull/5) [`78e87fe`](https://github.com/itc-labs/react-ui/commit/78e87fe7794afdfd4b5d4317066de4e39ca4f32f) Thanks [@vungbt](https://github.com/vungbt)! - Expose Navbar and NavbarProps, NavbarItem, NavbarLink, NavbarSection and
  NavbarClassNames from the root and modules entries, with navbar localization keys.
  Document shared navigation data, host router adapters, permission protection,
  TopLoader integration and PageHeader breadcrumbs in Overview/Navigation.

- [#5](https://github.com/itc-labs/react-ui/pull/5) [`78e87fe`](https://github.com/itc-labs/react-ui/commit/78e87fe7794afdfd4b5d4317066de4e39ca4f32f) Thanks [@vungbt](https://github.com/vungbt)! - Add Navbar with Radix desktop dropdown and mega navigation, a mobile Drawer,
  brand/actions/secondary slots, shared active-route and permission helpers,
  UiLink adapters, localized labels, sticky scroll elevation and typed class slots.

- [#5](https://github.com/itc-labs/react-ui/pull/5) [`78e87fe`](https://github.com/itc-labs/react-ui/commit/78e87fe7794afdfd4b5d4317066de4e39ca4f32f) Thanks [@vungbt](https://github.com/vungbt)! - Upgrade Navbar with structured brand blocks, a context switcher slot, icon names or glyphs on all item types, and a default underline active indicator with a pill option. Preserve route matching, permission filtering and mobile drawer navigation, including brand and switcher content.

  Export UserMenu, UserMenuProps and UserMenuClassNames from modules and the package root. Add an accessible avatar/name chip, responsive and compact modes, typed DropdownMenu entries, optional header content, localized trigger labels, refs, class slots and test selectors. DropdownMenu also accepts header content and a header class slot.

- [#5](https://github.com/itc-labs/react-ui/pull/5) [`78e87fe`](https://github.com/itc-labs/react-ui/commit/78e87fe7794afdfd4b5d4317066de4e39ca4f32f) Thanks [@vungbt](https://github.com/vungbt)! - Add router-independent matchPath, resolveActiveNav and filterNavByAccess helpers at the root, modules and navigation entries. Sidebar now accepts currentPath, isActive and typed canAccess callbacks, with permission pruning and route-aware branch selection while preserving explicit active overrides.

- [#5](https://github.com/itc-labs/react-ui/pull/5) [`78e87fe`](https://github.com/itc-labs/react-ui/commit/78e87fe7794afdfd4b5d4317066de4e39ca4f32f) Thanks [@vungbt](https://github.com/vungbt)! - Upgrade Sidebar with structured brand headers, standalone item badges, controlled or uncontrolled icon rails, label tooltips, keyboard-accessible submenu flyouts, optional toggle shortcuts and a mobile Drawer trigger slot. Export SidebarBrand and SidebarClassNames, add localized controls and the container-sidebar-collapsed theme token, and let WorkspaceShell follow the collapsed desktop width. Add complete application and top-navigation layout examples.

- [#5](https://github.com/itc-labs/react-ui/pull/5) [`78e87fe`](https://github.com/itc-labs/react-ui/commit/78e87fe7794afdfd4b5d4317066de4e39ca4f32f) Thanks [@vungbt](https://github.com/vungbt)! - Badge (label) is now Tag; Badge is now the count/dot indicator.

  Breaking in 0.x: migrate label-pill JSX and imports from Badge to Tag, and BadgeProps/BadgeTone to TagProps/TagTone. No deprecated alias is provided. Icon names and glyphs containing badge are unchanged.

  Tag retains all label tones and adds sm/md sizes, leading/trailing icons, localized removal, keyboard deletion, disabled and selectable/clickable behavior. The new Badge supports counts, max overflow, dots, placements, offsets and localized accessible notification labels. Both expose typed class slots, refs and derived test selectors. See docs/UI_TAG_BADGE.md for migration and API details.

- [#5](https://github.com/itc-labs/react-ui/pull/5) [`78e87fe`](https://github.com/itc-labs/react-ui/commit/78e87fe7794afdfd4b5d4317066de4e39ca4f32f) Thanks [@vungbt](https://github.com/vungbt)! - Add router-independent TopLoader, TopLoaderProvider, useTopLoader and hook-free createTopLoaderClient/topLoader controllers with optional link tracking, delayed display and route completion.

- [#5](https://github.com/itc-labs/react-ui/pull/5) [`78e87fe`](https://github.com/itc-labs/react-ui/commit/78e87fe7794afdfd4b5d4317066de4e39ca4f32f) Thanks [@vungbt](https://github.com/vungbt)! - Add linear and circular variants to Progress with shared value formatting and typed shape-specific props. Add the PageHeader breadcrumb slot above its per-page title, with class customization and derived test selectors.

## 0.1.2

### Patch Changes

- [#3](https://github.com/itc-labs/react-ui/pull/3) [`404dce7`](https://github.com/itc-labs/react-ui/commit/404dce7a985916495dd72c5e02b9f4d3a53279f2) Thanks [@vungbt](https://github.com/vungbt)! - Simplify the README usage section into small, independent examples (form controls, data-driven menus/dialogs, toasts and confirmations).

## 0.1.1

### Patch Changes

- [`29717df`](https://github.com/itc-labs/react-ui/commit/29717df90cd213e766b39682b538b66b6c722268) Thanks [@vungbt](https://github.com/vungbt)! - Link the hosted Storybook from the package homepage and README, and publish releases from CI with npm provenance.

## 0.1.0

Initial public release of `@itclabs/react-ui` under the MIT license.

- React 19 controls, accessible overlays, forms, data tables and layout compositions.
- Tailwind CSS v4 tokens, precompiled styles, runtime themes and typed localization.
- Tree-shakeable icons and optional editor, chart and avatar upload entry points.
- ESM output, TypeScript declarations, Storybook examples and contributor documentation.
