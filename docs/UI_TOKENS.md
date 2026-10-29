# Shared UI tokens

Source of truth: `src/theme/tokens.css`. Existing semantic colors, Be Vietnam Pro typography, spacing scale, radii and shadows include motion, control dimensions, overlay dimensions and global layers. `@theme static` emits the whole public token set, including currently unused tokens.

| Group           | Examples / defaults                                                                          | Used by                                 |
| --------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Semantic colors | canvas, surface, ink, muted, control-border, brand/info/success/warning/danger               | All primitives/compositions             |
| Typography      | font-sans, text-control, text-ui-sm, text-section, text-display                              | Same font/scale in app and Storybook    |
| Shape/elevation | radius-control/panel, shadow-panel/floating/overlay/control-focus/control-error              | Controls, panels, overlays, focus       |
| Control height  | spacing-control-sm 2rem, md 2.5rem, lg 3rem                                                  | Input, Button, IconButton, React Select |
| Overlay width   | container-dialog/drawer 32rem, popover 18rem                                                 | Dialog/AlertDialog/Drawer/Popover       |
| Motion duration | control 150ms, fast 120ms, normal 180ms, slow 240ms, exit 140ms, instant-exit 100ms          | Transitions and overlay entry/exit      |
| Loop duration   | loading 1250ms, spin 1000ms, pulse 2000ms                                                    | Table progress, Spinner, Skeleton       |
| Easing          | enter, exit, standard, loop                                                                  | Shared motion curves                    |
| Global layers   | header 100, overlay 300, modal 301, dropdown/popover 400, select 450, tooltip 500, toast 600 | Portalled layers and app header         |

Default transition duration/easing and animation utilities reference the shared motion tokens. Dropdown uses the popover layer alias. React Select styles reference CSS variables directly, so changing control height/layer does not require editing JavaScript numbers. cn/tailwind-merge recognizes the custom spacing/container tokens for consumer overrides.

## Usage

```css
@import '@itclabs/react-ui/theme/styles.css';

/* Optional app-wide theme override, after the import. */
:root {
  --motion-duration-normal: 200ms;
  --spacing-control-md: 2.75rem;
  --container-dialog: 36rem;
}
```

`styles.css` is the complete default entry: Tailwind, tokens/source discovery, fonts, base rules, vendor styles and motion. Existing web and both Storybook hosts import it once. Hosts can instead compose these public entries:

| Entry                                   | Includes                                                                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `@itclabs/react-ui/theme/tokens.css`    | `@theme static` variables/keyframes and kit `@source` roots only; no Tailwind import, fonts, body/cursor rules or vendor CSS |
| `@itclabs/react-ui/theme/fonts.css`     | Self-hosted Be Vietnam Pro 400, 500, 600, 700                                                                                |
| `@itclabs/react-ui/theme/base.css`      | Body defaults and interactive/disabled cursor rules in `base`                                                                |
| `@itclabs/react-ui/theme/vendor.css`    | React-Toastify in `toastify`, react-easy-crop in `components`                                                                |
| `@itclabs/react-ui/theme/motion.css`    | Overlay/disclosure/toast motion and reduced-motion rules                                                                     |
| `@itclabs/react-ui/theme/styles.css`    | All of the above plus Tailwind                                                                                               |
| `@itclabs/react-ui/theme/fonts-800.css` | Optional extra-bold font; only the web host wordmark currently needs it                                                      |

For a host-owned base/font setup:

```css
@layer theme, base, toastify, components, utilities;
@import 'tailwindcss';
@import '@itclabs/react-ui/theme/tokens.css';
@import '@itclabs/react-ui/theme/vendor.css';
@import '@itclabs/react-ui/theme/motion.css';
/* Host fonts and base rules go here. Add @source for host components. */
```

Declare that layer order before other imports so Toastify stays below kit components and utilities. Omit vendor CSS only when the corresponding controls are unused or their CSS is supplied by the host. Keep motion.css when using the kit overlays/toasts.

The color namespace starts with `--color-*: initial`: stock Tailwind colors are unavailable; use kit colors (including `on-brand` for white ink). No `white`/`black` aliases are needed by current consumers. The font-size namespace remains available for host projects. Kit controls/compositions/templates use `text-control`, `text-body`, `text-section`, `text-heading` (24px/32px), `text-title` (30px/36px), `text-ui-sm`, `text-eyebrow` and `text-display`. Migrated stock sizes retain their previous line heights where they differ from the kit default. New heading names are registered with cn/tailwind-merge.

