---
'@itclabs/react-ui': minor
---

Navbar standardisation, matching Sidebar:

- `appearance` presets (`default`, `floating`, `dark`, `brand`, `transparent`) set tone, item style and density; `tone`, `itemVariant` (`underline`, `pill`, `solid`, `ghost`) and `density` override them. `activeIndicator` still works as an alias of `itemVariant`.
- `align` (`start`, `center`, `split`) and a `topbar` row above the bar.
- Multi-level menus: dropdowns nest to any depth and open to the side; mega menus take a featured column, `columns`, a footer row and "Show all" links per section, or `layout="categories"` with categories on the left.
- The mobile drawer goes one level deeper at a time with a back button and opens on the current page's branch.
- `Button` and `IconButton` expose `data-variant`.
