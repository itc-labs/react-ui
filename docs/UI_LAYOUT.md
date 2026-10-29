# Shared layout compositions

Generic layout and navigation compositions. The library has no router dependency; the host supplies routes and page content.

| Entry                                    | Location                      | Host responsibility                                                                     |
| ---------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------- |
| Breadcrumb/List/Item/Link/Page/Separator | src/components/breadcrumb     | Choose items/hrefs/current page; Link supports asChild for Next Link                    |
| Sidebar/Group/Nav/Item                   | src/modules/sidebar           | Header/footer slots, navigation labels and active route; Item supports asChild and icon |
| WorkspaceShell/Body/Header/Main          | src/templates/workspace-shell | Supply sidebar, breadcrumb and header actions; compose page content                     |
| Stepper                                  | src/modules/stepper           | Steps/currentStep and transitions; read-only progress, no automatic actions             |

Sidebar is a sticky vertical panel from lg, with a scrollable middle and fixed header/footer. It supports an icon rail with tooltips and submenu flyouts, and a left Drawer below lg. Expanded submenu disclosures use Radix Collapsible. Breadcrumb wraps long paths rather than hiding them. Stepper marks the current step and completed text for assistive tech. Each entry has colocated stories; link composition and keyboard/current-state assertions are covered by play functions.

## Composition

```tsx
import {
  WorkspaceShell,
  WorkspaceBody,
  WorkspaceHeader,
  WorkspaceMain,
  Sidebar,
  SidebarGroup,
  SidebarNav,
  SidebarItem,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from '@itclabs/react-ui';

<WorkspaceShell
  sidebar={
    <Sidebar header={<strong>Workspace</strong>} footer="Nội dung của host">
      <SidebarGroup label="Workspace">
        <SidebarNav>
          <SidebarItem active href="/">
            Tổng quan
          </SidebarItem>
        </SidebarNav>
      </SidebarGroup>
    </Sidebar>
  }
>
  <WorkspaceBody>
    <WorkspaceHeader
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Tổng quan</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    />
    <WorkspaceMain>
      <h1>Nội dung trang</h1>
    </WorkspaceMain>
  </WorkspaceBody>
</WorkspaceShell>;
```

In Next, the app may use `<SidebarItem asChild active icon={...}><Link href="/items">Items</Link></SidebarItem>` or BreadcrumbLink asChild. Radix Slot preserves a single anchor and forwards consumer link props; the kit never imports next/link. A current-page label without a destination can use an asChild span, when no link is needed. Active route and breadcrumb derivation belong to the app, not the UI kit.

## Theme and overrides

`--container-sidebar: 13rem`, `--container-sidebar-collapsed: 4rem` and `--container-workspace: 100rem` define the default layout dimensions. WorkspaceShell consumes them; cn registers the container names for consumer max-width overrides. All parts accept className/native props. Header actions and main content are slots, not product-specific props.

## Submenus

`SidebarSubmenu`, `SidebarSubmenuTrigger`, `SidebarSubmenuContent` and `SidebarSubmenuRow` support nested disclosures. Use ordinary navigation links, not role=menu/tree: Tab visits visible links; Enter/Space toggles the native trigger button. Closed content is inert during exit and unmounted afterward. `forceMount` instead keeps it hidden/inert when closed. Trigger/content refs compose with consumer refs, including React 19 cleanup.

```tsx
import {
  Sidebar,
  SidebarNav,
  SidebarSubmenu,
  SidebarSubmenuTrigger,
  SidebarSubmenuContent,
  SidebarItem,
  Icon,
} from '@itclabs/react-ui';

<Sidebar className="flex-col items-stretch" header={<strong>Workspace</strong>}>
  <SidebarNav className="grid">
    <SidebarSubmenu active>
      <SidebarSubmenuTrigger icon={<Icon name="search" />}>Items</SidebarSubmenuTrigger>
      <SidebarSubmenuContent>
        <SidebarItem active href="/items">
          Danh sách mục
        </SidebarItem>
      </SidebarSubmenuContent>
    </SidebarSubmenu>
  </SidebarNav>
</Sidebar>;
```

On mobile the same compound content appears in the Drawer; generated items use the same permission and active-route model as desktop.

- `active` highlights the ancestor and defaults the uncontrolled disclosure open. Entering an active branch later opens it; manual collapse within the same active branch is respected. The host marks each active ancestor and the current leaf, and may control `open/onOpenChange` for other route-change or accordion rules. No pathname matching or permissions are inferred.
- `defaultOpen` overrides the initial open value. Controlled `open` is always authoritative. `disabled` disables the disclosure trigger; permissions/disabled links remain the host's responsibility.
- For a navigable parent, put SidebarItem and an iconOnly SidebarSubmenuTrigger with a meaningful text label into SidebarSubmenuRow. Link clicks navigate; only the separate button toggles.
- Nested roots have independent state/context, so parent highlights do not leak to unrelated child triggers. Closing a parent hides all descendants. There is no automatic arrow-key tree behavior; use the separate Tree component when that interaction is wanted.
- Open/close height and chevron motion use theme durations/easing and reduced-motion CSS. The height animation has no forwards fill, so nested content can grow after opening.

See the colocated Sidebar stories for keyboard, nested, controlled and active-branch examples. Static builds do not execute their play functions.

The submenu trigger owns a native button and requires label children (visually hidden with iconOnly). Custom router links use SidebarItem asChild; do not wrap the disclosure trigger in a link.

## Layering

- `src/components`: small controls.
- `src/modules`: reusable compositions such as Form, DataTable, Sidebar and Stepper.
- `src/templates`: generic page layouts with slots, including WorkspaceShell.

Application workflows belong to the consuming application. Storybook documents this library only.

## Simplified consumption

Use Breadcrumb items, Sidebar items and WorkspaceShell sidebar/header/content slots for normal usage. Compound parts remain advanced escape hatches. The app configures scoped UiLink/UiImage adapters instead of importing framework components in shared UI. See UI_COMPOSITION_API.md for the current API, identity, styling and interaction contracts; this supersedes earlier compound-only examples above.

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

## Collapsed workspace column

WorkspaceShell follows a direct child Sidebar's `data-collapsed="true"` using CSS
`:has()`, including when collapse state is uncontrolled. Its desktop grid column
uses `--container-sidebar-collapsed` instead of `--container-sidebar`; Sidebar width
and grid animate with the same motion-duration-normal token only when motion is
allowed. Keep Sidebar as a direct DOM child; providers/fragments are fine. When
using an extra DOM wrapper, set the shell grid columns with `className` from host
collapse state. Below lg the shell stacks the mobile trigger and body.

Templates/ApplicationLayout composes a structured brand, footer UserMenu, icons,
counts, a slim bar, PageHeader/Breadcrumb and Progress/ProgressList/Tag cards. Its
TopNavigationLayout variant uses Navbar's mega menu and underline indicator without
a sidebar. A local UiLink adapter changes host state for clickable fixture pages;
no router, fetching or authentication is bundled.
