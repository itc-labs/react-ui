'use client';
import { valueControl } from '../common/form-control';
import type { TestIdProps } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { useState } from 'react';
import { Select, type SingleSelectProps } from '../select';
import { timeSlots } from '../calendar/model';
export type TimePickerProps = (Omit<
  SingleSelectProps,
  'options' | 'multiple' | 'value' | 'defaultValue' | 'onValueChange'
> & {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  minTime?: string;
  maxTime?: string;
  minuteStep?: number;
  hourCycle?: 12 | 24;
}) &
  TestIdProps;

export function TimePicker({
  value: controlled,
  defaultValue = null,
  onValueChange,
  minTime = '00:00',
  maxTime = '23:59',
  minuteStep = 15,
  hourCycle = 24,
  error,
  ...props
}: TimePickerProps) {
  const { t } = useUILocale();
  const [local, setLocal] = useState(defaultValue);
  const value = controlled === undefined ? local : controlled;
  const slots = timeSlots(minTime, maxTime, minuteStep);

  const format = (time: string) => {
    if (hourCycle === 24) return time;
    const hour = Number(time.slice(0, 2));

    return `${String(hour % 12 || 12).padStart(2, '0')}:${time.slice(3)} ${t(hour < 12 ? 'time.am' : 'time.pm')}`;
  };

  const options = slots.map((time) => ({
    value: time,
    label: format(time),
    disabled: false,
  }));
  const invalid = Boolean(value && !slots.includes(value));
  if (value && invalid)
    options.unshift({
      value,
      label: t('time.invalidValue', { value }),
      disabled: true,
    });

  return (
    <Select
      {...props}
      searchable
      clearable={props.clearable ?? true}
      placeholder={props.placeholder ?? t('time.placeholder')}
      value={value ?? null}
      options={options}
      error={error || (invalid ? t('time.invalid') : undefined)}
      onValueChange={(next) => {
        setLocal(next);
        onValueChange?.(next);
      }}
    />
  );
}

TimePicker[valueControl] = true;
