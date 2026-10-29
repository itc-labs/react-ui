# Charts

`Chart` is a presentation module exported only from `@itclabs/react-ui/chart` (including its types). It wraps Recharts 3.10.1 behind one discriminated `type` API. `react-is` matches React 19.3.1. Install optional peers `recharts@3.10.1` and `react-is@19.3.1` (the versions used for local development) when using this entry. Core imports do not load either package. Consumers supply data; the module performs no requests, storage, scoring or metric estimation.

## Data contracts

```tsx
import { useTheme } from '@itclabs/react-ui';
import { Chart } from '@itclabs/react-ui/chart';

function Example() {
  const { colors } = useTheme();

  return (
    <Chart
      type="line"
      label="Dữ liệu minh họa"
      data={[
        { id: 'first', label: 'A', values: { views: 12 } },
        { id: 'missing', label: 'B', values: { views: null } },
        { id: 'zero', label: 'C', values: { views: 0 } },
      ]}
      series={[{ id: 'views', label: 'Lượt xem', color: colors.brand[700] }]}
    />
  );
}
```

| type  | Data                                             | Options                                                     |
| ----- | ------------------------------------------------ | ----------------------------------------------------------- |
| line  | `ChartPoint[]` and `ChartSeries[]`               | curve, dots, grid/xAxis/yAxis                               |
| area  | `ChartPoint[]` and `ChartSeries[]`               | curve, stacked, grid/xAxis/yAxis                            |
| bar   | `ChartPoint[]` and `ChartSeries[]`               | stacked, orientation, grid/xAxis/yAxis                      |
| pie   | `ChartSlice[]`: id, label, value, optional color | legend, tooltip                                             |
| donut | Same slices as pie                               | innerRadius fraction of outer radius, from 0 to less than 1 |

Cartesian points contain a stable id, a display label and a values map keyed by series id. Slices contain stable id, label and value. Labels are consumer-owned. IDs must be non-empty and unique within their dataset/series; duplicates produce an invalid-data state. Array position and translated labels are not identities.

Finite zero is real data; null, undefined and non-finite numbers remain missing. Lines/areas do not connect across missing points. Cartesian charts permit negative numbers; pie/donut reject negatives. Zero-only slices cannot occupy visible area, so the chart displays its empty message while the equivalent table retains zero values. The module does not convert missing values to zero or invent percentages, sales or demand.

## Colors, layout and formatting

Omit color to use the six shared chart tokens; default assignment follows stable IDs across reordering. Pass `color` on a series/slice for explicit overrides: `colors.chart[0]` from useTheme, a CSS variable, hex, rgb, hsl or another CSS color. Explicit color wins. CSS custom properties remain the source of actual color values and can be overridden per container.

The chart follows its container width with ResizeObserver. Default plot height is the chart-height token (18rem). Use positive finite `height` for a numeric height or override the viewport class. The tooltip is kept within the plot and inherits the same CSS scope. Animations are disabled, including tooltip animation, for predictable data changes and reduced-motion behavior.

`valueFormatter` applies to numeric axis ticks, tooltip values and the equivalent table. The default uses the current UIProvider locale. Labels/ISO values are not translated by the chart. Axis labels may be abbreviated or hidden by the rendering engine in narrow layouts; the data table retains complete labels and values.

## State and accessibility

A non-empty `label` provides an accessible chart/table name. Optional title and description are visible caption content. Recharts accessibilityLayer supplies chart keyboard navigation; the equivalent semantic table is always available to screen readers. `showDataTable` makes it visible as well. Do not rely on color alone: series labels and numerical data accompany the marks.

Loading replaces the plot and removes prior rows/legend/table. Error does the same; optional onRetry invokes a host callback without performing a request. Empty data has a distinct status. No previous dataset is retained internally. Consumer error takes precedence over invalid configuration; loading takes precedence over both. Supply emptyMessage/loadingLabel/retryLabel/missingValueLabel to override typed dictionary defaults.

Root native figure props/ref and data-testid are forwarded. Derived IDs include `-viewport`, `-plot`, `-loading`, `-error`, `-empty`, `-retry`, `-legend`, `-legend-{seriesOrSliceId}`, `-table`, `-row-{rowId}` and `-cell-{rowId}-{seriesId}` (radial cells use `value`). Dynamic segments are URI-encoded. No default selectors are emitted. SVG marks remain rendering-engine details; prefer chart keyboard/role queries or the equivalent table rather than vendor DOM indexes.

Typed classNames cover root/caption/title/description, viewport/plot, grid/axis/series, legend and tooltip parts, status/retry and table parts. className targets the figure. Caller classes merge after defaults. The series class targets the rendering engine's series group; use descendant utilities when styling actual paths. Colors remain separate from utility class overrides.

## Storybook and verification

Modules/Chart includes editable Cartesian Playground, all five variants, states, stacked/horizontal examples, missing-versus-zero, retry, narrow containers and CustomClasses/useTheme. The Playground type control is limited to Cartesian modes because radial types require a different data shape; Variants provides the radial recipes.

Tests cover data semantics, invalid identities/slices, all five actual SVG renderers, resize, native/class/selector contracts, localization, status replacement and tooltip rows. Compile-time cases reject mismatched type-specific props. Source-builder tests compile the stories against public exports. Builds/jsdom checks are separate from browser playback and layout review.

References: [Recharts sizing](https://recharts.github.io/en-US/api/ResponsiveContainer/), [Line gaps](https://recharts.github.io/en-US/api/Line/), [Pie](https://recharts.github.io/en-US/api/Pie/).
