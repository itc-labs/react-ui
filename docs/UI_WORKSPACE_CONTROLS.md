# Workspace controls and table pagination

## Semantic actions

Button and IconButton accept `tone="neutral|brand|info|success|warning|danger"` independently of `variant="primary|secondary|ghost|soft|outline|dashed"`. `variant="danger"` remains supported for existing consumers. An explicit tone overrides its color; caller classes override kit defaults. Icon also accepts `tone`; an omitted tone inherits the surrounding text color. Color does not replace action labels or confirmation for destructive operations.

## Language and appearance

`LanguageSwitcher` receives a controlled locale value, `onValueChange` and options with stable `value`, native-language `label`, and a `flag` ReactNode. Use emoji, UiImage or an existing flag component. The host chooses each flag rather than inferring countries from languages. `mode="auto"` shows a compact `en | vi` segmented choice without flags for two options (`shortLabel` overrides each code) and a radio dropdown otherwise; `mode="toggle"` retains the single-button shortcut; `mode="dropdown"` also supports two languages. Disabled options cannot be selected. The host supplies translation catalogs and passes the selected locale to UIProvider; switching does not remount children or mutate global locale.

`ThemeToggle` receives `value="light|dark"` and `onValueChange`, with `appearance="icon|button|switch"`. The switch places sun/moon glyphs in the track and moves an icon-bearing thumb; keyboard, disabled and reduced-motion behavior are preserved. It has no persistence, navigator detection, root DOM mutation or additional provider. The host owns theme CSS, initial hydration and storage/system preferences. The Storybook example applies a sample host dark palette to the document root, including portals.

## Pagination placement and height

DataTable already supports client pagination with `pagination` and server pagination with `mode="server"`, controlled state and rowCount. The additions share the existing TanStack state:

- `paginationPlacement="bottom"` is the default; `top` places controls before the table; `both` renders synchronized top and bottom controls; `none` leaves rendering to the host.
- Top pagination defaults to `topPaginationVariant="compact"`: result summary, current/total pages and previous/next. Choose `full` for page size and numbered links.
- `preservePageHeight` defaults to true for paginated tables. It retains the largest measured table height across pages, so 10 rows becoming 3 does not pull the footer up. It adds whitespace in the scroll region, never fake rows or retained records. Set false for natural height. Height resets when total count, page size, sort/filter or visible columns change; content growth is observed, and a sticky header's maxHeight still limits the scroll region. A directly opened short page has no previous full-page measurement to retain.
- `verticalAlign="top|middle|bottom"` covers ordinary, selection, reorder and skeleton cells. Default top preserves multiline layouts; use middle for compact rows mixing text, badges and actions. Specific classNames slots still override it.

For an application footer, call useDataTable once, render DataTableRoot once and pass the same controller to DataTablePagination. The host can use sticky/fixed CSS, reserve footer space and account for its sidebar and safe area. Do not also render DataTable with the same props: that would create a separate controller. Loading disables pagination; server requests, cancellation and errors remain host-owned. Clear selection explicitly when the dataset/scope changes.

Top controls derive a separate test-ID namespace (`<base>-top-*`); existing bottom IDs remain unchanged. Give external pagination its own `data-testid` when rendering more than one instance. No selectors are generated without a base.

## Bundle impact

The production esbuild fixtures measure Icon at 17,894 gzip bytes, Button at 20,165, DataTable at 86,531 and the full root at 279,671. Workspace translations also reach other locale consumers. Budget increases are limited to affected Rating, QuantityInput, Button, Lightbox and Root fixtures; heavy optional modules and full icon catalogs remain isolated. Reproduce with `node scripts/measure-icon-bundles.mjs`.

## Verification — 2026-11-06

Typecheck, 839 tests, formatting, library build, package smoke, Storybook build and opaque contrast checks passed. After the final guide updates, the four guide/recipe/catalog/authoring assertions also passed and Storybook was rebuilt.

In-app browser review used measured CSS viewports of 390×844 and 1440×900. The pagination-placement story executed its play assertions; moving from 10 rows to the last 3 rows retained the footer at the same y-coordinate (623.67px at desktop), with no fabricated rows. Top/bottom state and disabled boundaries matched. External pagination changed the same controller while the table's internal footer stayed absent. Language radio items showed pointer cursors and flags, and selection updated host state; the ThemeToggle play case synchronized buttons and switch, with the host sample dark palette rendering correctly. Button tone galleries were visually reviewed at 390px. No errors were logged on the reviewed pagination/theme pages. Full assistive-device and browser-matrix review was not performed.

### Follow-up review

Select now overrides the engine's option cursor, including disabled options. A DOM interaction regression checks computed cursors and prevents disabled selection. Table height is remeasured on width changes, so a narrow layout's wrapping does not leave a large gap after widening the window. New regressions also verify server page clamping waits for successful settled data. New control glyphs resolve through the kit theme's variants and overrides. Compact pagination buttons expose stable derived selectors.

Browser access was disabled in Work settings during this follow-up. Earlier screenshots cover the primary controls and pagination flows; the final cursor/resize refinements were verified automatically and still need a browser recheck.

### Sidebar active corners

Raised active rows now draw their contour with an inset ring. The prior outer ring could be clipped by the sidebar's scrolling region or collapsible group overflow. The change applies through the shared appearance resolver to expanded links, submenu triggers and icon rails; flyouts retain their quiet active style. A regression compiles the actual Tailwind inset shadow and covers default/dark/brand markup. The ActiveCorners Storybook fixture compares all three tones. Browser verification is pending because local browser use remains disabled in Work settings.
