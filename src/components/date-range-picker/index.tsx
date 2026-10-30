'use client';
import { valueControl } from '../common/form-control';
import { partTestId } from '../common/testing';
import { useUILocale } from '../../i18n/provider';
import { useId, useState } from 'react';
import { Calendar, type DateRange } from '../calendar';
import {
  calendarDateString,
  dateSpan,
  displayCalendarDate,
  parseCalendarDate,
} from '../calendar/model';
import { PickerControl } from '../date-picker/control';

export type { DateRangeValue, DateRangePickerProps } from './types';
import type { DateRangeValue, DateRangePickerProps } from './types';
import { DateRangeFooter } from './footer';

export function DateRangePicker({
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
  minDays = 1,
  maxDays,
  error,
  ...props
}: DateRangePickerProps) {
  const { t, locale } = useUILocale();
  if (
    !Number.isInteger(minDays) ||
    minDays < 1 ||
    (maxDays != null && (!Number.isInteger(maxDays) || maxDays < minDays))
  )
    throw new RangeError('DateRangePicker requires integer 1 <= minDays <= maxDays.');
  const generated = useId(),
    id = props.id ?? generated;
  const [local, setLocal] = useState<DateRangeValue>(defaultValue);
  const value = controlled === undefined ? local : controlled;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();

  function rangeIssue(range: DateRangeValue): string {
    if (!range) return '';
    const span = dateSpan(range.from, range.to);
    if (!Number.isFinite(span) || span < 1) return t('range.invalid');
    if (range.from < minDate || range.to > maxDate) return t('range.outOfBounds');
    if (span < minDays || (maxDays != null && span > maxDays))
      return maxDays == null
        ? t('range.minDays', { min: minDays, count: minDays })
        : t('range.dayLimits', { min: minDays, max: maxDays });
    if (isDateUnavailable) {
      const day = parseCalendarDate(range.from)!;
      for (let i = 0; i < span; i++) {
        if (isDateUnavailable(calendarDateString(day))) return t('range.unavailable');
        day.setDate(day.getDate() + 1);
      }
    }

    return '';
  }

  const candidate: DateRangeValue =
    draft?.from && draft.to
      ? {
          from: calendarDateString(draft.from),
          to: calendarDateString(draft.to),
        }
      : null;
  const draftIssue = rangeIssue(candidate);

  function change(next: DateRangeValue) {
    setLocal(next);
    onValueChange?.(next);
    setOpen(false);
    props.onBlur?.();
  }

  function changeOpen(next: boolean) {
    if (next) {
      const from = parseCalendarDate(value?.from),
        to = parseCalendarDate(value?.to);
      setDraft(from && to ? { from, to } : undefined);
    }
    setOpen(next);
  }

  return (
    <>
      <PickerControl
        {...props}
        id={id}
        error={error || rangeIssue(value)}
        text={
          value
            ? `${displayCalendarDate(value.from, locale.code)} — ${displayCalendarDate(value.to, locale.code)}`
            : ''
        }
        placeholder={placeholder ?? t('range.placeholder')}
        open={open}
        onOpenChange={changeOpen}
        onClear={clearable ? () => change(null) : undefined}
      >
        <Calendar
          data-testid={partTestId(props['data-testid'], 'calendar')}
          {...(calendarClassNames ? { classNames: calendarClassNames } : {})}
          {...(dayClassNames ? { dayClassNames } : {})}
          autoFocus
          mode="range"
          value={draft}
          onValueChange={setDraft}
          minDate={minDate}
          maxDate={maxDate}
          minDays={minDays}
          {...(maxDays == null ? {} : { maxDays })}
          {...(today ? { today } : {})}
          {...(isDateUnavailable ? { isDateUnavailable } : {})}
        />
        <DateRangeFooter
          data-testid={props['data-testid']}
          candidate={candidate}
          draftIssue={draftIssue}
          hasDraft={Boolean(draft)}
          onReset={() => setDraft(undefined)}
          onApply={() => change(candidate)}
          classNames={props.classNames}
        />
      </PickerControl>
      {props.name && (
        <>
          <input
            type="hidden"
            name={`${props.name}.from`}
            value={value?.from ?? ''}
            disabled={props.disabled}
          />
          <input
            type="hidden"
            name={`${props.name}.to`}
            value={value?.to ?? ''}
            disabled={props.disabled}
          />
        </>
      )}
    </>
  );
}

DateRangePicker[valueControl] = true;
