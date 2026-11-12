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
| line  | `ChartPoint[]` and `ChartSeries[]`               | curve, dots, grid/xAxis/yAxis, axisValueFormatter           |
| area  | `ChartPoint[]` and `ChartSeries[]`               | curve, stacked, grid/xAxis/yAxis, axisValueFormatter        |
| bar   | `ChartPoint[]` and `ChartSeries[]`               | stacked, orientation, grid/xAxis/yAxis, axisValueFormatter  |
| pie   | `ChartSlice[]`: id, label, value, optional color | legend, tooltip                                             |
| donut | Same slices as pie                               | innerRadius fraction of outer radius, from 0 to less than 1 |

Cartesian points contain a stable id, a display label and a values map keyed by series id. Slices contain stable id, label and value. Labels are consumer-owned. IDs must be non-empty and unique within their dataset/series; duplicates produce an invalid-data state. Array position and translated labels are not identities.

Finite zero is real data; null, undefined and non-finite numbers remain missing. Lines/areas do not connect across missing points. Cartesian charts permit negative numbers; pie/donut reject negatives. Zero-only slices cannot occupy visible area, so the chart displays its empty message while the equivalent table retains zero values. The module does not convert missing values to zero or invent percentages, sales or demand.

## Colors, layout and formatting

Omit color to use the six shared chart tokens; default assignment follows stable IDs across reordering. Pass `color` on a series/slice for explicit overrides: `colors.chart[0]` from useTheme, a CSS variable, hex, rgb, hsl or another CSS color. Explicit color wins. CSS custom properties remain the source of actual color values and can be overridden per container.

The chart follows its container width with ResizeObserver. Default plot height is the chart-height token (18rem). Use positive finite `height` for a numeric height or override the viewport class. The tooltip is kept within the plot and inherits the same CSS scope. Animations are disabled, including tooltip animation, for predictable data changes and reduced-motion behavior.

`valueFormatter` applies to numeric axis ticks, tooltip values and the equivalent table. The default uses the current UIProvider locale. Cartesian charts also accept `axisValueFormatter`, which formats numeric axis ticks only, so long values can use compact ticks (for example `40 Tr` from `Intl.NumberFormat('vi-VN', { notation: 'compact' })`) while tooltips, the legend and the table keep the full `valueFormatter` output. The numeric Y axis sizes itself to its longest formatted tick (Recharts `width="auto"`), so values such as `40.000.000 ₫` are not clipped; the category axis of horizontal bars keeps a fixed width and wraps long labels. Labels/ISO values are not translated by the chart. Axis labels may be abbreviated or hidden by the rendering engine in narrow layouts; the data table retains complete labels and values.

## State and accessibility

A non-empty `label` provides an accessible chart/table name. Optional title and description are visible caption content. Recharts accessibilityLayer supplies chart keyboard navigation; the equivalent semantic table is always available to screen readers. `showDataTable` makes it visible as well. Do not rely on color alone: series labels and numerical data accompany the marks.

Loading replaces the plot and removes prior rows/legend/table. Error does the same; optional onRetry invokes a host callback without performing a request. Empty data has a distinct status. No previous dataset is retained internally. Consumer error takes precedence over invalid configuration; loading takes precedence over both. Supply emptyMessage/loadingLabel/retryLabel/missingValueLabel to override typed dictionary defaults.

Root native figure props/ref and data-testid are forwarded. Derived IDs include `-viewport`, `-plot`, `-loading`, `-error`, `-empty`, `-retry`, `-legend`, `-legend-{seriesOrSliceId}`, `-table`, `-row-{rowId}` and `-cell-{rowId}-{seriesId}` (radial cells use `value`). Dynamic segments are URI-encoded. No default selectors are emitted. SVG marks remain rendering-engine details; prefer chart keyboard/role queries or the equivalent table rather than vendor DOM indexes.

Typed classNames cover root/caption/title/description, viewport/plot, grid/axis/series, legend and tooltip parts, status/retry and table parts. className targets the figure. Caller classes merge after defaults. The series class targets the rendering engine's series group; use descendant utilities when styling actual paths. Colors remain separate from utility class overrides.

## Storybook and verification

Modules/Chart includes editable Cartesian Playground, all five variants, states, stacked/horizontal examples, long currency values with compact axis ticks, missing-versus-zero, retry, narrow containers and CustomClasses/useTheme. The Playground type control is limited to Cartesian modes because radial types require a different data shape; Variants provides the radial recipes.

Tests cover data semantics, invalid identities/slices, all five actual SVG renderers, measured value-axis width and axis-only tick formatting, resize, native/class/selector contracts, localization, status replacement and tooltip rows. Compile-time cases reject mismatched type-specific props. Source-builder tests compile the stories against public exports. Builds/jsdom checks are separate from browser playback and layout review.