Shadows derive from `ink`, `brand-700` and `danger-700` through `color-mix(in srgb, …, transparent)` with their original 3–12% alphas. Palette overrides now also tint shadows; resolved default colors remain unchanged.

`line` is for decorative dividers only (1.28:1 on surface); controls use `control-border` (3.6:1). White text on brand-500 (4.24:1) and muted text on brand-100 (4.45:1) fail WCAG AA for normal text and must not be used as text pairs.

Portal theme overrides should be global (e.g. :root), since floating content is often rendered outside the caller's subtree. Toast dwell duration and tooltip interaction delay remain explicit library/provider options; they are behavior settings rather than CSS animation timing.

## Fonts and host themes

UIProvider configures icons, locale and optional root CSS token overrides. Fixed brands can keep their theme in host CSS. Every kit surface, including portalled overlays and toasts, reads `--font-sans`, so a host changes the typeface by loading its font and overriding that variable. Compose the entries without `fonts.css` to avoid downloading Be Vietnam Pro:

```css
@layer theme, base, toastify, components, utilities;
@import 'tailwindcss';
@import '@itclabs/react-ui/theme/tokens.css';
@import '@itclabs/react-ui/theme/base.css';
@import '@itclabs/react-ui/theme/vendor.css';
@import '@itclabs/react-ui/theme/motion.css';

:root {
  --font-sans: var(--font-inter), system-ui, sans-serif; /* e.g. next/font variable */
}
```

Check Vietnamese diacritics at 12–14px and weights 500–700 before adopting a new face.

A theme overrides palette, radius, control-size or font variables under a selector on the document root (`[data-theme='…']` or a class on `<html>`). Role tokens (`hover`, `hover-strong`, `selected`, `selected-ink`, `focus`, `accent`) and shadows are `var()` references resolved on `:root`, so overriding `--color-brand-*` there updates them too. Do not scope a theme to an inner wrapper: derived role tokens would keep the root values, and dialogs, menus, Select popups and toasts portal to `body` outside it. `--color-chart-*` is a separate categorical palette and does not follow brand overrides. Recheck the contrast pairs above for every new palette.

The UI Storybook toolbar has a Theme switcher (Default, Ocean rebrand, Compact shape/font) defined in `.storybook/themes.css`; add sample themes there to verify that components contain no hardcoded colours, radii or fonts.

## Motion behavior

- Backdrops fade in/out; Dialog/AlertDialog use a restrained fade.
- Drawer slides from its left/right edge; actual panel width is measured for the slide distance.
- Menus, popovers and tooltips use a short fade.
- Radix Presence waits for CSS exit animation before unmounting and restoring focus. No duplicate JavaScript animation timer is introduced.
- Modal and drawer roots never use transforms: fixed React Select menu coordinates stay correct. Drawer motion animates its fixed edge offset.
- prefers-reduced-motion disables overlay animations; loading/spin/pulse use motion-safe utilities.

Live token values: http://127.0.0.1:6006/?path=/story/foundations-motion-layers--token-reference

## Storybook source examples

`.storybook/readable-source.ts` expands wrapper/render dependencies into readable examples, with React hooks, relevant helper data/types and public @itclabs/react-ui imports. Prettier formats them at build/dev-server time only. Interaction tests and CSF metadata are omitted. Direct component/args stories keep Storybook's native dynamic source; wrappers show the selected story's default recipe. A per-story explicit docs.source.code remains an override.

Tests parse and typecheck every generated example against the real public UI API. Source formatting/compiler helpers are development-only and are not included in the published runtime. Storybook must restart when its Node-side source builder changes.

