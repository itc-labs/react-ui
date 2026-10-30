'use client';
import { useUILocale } from '../../i18n/provider';
import { useCalendarLocale } from './locale';
import { useState } from 'react';
import {
  DayPicker,
  getDefaultClassNames,
  type ClassNames,
  type Matcher,
  type Labels,
} from 'react-day-picker';

import { CalendarTestIdContext, TestingDayButton } from './testing-slots';
import { cn } from '../common';
import { calendarDateString, parseCalendarDate } from './model';
import './calendar.css';

export type { DateRange } from 'react-day-picker';
export type { CalendarConstraints, CalendarProps } from './types';
import type { CalendarProps } from './types';
import { CalendarHeader } from './header';

export function Calendar(props: CalendarProps) {
  const { t, locale } = useUILocale();
  const calendarLocale = useCalendarLocale();
  const {
    minDate = '1900-01-01',
    maxDate = '2100-12-31',
    isDateUnavailable,
    today,
    className,
    classNames,
    defaultMonth,
    autoFocus = false,
  } = props;
  const min = parseCalendarDate(minDate),
    max = parseCalendarDate(maxDate);
  if (
    props.mode === 'range' &&
    ((props.minDays != null &&
      (!Number.isInteger(props.minDays) || props.minDays < 1)) ||
      (props.maxDays != null &&
        (!Number.isInteger(props.maxDays) || props.maxDays < (props.minDays ?? 1))))
  )
    throw new RangeError('Calendar range requires positive integer day limits.');
  if (!min || !max || minDate > maxDate)
    throw new RangeError('Calendar requires valid minDate <= maxDate.');
  const initial =
    defaultMonth ??
    (props.mode === 'range'
      ? props.value?.from && calendarDateString(props.value.from)
      : props.value) ??
    today ??
    calendarDateString(new Date());
  const [month, setMonth] = useState(
    () =>
      parseCalendarDate(
        initial < minDate ? minDate : initial > maxDate ? maxDate : initial,
      ) ?? min,
  );

  const disabled: Matcher[] = [{ before: min }, { after: max }];
  if (isDateUnavailable)
    disabled.push((date) => isDateUnavailable(calendarDateString(date)));
  const defaults = getDefaultClassNames();
  const dayClasses = { ...defaults };
  for (const key of Object.keys(props.dayClassNames ?? {}) as (keyof ClassNames)[])
    dayClasses[key] = cn(defaults[key], props.dayClassNames?.[key]);
  const labels: Partial<Labels> = {
    labelDayButton: (date, modifiers) => {
      let text = new Intl.DateTimeFormat(locale.code, { dateStyle: 'full' }).format(
        date,
      );
      if (modifiers.today) text = t('calendar.today', { date: text });
      if (modifiers.selected) text = t('calendar.selected', { date: text });

      return text;
    },
  };
  const shared = {
    components: { DayButton: TestingDayButton },
    classNames: dayClasses,
    labels,
    lang: locale.code,
    locale: calendarLocale,
    month,
    onMonthChange: setMonth,
    startMonth: min,
    endMonth: max,
    disabled,
    hideNavigation: true,
    autoFocus,
    ...(today && parseCalendarDate(today) ? { today: parseCalendarDate(today)! } : {}),
  };

  return (
    <CalendarTestIdContext.Provider value={props['data-testid']}>
      <div
        data-testid={props['data-testid']}
        className={cn(
          'pod-calendar flex min-h-0 w-[20rem] max-w-full flex-col gap-3',
          classNames?.root,
          className,
        )}
      >
        <CalendarHeader
          data-testid={props['data-testid']}
          month={month}
          setMonth={setMonth}
          min={min}
          max={max}
          classNames={classNames}
        />
        <div
          className={cn(
            'flex min-h-0 justify-center overflow-x-hidden overflow-y-auto',
            classNames?.grid,
          )}
        >
          {props.mode === 'range' ? (
            <DayPicker
              {...shared}
              mode="range"
              selected={props.value}
              onSelect={props.onValueChange}
              min={Math.max(0, (props.minDays ?? 1) - 1)}
              {...(props.maxDays == null
                ? {}
                : { max: Math.max(0, props.maxDays - 1) })}
              excludeDisabled
            />
          ) : (
            <DayPicker
              {...shared}
              mode="single"
              selected={parseCalendarDate(props.value) ?? undefined}
              {...(props.required ? { required: true } : {})}
              onSelect={(date) =>
                props.onValueChange?.(date ? calendarDateString(date) : null)
              }
            />
          )}
        </div>
      </div>
    </CalendarTestIdContext.Provider>
  );
}
