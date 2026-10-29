'use client';
import { useControl } from '../context';
import { DatePicker, type DatePickerProps } from '../../../components/date-picker';
import { TimePicker, type TimePickerProps } from '../../../components/time-picker';
import {
  DateRangePicker,
  type DateRangePickerProps,
  type DateRangeValue,
} from '../../../components/date-range-picker';

export function DateField(
  props: Omit<
    DatePickerProps,
    'value' | 'defaultValue' | 'name' | 'onValueChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl();

  return (
    <DatePicker
      {...props}
      name={field.name}
      value={field.state.value || null}
      onValueChange={(value) => field.handleChange(value ?? '')}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}

export function TimeField(
  props: Omit<
    TimePickerProps,
    'value' | 'defaultValue' | 'name' | 'onValueChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl();

  return (
    <TimePicker
      {...props}
      name={field.name}
      value={field.state.value || null}
      onValueChange={(value) => field.handleChange(value ?? '')}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}

export function DateRangeField(
  props: Omit<
    DateRangePickerProps,
    'value' | 'defaultValue' | 'name' | 'onValueChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl<DateRangeValue>();

  return (
    <DateRangePicker
      {...props}
      name={field.name}
      value={field.state.value}
      onValueChange={field.handleChange}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}
