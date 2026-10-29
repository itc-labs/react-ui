import type { TestIdProps } from '../common/testing';
import type { ClassNames, DateRange } from 'react-day-picker';
import type { SlotClasses } from '../common';
export type CalendarConstraints = {
  minDate?: string;
  maxDate?: string;
  isDateUnavailable?: (date: string) => boolean;
  today?: string;
};
type Base = CalendarConstraints & {
  'data-testid'?: string | undefined;
  className?: string;
  classNames?: SlotClasses<
    | 'root'
    | 'header'
    | 'navigation'
    | 'caption'
    | 'navigationButton'
    | 'selects'
    | 'monthSelect'
    | 'yearSelect'
    | 'grid'
  >;
  dayClassNames?: Partial<ClassNames>;
  defaultMonth?: string;
  autoFocus?: boolean;
};
export type CalendarProps = (Base &
  (
    | {
        mode?: 'single';
        value?: string | null;
        onValueChange?: (value: string | null) => void;
        required?: boolean;
      }
    | {
        mode: 'range';
        value: DateRange | undefined;
        onValueChange: (value: DateRange | undefined) => void;
        minDays?: number;
        maxDays?: number;
      }
  )) &
  TestIdProps;
