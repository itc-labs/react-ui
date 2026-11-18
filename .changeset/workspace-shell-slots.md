---
'@itclabs/react-ui': minor
---

WorkspaceShell gains optional `topbar` (full-width bar above sidebar and page; the sticky sidebar starts below it) and `aside` (secondary column from xl, `--container-aside` token) slots, plus `WorkspaceAside`. A direct Sidebar now follows the shell variant (`floating` panel, `soft` appearance) unless its props differ. The shell no longer centres itself at `--container-workspace`, so the sidebar stays at the viewport edge on wide screens. DashboardShell: `account` is optional with `accountPlacement` (`header` or `sidebar`), it provides a SidebarProvider when needed and opens the mobile drawer from a header menu button instead of a separate row. Sidebar button items now align their labels to the start.
