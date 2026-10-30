# Navigation

The host supplies paths and permission decisions. The kit never imports a router or reads location/session globals. Sidebar links continue to use UiLink and the host's UIProvider link adapter.

## Pure helpers

Import `matchPath`, `resolveActiveNav`, `filterNavByAccess`, `NavItem` and `MatchPathOptions` from `@itclabs/react-ui/navigation` or the package root. They are also exported by `@itclabs/react-ui/modules`. The navigation subpath has no React runtime dependency or client boundary.

```ts
import {
  filterNavByAccess,
  resolveActiveNav,
  type NavItem,
} from '@itclabs/react-ui/navigation';

type Permission = 'profile:read' | 'team:read';
const items: NavItem<Permission>[] = [
  { id: 'home', href: '/', exact: true },
  {
    id: 'settings',
    items: [
      { id: 'profile', href: '/settings/profile', access: 'profile:read' },
      { id: 'team', href: '/settings/team', access: 'team:read' },
    ],
  },
];
const granted = new Set<Permission>(['profile:read']);
const visible = filterNavByAccess(items, (access) => granted.has(access));
const activeIds = resolveActiveNav(visible, '/settings/profile?tab=details');
// ['settings', 'profile']
```

`matchPath(href, currentPath, { exact?, end? })` compares absolute local paths case-sensitively. Trailing slashes, query strings and hashes are ignored. Empty paths, relative paths, hash-only targets (`#` included), protocol-relative URLs and URLs with a scheme never match. Prefix matching requires a segment boundary: `/admin` matches `/admin/users`, but not `/administrator`. `/` matches only itself by default so a home link is not active everywhere; pass `exact: false` to opt into prefix matching for the root. `end` is an alias for `exact`; an explicitly supplied `exact` takes precedence. No pattern, dynamic parameter, locale, base-path, percent-decoding or case conversion is performed; the host can provide normalized paths or a custom predicate.

`resolveActiveNav(items, currentPath, isActive?)` returns one ID path from root to the selected entry, or `[]`. It walks both `items` and `children`, so groups, sections and submenus can use either collection. IDs must be stable and unique among siblings. Explicit `active: true` takes priority over inferred matches. Explicit `active: false` excludes that entry from selection while its children remain eligible. Otherwise, the optional predicate `(item, currentPath) => boolean` replaces default path matching for each entry. The longest normalized matching href wins within a priority; equal lengths prefer the deeper entry, then the first in traversal order. Multiple explicit active entries use those same tie rules. No input is mutated.

`filterNavByAccess(items, canAccess)` preserves host metadata and returns fresh entries/arrays, recursively filtering both child collections. The callback receives `(access, item)` only when `access !== undefined`; entries without access are public. A denied parent removes its whole branch. Containers left without any children are pruned, including a submenu that has its own href. Empty input returns `[]`. Use a typed `NavItem<Permission>` (or an extension) to describe host-owned access values; no permission vocabulary is built into the kit. Filter before resolving active state so denied entries cannot win.

## Sidebar

```tsx
import { Sidebar, type SidebarEntry } from '@itclabs/react-ui';

type Permission = 'profile:read';
const menu: SidebarEntry<Permission>[] = [
  { id: 'home', label: 'Home', href: '/', exact: true },
  {
    id: 'profile',
    label: 'Profile',
    href: '/settings/profile',
    access: 'profile:read',
  },
];

<Sidebar
  items={menu}
  currentPath="/settings/profile"
  canAccess={(permission) => permission === 'profile:read'}
  data-testid="primary-navigation"
/>;
```

`SidebarProps<TAccess>` and `SidebarEntry<TAccess>` preserve the host's permission type. Sidebar filters before matching; `canAccess` is optional and omitting it leaves all entries visible. `isActive` receives `(entry, currentPath)` and follows the same precedence as the helper. Omitting `currentPath` keeps explicit active flags working; predicates then receive an empty path. Only the winning row receives `aria-current="page"`; its ancestors receive branch highlighting. Active descendants reveal uncontrolled branches when they become active. A host-controlled `open` remains authoritative, and users can manually collapse an active branch. Existing className/classNames slots, refs, localized labels and stable partTestId selectors remain available. Permission/path changes are processed on each render.

