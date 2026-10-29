import type { TestIdProps } from '../common/testing';
import type { CalendarConstraints, CalendarProps } from '../calendar';
import type { PickerFieldProps } from '../date-picker/control';
export type DateRangeValue = { from: string; to: string } | null;
export type DateRangePickerProps = (PickerFieldProps &
  CalendarConstraints & {
    value?: DateRangeValue;
    defaultValue?: DateRangeValue;
    onValueChange?: (value: DateRangeValue) => void;
    placeholder?: string;
    clearable?: boolean;
    calendarClassNames?: CalendarProps['classNames'];
    dayClassNames?: CalendarProps['dayClassNames'];
    minDays?: number;
    maxDays?: number;
  }) &
  TestIdProps;
