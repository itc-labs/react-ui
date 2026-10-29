'use client';
import type { TestIdProps } from '../common/testing';

import { partTestId } from '../common/testing';
import { useUILocale } from '../../i18n/provider';
import { useId, useState } from 'react';
import { Calendar, type CalendarConstraints, type CalendarProps } from '../calendar';
import { parseCalendarDate, displayCalendarDate } from '../calendar/model';
import { PickerControl, type PickerFieldProps } from './control';

export type DatePickerProps = (PickerFieldProps &
  CalendarConstraints & {
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    placeholder?: string;
    clearable?: boolean;
    calendarClassNames?: CalendarProps['classNames'];
    dayClassNames?: CalendarProps['dayClassNames'];
  }) &
  TestIdProps;

export function DatePicker({
  value: controlled,
  defaultValue = null,
  onValueChange,
  placeholder,
  clearable = true,
  calendarClassNames,
  dayClassNames,
  minDate = '1900-01-01',
  maxDate = '2100-12-31',
  isDateUnavailable,
  today,
  error,
  ...props
}: DatePickerProps) {
  const { t, locale } = useUILocale();
  const generated = useId(),
    id = props.id ?? generated;
  const [local, setLocal] = useState(defaultValue);
  const value = controlled === undefined ? local : controlled;
  const [open, setOpen] = useState(false);
  const issue =
    value &&
    (!parseCalendarDate(value)
      ? t('date.invalid')
      : value < minDate || value > maxDate || isDateUnavailable?.(value)
        ? t('date.outOfBounds')
        : '');

  const change = (next: string | null) => {
    setLocal(next);
    onValueChange?.(next);
    setOpen(false);
    props.onBlur?.();
  };

  return (
    <>
      <PickerControl
        {...props}
        id={id}
        error={error || issue}
        text={value ? displayCalendarDate(value, locale.code) : ''}
        placeholder={placeholder ?? t('date.placeholder')}
        open={open}
        onOpenChange={setOpen}
        onClear={clearable ? () => change(null) : undefined}
      >
        <Calendar
          data-testid={partTestId(props['data-testid'], 'calendar')}
          {...(calendarClassNames ? { classNames: calendarClassNames } : {})}
          {...(dayClassNames ? { dayClassNames } : {})}
          autoFocus
          value={value ?? null}
          required={!clearable}
          minDate={minDate}
          maxDate={maxDate}
          {...(today ? { today } : {})}
          {...(isDateUnavailable ? { isDateUnavailable } : {})}
          onValueChange={change}
        />
      </PickerControl>
      {props.name && (
        <input
          type="hidden"
          name={props.name}
          value={value ?? ''}
          disabled={props.disabled}
        />
      )}
    </>
  );
}
