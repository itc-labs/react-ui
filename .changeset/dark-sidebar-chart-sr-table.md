---
'@itclabs/react-ui': patch
---

Sidebar `tone="dark"` now uses `--color-sidebar-dark`/`--color-sidebar-dark-ink` instead of ink/surface, so it stays dark in dark themes. Chart contains its screen-reader data table in a clipped box (a table ignores `sr-only` width), so charts no longer widen narrow pages.
