import type { ComponentProps, ReactNode } from 'react';
import type { SlotClasses } from '../../components/common';

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'donut';

export interface ChartSeries {
  /** Stable series identity; matches a key in each point's values. */
  id: string;
  label: string;
  /** Any CSS color; defaults to the theme's chart palette. */
  color?: string;
}

export interface ChartPoint {
  id: string;
  label: string;
  /** Missing and non-finite values remain gaps, never zero. */
  values: Readonly<Record<string, number | null | undefined>>;
}

export interface ChartSlice {
  id: string;
  label: string;
  /** Pie/donut values must be non-negative. */
  value: number | null;
  color?: string;
}

export type ChartClassNames = SlotClasses<
  | 'root'
  | 'caption'
  | 'title'
  | 'description'
  | 'viewport'
  | 'plot'
  | 'grid'
  | 'axis'
  | 'series'
  | 'legend'
  | 'legendItem'
  | 'legendMarker'
  | 'tooltip'
  | 'tooltipLabel'
  | 'tooltipRow'
  | 'tooltipMarker'
  | 'tooltipValue'
  | 'status'
  | 'retry'
  | 'table'
  | 'tableCaption'
  | 'tableHead'
  | 'tableRow'
  | 'tableHeader'
  | 'tableCell'
>;

type ChartBaseProps = Omit<ComponentProps<'figure'>, 'children' | 'title'> & {
  /** Accessible name for the chart and its equivalent data table. */
  label: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Plot height in pixels. Defaults to the shared chart-height token. */
  height?: number;
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  emptyMessage?: ReactNode;
  loadingLabel?: string;
  retryLabel?: string;
  missingValueLabel?: string;
  legend?: boolean;
  tooltip?: boolean;
  /** The equivalent table is always available to screen readers. */
  showDataTable?: boolean;
  valueFormatter?: (value: number) => string;
  classNames?: ChartClassNames;
  'data-testid'?: string;
};

type CartesianProps = {
  data: readonly ChartPoint[];
  series: readonly ChartSeries[];
  grid?: boolean;
  xAxis?: boolean;
  yAxis?: boolean;
};

type CurveProps = {
  curve?: 'linear' | 'monotone' | 'step';
};

export type ChartLineProps = ChartBaseProps &
  CartesianProps &
  CurveProps & {
    type: 'line';
    dots?: boolean;
  };

export type ChartAreaProps = ChartBaseProps &
  CartesianProps &
  CurveProps & {
    type: 'area';
    stacked?: boolean;
  };

export type ChartBarProps = ChartBaseProps &
  CartesianProps & {
    type: 'bar';
    stacked?: boolean;
    orientation?: 'vertical' | 'horizontal';
  };

export type ChartPieProps = ChartBaseProps & {
  type: 'pie';
  data: readonly ChartSlice[];
};

export type ChartDonutProps = ChartBaseProps & {
  type: 'donut';
  data: readonly ChartSlice[];
  /** Fraction of outer radius, from 0 to less than 1. */
  innerRadius?: number;
};

/** A single public API with type-specific options checked by TypeScript. */
export type ChartProps =
  ChartLineProps | ChartAreaProps | ChartBarProps | ChartPieProps | ChartDonutProps;
