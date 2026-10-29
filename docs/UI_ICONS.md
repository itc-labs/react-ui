# Shared UI icon set

The curated icon vocabulary has Outline and Bold styles.

## Public usage

```tsx
import { Icon, IconButton, UIProvider, defineTheme } from '@itclabs/react-ui';
import { outlineCatalog, boldCatalog } from '@itclabs/react-ui/icons/catalog';

const theme = defineTheme({
  icons: { packs: { outline: outlineCatalog, bold: boldCatalog } },
});

export function Example() {
  return (
    <UIProvider theme={theme}>
      <Icon name="search" />
      <Icon name="search" variant="bold" className="text-brand-700" />
      <IconButton icon="delete" iconVariant="bold" label="Delete" />
    </UIProvider>
  );
}
```

There are 651 canonical names in each style, with exactly the same keys. Outline is the default for the UI kit, including its internal controls. Theme configuration accepts defineTheme({ icons: { variant: 'bold' } }) once at the UIProvider root. Explicit glyph/pack/variant wins over theme overrides; theme overrides win over the configured default. Existing optional defaultPack and project registrations remain supported. A missing semantic name in a custom pack falls back to the registered catalog for the active variant, then the small built-in kit map. Unknown pack/name errors remain explicit. The theme is scoped, not a mutable global registry.

```tsx
import { SearchIcon } from '@itclabs/react-ui/icons/outline/search';
import { SearchIcon as SearchBoldIcon } from '@itclabs/react-ui/icons/bold/search';

export function Example() {
  return (
    <>
      <SearchIcon size={24} className="text-brand-700" />
      <SearchBoldIcon size={24} label="Search" />
    </>
  );
}
```

Each direct leaf is provider-free SVG React code (or a re-export of a shared neutral glyph). Group barrels are @itclabs/react-ui/icons/outline and @itclabs/react-ui/icons/bold. Native size/label/ref/SVG props/className remain supported; caller classes merge last. Direct leaves do not import vendor libraries or whole pack registries. Semantic Icon accepts the same styling/accessible props and inherits theme size/strokeWidth. For the 288 paired names, Bold uses a real Heroicons Solid variant, not an inflated stroke width. Another 359 names have only an Outline source: both modes share the same Outline implementation, explicitly marked outlineOnly in metadata and the catalog. Four neutral controls are shared as described below.

## Curation and deduplication

- Prefer Heroicons Outline/Solid pairs. Otherwise use Lucide Outline in both modes with outlineOnly=true. The curated upstream set is Lucide (ISC) + Heroicons (MIT) only.
- Bare check and close use Heroicons in both variants so they remain distinct from success/check-circle and close-circle behaviors.
- Spinner uses Lucide LoaderCircle as a neutral glyph. The three paired sort-state glyphs are local UI artwork, unchanged from the previous DataTable appearance. These four controls intentionally look the same in both styles; the catalog marks them as neutral. They share one source implementation, rather than duplicated SVG paths.
- Do not show search from three libraries as three separate choices. No vendor picker, vendor variant stories or vendor-native copies remain in the primary catalog. Use outline/search or bold/search for direct imports.
- Lucide and Heroicons are development-only sources for regeneration/parity checks; runtime uses native SVG files. Typed custom project packs and direct compatible SVG glyphs remain supported.

The source manifest src/components/icon/sources.json records the selected library, original symbol, original variant and neutral status for each of the 648 upstream-derived names × two UI modes. Three local sort-state functions complete the 651-name vocabulary. Every generated SVG file records the exact installed version. This is a selection integrated into the UI kit, not original artwork or an independently published icon product.

## Generate and verify

Run pnpm generate:icons, then pnpm format. Generation uses pinned installed packages, with no downloads or provider calls. It preserves viewBox, root paint and path geometry. Tests compare every selected upstream glyph against its installed original, enforce the two inventories' parity and canonical-name count, verify native leaf boundaries and preserve neutral sort-state opacity. Theme/variant overrides, adapter compatibility, accessible labels and clipboard failure paths have regression coverage.

Storybook Components/Icon has one searchable catalog with 18 category filters and incremental batches of 80 tiles, Outline/Bold, Variants, DirectImports, ThemeSwitch, Accessible and CustomClasses. Clicking a tile copies the direct native leaf import for its current style. Success is shown only after clipboard writing succeeds; unavailable/denied clipboard selects the snippet for manual copy. Browser visual/playback review remains separate from unit/DOM tests.

