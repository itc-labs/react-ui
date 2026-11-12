---
'@itclabs/react-ui': minor
---

Add `KpiCard`, `MetricTrend` and `KpiGrid` for dashboard key figures. KpiCard shows a label, formatted value and unit with a semantic tone bar, optional icon, badge, trend, supporting line and accessible progress; `href` or `onClick` turns the whole card into a link or button, and `loading` shows skeletons. MetricTrend separates direction from intent so a decrease can read as good, with localized screen-reader text. KpiGrid lays cards out in a container-responsive grid.

Chart's numeric Y axis now sizes itself to its formatted tick labels instead of a fixed 64px, so long values such as `40.000.000 ₫` are no longer clipped. The new Cartesian `axisValueFormatter` prop formats axis ticks only (for example compact `40 Tr`), while tooltips, the legend and the data table keep `valueFormatter`.
