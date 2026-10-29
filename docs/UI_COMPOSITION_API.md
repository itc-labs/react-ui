# UI consumption audit

Ordinary usage should express intent through one component and its data/slots. Consumers should not rebuild the primitive library's wiring for a standard menu, panel or navigation control. Existing compound parts remain the advanced layer for custom semantics, focus/ref composition and backward compatibility.

## Public API decisions

| Area                                                                                                               | Default usage                                                                    | Advanced usage                                                  |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| DropdownMenu                                                                                                       | trigger + items; actions, href links, checkboxes, labels, groups and submenus    | Existing explicit menu parts                                    |
| Dialog                                                                                                             | trigger + title/description + body + actions/footer                              | Explicit content/title/description/close and refs               |
| Drawer                                                                                                             | Same panel API, plus left/right/top/bottom side                                  | Existing DrawerContent and compound parts                       |
| AlertDialog                                                                                                        | title/description + onConfirm, labels and loading/disabled state                 | Explicit cancel/action parts or custom footer                   |
| Popover                                                                                                            | trigger + content + optional label/contentProps                                  | Explicit trigger/content/close                                  |
| Tooltip                                                                                                            | Existing one-component content + child trigger                                   | Child supplies its own semantics/ref                            |
| Breadcrumb                                                                                                         | items + optional description/separator/page-or-hero appearance                   | Existing list/item/link/page/separator parts                    |
| Tabs                                                                                                               | items with stable value, label, content and optional disabled/keepMounted        | Existing list/trigger/content parts                             |
| Sidebar                                                                                                            | items with item/group/submenu types; href, active and controlled submenu options | Custom row/toggle/ref layout                                    |
| WorkspaceShell                                                                                                     | sidebar/header/content slots with automatic body/header/main structure           | Existing body/header/main parts                                 |
| Accordion                                                                                                          | Existing items + type + variant                                                  | Existing item/trigger/content parts                             |
| Select, RadioGroup, Tree, Stepper, DataTable, Pagination                                                           | Already data-driven single components                                            | Typed callbacks/render slots as appropriate                     |
| Input family, Textarea, Button, IconButton, Avatar, UploadField, AvatarUpload, Calendar/date/time controls, Editor | Already direct prop APIs                                                         | Existing class slots and bound Form fields                      |
| Card, PageHeader, Alert, EmptyState, Tag, Badge, Skeleton, Spinner, Icon, Illustration                             | Already direct presentation/slot APIs                                            | Consumer-owned content                                          |
| Form                                                                                                               | Schema + FormField around normal controls                                        | Bound fields and explicit mapping retain validation/type safety |
| Toast                                                                                                              | Existing callable/scoped notification API                                        | Explicit client or hook-only provider scopes                    |

A form is not replaced with a second form-schema renderer: field binding, shared validation and custom control mapping are meaningful composition. Generic layout slots do not own business workflows or routing. No sibling feature coupling is introduced.

Composed mode is selected by prop key presence: `title` for Dialog/Drawer/AlertDialog, `content` for Popover and `items` for DropdownMenu. Omit that key for primitive Root usage. Composed titles/content must be `NonNullable<ReactNode>`; resolve nullable values before passing them (for example, `title={maybeTitle ?? 'Details'}`). Empty strings, `0` and `false` still select composed mode; menu `items` may be an empty array. Even an untyped caller passing `undefined` as title/content keeps the composed trigger and portal instead of falling back to primitive mode. Supply a meaningful accessible name, using `contentProps` when the visible title is empty.

## Examples

```tsx
<DropdownMenu
  trigger="Tác vụ"
  items={[
    { id: 'edit', label: 'Chỉnh sửa', onSelect: handleEdit },
    { id: 'separator', type: 'separator' },
    { id: 'delete', label: 'Xóa', tone: 'danger', onSelect: handleDelete },
  ]}
/>

<Drawer
  title="Thông tin"
  trigger="Mở thông tin"
  side="right"
  actions={[{ id: 'close', label: 'Đóng', close: true }]}
>
  <Input label="Nội dung" />
</Drawer>

<Tabs items={[
  { value: 'first', label: 'Phần một', content: <FirstPanel /> },
  { value: 'second', label: 'Phần hai', content: <SecondPanel /> },
]} />

<Breadcrumb items={[
  { key: 'home', title: 'Trang chủ', href: '/' },
  { key: 'current', title: 'Trang hiện tại' },
]} />
```

