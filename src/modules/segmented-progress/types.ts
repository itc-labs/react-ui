import type { ComponentProps } from 'react';
import type { SlotClasses, TestIdProps } from '../../components/common';
import type { ProgressTone } from '../../components/progress';
export interface ProgressSegment {
  id: string;
  label: string;
  value: number;
  tone?: ProgressTone;
}
export interface ProgressSegmentValue {
  value: number;
  total: number;
  percent: number;
}
export type SegmentedProgressClassNames = SlotClasses<
  | 'root'
  | 'track'
  | 'segment'
  | 'summary'
  | 'legend'
  | 'legendItem'
  | 'swatch'
  | 'label'
  | 'value'
  | 'empty'
>;
export type SegmentedProgressProps = Omit<ComponentProps<'figure'>, 'children'> &
  TestIdProps & {
    segments: readonly ProgressSegment[];
    label?: string;
    showLegend?: boolean;
    valueFormatter?: (state: ProgressSegmentValue, segment: ProgressSegment) => string;
    emptyMessage?: string;
    classNames?: SegmentedProgressClassNames;
  };