### Sidebar rail and mobile navigation

`Sidebar` also exports `SidebarBrand` and `SidebarClassNames`. `header` accepts
any ReactNode (for example a workspace switcher) or `{ logo?, title, subtitle?, href? }`.
Structured brands use UiLink when `href` is supplied; title/subtitle become
screen-reader-only in the rail. Header and footer remain in view while the middle
scrolls inside a viewport-height, sticky desktop sidebar. Custom header/footer nodes
can adapt with `group-data-[collapsed=true]/sidebar:hidden`, for example on UserMenu's
`details` and `chevron` class slots. Slots rendered in both desktop and mobile scopes
must avoid fixed DOM IDs. The host owns workspace selection and account actions.

```tsx
<WorkspaceShell
  sidebar={
    <Sidebar
      header={{ title: 'Lorem ipsum', logo: <Icon glyph={HomeIcon} />, href: '/' }}
      footer={<UserMenu name="Alex Morgan" compact items={accountItems} />}
      items={navigation}
      currentPath={currentPath}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      toggleShortcut="mod+b"
    />
  }
  content={children}
/>
```

Items/submenus accept `icon` as an existing registered icon name or a directly
imported kit glyph, and `badge` as a number or Badge props excluding children.
Expanded rows use Badge's standalone pill; collapsed rows put a dot on the icon.
Badge visibility rules (zero, showZero, invisible) still apply. An item without an
icon uses a folder glyph in the rail, so it remains reachable. Group labels stay
visible. Disabled entries cannot activate or open flyouts.

`collapsed` is controlled; otherwise `defaultCollapsed` initializes local state
(default false). `onCollapsedChange` reports requested changes. The built-in toggle
has localized collapse/expand names and `aria-expanded`. `collapseLabel` and
`expandLabel` override them. Optional `toggleShortcut` supports `mod`, `ctrl`, `meta`,
`alt`, `shift` and a key separated by `+`; `mod` accepts Control or Command. It is
off by default and ignores editable controls, repeat/composition and already handled
events. Give each shortcut a single owner when mounting multiple sidebars.

Rail links expose label tooltips on hover/focus. Submenus become side flyouts:
Enter/Space or ArrowRight/ArrowDown opens, focus moves to the first link/control,
Tab visits the contents, Escape dismisses and returns focus. A parent with `href`
remains available as the first flyout link. Only the winning link has aria-current;
its rail branch stays highlighted. Existing submenu `open`, `defaultOpen` and
`onOpenChange` work in both presentations. Uncontrolled rail flyouts default closed
even for active descendants, while expanded disclosures reveal active branches.
Changing between rail and expanded presentations remounts uncontrolled branches;
control submenu `open` when it must persist across that change.

Below `lg`, the desktop aside is hidden and an IconButton opens a left kit Drawer
with the same filtered/active tree, header and footer. `mobileTrigger` can replace
that button with a native/ref-forwarding control such as
`<IconButton icon={MenuIcon} label="Open navigation" />`; supply its own accessible
name. `mobileTriggerLabel` names the default button and `drawerTitle` names the
Drawer; both otherwise use localized defaults. Selecting a mobile link/action,
changing currentPath or crossing to desktop closes the Drawer. Escape, focus trap
and focus restoration come from Drawer.

