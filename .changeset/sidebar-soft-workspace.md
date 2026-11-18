---
'@itclabs/react-ui': minor
---

Sidebar: add `tone="soft"` (brand-tinted background, full-ink labels) and `itemVariant="pill"` (rounded tinted current page; ancestors stay plain and nested items lose their guide rule), plus `description` (tooltip beside the expanded item) and `trailing` (e.g. a premium mark) on items. WorkspaceShell/DashboardShell: add `variant="soft"` (full-height sidebar with a rounded trailing edge, borderless header, flat page; DashboardShell defaults its sidebar to the soft tone and pill items). Floating shells now keep the header on the page surface instead of a ruled strip.
