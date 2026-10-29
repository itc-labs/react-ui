import type { ComponentProps, ReactNode } from 'react';
import type { SlotClasses, TestIdProps } from '../../components/common';
import type {
  ProgressTone,
  ProgressValue,
  ProgressClassNames,
} from '../../components/progress';
export type ProgressListItem = {
  id: string;
  label: string;
  secondaryText?: ReactNode;
  tone?: ProgressTone;
} & (
  | { value: number; max?: number; percent?: never }
  | { percent: number; value?: never; max?: never }
);
export interface ProgressThreshold {
  /** Inclusive lower percentage bound. Highest matching bound wins. */
  min: number;
  tone: ProgressTone;
}
export type ProgressListClassNames = SlotClasses<
  'root' | 'list' | 'row' | 'secondary' | 'empty'
>;
export type ProgressListProps = Omit<ComponentProps<'section'>, 'children'> &
  TestIdProps & {
    items: readonly ProgressListItem[];
    label?: string;
    tone?: ProgressTone;
    thresholds?: readonly ProgressThreshold[];
    sort?: 'none' | 'ascending' | 'descending';
    valueFormatter?: (state: ProgressValue, item: ProgressListItem) => string;
    emptyMessage?: string;
    classNames?: ProgressListClassNames;
    progressClassNames?: ProgressClassNames | undefined;
  };
