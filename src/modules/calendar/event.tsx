'use client';

import { isSameDay } from 'date-fns';
import { calendarTime, calendarTimeRange } from './format';
import { useContext } from 'react';
import { CalendarEditing } from './editing-context';
import type { NormalizedEvent } from './engine/types';
import { cn, partTestId } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import type { CalendarEventRenderContext, CalendarProps } from './types';

const tones = {
  brand: 'border-accent bg-hover text-accent',
  info: 'border-info-700 bg-info-50 text-info-700',
  success: 'border-success-700 bg-success-50 text-success-700',
  warning: 'border-warning-700 bg-warning-50 text-warning-700',
  danger: 'border-danger-700 bg-danger-50 text-danger-700',
  neutral: 'border-control-border bg-brand-50 text-ink',
};

const dots = {
  brand: 'bg-accent',
  info: 'bg-info-700',
  success: 'bg-success-700',
  warning: 'bg-warning-700',
  danger: 'bg-danger-700',
  neutral: 'bg-muted',
};
const bars = {
  brand: 'bg-selected text-selected-ink',
  info: 'bg-info-50 text-info-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-800',
  neutral: 'bg-sidebar text-ink',
};

/** Shared presentation for grid segments, overflow entries and list rows. */
export function CalendarEventChip<TData>({
  event: inputEvent,
  view,
  isStart = true,
  isEnd = true,
  presentation,
  className,
  classNames,
  renderEvent,
  eventClassName,
  onEventClick,
  'data-testid': testId,
}: Pick<CalendarEventRenderContext<TData>, 'event' | 'view'> & {
  presentation?: 'dayGrid' | 'timeGrid';
  isStart?: boolean;
  isEnd?: boolean;
  className?: string;
  classNames: CalendarProps<TData>['classNames'];
  renderEvent: CalendarProps<TData>['renderEvent'];
  eventClassName: CalendarProps<TData>['eventClassName'];
  onEventClick: CalendarProps<TData>['onEventClick'];
  'data-testid': string | undefined;
}) {
  const editing = useContext(CalendarEditing)?.describe(inputEvent.id);
  const event = (editing?.event ?? inputEvent) as NormalizedEvent<TData>;
  const canMove = editing?.move ?? false;
  const canResize = (editing?.resize ?? false) && isEnd;
  const editable = canMove || canResize;
  const mirror = editing?.mirror ?? false;
  const { locale, t } = useUILocale();
  const full = new Intl.DateTimeFormat(locale.code, {
    dateStyle: 'full',
    ...(event.allDay ? {} : { timeStyle: 'short' as const }),
  });
  const timeText = event.allDay
    ? t('calendar.allDay')
    : calendarTimeRange(event.start, event.end, locale.code);
  const dayGrid = presentation === 'dayGrid' || view === 'month';
  const multiDay = !isSameDay(event.start, new Date(+event.end - 1));
  const bar = view !== 'list' && (event.allDay || (dayGrid && multiDay));
  const inline = view === 'list' || (dayGrid && !bar);
  const short =
    !inline && !bar && !event.allDay && +event.end - +event.start < 45 * 60_000;
  const tone = event.tone ?? 'brand';
  const visibleTime =
    dayGrid && !bar ? calendarTime(event.start, locale.code, true) : timeText;
  const context = { event, view, timeText, isStart, isEnd };
  const Tag = onEventClick && !editable && !mirror ? 'button' : 'div';

  return (
    <Tag
      {...(Tag === 'button' ? { type: 'button' as const } : {})}
      role={Tag === 'button' ? undefined : 'group'}
      tabIndex={editable ? 0 : undefined}
      onClick={onEventClick && !mirror ? () => onEventClick({ event }) : undefined}
      onKeyDown={
        editable && onEventClick
          ? (next) => {
              if (
                next.target === next.currentTarget &&
                (next.key === 'Enter' || next.key === ' ')
              ) {
                next.preventDefault();
                onEventClick({ event });
              }
            }
          : undefined
      }
      data-calendar-event-id={mirror ? undefined : event.id}
      data-presentation={
        inline ? 'list' : bar || event.allDay ? 'bar' : short ? 'short' : 'timeGrid'
      }
      data-mirror={mirror || undefined}
      data-dragging={editing?.dragging || undefined}
      aria-hidden={mirror || undefined}
      aria-description={editable ? t('calendar.editHint') : undefined}
      data-testid={testId}
      aria-label={t('calendar.eventLabel', {
        title: event.title,
        start: full.format(event.start),
        end: full.format(event.end),
      })}
      className={cn(
        'ui-event-calendar-chip relative block w-full overflow-hidden text-left text-small focus-visible:outline-2 focus-visible:outline-focus',
        inline
          ? 'flex items-center gap-1.5 bg-transparent px-1 py-1 text-ink'
          : 'border-l-[3px] px-1.5 py-0.5',
        !inline && (bar ? bars[tone] : tones[tone]),
        bar && 'border-l-0',
        short && 'flex items-start gap-1',
        editable && 'select-none',
        canMove && 'cursor-grab touch-pan-y',
        mirror && 'pointer-events-none ring-2 ring-accent',
        editing?.dragging && 'opacity-40',
        className,
        classNames?.event,
        mirror && classNames?.eventMirror,
        editing?.dragging && classNames?.draggingEvent,
        event.className,
        typeof eventClassName === 'function' ? eventClassName(context) : eventClassName,
      )}
      // Arbitrary CSS colors are accents only: token surface/ink retain readable contrast.
      style={event.color && !inline ? { borderLeftColor: event.color } : undefined}
    >
      {renderEvent ? (
        renderEvent(context)
      ) : (
        <>
          {inline && (
            <span
              aria-hidden="true"
              className={cn(
                'size-1.5 shrink-0 rounded-full',
                dots[tone],
                classNames?.eventDot,
              )}
              style={event.color ? { backgroundColor: event.color } : undefined}
              data-testid={partTestId(testId, 'dot')}
            />
          )}
          {!bar && (
            <span
              className={cn(
                'min-w-0 tabular-nums',
                inline
                  ? 'shrink-0 whitespace-nowrap'
                  : short
                    ? 'max-w-[55%] shrink-0 truncate'
                    : 'block truncate',
                view === 'list' && 'w-44 truncate',
                classNames?.eventTime,
              )}
              data-testid={partTestId(testId, 'time')}
            >
              {visibleTime}
            </span>
          )}
          <span
            className={cn(
              'min-w-0 font-semibold',
              short && 'flex-1',
              inline || short || bar || event.allDay
                ? 'truncate'
                : 'block truncate @min-[10rem]:line-clamp-2 @min-[10rem]:whitespace-normal @min-[10rem]:break-normal @min-[10rem]:[overflow-wrap:normal]',
              classNames?.eventTitle,
            )}
            data-testid={partTestId(testId, 'title')}
          >
            {event.title}
          </span>
        </>
      )}
      {canResize && (
        <span
          role="button"
          tabIndex={0}
          aria-label={t('calendar.resizeEvent', { title: event.title })}
          aria-description={t('calendar.editHint')}
          data-calendar-resize=""
          data-testid={partTestId(testId, 'resizeHandle')}
          onClick={(next) => next.stopPropagation()}
          onKeyDown={(next) => {
            if (next.key === 'Enter' || next.key === ' ') {
              next.preventDefault();
              next.stopPropagation();
            }
          }}
          className={cn(
            'absolute z-20 touch-pan-y rounded-control bg-current opacity-40 focus-visible:outline-2 focus-visible:outline-focus',
            dayGrid || event.allDay
              ? 'inset-y-1 right-0 w-2 cursor-ew-resize'
              : 'inset-x-1 bottom-0 h-2 cursor-ns-resize',
            classNames?.resizeHandle,
          )}
        />
      )}
    </Tag>
  );
}