References: [Recharts sizing](https://recharts.github.io/en-US/api/ResponsiveContainer/), [Line gaps](https://recharts.github.io/en-US/api/Line/), [Pie](https://recharts.github.io/en-US/api/Pie/).

## Progress bars and distributions

`Progress` is a component with linear and circular variants; `ProgressList` and `SegmentedProgress` are modules. All three and their prop/slot/data types are available from the root entry. The component and module barrels also export their respective APIs. These progress charts use React, Radix and SVG without optional chart peers.

```tsx
import { Progress, ProgressList, SegmentedProgress } from '@itclabs/react-ui';

<Progress value={6} max={12} label="Tiến độ" showValue />;
<Progress variant="circular" value={6} max={12} label="Tiến độ" />;
<ProgressList
  sort="descending"
  thresholds={[
    { min: 0, tone: 'warning' },
    { min: 80, tone: 'success' },
  ]}
  items={[
    { id: 'first', label: 'Mục A', value: 6, max: 12 },
    { id: 'second', label: 'Mục B', percent: 85, secondaryText: 'Lorem ipsum.' },
  ]}
/>;
<SegmentedProgress
  segments={[
    { id: 'complete', label: 'Hoàn tất', value: 12, tone: 'success' },
    { id: 'waiting', label: 'Chờ xử lý', value: 3, tone: 'warning' },
  ]}
/>;
```

### Linear and circular progress

`value` is clamped to `[0, max]`; invalid/nonfinite values become zero. `max` defaults to 100 and falls back to 100 for nonpositive/nonfinite inputs. Percentage is clamped value divided by safe max. `null` or omitted value means indeterminate; `indeterminate` can explicitly select either mode. Zero remains determinate. ARIA values match the normalized value/max; indeterminate progress omits `aria-valuenow`. Both have a localized default accessible name, overridable with `label`, `aria-label` or `aria-labelledby`.

`Progress` defaults to `variant="linear"`, uses Radix Progress, supports `sm`/`md`/`lg`, `striped`, and `brand` (default), `info`, `success`, `warning`, `danger` tones. `label` is visible. `showValue` displays the locale-formatted percentage. Supplying `valueLabel` also displays a value: a string or `(state: ProgressValue) => string`, where state includes normalized `value`, `max` and `percent` (0–100). The displayed string also supplies `aria-valuetext`, unless explicitly overridden. Indeterminate progress uses the localized loading string.

`Progress variant="circular"` uses SVG with a numeric pixel `size` (default 96), pixel `thickness` (default 8) and the same tones. Invalid size/thickness fall back to defaults; thickness is capped at half the diameter. Both variants accept `valueLabel` as a string or formatter. Circular size/thickness/children and linear striped/showValue are checked by a discriminated union. Its center defaults to the formatted value; `children` replaces it, and `null` hides it. The indeterminate center is empty. Center content is decorative inside the progressbar: keep actions outside, and supply `aria-valuetext` when custom content changes the value description. `label` names the ring without visible caption text.

Indeterminate linear and ring animations use the existing loading/spin tokens through `motion-safe` utilities. Reduced motion retains a static indicator. Progressbars are passive indicators with no keyboard actions or tab stops; screen readers can inspect their names and values. Hosts own announcements for meaningful value changes.

### Lists, thresholds and distributions

`ProgressList.items` requires a stable unique nonempty `id` and string `label`, plus either `value`/optional `max` or `percent`. Each row can supply `secondaryText` and `tone`. A row's explicit tone wins; otherwise `thresholds` chooses the highest inclusive `min` less than or equal to its percentage, falling back to the list `tone` (brand). Threshold order does not matter; equal bounds use the last entry. Nonfinite bounds are ignored. No thresholds are inferred. `sort` is `none` (default), `ascending` or `descending`, comparing normalized percentages and preserving input order for ties without mutating items. `valueFormatter(state, item)` receives normalized values and returns visible/accessible text. `progressClassNames` styles each nested Progress. Empty items render `EmptyState`; zero rows remain visible.

`SegmentedProgress.segments` requires stable unique nonempty IDs, labels and values. Finite negative values clamp to zero; nonfinite values become zero. Shares divide each sanitized value by their total; scaled arithmetic avoids overflow when computing shares. A total beyond the finite number range is capped at `Number.MAX_VALUE` for display/formatter context. Zero-only or empty distributions render `EmptyState`; zero entries remain in the legend. `valueFormatter({ value, total, percent }, segment)` formats segment text; defaults use active-locale counts and percentages. Percentages are independently rounded for display and may not sum to 100; bar widths use unrounded shares.

Default segment colors use the shared categorical chart palette, assigned by stable ID across reordering. Optional segment `tone` selects a status token for both bar and swatch. Override chart tokens in CSS to customize categorical colors. `showLegend={false}` hides the visible legend while preserving the accessible caption with total, every label and formatted value. The decorative stacked bar is hidden from assistive technology; the figure and text caption convey the distribution. `label`/ARIA naming and `emptyMessage` override localized defaults.

### Classes and selectors

All three forward React 19 root refs, native root props and optional `data-testid`. Direct `className` wins after `classNames.root`. Typed slots:

- Progress: root, track, indicator; linear also has header, label, value; circular also has svg, center.
- ProgressList: root, list, row, secondary, empty; nested bars use `progressClassNames`.
- SegmentedProgress: root, track, segment, summary, legend, legendItem, swatch, label, value, empty.

The base selector targets the progressbar for both Progress variants, section for ProgressList, and figure for SegmentedProgress. All parts derive suffixes through `partTestId`, with no selectors emitted without a base. Progress variant suffixes match their non-root slots. Lists use `-list`, `-row-{id}`, `-progress-{id}`, `-secondary-{id}`, `-empty`; nested Progress parts append their suffix to `-progress-{id}`. SegmentedProgress uses `-track`, `-segment-{id}`, `-summary`, `-legend`, `-legend-{id}`, `-swatch-{id}`, `-label-{id}`, `-value-{id}`, `-empty`. Dynamic IDs are URI-encoded.

Colocated stories cover editable Playgrounds, tones, states, sizes, thresholds/rankings, custom center content, narrow layouts/long labels and CustomClasses. Tests cover normalization, percent/segment computations, thresholds, ARIA, locale formatting, sorting, stable colors, refs and customization. Browser layout, reduced-motion playback and assistive technology review remain separate from static/unit checks.

## KPI cards

`KpiCard`, `MetricTrend` and `KpiGrid` are modules exported from the root entry and `@itclabs/react-ui/modules`, with no optional peers. The application formats values; the cards perform no calculations.

```tsx
import { KpiCard, KpiGrid, Tag } from '@itclabs/react-ui';

export function Overview() {
  return (
    <KpiGrid columns={4} aria-label="Tổng quan">
      <KpiCard
        tone="success"
        icon="banknotes"
        badge={
          <Tag tone="success" size="sm">
            +8,2%
          </Tag>
        }
        label="Doanh thu"
        value="1.284"
        unit="tỷ đồng"
        trend={{ value: -3.9, intent: 'positive', label: 'so với kỳ 10/2026' }}
        href="/reports"
      />
      <KpiCard
        tone="info"
        icon="chart"
        label="Tỷ lệ hoàn thành"
        value="83,6"
        unit="%"
        progress={83.6}
      />
    </KpiGrid>
  );
}
```

`KpiCard` requires `label` and a formatted `value`; `0` is displayed and `null`/`undefined` shows the localized missing text (`missingValueLabel` overrides it). `tone` is the shared `UITone` set (`brand` by default, `info`, `success`, `warning`, `danger`, `neutral`) and colors the 3px top bar, the icon tile and the corner decoration. `icon` accepts an icon name or glyph; `badge` is non-interactive header content such as a Tag. `hint` adds a muted supporting line. `compact` tightens spacing and removes the decoration; `density="dashboard"` uses a smaller value and clamps the label to two lines.

`trend` takes MetricTrend data: a signed `value` whose sign selects the direction (or an explicit `direction`), an `intent` (`positive`, `negative`, `neutral`; defaults to up = positive, down = negative), an optional `valueFormatter` that receives the absolute change (default: locale percentage, `3.9` → `3,9%`), a trailing `label` and optional `children` that replace the value and label. Intent colors the arrow and value, so a decrease such as lower costs can read as good. Screen readers hear the localized `trend.up`/`trend.down`/`trend.flat` word first; pass `directionLabel=""` when visible text already states the direction. `MetricTrend` can also be used on its own.

`progress` is a 0–100 percentage rendered with `Progress`: values are clamped, `0` is shown, and the progressbar is named by a string `label`, `progressLabel` or the localized progress label. The neutral tone uses the brand progress color.

`href` makes the whole card a link through the UIProvider link component; `onClick` (without `href`) makes it a button. The action is a transparent overlay named by the label and value (`aria-labelledby`) and described by the trend and hint, so the progressbar keeps its semantics and no block content is nested in the link. Interactive cards gain the floating shadow on hover and a focus outline on keyboard focus. Do not put interactive content in `badge` of a clickable card. `loading` replaces the content with Skeleton placeholders, sets `aria-busy`, announces `loadingLabel` (default `common.loading`) and removes the action.

`KpiGrid` wraps its children in a container-query grid: one column, two from a medium container width and up to `columns` (1–6, default 4) on wide containers. Cards in a row share the same height. Classes and selectors are listed in [UI_CUSTOM_CLASSES.md](UI_CUSTOM_CLASSES.md) and [UI_TESTING.md](UI_TESTING.md).
