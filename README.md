# @itclabs/react-ui

[![npm](https://img.shields.io/npm/v/@itclabs/react-ui)](https://www.npmjs.com/package/@itclabs/react-ui) [![CI](https://github.com/itc-labs/react-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/itc-labs/react-ui/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**[Storybook](https://react-ui-one-rose.vercel.app/)** · [npm](https://www.npmjs.com/package/@itclabs/react-ui) · [GitHub](https://github.com/itc-labs/react-ui)

A reusable React 19 UI kit built on Tailwind CSS v4 tokens and Radix primitives: controls, data-driven overlays and menus, forms with schema validation, data tables, theming and a tree-shakeable icon set.

- **ESM only**, TypeScript declarations included, `'use client'` boundaries preserved for the Next.js App Router.
- **Tree-shakeable**: each module is a separate file; heavy features live on optional subpaths.
- **Themeable** through CSS variables or `UIProvider` theme tokens.
- **Localized** defaults (Vietnamese and English) with typed message catalogs.

## Install

```bash
pnpm add @itclabs/react-ui valibot date-fns @date-fns/tz @tanstack/react-form @tanstack/react-table
# peer dependencies
pnpm add react@^19 react-dom@^19
```

Requires Node.js >= 22.12.

These five data/form/date libraries are required peers so the app and the kit share a single copy, and the app can import them directly (for example, Valibot schemas shared with server code). `useAppForm` builds on TanStack Form, `createValibotFieldValidators` adapts Valibot schemas, DataTable extends TanStack Table column meta with `align`, and calendar helpers build on date-fns with date-fns time-zone support. Import the libraries from their own packages; the kit does not re-export them.

All five remain required at package level because the core entries expose forms, tables and date controls; importing a narrower subpath does not change that peer contract.

## Styles

**Tailwind CSS v4 host** — import the theme once in your global CSS:

```css
@import '@itclabs/react-ui/theme/styles.css';
```

The theme registers the kit's own class sources, so no `@source` pointing into `node_modules` is needed. Add `@source` only for your own folders that Tailwind does not detect automatically.

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

Components take plain props and data; no setup beyond the styles is required.

Sidebar accepts host-provided `currentPath`, `isActive` and `canAccess`. See [navigation matching and route protection](docs/UI_NAVIGATION.md) for helpers and router recipes.

```tsx
import { Button, Input, Select } from '@itclabs/react-ui';

export function ProfileForm() {
  return (
    <form>
      <Input label="Name" placeholder="Jane Doe" />
      <Select
        label="Role"
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'member', label: 'Member' },
        ]}
      />
      <Button type="submit">Save</Button>
    </form>
  );
}
```

### Menus and dialogs

Menus, dialogs and tabs are data-driven: pass a trigger and `items` instead of composing primitives.

```tsx
import { Dialog, DropdownMenu, IconButton } from '@itclabs/react-ui';

<DropdownMenu
  trigger={<IconButton icon="more" label="Actions" />}
  items={[
    { id: 'edit', label: 'Edit', onSelect: onEdit },
    { id: 'delete', label: 'Delete', tone: 'danger', onSelect: onDelete },
  ]}
/>;

<Dialog title="Settings" trigger="Open settings">
  Dialog content
</Dialog>;
```

### Event calendar

Use `Calendar` from the calendar subpath (`EventCalendar` from the root/modules).
The root `Calendar` remains the date-selection control. Event ends are exclusive;
ISO date-only strings use local midnight.

```tsx
import { Calendar, type CalendarEvent } from '@itclabs/react-ui/calendar';

const events: CalendarEvent[] = [
  {
    id: 'alpha',
    title: 'Lorem ipsum',
    start: '2026-10-29T09:00',
    end: '2026-10-29T10:00',
    tone: 'info',
  },
];

export function Schedule() {
  return (
    <Calendar
      events={events}
      defaultDate={new Date(2026, 9, 29)}
      defaultView="week"
      responsiveView="list"
      height={600}
      data-testid="schedule"
    />
  );
}
```

See [calendar API and host recipes](docs/UI_CALENDAR.md) and Storybook
**Overview/Calendar** for controlled navigation, range loading, select-to-create,
optimistic editing, custom rendering, localization and keyboard interaction.
**Templates/CalendarPage** composes WorkspaceShell, Sidebar, PageHeader and event
details in a Drawer. Recurrence, time-zone configuration and resource timelines
are outside phase 1.

### Toasts and confirmations

With `ToastProvider` / `ModalProvider` mounted, call them from anywhere:

```tsx
import { toast } from '@itclabs/react-ui/toast';
import { modal } from '@itclabs/react-ui/modal';

toast.success('Saved');

const ok = await modal.confirm({ title: 'Delete this item?', tone: 'danger' });
```

Browse every component, prop and state in the [Storybook](https://react-ui-one-rose.vercel.app/).

### Entry points

| Import                                                 | Contents                                                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `@itclabs/react-ui`                                    | Everything in the core kit: components, modules, templates, providers and helpers                                                 |
| `@itclabs/react-ui/components`                         | Controls: Button, IconButton, Input, Select, Tag, Badge, Dialog, Drawer, DropdownMenu, Tabs, Tooltip, Progress (linear/circular)… |
| `@itclabs/react-ui/modules`                            | Compositions: Form, DataTable, Sidebar, Navbar, Pagination, EmptyState, PageHeader, ProgressList…                                 |
| `@itclabs/react-ui/templates`                          | Page layouts with slots (WorkspaceShell)                                                                                          |
| `@itclabs/react-ui/navigation`                         | Router-agnostic `matchPath`, `resolveActiveNav`, `filterNavByAccess` (no React)                                                   |
| `@itclabs/react-ui/calendar`                           | Event Calendar shell plus pure date, layout, filtering and interaction helpers                                                    |
| `@itclabs/react-ui/hooks`                              | Shared hooks: click outside, debounced values and callbacks                                                                       |
| `@itclabs/react-ui/theme`                              | `defineTheme`, theme types and typed colour references                                                                            |
| `@itclabs/react-ui/i18n`                               | Locales, message types and `defineLocale` for custom languages                                                                    |
| `@itclabs/react-ui/toast`                              | Hook-free `toast.success/error/info/warning`                                                                                      |
| `@itclabs/react-ui/modal`                              | Hook-free `modal.confirm/alert/open`                                                                                              |
| `@itclabs/react-ui/icons/outline/*`, `/icons/bold/*`   | Single icon glyphs, e.g. `@itclabs/react-ui/icons/outline/search` (lightest)                                                      |
| `@itclabs/react-ui/icons/catalog`                      | Full icon catalog for `<Icon name="…">` beyond the kit's own icons                                                                |
| `@itclabs/react-ui/editor`, `/chart`, `/avatar-upload` | Optional features with optional peer dependencies                                                                                 |
| `@itclabs/react-ui/theme/styles.css`                   | Full theme for Tailwind v4 hosts (`tokens`, `fonts`, `base`, `vendor`, `motion` entries also available)                           |
| `@itclabs/react-ui/ui.css`                             | Precompiled stylesheet for hosts without Tailwind                                                                                 |

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

Storybook: https://react-ui-one-rose.vercel.app/

See [docs/](docs/) for component contracts, theming, localization, accessibility checks and Storybook conventions.

### Navigation

See [Overview/Navigation](https://react-ui-one-rose.vercel.app/?path=/docs/overview-navigation--docs) for shared Navbar/Sidebar menus, router adapters, permission checks and TopLoader usage.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for setup and commands, [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines, and [CHANGELOG.md](CHANGELOG.md) for releases.

## Third-party notices

Icon artwork comes from [Lucide](https://lucide.dev) (ISC) and [Heroicons](https://heroicons.com) (MIT). Their license texts ship in `src/components/icon/licenses` and `THIRD_PARTY_NOTICES.md`.

## License

MIT © itclabs. Icon artwork keeps its own Lucide (ISC) and Heroicons (MIT) licenses.

### Tag and Badge migration

Badge (label) is now Tag; Badge is now the count/dot indicator. Rename label-pill imports, JSX and types to Tag/TagProps/TagTone. See [Tag and Badge](docs/UI_TAG_BADGE.md) for the new APIs.