References: [Radix CSS animation lifecycle](https://www.radix-ui.com/primitives/docs/guides/animation), [Storybook source configuration](https://storybook.js.org/docs/api/doc-blocks/doc-block-source).

## Shared workspace containers

`--container-sidebar: 13rem` (208px), `--container-workspace: 100rem` (1600px). WorkspaceShell uses these for the desktop grid and maximum width. Override via theme scope; custom container names participate in cn/max-width merging. See UI_LAYOUT.md.

Sidebar submenu height/chevron animations reuse motion-duration-normal/exit/control and shared enter/exit easings. The reduced-motion rule disables disclosure animation; nested parents return to auto height after entry so deeper items are not clipped.

## Elevation review

Motion & Layers includes a live Shadows/Focus token reference and Elevation comparison story. Shadow-panel is for card/table surfaces; shadow-floating is for Select, Popover, DropdownMenu, Tooltip and Toast; shadow-overlay remains for Dialog/Drawer/AlertDialog. Flat surfaces use shadow-none. Focus/error focus shadows are control rings, not elevation levels. Global z-index layers remain independent of shadow strength.

Source tokens are shared by actual controls and the swatches, with no duplicate JS shadow values. The preview uses regular document flow without transforms or changes to fixed-portal coordinates. cn recognizes shadow-floating for consumer overrides. Review: http://127.0.0.1:6006/?path=/story/foundations-motion-layers--elevation

Toast now uses React-Toastify with a static toastify cascade layer below components/utilities. The shared toast viewport z-index, normal/exit durations, easing, surface colors, font and floating shadow remain authoritative. Entry/exit fades avoid persistent root transforms; reduced-motion animations last 1ms so animationend still drives the engine. See UI_TOAST.md.

## Typed theme colors

`useTheme` from `@itclabs/react-ui` (or `@itclabs/react-ui/theme/provider`) returns scoped icon settings plus typed colors. The former internal `useUITheme` usage has migrated to this public hook. `themeColors` from `@itclabs/react-ui/theme` is the same immutable, server-compatible map for code that does not need a hook.

```tsx
const { colors } = useTheme();
const series = [
  { id: 'views', label: 'Lượt xem', color: colors.brand[700] },
  { id: 'orders', label: 'Đơn hàng', color: '#2563eb' },
];
```

Available colors include canvas/surface/sidebar/ink/muted/line/controlBorder/onBrand, brand/info/success/warning/danger scales and a six-entry chart tuple. The map holds CSS var references, not a second set of hex values. CSS scope overrides resolve in the browser without global mutation, DOM reads, a useEffect color flash or duplicate palette configuration. `defineTheme` configures icons and optional typed token overrides; actual colors still resolve through CSS variables. Consumers needing concrete pixel values for a canvas/export must resolve them at that boundary; this hook intentionally returns CSS colors.

Chart palette tokens are chart-1 through chart-6; chart-height is 18rem. Accordion open/close animations reference measured Radix content height and shared durations/easing. Tests check that every exported color reference exists in tokens.css, that the maps are immutable, and that SSR/nested icon scopes remain correct.

## Interaction roles

Interaction styles use semantic color utilities so hosts can rebrand states independently of the brand palette. Defaults reference existing palette variables; no palette shades or resolved colors change.

| Token / utility                                        | Default   | Purpose                                                                           |
| ------------------------------------------------------ | --------- | --------------------------------------------------------------------------------- |
| `hover` / `bg-hover`                                   | brand-50  | Hover/highlight, subtle selected rows and soft active tabs                        |
| `hover-strong` / `bg-hover-strong`                     | brand-100 | Stronger hover                                                                    |
| `selected` / `bg-selected`                             | brand-100 | Selected rows, chips, editor commands and calendar range                          |
| `selected-ink` / `text-selected-ink`                   | brand-800 | Selected sidebar/progress text                                                    |
| `focus` / `outline-focus`, `ring-focus`                | brand-500 | Keyboard focus and resize-handle emphasis                                         |
| `accent` / `text-accent`, `border-accent`, `bg-accent` | brand-700 | Active/hover text, field borders and solid selection; use `on-brand` as solid ink |

These six roles replace the former twelve. Migrate `hover-ink`, `selected-accent`, `selected-solid` and `focus-border` to `accent`; `hover-emphasis` to `focus`; `selected-subtle` to `hover`; and `selected-solid-ink` to `on-brand`. Each mapping retains its exact default palette value. `hover-strong` and `selected` share a default but remain distinct so hosts can tune hover and selection separately.

Opacity/state variants remain available, e.g. `hover:bg-hover/70` and `data-[selected=true]:bg-hover`. Brand decoration, primary buttons, status and loading indicators retain their palette tokens. Focus shadows use `--shadow-control-focus`. Caller className/classNames utilities merge last through cn().

```css
@import '@itclabs/react-ui/theme/styles.css';

/* Global overrides include portals. */
:root {
  --color-hover: #eff6ff;
  --color-hover-strong: #dbeafe;
  --color-selected: #dbeafe;
  --color-selected-ink: #1e40af;
  --color-accent: #1d4ed8;
  --color-on-brand: #ffffff;
  --color-focus: #3b82f6;
}
```

Keep `@theme static`, without `inline`. Tailwind emits the entire token set and utilities such as `background-color: var(--color-hover)` and `outline-color: var(--color-focus)`; it does not substitute the palette alias into each utility. A host can therefore override a role at runtime in :root or a CSS subtree without rebuilding components. The compiler regression test checks these emitted references, opacity utilities and unused static tokens. CSS aliases resolve where they are declared: changing only a palette variable in a nested subtree does not retarget an inherited role alias. Override the role variables themselves in that subtree (as shown in Foundations/Theme → InteractionRoles). Portalled content needs the same role overrides at its portal root, usually :root.

## Info status palette

`--color-info-50: #eaf3f8` and `--color-info-700: #245b79` are the informational status pair, available through `themeColors.info` / `useTheme().colors.info` at shades 50 and 700. Contrast: info-700 on info-50 **6.56:1**, info-700 on surface **7.17:1**, and white on info-700 **7.37:1**; all meet WCAG AA for normal text. No additional info shades are defined.

Alert defaults to `tone="info"`: panels use `border-info-700/20 bg-info-50 text-info-700`, and inline feedback uses `text-info-700`. Use `tone="neutral"` to retain the previous notice appearance (`border-line bg-brand-50 text-ink` for panels, `text-muted` inline). Badge adds `tone="info"` alongside its existing neutral/brand/status options. Toast info uses an info-700 icon and border on its existing surface background; loading spinners remain neutral. The scoped `.pod-toast` rule maps `--toastify-color-info`, `--toastify-icon-color-info` and `--toastify-color-progress-info` directly to `--color-info-700`. These aliases are assigned in the toast scope so they do not inherit Toastify's default blue values resolved at :root.

Upload and Form validation retain their danger-only error feedback; they have no multi-status tone API. Button and menu danger actions are action styling rather than status-tone maps. Foundations palettes and component tone galleries show the new info status independently of brand/neutral notices.

## Theme tokens in UIProvider

Use `theme.tokens` for runtime or per-customer branding; prefer host CSS for fixed brands. Import `defineTheme`, `UIThemeTokenName`, `UIThemeTokens` and `uiThemeTokenNames` from `@itclabs/react-ui/theme` (also exported by `@itclabs/react-ui`). Names omit the leading `--`.

```tsx
import { defineTheme, UIProvider } from '@itclabs/react-ui';

const theme = defineTheme({
  tokens: {
    'color-brand-700': '#1d4ed8',
    'radius-control': '1rem',
    'font-sans': 'Georgia, serif',
  },
});

<UIProvider theme={theme}>{children}</UIProvider>;
```

`defineTheme` validates and freezes a snapshot. UIProvider also validates plain token objects, including serializable strings passed from a Server Component. Unknown names, empty/whitespace-only values and values containing semicolons, braces, angle brackets, backslashes, line breaks, `/*` or `!important` are rejected. Validation prevents declaration/style breakout; it does not validate CSS grammar or accessibility. The host loads font files separately. Internal Tailwind resets, base spacing, animation recipes and default transition aliases are excluded; public motion tokens configure those aliases.

The outermost UIProvider with nonempty tokens renders an ordinary `<style>` as its first output before children, inline at the provider position. The deterministic `:root{--name:value;...}` rule is unlayered, with no `href` or `precedence`. It appears in SSR HTML without effects or DOM mutation. React updates its text without remounting children and removes it when tokens are cleared or the provider unmounts. It is not a hoisted shared resource. No tokens means no style element.

Tokens affect the document root, including body portals and derived roles/shadows. A nested provider inherits active tokens; its own token overrides are ignored, with one development warning per provider instance. Icon/locale composition remains available. Providers that configure only icons/locale do not prevent a descendant from owning tokens. Use a selector on `<html>` for CSS theme switching; a provider does not create a scoped element. Multiple independent token roots on one document still compete in the CSS cascade.

The unlayered rule overrides defaults in `@layer theme`. Against unlayered host CSS, normal cascade specificity wins, followed by source order for equal specificity (`html[data-theme]` is more specific than `:root`). Choose one override source per token instead of mixing host CSS and provider tokens. `useTheme().tokens` is the active read-only snapshot; `useTheme().colors` remains the same typed `var()` references.

`@itclabs/react-ui/theme/custom-theme.example.css` is an exported reference file, not a required runtime import. Copy it, change only what is needed and import the host copy after kit CSS, or replace `:root` with `[data-theme='name']` on `<html>`. It lists every public token and its default, grouped with WCAG AA notes; drift tests check names/defaults against tokens.css. Overview/Theming displays the full file via a Vite `?raw` import, never a duplicated snippet.

Foundations/Theme → ThemeTokens demonstrates brand, radius and font overrides with a portalled Dialog. Docs renders that story in its own iframe. Lifecycle tests switch away from a themed tree and assert that its style disappears, restoring the underlying host/kit rules; browser navigation/visual review is a separate check.
