# @itclabs/react-ui

A reusable React 19 UI kit built on Tailwind CSS v4 tokens and Radix primitives: controls, data-driven overlays and menus, forms with schema validation, data tables, theming and a tree-shakeable icon set.

- **ESM only**, TypeScript declarations included, `'use client'` boundaries preserved for the Next.js App Router.
- **Tree-shakeable**: each module is a separate file; heavy features live on optional subpaths.
- **Themeable** through CSS variables or `UIProvider` theme tokens.
- **Localized** defaults (Vietnamese and English) with typed message catalogs.

## Install

```bash
pnpm add @itclabs/react-ui
# peer dependencies
pnpm add react@^19 react-dom@^19
```

Requires Node.js >= 22.12.

## Styles

**Tailwind CSS v4 host** — import the theme once and let Tailwind scan the kit:

```css
@import '@itclabs/react-ui/theme/styles.css';
@source '../node_modules/@itclabs/react-ui/dist';
```

**Host without Tailwind** — import the precompiled stylesheet once at your entry:

```ts
import '@itclabs/react-ui/ui.css';
```

Use one of the two, not both.

## Providers

Every provider is optional; components fall back to sensible defaults (Vietnamese labels, Outline icons, native `<a>`/`<img>`).

```tsx
'use client';

import {
  UIProvider,
  LinkImageProvider,
  ToastProvider,
  ModalProvider,
} from '@itclabs/react-ui';

export function UIRoot({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider locale="en-US">
      <LinkImageProvider Link={AppLink} Image={AppImage}>
        <ToastProvider>
          <ModalProvider>{children}</ModalProvider>
        </ToastProvider>
      </LinkImageProvider>
    </UIProvider>
  );
}
```

| Provider            | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `UIProvider`        | Locale, translations, icon theme and runtime theme tokens |
| `LinkImageProvider` | Router link / optimized image adapters (e.g. Next.js)     |
| `ToastProvider`     | Enables `toast.success/error/info/warning` anywhere       |
| `ModalProvider`     | Enables `modal.confirm/alert/open` with a FIFO queue      |

## Usage

```tsx
import { Button, DropdownMenu, IconButton, Input } from '@itclabs/react-ui';
import { modal } from '@itclabs/react-ui/modal';
import { toast } from '@itclabs/react-ui/toast';

<DropdownMenu
  trigger={<IconButton icon="more" label="Actions" />}
  items={[
    { id: 'edit', label: 'Edit', onSelect: onEdit },
    {
      id: 'delete',
      label: 'Delete',
      tone: 'danger',
      onSelect: async () => {
        if (await modal.confirm({ title: 'Delete item?', tone: 'danger' }))
          toast.success('Deleted');
      },
    },
  ]}
/>;
```

Entry points: `@itclabs/react-ui` (everything core), `/components`, `/modules`, `/templates`, `/hooks`, `/theme`, `/i18n`, `/toast`, `/modal`, `/icons/outline/*`, `/icons/bold/*`, `/icons/catalog`.

## Optional features

Install the peers only for the features you use:

| Entry                             | Install                                                 |
| --------------------------------- | ------------------------------------------------------- |
| `@itclabs/react-ui/editor`        | `@tiptap/react@^3 @tiptap/pm@^3 @tiptap/starter-kit@^3` |
| `@itclabs/react-ui/chart`         | `recharts@^3 react-is@^19`                              |
| `@itclabs/react-ui/avatar-upload` | `react-easy-crop@^6`                                    |

## Theming

Override CSS variables after the kit styles (or under `[data-theme='…']` on `<html>`):

```css
:root {
  --color-brand-700: #245b79;
  --radius-control: 0.375rem;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

Or apply runtime tokens through the root provider:

```tsx
<UIProvider theme={defineTheme({ tokens: { 'color-brand-700': '#245b79' } })}>
```

`@itclabs/react-ui/theme/custom-theme.example.css` lists every overridable token with its default value.

## Icons

Kit components bundle only the icons they use. Import glyphs directly for the lightest bundle:

```tsx
import { SearchIcon } from '@itclabs/react-ui/icons/outline/search';
<Icon glyph={SearchIcon} />;
```

To use `<Icon name="…">` with any of the 651 catalog names, register the catalog once:

```tsx
import { outlineCatalog, boldCatalog } from '@itclabs/react-ui/icons/catalog';
<UIProvider theme={defineTheme({ icons: { packs: { outline: outlineCatalog, bold: boldCatalog } } })}>
```

## Documentation

Storybook: https://main--<chromatic-app-id>.chromatic.com — link added after the first Chromatic build

See [docs/](docs/) for component contracts, theming, localization, accessibility checks and Storybook conventions.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for setup and commands, [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines, and [CHANGELOG.md](CHANGELOG.md) for releases.

## Third-party notices

Icon artwork comes from [Lucide](https://lucide.dev) (ISC) and [Heroicons](https://heroicons.com) (MIT). Their license texts ship in `src/components/icon/licenses` and `THIRD_PARTY_NOTICES.md`.

## License

MIT © itclabs. Icon artwork keeps its own Lucide (ISC) and Heroicons (MIT) licenses.
