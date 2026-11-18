---
'@itclabs/react-ui': minor
---

`UIProvider` accepts a `router` adapter next to `link` and `image`. `useUiRouter()` returns the current `pathname` and `navigate`, `useUiNavigate()` returns a stable navigate function that does not re-render on route changes, and Sidebar, Navbar and TopLoaderProvider follow the adapter's path when `currentPath` is omitted.
