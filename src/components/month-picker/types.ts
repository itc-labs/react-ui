import type { SlotClasses } from '../common';
import type { TestIdProps } from '../common/testing';
import type { PickerFieldProps } from '../date-picker/types';

export type MonthPanelClassNames = SlotClasses<
  | 'root'
  | 'header'
  | 'navigationButton'
  | 'caption'
  | 'grid'
  | 'row'
  | 'month'
  | 'footer'
  | 'currentMonth'
  | 'clearSelection'
>;

export type MonthPickerProps = (PickerFieldProps & {
  /** Selected month as `YYYY-MM`, or null when empty. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Earliest selectable month (`YYYY-MM`). Defaults to 1900-01. */
  min?: string;
  /** Latest selectable month (`YYYY-MM`). Defaults to 2100-12. */
  max?: string;
  /** Month treated as current (`YYYY-MM`) for highlighting and "This month". Defaults to the local current month. */
  currentMonth?: string;
  placeholder?: string;
  clearable?: boolean;
  panelClassNames?: MonthPanelClassNames;
}) &
  TestIdProps;
