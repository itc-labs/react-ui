---
'@itclabs/react-ui': minor
---

DataTable: `preservePageHeight` now measures only settled pages. While `loading` is true, or while a server host still shows more rows than one page (for example the previous 50 rows after switching to 10 per page), no height is recorded, so a smaller page size shrinks the table instead of keeping the taller height until reload.

Sidebar: add `collapseToggle?: 'sidebar' | 'none'` (default `'sidebar'`) to omit the desktop collapse toggle from the sidebar header. WorkspaceShell and WorkspaceHeader accept `sidebarToggle` (`true` or a custom node) to render a `SidebarTrigger` before the breadcrumb, wired to the SidebarProvider's sidebar (`aria-controls`, `aria-expanded`, localized label) and hidden below `lg`, where the drawer button remains. `SidebarTrigger` gains an optional `tooltip`.
