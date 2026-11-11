'use client';
import { valueControl } from '../common/form-control';
import { partTestId } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { useId, useState } from 'react';
import { PickerControl } from '../date-picker/control';
import { MonthPanel } from './panel';
import {
  currentMonthIndex,
  monthIndexDate,
  monthIndexString,
  parseMonthIndex,
} from './model';

export type { MonthPickerProps, MonthPanelClassNames } from './types';
import type { MonthPickerProps } from './types';

export function MonthPicker({
  value: controlled,
  defaultValue = null,
  onValueChange,
  min: minMonth = '1900-01',
  max: maxMonth = '2100-12',
  currentMonth,
  placeholder,
  clearable = true,
  panelClassNames,
  error,
  ...props
}: MonthPickerProps) {
  const { t, locale } = useUILocale();
  const generated = useId(),
    id = props.id ?? generated;
  const [local, setLocal] = useState(defaultValue);
  const value = controlled === undefined ? local : controlled;
  const [open, setOpen] = useState(false);

  const min = parseMonthIndex(minMonth),
    max = parseMonthIndex(maxMonth);
  if (min == null || max == null || min > max)
    throw new RangeError('MonthPicker requires valid YYYY-MM min <= max.');
  const selected = parseMonthIndex(value);
  const current = parseMonthIndex(currentMonth) ?? currentMonthIndex();
  const issue =
    value &&
    (selected == null
      ? t('month.invalid')
      : selected < min || selected > max
        ? t('month.outOfBounds')
        : '');

  const text =
    selected == null
      ? (value ?? '')
      : t('month.value', {
          month: new Intl.DateTimeFormat(locale.code, { month: 'short' }).format(
            monthIndexDate(selected),
          ),
          number: String((selected % 12) + 1).padStart(2, '0'),
          year: String(Math.floor(selected / 12)),
        });

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
        text={text}
        placeholder={placeholder ?? t('month.placeholder')}
        clearLabel={t('month.clear')}
        popoverLabel={t('month.placeholder')}
        open={open}
        onOpenChange={setOpen}
        onClear={clearable ? () => change(null) : undefined}
      >
        <MonthPanel
          data-testid={partTestId(props['data-testid'], 'months')}
          selected={selected}
          hasValue={Boolean(value)}
          min={min}
          max={max}
          current={current}
          clearable={clearable}
          classNames={panelClassNames}
          onSelect={(index) => change(index == null ? null : monthIndexString(index))}
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

MonthPicker[valueControl] = true;
