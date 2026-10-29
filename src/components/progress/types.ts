import type { ComponentProps, ReactNode } from 'react';
import type { SlotClasses, TestIdProps } from '../common';
import type { ProgressSize, ProgressTone, ProgressValue } from './model';
export type ProgressClassNames = SlotClasses<
  'root' | 'header' | 'label' | 'value' | 'track' | 'indicator' | 'svg' | 'center'
>;
type SharedProgressProps = Omit<ComponentProps<'div'>, 'children'> &
  TestIdProps & {
    /** Null or omitted value selects indeterminate progress. */
    value?: number | null;
    max?: number;
    indeterminate?: boolean;
    label?: string;
    valueLabel?: string | ((value: ProgressValue) => string);
    tone?: ProgressTone;
    classNames?: ProgressClassNames | undefined;
  };
export type LinearProgressProps = SharedProgressProps & {
  variant?: 'linear';
  size?: ProgressSize;
  striped?: boolean;
  showValue?: boolean;
  thickness?: never;
  children?: never;
};
export type CircularProgressProps = SharedProgressProps & {
  variant: 'circular';
  /** Diameter and stroke thickness in pixels. */
  size?: number;
  thickness?: number;
  children?: ReactNode;
  striped?: never;
  showValue?: never;
};
export type ProgressProps = LinearProgressProps | CircularProgressProps;
export type ProgressPresentation = {
  state: ProgressValue;
  text: string;
  indeterminate: boolean;
};
