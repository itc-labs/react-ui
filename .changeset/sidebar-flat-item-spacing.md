---
'@itclabs/react-ui': patch
---

Sidebar: a flat item list keeps the tight in-group spacing. The nav no longer puts `gap-5` between every top-level entry; only group boundaries get the 20px space, so grouped menus look the same as before. Group roots now carry `data-sidebar-group`.
