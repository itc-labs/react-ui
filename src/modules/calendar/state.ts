'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { startOfDay, toDate } from 'date-fns';
import { navigate, viewRange } from './engine/dates';
import type { CalendarView } from './engine/types';
import type { CalendarProps } from './types';

const defaultViews: readonly CalendarView[] = ['month', 'week', 'day', 'list'];

export function useCalendarState<TData>(
  props: CalendarProps<TData>,
  weekStartsOn: NonNullable<CalendarProps['weekStartsOn']>,
  narrow = false,
) {
  const enabledViews = [...new Set(props.views ?? defaultViews)];
  const views = narrow && props.responsiveView ? [props.responsiveView] : enabledViews;
  if (enabledViews.length === 0)
    throw new RangeError('Calendar views must not be empty.');
  const [localView, setLocalView] = useState(props.defaultView ?? views[0]!);
  const [localDate, setLocalDate] = useState(() =>
    toDate(props.defaultDate ?? startOfDay(new Date())),
  );
  const [navigation, setNavigation] = useState(0);
  const selectedView =
    props.view ?? (enabledViews.includes(localView) ? localView : enabledViews[0]!);
  if (!enabledViews.includes(selectedView))
    throw new RangeError('Calendar view must be enabled.');
  const view = narrow && props.responsiveView ? props.responsiveView : selectedView;
  const date = props.date ?? localDate;
  const range = viewRange(view, date, {
    weekStartsOn,
    ...(props.fixedWeekCount === undefined
      ? {}
      : { fixedWeekCount: props.fixedWeekCount }),
  });
  const start = +range.start;
  const end = +range.end;
  const dateValue = +date;
  const notifyRange = useEffectEvent(() => {
    props.onRangeChange?.({ start: toDate(range.start), end: toDate(range.end), view });
  });

  useEffect(() => {
    notifyRange();
  }, [start, end, view, dateValue, navigation]);

  const onNavigate = (action: 'prev' | 'today' | 'next') => {
    const next = navigate(view, date, action);
    if (props.date === undefined) {
      setLocalDate(next);

      setNavigation((count) => count + 1);
    }
    props.onDateChange?.(toDate(next));
  };

  const onSetDate = (next: Date) => {
    if (props.date === undefined) setLocalDate(toDate(next));
    props.onDateChange?.(toDate(next));
  };

  const onViewChange = (next: CalendarView) => {
    if (!views.includes(next) || next === view) return;
    if (props.view === undefined) setLocalView(next);
    props.onViewChange?.(next);
  };

  return {
    view,
    date: toDate(date),
    ...range,
    views,
    onNavigate,
    onViewChange,
    onSetDate,
  };
}
