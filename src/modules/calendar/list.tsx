'use client';

import { format, isSameDay } from 'date-fns';
import { cn, partTestId } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import { EmptyState } from '../empty-state';
import { normalizeEvent } from './engine/dates';
import { layoutList } from './engine/layout-list';
import type { CalendarRange } from './engine/types';
import { CalendarEventChip } from './event';
import type { CalendarProps } from './types';

type ListProps<TData> = {
  [
    K in
      | 'events'
      | 'className'
      | 'classNames'
      | 'onEventClick'
      | 'renderEvent'
      | 'eventClassName'
      | 'data-testid'
  ]?: CalendarProps<TData>[K] | undefined;
} & CalendarRange;

export function CalendarList<TData>({
  events = [],
  start,
  end,
  className,
  classNames,
  onEventClick,
  renderEvent,
  eventClassName,
  'data-testid': testId,
}: ListProps<TData>) {
  const { locale, t } = useUILocale();
  const days = layoutList(
    events.map((event) => normalizeEvent(event)),
    { start, end },
  ).filter((day) => day.segments.length > 0);
  const header = new Intl.DateTimeFormat(locale.code, { dateStyle: 'full' });

  return (
    <div
      className={cn('min-h-0 flex-1 overflow-auto', classNames?.list, className)}
      data-testid={partTestId(testId, 'list')}
    >
      {days.length === 0 ? (
        <EmptyState
          title={t('calendar.noEvents')}
          icon="calendar"
          size="compact"
          appearance="plain"
          className={classNames?.emptyState}
          data-testid={partTestId(testId, 'emptyState')}
        />
      ) : (
        days.map(({ date, segments }) => {
          const dayKey = format(date, 'yyyy-MM-dd');

          return (
            <section
              key={dayKey}
              aria-label={header.format(date)}
              className={cn(
                'flex min-w-max gap-3 border-b border-line px-3 py-3 last:border-b-0',
                isSameDay(date, new Date()) && 'bg-hover/40',
                classNames?.listDay,
              )}
              data-testid={partTestId(testId, 'listDay', dayKey)}
            >
              <h3
                className={cn(
                  'flex w-44 shrink-0 items-start gap-2',
                  classNames?.listDayHeader,
                )}
                data-testid={partTestId(testId, 'listDayHeader', dayKey)}
              >
                <time dateTime={dayKey} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full text-heading',
                      isSameDay(date, new Date()) && 'bg-selected text-selected-ink',
                      classNames?.dayNumber,
                    )}
                    data-testid={partTestId(testId, 'listDayNumber', dayKey)}
                  >
                    {new Intl.NumberFormat(locale.code).format(date.getDate())}
                  </span>
                  <span
                    className={cn(
                      'whitespace-nowrap text-small uppercase text-muted',
                      classNames?.listDayLabel,
                    )}
                    data-testid={partTestId(testId, 'listDayLabel', dayKey)}
                  >
                    {t('calendar.listDayLabel', {
                      weekday: new Intl.DateTimeFormat(locale.code, {
                        weekday: 'short',
                      }).format(date),
                      month: new Intl.DateTimeFormat(locale.code, {
                        month: 'short',
                      }).format(date),
                      numericMonth: new Intl.DateTimeFormat(locale.code, {
                        month: '2-digit',
                      }).format(date),
                      day: new Intl.DateTimeFormat(locale.code, {
                        day: '2-digit',
                      }).format(date),
                    })}
                  </span>
                </time>
              </h3>
              <ul
                className={cn('min-w-0 flex-1 space-y-0.5', classNames?.listEvents)}
                data-testid={partTestId(testId, 'listEvents', dayKey)}
              >
                {segments.map(({ event, isStart, isEnd }) => (
                  <li key={event.id}>
                    <CalendarEventChip
                      {...{
                        event,
                        isStart,
                        isEnd,
                        classNames,
                        renderEvent,
                        eventClassName,
                        onEventClick,
                      }}
                      view="list"
                      data-testid={partTestId(testId, 'event', dayKey, event.id)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
