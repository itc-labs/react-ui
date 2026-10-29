'use client';

import {
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  addDays,
  getISOWeek,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
} from 'date-fns';
import { cn, partTestId } from '../../components/common';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/popover';
import { useUILocale } from '../../i18n/provider';
import { CalendarDayHeading } from './day-heading';
import { CalendarEventChip } from './event';
import { CalendarEditing } from './editing-context';
import { normalizeEvent } from './engine/dates';
import { layoutMonth } from './engine/layout-month';
import type { CalendarRange, NormalizedEvent } from './engine/types';
import type { CalendarProps } from './types';
import { selectionCell, useCalendarSelection } from './selection';
import { SelectionMirror, SelectionStatus } from './selection-presentation';

type MonthProps<TData> = {
  [
    K in
      | 'events'
      | 'dayMaxEvents'
      | 'weekNumbers'
      | 'classNames'
      | 'selectable'
      | 'selectMinDistance'
      | 'selectAllow'
      | 'onSelect'
      | 'onDateClick'
      | 'onEventClick'
      | 'renderEvent'
      | 'eventClassName'
      | 'data-testid'
  ]?: CalendarProps<TData>[K] | undefined;
} & CalendarRange & {
    className?: string;
    view?: 'month' | 'week';
    date: Date;
    title: string;
    onDateChange: (date: Date) => void;
  };