A string trigger becomes a shared Button. Visual content such as Avatar, Icon or a noninteractive custom component receives an unstyled native trigger button for keyboard semantics; supply triggerLabel for icon-only content. Kit controls that forward native props/ref (including Button, IconButton, UiLink and input/choice controls), native button and native a triggers automatically receive behavior directly, preserving events/ref/disabled state. For third-party/custom interactive controls, set triggerAsChild; the component must forward native props and ref. Explicit triggerAsChild={true} forces direct composition; false forces wrapping. Development warns once when a known interactive element is wrapped. triggerDisabled controls generated triggers; triggerLabel supplies an explicit accessible name. Tooltip supports the same trigger contract while retaining its legacy child-element API. Composed Dialog/Drawer footer actions use stable id, label, optional onClick/variant/loading/disabled/className and close. Close is explicit; preventing the click's default keeps the panel open. footer overrides generated actions when supplied.

### AlertDialog

AlertDialog's onConfirm follows the native click event contract, including event.preventDefault(). closeOnConfirm defaults to true, preserving immediate close on confirm. Set closeOnConfirm={false} for asynchronous work and own open/loading/error at the caller; successful completion may then close it explicitly. While confirmLoading is true, confirm cannot be clicked again, Cancel is disabled, and dismissal requests/Escape are blocked. Overlay interaction cannot dismiss an AlertDialog. When loading ends, normal dismissal returns; the host can still set open={false} while loading. Keep controlled open synchronized through onOpenChange. Custom footer actions remain caller-owned.

The UI never retries, swallows errors, performs host actions or treats a returned Promise as success or authorization to repeat work. Confirm/cancel labels come from typed dictionaries unless supplied explicitly.

```tsx
function AsyncConfirmation({ save }: { save: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AlertDialog
      trigger="Save"
      title="Confirm save"
      open={open}
      onOpenChange={setOpen}
      closeOnConfirm={false}
      confirmLoading={loading}
      onConfirm={async () => {
        setLoading(true);
        setError(null);
        try {
          await save();
          setOpen(false);
        } catch {
          setError('Save failed. Try again.');
        } finally {
          setLoading(false);
        }
      }}
    >
      {error && <p role="alert">{error}</p>}
    </AlertDialog>
  );
}
```

Menu action items and submenu triggers accept `tone?: 'default' | 'danger'` (default: `default`). Danger uses `text-danger-700` and `data-[highlighted]:bg-danger-50`; existing `classNames.item`, entry `className` and `classNames.submenuTrigger` overrides still merge after tone styles. Tone changes presentation only; confirmation and deletion remain host-owned.

`DropdownMenu` also accepts optional `header` content above the generated items, styled through `classNames.header` and identified by `-header`. `UserMenu` in the modules barrel composes this menu with an Avatar/name trigger; it accepts the same `DropdownMenuEntry[]` items, optional header, compact and responsive modes. See [navigation](UI_NAVIGATION.md).

Menu checkboxes are host-controlled. They close by default; closeOnSelect=false keeps the menu open while updating the value. Entries use stable id; groups/submenus provide nested items. href actions use UiLink. Ordinary action onSelect can prevent default using the primitive's event semantics. No array indexes or translated labels become IDs.

Tabs preserve visited panels by default. Disabled options are skipped when choosing the initial generated tab. Controlled value remains host-owned; schema/data changes do not introduce remount keys. Sidebar's active state stays host-owned, active descendants reveal their branch, and optional submenu open/onOpenChange keeps a branch controlled.

Breadcrumb's default rendering is plain small text with muted parent links, a slash separator and medium-weight current text; no panel, icon or page heading. The last item is text even if it carries href. An empty item list renders nothing. Wrapping long labels preserves readability in narrow layouts. Compound APIs remain available when custom nodes are necessary. Both item links and BreadcrumbLink with href use the scoped UiLink adapter; asChild delegates to the supplied child. BreadcrumbLink without href renders a span. SidebarItem follows the same routing contract: href uses UiLink, asChild uses the child, and a row without href renders a span (including disabled links and label-only entries), retaining aria-current. Use asChild with a button for actions.

DataTable aligns the first visible data column left and the last visible column right (typically actions or totals); a single-column table stays left. Override per column with `meta: { align: 'left' | 'center' | 'right' }`, e.g. right-aligned numeric columns. Header, body and skeleton cells share the alignment. Inline content (Button, IconButton, text) follows it; a custom block/flex cell must justify its own content.

