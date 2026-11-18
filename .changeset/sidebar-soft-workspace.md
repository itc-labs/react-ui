---
'@itclabs/react-ui': minor
---

Sidebar standardisation:

- `appearance` presets (`default`, `soft`, `dark`, `brand`) set tone, item style and density in one prop; `tone`, `itemVariant` and the new `density` (`compact`, `default`, `comfortable`) still override them.
- New `tone="soft"` and `itemVariant="pill"` (rounded current-page fill with an edge bar; ancestors stay plain).
- Tone colours are CSS variables scoped by `data-sidebar-tone`, with theme tokens `--color-sidebar-soft` and `--color-sidebar-soft-active`; the aside no longer carries inline colour styles.
- `footerItems` (pinned entries in a secondary nav, sharing active resolution), `account` (UserMenu that adapts to the rail) and `SidebarMobileTrigger` with `mobileTrigger={false}` to open the drawer from the page header.
- Items accept `description` (tooltip beside the row and in the rail) and `trailing`.
- Fixes: a provider-backed Sidebar with `onCollapsedChange` now toggles; rail flyouts no longer open on collapse because of `defaultOpen`.
- Accessibility: labelled groups (`role="group"` with `aria-labelledby`), including collapsible groups.
- WorkspaceShell/DashboardShell: `variant="soft"` (DashboardShell uses `appearance="soft"`); floating shells keep the header on the page surface.