export function CalendarMonth<TData>({
  events = [],
  date,
  start,
  end,
  title,
  dayMaxEvents,
  weekNumbers = false,
  view = 'month',
  className,
  classNames,
  selectable,
  selectMinDistance,
  selectAllow,
  onSelect,
  onDateClick,
  onEventClick,
  renderEvent,
  eventClassName,
  onDateChange,
  'data-testid': testId,
}: MonthProps<TData>) {
  const { locale, t } = useUILocale();
  const editing = useContext(CalendarEditing);

  const isMirror = (id: string) => editing?.describe(id).mirror ?? false;

  const selection = useCalendarSelection({
    selectable,
    selectMinDistance,
    selectAllow,
    onSelect,
    view,
    rangeKey: `${+start}-${+end}`,
  });
  const [focus, setFocus] = useState(() => ({
    day: startOfDay(date),
    month: format(date, 'yyyy-MM'),
  }));
  const focused = focus.day;
  const pendingFocus = useRef<Date | null>(null);
  const cells = useRef(new Map<string, HTMLDivElement>());
  const active =
    focus.month === format(date, 'yyyy-MM') && focused >= start && focused < end
      ? focused
      : startOfDay(date);
  const rows = layoutMonth(
    events.map((event) => normalizeEvent(event)),
    { start, end },
    dayMaxEvents === undefined ? {} : { dayMaxEvents },
  );
  const fullDate = new Intl.DateTimeFormat(locale.code, { dateStyle: 'full' });
  const weekday = new Intl.DateTimeFormat(locale.code, { weekday: 'short' });
  const number = new Intl.NumberFormat(locale.code);
  const today = new Date();

  const key = (day: Date) => format(day, 'yyyy-MM-dd');

  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (
      target &&
      (view === 'month' ? isSameMonth(target, date) : target >= start && target < end)
    ) {
      cells.current.get(key(target))?.focus();
      pendingFocus.current = null;
    }
  });

  const onKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    day: Date,
    column: number,
  ) => {
    if (event.target !== event.currentTarget) return;
    let next: Date;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(day, -1);
        break;
      case 'ArrowRight':
        next = addDays(day, 1);
        break;
      case 'ArrowUp':
        next = addDays(day, -7);
        break;
      case 'ArrowDown':
        next = addDays(day, 7);
        break;
      case 'Home':
        next = addDays(day, -column);
        break;
      case 'End':
        next = addDays(day, 6 - column);
        break;
      case 'PageUp':
        next = addMonths(day, -1);
        break;
      case 'PageDown':
        next = addMonths(day, 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onDateClick?.({ date: new Date(day), allDay: true });
        return;
      default:
        return;
    }
    event.preventDefault();
    pendingFocus.current = next;
    if (view === 'month' ? isSameMonth(next, date) : next >= start && next < end) {
      setFocus({ day: next, month: format(date, 'yyyy-MM') });
    } else {
      onDateChange(next);
    }
  };

  const eventButton = (
    event: NormalizedEvent<TData>,
    id: string,
    isStart = true,
    isEnd = true,
  ) => (
    <CalendarEventChip
      {...{
        event,
        isStart,
        isEnd,
        classNames,
        onEventClick,
        renderEvent,
        eventClassName,
      }}
      view={view}
      presentation="dayGrid"
      data-testid={partTestId(testId, 'event', id)}
      className={cn(
        'truncate',
        !isStart && 'rounded-l-none',
        !isEnd && 'rounded-r-none',
      )}
    />
  );

  return (
    <div
      ref={selection.ref}
      {...selection.handlers}
      role="grid"
      aria-describedby={selectable ? selection.descriptionId : undefined}
      aria-label={title}
      aria-colcount={weekNumbers ? 8 : 7}
      className={cn(
        'flex min-w-0 flex-1 flex-col',
        selectable && 'select-none',
        classNames?.monthGrid,
        className,
      )}
      data-testid={partTestId(testId, 'monthGrid')}
      data-week-layout={view === 'week' ? 'dayGrid' : undefined}
    >
      <div
        role="row"
        className={cn('grid border-b border-line', classNames?.weekdayHeader)}
        data-testid={partTestId(testId, 'weekdayHeader')}
        style={{
          gridTemplateColumns: `${weekNumbers ? '3rem ' : ''}repeat(7, minmax(0, 1fr))`,
        }}
      >
        {weekNumbers && (
          <div role="columnheader" aria-label={t('calendar.views.week')} />
        )}
        {rows[0]!.days.map((day) => (
          <div
            role="columnheader"
            key={key(day)}
            className={cn(
              'p-2 text-center text-small font-medium uppercase text-muted',
              classNames?.weekday,
              view === 'week' && classNames?.dayHeader,
              view === 'week' && isSameDay(day, today) && classNames?.today,
            )}
            aria-label={view === 'week' ? fullDate.format(day) : undefined}
            aria-current={view === 'week' && isSameDay(day, today) ? 'date' : undefined}
            data-today={(view === 'week' && isSameDay(day, today)) || undefined}
            data-testid={
              view === 'week'
                ? partTestId(testId, 'dayHeader', key(day))
                : partTestId(testId, 'weekday', day.getDay())
            }
          >
            {view === 'week' ? (
              <CalendarDayHeading
                date={day}
                today={isSameDay(day, today)}
                classNames={classNames}
                data-testid={partTestId(testId, 'dayHeader', key(day))}
              />
            ) : (
              weekday.format(day)
            )}
          </div>
        ))}
      </div>
      {selectable && (
        <SelectionStatus
          selection={selection.mirror}
          id={selection.descriptionId}
          className={classNames?.selectionStatus}
          data-testid={partTestId(testId, 'selectionStatus')}
        />
      )}
      {rows.map((row) => {
        const mirrorLevels = row.segments
          .filter((segment) => isMirror(segment.event.id))
          .map((segment) => segment.level + 1);
        const levels = Math.max(
          Math.min(row.levelCount, dayMaxEvents ?? Infinity),
          ...mirrorLevels,
        );

        return (
          <div
            role="row"
            key={key(row.start)}
            className={cn(
              'grid flex-1 border-b border-line last:border-b-0',
              classNames?.week,
            )}
            data-testid={partTestId(testId, 'week', key(row.start))}
            style={{
              gridTemplateColumns: `${weekNumbers ? '3rem ' : ''}repeat(7, minmax(0, 1fr))`,
            }}
          >
            {weekNumbers && (
              <div role="rowheader" className="px-1 py-2">
                <span
                  className={cn(
                    'inline-block rounded-full bg-selected px-1.5 py-0.5 text-small font-medium text-selected-ink',
                    classNames?.weekNumber,
                  )}
                  data-testid={partTestId(testId, 'weekNumber', key(row.start))}
                >
                  {t('calendar.weekNumber', {
                    week: getISOWeek(addDays(row.start, 3)),
                  })}
                </span>
              </div>
            )}
            {row.days.map((day, column) => {
              const dayKey = key(day);
              const isToday = isSameDay(day, today);
              const outside = view === 'month' && !isSameMonth(day, date);
              const hidden = row.segments.filter(
                (segment) =>
                  segment.hidden &&
                  !isMirror(segment.event.id) &&
                  segment.startColumn <= column &&
                  segment.endColumn > column,
              ).length;

              return (
                <div
                  {...selectionCell(day, addDays(day, 1), true)}
                  role="gridcell"
                  key={dayKey}
                  ref={(node) => {
                    if (node) cells.current.set(dayKey, node);
                    else cells.current.delete(dayKey);
                  }}
                  tabIndex={isSameDay(day, active) ? 0 : -1}
                  aria-label={
                    isToday
                      ? t('calendar.today', { date: fullDate.format(day) })
                      : fullDate.format(day)
                  }
                  aria-current={isToday ? 'date' : undefined}
                  data-outside={outside || undefined}
                  data-today={isToday || undefined}
                  data-testid={partTestId(testId, 'day', dayKey)}
                  className={cn(
                    'relative min-w-0 border-r border-line p-1 last:border-r-0 focus-visible:z-20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                    classNames?.day,
                    outside && classNames?.otherMonthDay,
                    isToday && classNames?.today,
                  )}
                  style={{
                    minHeight:
                      view === 'week'
                        ? Math.max(320, 24 + levels * 26)
                        : Math.max(104, 52 + levels * 26),
                  }}
                  onFocus={(event) => {
                    if (event.target === event.currentTarget) {
                      setFocus({ day, month: format(date, 'yyyy-MM') });
                    }
                  }}
                  onKeyDown={(event) => onKeyDown(event, day, column)}
                  onClick={(event) => {
                    if (event.target === event.currentTarget) {
                      event.currentTarget.focus();
                      onDateClick?.({ date: new Date(day), allDay: true });
                    }
                  }}
                >
                  {selection.selected(day, addDays(day, 1), true) && (
                    <SelectionMirror
                      className={classNames?.selectionMirror}
                      data-testid={partTestId(testId, 'selectionMirror', dayKey)}
                    />
                  )}
                  {view === 'month' && (
                    <span
                      className={cn(
                        'pointer-events-none mx-auto flex size-8 items-center justify-center rounded-full text-small',
                        outside && 'text-muted',
                        isToday && 'bg-selected font-semibold text-selected-ink',
                        classNames?.dayNumber,
                      )}
                      data-testid={partTestId(testId, 'dayNumber', dayKey)}
                    >
                      {number.format(day.getDate())}
                    </span>
                  )}
                  {row.segments
                    .filter(
                      (segment) =>
                        (!segment.hidden || isMirror(segment.event.id)) &&
                        segment.startColumn === column,
                    )
                    .map((segment) => (
                      <div
                        key={segment.event.id}
                        className="absolute z-10 px-1"
                        style={{
                          top: (view === 'week' ? 4 : 36) + segment.level * 26,
                          left: 0,
                          width: `${(segment.endColumn - segment.startColumn) * 100}%`,
                        }}
                      >
                        <div
                          data-start={segment.isStart}
                          data-end={segment.isEnd}
                          className={cn(
                            segment.isStart ? 'rounded-l-control' : 'rounded-l-none',
                            segment.isEnd ? 'rounded-r-control' : 'rounded-r-none',
                            classNames?.eventSegment,
                          )}
                          data-testid={partTestId(
                            testId,
                            'segment',
                            dayKey,
                            segment.event.id,
                          )}
                        >
                          {eventButton(
                            segment.event,
                            `${dayKey}-${segment.event.id}`,
                            segment.isStart,
                            segment.isEnd,
                          )}
                        </div>
                      </div>
                    ))}
                  {hidden > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'absolute bottom-1 left-1 right-1 truncate px-1 text-left text-small text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-focus',
                            classNames?.moreButton,
                          )}
                          data-testid={partTestId(testId, 'more', dayKey)}
                        >
                          +{t('calendar.more', { count: hidden })}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        data-calendar-content=""
                        aria-label={fullDate.format(day)}
                        className={cn(
                          'max-h-80 overflow-auto',
                          classNames?.morePopover,
                        )}
                        data-testid={partTestId(testId, 'morePopover', dayKey)}
                      >
                        <div
                          className={cn('mb-2 font-semibold', classNames?.moreTitle)}
                          data-testid={partTestId(testId, 'moreTitle', dayKey)}
                        >
                          {fullDate.format(day)}
                        </div>
                        <ul
                          className={cn('space-y-1', classNames?.moreList)}
                          data-testid={partTestId(testId, 'moreList', dayKey)}
                        >
                          {row.segments
                            .filter(
                              (segment) =>
                                segment.startColumn <= column &&
                                segment.endColumn > column &&
                                !isMirror(segment.event.id),
                            )
                            .map(({ event }) => (
                              <li key={event.id}>
                                {eventButton(event, `more-${dayKey}-${event.id}`)}
                              </li>
                            ))}
                        </ul>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