## Link and image boundary

UiLink and UiImage default to native a/img elements and forward native attributes, React 19 refs, events, className and optional data-testid. LinkImageProvider installs host adapters once and inherits unspecified adapters through nested scopes. The UI package imports no Next/router/image framework.

A Next.js host can configure its adapters in a client composition root. Server components pass normal children/data rather than adapter functions across the server/client boundary. NextLink and NextImage imports are centralized in that file. Routing links in the app, generated Breadcrumb/Sidebar/menu links, Avatar images and file preview/download links use UiLink/UiImage.

Image optimization requires dimensions. Native srcSet candidates, dimensionless images, external sources and data/blob local previews use the host's native fallback; local absolute asset paths with complete dimensions use NextImage. Remote optimization requires an explicitly configured host adapter/allowlist. All relevant attributes and errors are forwarded. Processing-only new Image() in the crop engine and third-party crop internals retain their pixel-processing lifecycle. These are not presentation bypasses.

## Styling, selectors and validation

Composed className targets the real portalled content; typed classNames expose trigger/content/overlay/close/header/title/description/body/footer/action slots as applicable. Existing Content class targets remain unchanged. Caller classes merge after composition defaults, state and inherited styles. Root-only headless mode still has no DOM wrapper.

A composed overlay's data-testid targets content; trigger/header/title/description/body/footer/actions derive suffixes. Menu items derive their type and stable id; nested scopes incorporate the parent id. Breadcrumb uses stable item key; Tabs uses value; Sidebar uses id. Native attributes/refs and explicit contentProps overrides reach the rendered control. No default IDs or styling maps are emitted onto DOM.

Tests cover actual composed dialogs, cancellation, dropdown checkbox/actions, Popover refs, tab retention/reordering, adapter/native forwarding and generated navigation/layout. A source guard rejects native presentation a/img and Next link/image imports inside the shared kit outside its native adapter boundary. Existing primitive, source-builder, localization and selector tests remain applicable. Browser review must verify keyboard/Select portal behavior and visual layout separately from static/jsdom checks.

## Trigger recipes

```tsx
<DropdownMenu trigger={<Avatar alt="Tài khoản" src={avatarUrl} />} triggerLabel="Mở menu tài khoản" items={items} />
<DropdownMenu trigger={<Icon name="more" />} triggerLabel="Tác vụ" items={items} />
<DropdownMenu
  trigger={<IconButton icon="more" label="Tác vụ của dòng" onClick={(event) => event.stopPropagation()} />}
  items={rowActions}
/>
```

```tsx
<DropdownMenu
  trigger={<CustomControl ref={triggerRef} />}
  triggerAsChild
  items={items}
/>
```

CustomControl must forward native props and its ref to the focusable element. Use triggerLabel for generated visual buttons; Button/IconButton retain their own accessible names by default.

The table-cell example in Storybook Components/DropdownMenu, TableActions demonstrates row-owned actions with stable selectors and a single actual trigger. Visual triggers do not need to forward events; asChild controls do. Native keyboard behavior, custom callbacks and focus restoration remain owned by the underlying trigger primitives.

ModalProvider/useModal and the browser modal facade provide short confirm/alert/custom flows with FIFO, optional stacking and async error feedback. Prefer declarative Dialog for forms and long content. See [UI_MODAL.md](UI_MODAL.md).

### Navbar

Use `Navbar` from the root or modules barrel for horizontal navigation with
`brand` / `brandHref`, `items`, `actions` and optional `secondary` slots. Link
items carry `href`, dropdowns carry `children`, and mega items carry titled
`sections` with links. All links use UiLink; route matching and permission
pruning share Sidebar's `currentPath`, `isActive` and `canAccess` contracts.
The desktop Radix NavigationMenu collapses into a kit Drawer below `lg`.
Localized navigation/open labels, React 19 header refs, typed class slots and
stable part selectors are built in. See [navigation guidance](UI_NAVIGATION.md#navbar)
for the complete data contract and examples. WorkspaceShell can receive an
Navbar through its `header` slot; adjust the shell header wrapper classes
when the Navbar supplies its own padding and border.

Tag and Badge contracts, localization and migration are documented in [Tag and Badge](UI_TAG_BADGE.md).
