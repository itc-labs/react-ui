import { themeColors } from '../../theme/colors';
import type { ChartProps } from './types';

export interface ChartEntry {
  id: string;
  label: string;
  color: string;
}

export interface ChartRow {
  id: string;
  label: string;
  values: readonly (number | null)[];
}

export interface ChartModel {
  entries: readonly ChartEntry[];
  rows: readonly ChartRow[];
  hasData: boolean;
  invalid: boolean;
}

/** Finite zero is observed data; missing/invalid values remain null. */
export function chartValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Stable colors survive series/slice reordering. */
export function chartColor(id: string, color?: string): string {
  if (color) return color;
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) | 0;

  return themeColors.chart[(hash >>> 0) % themeColors.chart.length]!;
}

function duplicates(ids: readonly string[]) {
  return ids.some((id) => !id) || new Set(ids).size !== ids.length;
}

/** Pure presentation projection; the caller owns provenance and retention. */
export function chartModel(props: ChartProps): ChartModel {
  if (props.type === 'pie' || props.type === 'donut') {
    const rows = props.data.map((slice) => ({
      id: slice.id,
      label: slice.label,
      values: [chartValue(slice.value)],
    }));

    return {
      entries: props.data.map((slice) => ({
        id: slice.id,
        label: slice.label,
        color: chartColor(slice.id, slice.color),
      })),
      rows,
      // Zero-only slices have no area. The table still preserves their zero values.
      hasData: rows.some((row) =>
        row.values.some((value) => value !== null && value > 0),
      ),
      invalid:
        duplicates(props.data.map((slice) => slice.id)) ||
        rows.some((row) => row.values.some((value) => value !== null && value < 0)),
    };
  }

  const rows = props.data.map((point) => ({
    id: point.id,
    label: point.label,
    values: props.series.map((series) => chartValue(point.values[series.id])),
  }));

  return {
    entries: props.series.map((series) => ({
      id: series.id,
      label: series.label,
      color: chartColor(series.id, series.color),
    })),
    rows,
    hasData: rows.some((row) => row.values.some((value) => value !== null)),
    invalid:
      duplicates(props.series.map((series) => series.id)) ||
      duplicates(props.data.map((point) => point.id)),
  };
}