## Illustrations

Illustration is a separate component at components/illustration, exported from @itclabs/react-ui/illustrations and the UI barrel. Its five files are empty.tsx, no-results.tsx, not-found.tsx, error.tsx and forbidden.tsx. Call Illustration with name and className/native SVG props. It does not use icon variants or icon packs. EmptyState consumes Illustration and preserves the existing classNames.illustration wrapper target. Its gallery and CustomClasses live under Components/Illustration.

## Sources and notices

- Lucide 1.61.0, ISC plus applicable Feather-derived MIT notices. Full installed notice retained under icon/licenses/LUCIDE.txt. [License](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
- Heroicons 2.2.0, MIT/Tailwind Labs. Full notice retained under icon/licenses/HEROICONS.txt. [License](https://github.com/tailwindlabs/heroicons/blob/master/LICENSE).

Distributions must retain the Lucide/Feather and Heroicons notices.

## Expanded curation

updated The first 75 names only covered the pre-existing UI vocabulary; they were not the result of auditing the full installed libraries. The expanded inventory contains 651 names: 288 real Outline/Bold pairs, 359 outline-only functions with explicit fallback, and four neutral controls. Selected upstream functions: 288 Heroicons and 360 Lucide (including neutral spinner); three local sort states complete the set. These are selected names rather than the sum of vendor export counts (which include aliases).

Selection preserves existing names; removes known deprecated/small/decorative aliases and exact paired-geometry aliases; chooses one source for overlapping basic functions; and adds navigation, account, security, files, editor, media, data, commerce, communication, devices, development, time, location, logistics, nature, status, actions and objects. For example Heroicons MagnifyingGlass remains search, Trash remains delete, ArrowSmall variants are omitted, and the duplicate ArrowLeftOnRectangle maps to login. Source symbols remain searchable as aliases without exposing vendor duplicates.

If a pair is unavailable, use the existing Outline component in both modes. Never inflate stroke width or manufacture a solid form. Shared outline-only files live in icon/shared; outline/bold leaves re-export them. The catalog labels these entries "Chỉ có Outline" and distinguishes neutral spinner/sort glyphs. Exported @itclabs/react-ui/icons/catalog metadata exposes category/source/aliases/outlineOnly/neutral so consumers can inspect this explicitly.

The full catalogs are opt-in. `Icon` includes only the 35 semantic names used by kit controls (including `more`, the conventional action-menu trigger), in Outline/Bold variants. Names outside that map require scoped `packs: { outline: outlineCatalog, bold: boldCatalog }` registration as above, a small custom pack, an override, or a direct `glyph` prop. The `IconName` union and `iconNames` list still contain all 651 names without importing their artwork. Missing names throw a setup error; no global registry or automatic catalog loading exists.

Prefer direct leaf imports when a host needs only a few extra icons: `<Icon glyph={SearchIcon} />` preserves SVG props and theme size/strokeWidth, while `<SearchIcon />` is provider-free. Direct glyphs intentionally fix their artwork; use a semantic project pack with Outline/Bold registrations when theme switching is required. Existing `iconCatalog` metadata remains exported alongside `outlineCatalog`/`boldCatalog` from `@itclabs/react-ui/icons/catalog`. Importing runtime packs retains their full artwork; importing metadata alone can tree-shake the pack exports.

Resolution preserves the existing explicit precedence: `glyph` first; explicit `pack` or `variant` bypasses semantic overrides; otherwise theme overrides win, followed by the selected/default registered pack, the active variant catalog, and the kit map. An explicit `variant` also takes precedence over `defaultPack`. Unknown explicit packs still throw. Nested providers inherit registrations and sibling roots remain isolated. Spinner uses the same resolver with a single neutral fallback, so Button loading retains overrides/defaultPack/variant behavior without importing the kit map.

### Bundle regression

Run `node scripts/measure-icon-bundles.mjs` from the repository root. `pnpm test` includes the Icon/Button budget regression; the standalone script additionally reports Dialog, Select, DataTable and Root. It uses the installed Vite/esbuild toolchain, minified browser ESM, production NODE_ENV, React/ReactDOM external (including subpaths), and CSS ignored. Each component is imported by name; Root exports the whole barrel. It rejects full pack imports in all six graphs and enforces Icon <20,000 and Button <30,000 gzip bytes. No dependency/store changes are required.

Measured on this checkout before/after T11 (decimal KB, minified / gzip):

| Import    | Before KB      | After KB       |
| --------- | -------------- | -------------- |
| Icon      | 570.5 / 115.4  | 63.1 / 17.7    |
| Button    | 630.6 / 131.6  | 92.1 / 27.0    |
| Dialog    | 677.5 / 147.9  | 170.1 / 50.4   |
| Select    | 733.6 / 167.9  | 226.2 / 69.8   |
| DataTable | 916.7 / 222.8  | 408.6 / 125.3  |
| Root      | 2089.4 / 575.8 | 1584.8 / 480.2 |

The root entry includes other controls and dependencies. Storybook registers both catalogs for broad examples; gallery tiles pass explicit packs.

## Runtime cleanup

Removed the obsolete per-vendor adapters and their package exports. The implicit lucide built-in pack was removed; built-ins are outline and bold. Apps use canonical names/variants, or explicitly register a custom project pack. Vendor packages are dev dependencies, not runtime dependencies. Keep registry/types/svg/catalog/sources/licenses: these implement registration, public contracts, rendering, discovery and provenance rather than duplicate icon sets.

## Replacement fallbacks

All 651 semantic names and both leaf/pack inventories remain stable. Heroicons supplies 288 real pairs; Lucide supplies 359 outline-only names and the neutral spinner. Three local neutral sort glyphs complete the count (288 + 360 + 3 = 651). Only 648 names derive from upstream artwork; local sort states are intentionally not attributed to an upstream family.

Specialized modifiers sometimes have no upstream equivalent. Preserve the semantic API and use the closest available base glyph rather than drawing a new modifier or inventing Bold geometry. These unavoidable shared Lucide sources are explicitly checked by native.test.tsx; this is the complete duplicate-source list:

| Upstream glyph     | Semantic names                              | Limitation                                                |
| ------------------ | ------------------------------------------- | --------------------------------------------------------- |
| PackageCheck       | archiveCheck, deliveryBox                   | Checked stored/delivered package; no archive check glyph. |
| Wallet             | walletAdd, walletSearch                     | Wallet base; add/search modifiers unavailable.            |
| WalletMinimal      | walletRemove, walletMoney                   | Money wallet base; remove modifier unavailable.           |
| WalletCards        | walletCheck, convertCard                    | Card wallet base; check/convert modifiers unavailable.    |
| Landmark           | bank, courthouse                            | Shared civic building silhouette.                         |
| CreditCard         | cardEdit, cardReceive, cardSend             | Card base; edit/transfer modifiers unavailable.           |
| Store              | shopAdd, shopRemove                         | Store base; add/remove modifiers unavailable.             |
| Truck              | deliveryTime, deliveryRemove, deliveryCheck | Delivery base; time/remove/check modifiers unavailable.   |
| Globe              | globeSearch, globeEdit, globeRefresh        | Globe base; search/edit/refresh modifiers unavailable.    |
| Shapes             | shape, convertShape                         | Shapes base; convert modifier unavailable.                |
| FolderSync         | folderCloud, folderSync                     | Synchronized folder; no cloud-folder glyph.               |
| ShieldQuestionMark | securitySearch, shieldQuestion              | Security inquiry; no shield-search glyph.                 |
| Keyboard           | keyboard, keyboardOpen                      | Keyboard base; no open-state glyph.                       |
| Cpu                | cpu, cpuCharge                              | CPU base; no charging-state glyph.                        |
| CircuitBoard       | cpuSettings, circuitBoard                   | Hardware circuitry; no CPU-settings glyph.                |
| HardDrive          | driver, driverRefresh                       | Drive base; no drive-refresh glyph.                       |
| CardSim            | simCard, simCards                           | SIM base; no multiple-SIM glyph.                          |
| Heart              | heartSearch, heartEdit, heartCircle         | Heart base; no search/edit/circled-heart glyph.           |
| CodeXml            | programming, codeXml                        | Programming/code synonyms.                                |

Other approximate replacements also omit unavailable modifiers (for example calendarEdit uses Calendar, ticketStar uses Ticket, and homeTrendUp/homeTrendDown use TrendingUp/TrendingDown). sources.json records every selected symbol. Semantic names describe host intent and do not guarantee that every modifier is drawn. Review the gallery when choosing an icon for a destructive or directional action; retain accessible labels.