`className` and React 19 ref still target the desktop aside. Existing class slots
remain; additional slots are `brand`, `brandLogo`, `brandTitle`, `brandSubtitle`,
`label`, `badge`, `toggle`, `tooltip`, `flyout`, `mobileTrigger` and `drawer`.
The optional base selector derives `-header`, `-brand*`, `-toggle`, `-content`,
`-footer`, `-nav`, `-drawer` and Drawer's standard `-drawer-trigger`/`-drawer-close`.
Item paths retain stable type/id segments and derive `-icon`, `-label`, `-badge`
(and Badge's parts), `-tooltip`, submenu `-content` and rail parent `-link`.
Mobile item paths start under `-drawer`, with `-drawer-sidebarHeader` for the brand header inside the body, avoiding duplicate selectors.

See Modules/Sidebar's WithHeaderFooter, IconsAndCounts, Collapsible,
CollapsedFlyout and Mobile stories, and Templates/ApplicationLayout for clickable
sidebar and top-navigation layouts.

## Permission filtering and route protection

UI hiding is not security. Users can enter URLs directly or call APIs without using a menu. The host must also guard routes server-side / in middleware, verify sessions and permissions at the data boundary, and authorize every sensitive action. A client-side route guard helps navigation but does not secure backend data.

### Next.js host

Keep framework imports in the host. A client navigation wrapper passes [usePathname](https://nextjs.org/docs/app/api-reference/functions/use-pathname) to Sidebar. `items` is the typed menu above; the server provides serializable granted permissions. Install a Next Link adapter through UIProvider link in the host composition root for client navigation (see [composition guidance](UI_COMPOSITION_API.md#link-and-image-boundary)).

```tsx
'use client';
import { usePathname } from 'next/navigation';
import { Sidebar, type SidebarEntry } from '@itclabs/react-ui';

export function Navigation({
  items,
  granted,
}: {
  items: readonly SidebarEntry<string>[];
  granted: readonly string[];
}) {
  const currentPath = usePathname();

  return (
    <Sidebar
      items={items}
      currentPath={currentPath ?? ''}
      canAccess={(permission) => granted.includes(permission)}
    />
  );
}
```

For Next.js versions using `middleware.ts`, the host can start with this route gate. `verifySession` is host-owned: it must validate the session and permissions using the host's authentication system, rather than trust an unverified cookie value. Next.js 16 renamed this convention to [proxy.ts](https://nextjs.org/docs/app/api-reference/file-conventions/proxy); use that filename and rename the exported function to `proxy` there.

```ts
// Host middleware.ts (Next.js 15); proxy.ts/export proxy on Next.js 16.
import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from './auth/session';

export async function middleware(request: NextRequest) {
  const session = await verifySession(request);
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (!session.permissions.includes('profile:read')) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

export const config = { matcher: ['/settings/:path*'] };
```

Choose matchers/permissions for the host's route tree. Also verify authorization in server data access and route handlers; a middleware/proxy gate alone is insufficient. See the [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication).

### React Router host

Read [useLocation](https://reactrouter.com/api/hooks/useLocation) inside the host router and pass its pathname. Configure a UIProvider link adapter mapping UiLink's `href` to React Router Link's `to`, forwarding native props and ref.

```tsx
import { useLocation } from 'react-router';
import { Sidebar, type SidebarEntry } from '@itclabs/react-ui';

export function Navigation({
  items,
  canAccess,
}: {
  items: readonly SidebarEntry<string>[];
  canAccess: (permission: string) => boolean;
}) {
  const { pathname } = useLocation();

  return <Sidebar items={items} currentPath={pathname} canAccess={canAccess} />;
}
```

A protected route loader can reject navigation before rendering using [redirect](https://reactrouter.com/api/utils/redirect). Attach the following loader to the relevant host route. `requireSession` and `loadProfile` are host functions; enforce the same permission in the server/API serving `loadProfile`, even when the loader runs in the browser.

```ts
import { redirect, type LoaderFunctionArgs } from 'react-router';
import { requireSession, loadProfile } from './auth/session';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireSession(request);
  if (!session) throw redirect('/login');
  if (!session.permissions.includes('profile:read')) {
    throw new Response(null, { status: 403 });
  }

  return loadProfile(session);
}
```

## Navbar

`Navbar` and its types (`NavbarProps<TAccess>`, `NavbarItem<TAccess>`,
`NavbarLink<TAccess>`, `NavbarSection<TAccess>`, `NavbarBrand`, `NavbarClassNames`) are
exported from the root and modules barrels.

```tsx
import { Navbar, type NavbarItem } from '@itclabs/react-ui';

const items: NavbarItem<string>[] = [
  { id: 'home', label: 'Home', href: '/', exact: true },
  {
    id: 'settings',
    type: 'dropdown',
    label: 'Settings',
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile' },
      { id: 'team', label: 'Team', href: '/settings/team', access: 'team:read' },
    ],
  },
  {
    id: 'resources',
    type: 'mega',
    label: 'Resources',
    sections: [
      {
        id: 'guides',
        title: 'Guides',
        items: [
          {
            id: 'start',
            label: 'Getting started',
            href: '/guides/start',
            icon: 'bookOpen',
          },
        ],
      },
    ],
  },
];

<Navbar
  brand="Lorem ipsum"
  brandHref="/"
  items={items}
  currentPath="/settings/profile"
  canAccess={(access) => access === 'team:read'}
  elevateOnScroll
  data-testid="primary-navbar"
/>;
```

Links accept optional `description`. Links, dropdowns and mega items accept `icon` as a kit icon name (registered in the host theme) or a direct tree-shakeable glyph. Dropdowns use `children`; mega
menus use titled `sections` containing links. Keep IDs stable and unique among
siblings, including section IDs. `currentPath`, `isActive` and `canAccess` follow
Sidebar's callback contracts and the shared helpers' precedence. Predicates
receive original item data; structural sections are not passed to callbacks.
Filtering runs before matching and removes empty sections and menus. Only the
winning link receives `aria-current="page"`; its top-level branch is highlighted.
Both desktop and mobile use the same filtered tree. As with Sidebar, permission
filtering only controls presentation; the host protects routes and data.

The `lg` breakpoint switches between Radix NavigationMenu and an IconButton that
opens the kit Drawer. Desktop supports arrow keys and Escape through Radix;
mobile groups use native keyboard-accessible disclosures, initially expanded
for the active branch. Selecting a mobile link or changing `currentPath` closes
the Drawer. Brand and navigation links use UiLink adapters. `brandHref` turns the
brand slot into a link; `actions` accepts host controls, and `secondary` adds a row.
`navigationLabel`, `mobileTriggerLabel` and `drawerTitle` override localized defaults.

`sticky` defaults to true and uses `z-header`; `elevateOnScroll` defaults to false
and adds a shadow after window scrolling without changing dimensions.
`className` targets the header; `classNames` exposes root, inner, brand, nav,
item, trigger, content, section, link, actions, mobileTrigger, drawer and secondary.
Native header attributes and React 19 `ref` are forwarded. The base test ID targets
the header; parts derive `-inner`, `-brand`, `-nav`, `-actions`, `-mobileTrigger`,
`-drawer`, `-drawerNav`, `-secondary` and `-item-{id}` with `-trigger`, `-content`
or `-link` suffixes. Mega sections add `-section-{id}` before child item IDs;
mobile entries are scoped under `-drawer`. Drawer also derives its standard parts.

### Brand, switcher and active indicator

The surface bar is at least 64px tall with a bottom border. `brand` accepts a
ReactNode or `{ logo?, title, subtitle?, href? }`. Structured brands render a
rounded accent logo tile, bold title and muted uppercase subtitle. Supply an
`Icon` glyph or image node as `logo`; override `classNames.brandLogo` for image
backgrounds. `href` uses UiLink and takes precedence over legacy `brandHref`.
`switcher` appears immediately after the brand on desktop and inside the mobile
Drawer alongside the brand. Use the kit segmented Tabs (with TabsList/TabsTrigger)
or Select; the host owns its selected context. Avoid fixed DOM IDs inside a slot
rendered in both desktop and drawer scopes.

`activeIndicator="underline"` is the default: the active top-level item has accent
text and a 2px accent bar flush with the bottom border. The bar is absolutely
positioned and has no animation or layout shift. `activeIndicator="pill"` retains
the selected background style. Mobile entries retain their selected background.
Additional class slots are `brandLogo`, `brandTitle`, `brandSubtitle`, `switcher`,
`icon` and `activeIndicator`. Corresponding selectors derive `-brandLogo`,
`-brandTitle`, `-brandSubtitle`, `-switcher`, `-drawerSwitcher`,
`-item-{id}-icon` and `-item-{id}-activeIndicator` (active desktop item only).
Drawer brand parts are scoped under `-drawer`.

### UserMenu and actions

`UserMenu`, `UserMenuProps` and `UserMenuClassNames` are exported from the modules
and root barrels. `name` supplies visible text, avatar initials and the localized
trigger name. Optional `description` is shown below it. `avatar` accepts Avatar
options such as `src`, `fallback`, `shape` and `classNames`; images use UiImage.
`compact` shows only the avatar. By default, `collapseOnMobile` hides details and
chevron below `sm`; set it to false to keep the full chip at all widths.

`items` uses `readonly DropdownMenuEntry[]`: actions, links, separators, labels,
checkboxes, groups and submenus share DropdownMenu behavior. `header` accepts
optional name/email content above the entries. DropdownMenu itself also supports
this optional `header` and a `classNames.header` slot. `open`, `defaultOpen`,
`onOpenChange` and `contentProps` configure the menu. Enter/Space/ArrowDown open
it; Radix manages menu navigation, Escape and focus restoration. Hosts own item
callbacks, including sign-out. `label` or native `aria-label` overrides the localized
trigger name. Native button attributes and React 19 `ref` target the trigger.

```tsx
import { Icon, IconButton, Navbar, UserMenu } from '@itclabs/react-ui';
import { HomeIcon } from '@itclabs/react-ui/icons/outline/home';
import { BellIcon } from '@itclabs/react-ui/icons/outline/bell';

<Navbar
  brand={{
    logo: <Icon glyph={HomeIcon} />,
    title: 'Lorem ipsum',
    subtitle: 'Dolor sit amet',
    href: '/',
  }}
  items={[{ id: 'home', href: '/', label: 'Home', icon: HomeIcon }]}
  currentPath="/"
  activeIndicator="underline"
  actions={
    <>
      <IconButton icon={BellIcon} label="Notifications" variant="secondary" badge={3} />
      <UserMenu
        name="Lorem Ipsum"
        description="Dolor sit amet"
        header={<span>user@example.com</span>}
        items={[{ id: 'profile', label: 'Profile', href: '/profile' }]}
      />
    </>
  }
/>;
```

`className`, `classNames.root` and `classNames.trigger` target the chip (direct
className wins). Other slots include `avatar`, `details`, `name`, `description`,
`chevron` and DropdownMenu's typed slots such as `content`, `header` and `item`.
The optional test ID is a scope: `-trigger` identifies the button, with `-avatar`,
`-details`, `-name`, `-description`, `-chevron`, `-content`, `-header` and standard
DropdownMenu entry IDs such as `-item-profile`. Menus are portalled; query them
from document/page. No selectors are emitted without an explicit base ID.

## TopLoader

`TopLoaderProvider` renders a fixed decorative progress bar and supplies
`useTopLoader(): TopLoaderController` with `start()`, `set(fraction)`, `inc(amount?)`
and `done()`. All APIs and types, including `TopLoader`, `TopLoaderProps`,
`TopLoaderProviderProps`, `TopLoaderClassNames`, `TopLoaderClient`,
`createTopLoaderClient` and `topLoader`, are exported from the root and components
barrels. No router is imported by the kit.

Mount one provider at a persistent application root. The default `topLoader`
facade attaches after mount; calls before mount or after unmount throw without
queuing SSR work. For independent apps use `client={createTopLoaderClient()}`
with a stable client created outside rendering. A client binds to one provider;
use `client={null}` for independent hook-only scopes. Stale hook controllers are
inert after unmount. Import the hook-free facade directly from the root or
components barrel; no separate package subpath is required.

`start()` is idempotent while running. `set(n)` clamps finite fractions to
0.08–0.994, and `set(1)` completes. Invalid numbers are ignored. `inc()` advances
by a small diminishing fraction; automatic trickling never completes the bar.
These methods share one activity, not a reference counter: hosts coordinating
concurrent work must call `done()` after all work finishes. Starting during
completion cancels the old fade and begins a fresh activity.

The defaults are `delay={100}`, `minimumDuration={300}` (from becoming visible),
`fadeDuration={180}`, `trickle={true}`, `trickleInterval={800}` and `peg={true}`.
Instant work finishes before the delay without showing a bar. Completion fills
the bar, waits for its minimum display time, then fades and hides it. Refs and
native div attributes target the visual root, including on the provider.
`height` and `color` accept CSS values; defaults use `h-1`, `text-brand-500` and
`z-toast` (above `z-header`). `className` targets the fixed root; `classNames`
exposes root/bar/peg, with caller classes merged last. The base `data-testid`
targets the root, with `-bar` and `-peg` parts. `data-state` is idle/loading/fading.
`TopLoader` renders another view of the nearest provider if a separate styled
view is needed; normally the provider's built-in view is sufficient.

The estimated `role="progressbar"` is always `aria-hidden`: it does not announce
invented percentages or repeated route events, and owns no keyboard focus or
text requiring translation. Hosts should set `aria-busy` on affected content and
provide a localized status message when needed. Reduced motion displays a static
quarter-width bar, disables trickling, glow and transitions, and retains display
timing.

With `trackLinks`, document capture observes same-origin HTTP(S) anchor clicks,
including UiLink adapters. It ignores non-left clicks, modifiers, downloads,
non-self targets (including inherited base targets), external links, the current
URL and hash-only changes. It never prevents navigation. Capture lets host
routers prevent native navigation in their own click handlers. A host that cancels
navigation must call `done()`; capture cannot predict cancellation. The bar
finishes when `currentPath` changes. Include search parameters if query-only
navigation should complete it. Hash-only changes do not start it. Browser back/
forward and programmatic navigation require manual `start()`; route errors,
redirects to the same URL and aborted navigation require explicit `done()`.

### Next.js App Router progress

Keep this wrapper in the host application; mount it in a persistent layout.

```tsx
'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { TopLoaderProvider } from '@itclabs/react-ui';

export function NavigationProgress({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <TopLoaderProvider currentPath={pathname ?? ''} trackLinks>
      {children}
    </TopLoaderProvider>
  );
}
```

For query navigation, combine pathname with the host's `useSearchParams()` value
and follow the host framework's Suspense requirements. Programmatic navigation
can call `topLoader.start()` before `router.push()`; the changed path completes
it. Call `topLoader.done()` on failure or cancellation.

### React Router progress

Mount inside the host router and outside route elements that unmount on navigation.

```tsx
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { TopLoaderProvider } from '@itclabs/react-ui';

export function NavigationProgress({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation();
  return (
    <TopLoaderProvider currentPath={pathname + search} trackLinks>
      {children}
    </TopLoaderProvider>
  );
}
```

For data loading, use the same controller independently of any router:

```tsx
const loader = useTopLoader();
async function refresh() {
  loader.start();
  try {
    await loadData(); // Host-owned request.
  } finally {
    loader.done();
  }
}
```

## PageHeader and Navbar

PageHeader is the per-page title block: it renders an h1 with optional eyebrow, description, action and breadcrumb slots. Navbar is the application-wide navigation bar. Supply breadcrumbs explicitly; PageHeader does not infer routes.

```tsx
<PageHeader
  breadcrumb={
    <Breadcrumb
      items={[
        { key: 'home', title: 'Home', href: '/' },
        { key: 'current', title: 'Current page' },
      ]}
    />
  }
  title="Lorem ipsum"
/>
```

The breadcrumb renders above the eyebrow/title inside the content column. `classNames.breadcrumb` styles its wrapper; a base `data-testid` derives `-breadcrumb`, `-content`, `-eyebrow`, `-title`, `-description` and `-actions`. Breadcrumb retains its own navigation semantics and UiLink adapter support. PageHeader forwards the React 19 ref and native div props to its root.
