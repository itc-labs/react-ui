'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { addDays, format, isSameDay } from 'date-fns';
import { calendarTime } from './format';
import { CalendarDayHeading } from './day-heading';
import { cn, partTestId } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import { normalizeEvent } from './engine/dates';
import { fractionToTime, snapTime } from './engine/interaction';
import { layoutTimeGrid } from './engine/layout-timegrid';
import { atTime, timeSeconds } from './engine/layout-utils';
import type { CalendarRange } from './engine/types';
import { TimeGridEvent } from './timegrid-event';
import type { CalendarBusinessHours, CalendarProps } from './types';
import { selectionCell, useCalendarSelection } from './selection';
import { SelectionMirror, SelectionStatus } from './selection-presentation';

type TimeGridProps<TData> = {
  [
    K in
      | 'events'
      | 'slotDuration'
      | 'slotMinTime'
      | 'slotMaxTime'
      | 'scrollTime'
      | 'businessHours'
      | 'nowIndicator'
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
} & CalendarRange & { title: string; className?: string; view: 'week' | 'day' };

const defaultBusinessHours: readonly CalendarBusinessHours[] = [
  { daysOfWeek: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
];

export function CalendarTimeGrid<TData>({
  events = [],
  start,
  end,
  title,
  slotDuration = 30,
  slotMinTime = '00:00',
  slotMaxTime = '24:00',
  scrollTime = '06:00',
  businessHours = false,
  nowIndicator = true,
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
  view,
  'data-testid': testId,
}: TimeGridProps<TData>) {
  const { locale, t } = useUILocale();
  const selection = useCalendarSelection({
    selectable,
    selectMinDistance,
    selectAllow,
    onSelect,
    view,
    rangeKey: `${+start}-${+end}-${slotDuration}-${slotMinTime}-${slotMaxTime}`,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef(new Map<string, HTMLButtonElement>());
  const [active, setActive] = useState('');
  const [now, setNow] = useState(() => new Date());
  // Reuse engine validation and midnight-based slot snapping.
  snapTime(start, slotDuration);
  const min = timeSeconds(slotMinTime);
  const max = timeSeconds(slotMaxTime);
  const initialScroll = timeSeconds(scrollTime);
  const layout = layoutTimeGrid(
    events.map((event) => normalizeEvent(event)),
    { start, end },
    {
      slotMinTime,
      slotMaxTime,
    },
  );
  // Grow the scrollable canvas rather than squeezing overlap columns below 4rem.
  const overlapColumns = Math.max(
    1,
    ...layout.days.flatMap((day) => day.segments.map((segment) => segment.columnCount)),
  );
  const minGridWidth = Math.max(
    layout.days.length > 1 ? 42 : 20,
    4 + layout.days.length * overlapColumns * 4,
  );
  const duration = slotDuration * 60;
  const slots = [min];
  for (
    let second = (Math.floor(min / duration) + 1) * duration;
    second < max;
    second += duration
  ) {
    slots.push(second);
  }
  const gridHeight = ((max - min) / 3600) * 36;

  const position = (second: number) => ((second - min) / (max - min)) * 100;

  const key = (day: Date) => format(day, 'yyyy-MM-dd');

  const slotKey = (day: Date, second: number) => `${key(day)}-${second}`;

  const fullDate = new Intl.DateTimeFormat(locale.code, { dateStyle: 'full' });
  const timeLabel = new Intl.DateTimeFormat(locale.code, {
    hour: new Intl.Locale(locale.code).language === 'en' ? 'numeric' : '2-digit',
    ...(new Intl.Locale(locale.code).language === 'en'
      ? {}
      : { minute: '2-digit' as const }),
  });
  const dateTimeLabel = new Intl.DateTimeFormat(locale.code, {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const hours =
    businessHours === true
      ? defaultBusinessHours
      : businessHours === false
        ? []
        : 'daysOfWeek' in businessHours
          ? [businessHours]
          : businessHours;
  const windows = hours.map((hours) => {
    const from = timeSeconds(hours.startTime);
    const to = timeSeconds(hours.endTime);
    if (
      from >= to ||
      hours.daysOfWeek.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
    ) {
      throw new RangeError(
        'Business hours require valid weekdays and an increasing local time window.',
      );
    }

    return { days: hours.daysOfWeek, from: Math.max(min, from), to: Math.min(max, to) };
  });
  const gridColumns = {
    gridTemplateColumns: `4rem repeat(${layout.days.length}, minmax(0, 1fr))`,
  };
  const firstSlot = slotKey(layout.days[0]!.date, min);
  const focusedSlot = layout.days.some(({ date }) =>
    slots.some((second) => slotKey(date, second) === active),
  )
    ? active
    : firstSlot;
  const rangeStart = +start;
  const rangeEnd = +end;

  useEffect(() => {
    if (!nowIndicator) return;
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);

    return () => clearInterval(timer);
  }, [nowIndicator]);

  useEffect(() => {
    const container = scrollRef.current;
    const body = bodyRef.current;
    if (!container || !body) return;
    const fraction = Math.max(0, Math.min(1, (initialScroll - min) / (max - min)));
    // Offset the sticky header so the requested time appears immediately below it.
    const offset = body.offsetTop - (headerRef.current?.offsetHeight ?? 0);
    container.scrollTop = Math.max(0, offset + fraction * gridHeight);
  }, [initialScroll, min, max, gridHeight, rangeStart, rangeEnd]);

  const onSlotKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    column: number,
    row: number,
  ) => {
    let nextColumn = column;
    let nextRow = row;
    switch (event.key) {
      case 'ArrowLeft':
        nextColumn--;
        break;
      case 'ArrowRight':
        nextColumn++;
        break;
      case 'ArrowUp':
        nextRow--;
        break;
      case 'ArrowDown':
        nextRow++;
        break;
      case 'Home':
        nextRow = 0;
        break;
      case 'End':
        nextRow = slots.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    nextColumn = Math.max(0, Math.min(layout.days.length - 1, nextColumn));
    nextRow = Math.max(0, Math.min(slots.length - 1, nextRow));
    const next = slotKey(layout.days[nextColumn]!.date, slots[nextRow]!);
    setActive(next);
    slotsRef.current.get(next)?.focus();
  };

  return (
    <div
      ref={scrollRef}
      data-calendar-scroll=""
      className={cn(
        'relative min-h-0 max-h-[40rem] flex-1 overflow-auto',
        classNames?.scrollContainer,
        className,
      )}
      data-testid={partTestId(testId, 'scrollContainer')}
    >
      <div
        ref={selection.ref}
        {...selection.handlers}
        role="group"
        aria-describedby={selectable ? selection.descriptionId : undefined}
        aria-label={title}
        className={cn(
          'relative min-w-80',
          selectable && 'select-none',
          layout.days.length > 1 && 'min-w-[42rem]',
          classNames?.timeGrid,
        )}
        data-testid={partTestId(testId, 'timeGrid')}
        style={{
          minWidth: `${minGridWidth}rem`,
        }}
      >
        {selectable && (
          <SelectionStatus
            selection={selection.mirror}
            id={selection.descriptionId}
            className={classNames?.selectionStatus}
            data-testid={partTestId(testId, 'selectionStatus')}
          />
        )}
        <div
          ref={headerRef}
          className={cn(
            'sticky top-0 z-30 grid border-b border-line bg-surface',
            classNames?.weekdayHeader,
          )}
          style={gridColumns}
          data-testid={partTestId(testId, 'weekdayHeader')}
        >
          <div aria-hidden="true" />
          {layout.days.map(({ date }) => (
            <div
              key={key(date)}
              aria-label={fullDate.format(date)}
              aria-current={isSameDay(date, now) ? 'date' : undefined}
              data-today={isSameDay(date, now) || undefined}
              className={cn(
                'border-l border-line p-2 text-center',
                isSameDay(date, now) && 'text-accent',
                classNames?.dayHeader,
                isSameDay(date, now) && classNames?.today,
              )}
              data-testid={partTestId(testId, 'dayHeader', key(date))}
            >
              <CalendarDayHeading
                date={date}
                today={isSameDay(date, now)}
                classNames={classNames}
                data-testid={partTestId(testId, 'dayHeader', key(date))}
              />
            </div>
          ))}
        </div>
        {layout.allDay.map((row) => (
          <div
            key={key(row.start)}
            className={cn('grid border-b border-line', classNames?.allDayRow)}
            style={gridColumns}
            data-testid={partTestId(testId, 'allDayRow')}
          >
            <div
              className={cn(
                'p-2 text-right text-small text-muted',
                classNames?.allDayLabel,
              )}
              data-testid={partTestId(testId, 'allDayLabel')}
            >
              {t('calendar.allDay')}
            </div>
            <div
              className="relative col-start-2 -col-end-1 grid"
              style={{
                gridTemplateColumns: `repeat(${row.days.length}, minmax(0, 1fr))`,
                minHeight: Math.max(40, row.levelCount * 32 + 8),
              }}
            >
              {row.days.map((day) => (
                <button
                  key={key(day)}
                  {...selectionCell(day, addDays(day, 1), true)}
                  type="button"
                  aria-label={`${fullDate.format(day)}, ${t('calendar.allDay')}`}
                  className={cn(
                    'relative border-l border-line focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                    classNames?.allDayCell,
                  )}
                  data-testid={partTestId(testId, 'allDayCell', key(day))}
                  onClick={() => onDateClick?.({ date: new Date(day), allDay: true })}
                >
                  {selection.selected(day, addDays(day, 1), true) && (
                    <SelectionMirror
                      className={classNames?.selectionMirror}
                      data-testid={partTestId(
                        testId,
                        'selectionMirror',
                        'allDay',
                        key(day),
                      )}
                    />
                  )}
                </button>
              ))}
              {row.segments.map((segment) => (
                <TimeGridEvent
                  key={segment.event.id}
                  segment={segment}
                  view={view}
                  renderEvent={renderEvent}
                  eventClassName={eventClassName}
                  classNames={classNames}
                  onEventClick={onEventClick}
                  data-testid={partTestId(testId, 'event', 'allDay', segment.event.id)}
                  style={{
                    top: 4 + segment.level * 32,
                    height: 28,
                    left: `${(segment.startColumn * 100) / row.days.length}%`,
                    width: `${((segment.endColumn - segment.startColumn) * 100) / row.days.length}%`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        <div
          ref={bodyRef}
          className="relative grid"
          style={{ ...gridColumns, height: gridHeight }}
        >
          <div
            aria-hidden="true"
            className={cn(
              'relative text-right text-small text-muted',
              classNames?.timeGutter,
            )}
            data-testid={partTestId(testId, 'timeGutter')}
          >
            {slots
              .filter((second) => second % 3600 === 0)
              .map((second) => (
                <div
                  key={second}
                  className={cn('absolute right-2', classNames?.slotLabel)}
                  style={{ top: `${position(second)}%` }}
                  data-testid={partTestId(testId, 'slotLabel', second)}
                >
                  {timeLabel
                    .format(atTime(start, second))
                    .replace(/\s/g, '')
                    .toLocaleLowerCase(locale.code)}
                </div>
              ))}
          </div>
          {layout.days.map(({ date, segments }, column) => {
            const secondsNow =
              now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const showNow =
              nowIndicator &&
              isSameDay(date, now) &&
              secondsNow >= min &&
              secondsNow < max;

            return (
              <div
                key={key(date)}
                role="group"
                aria-label={fullDate.format(date)}
                className={cn(
                  'relative border-l border-line',
                  businessHours !== false && 'bg-canvas',
                  classNames?.dayColumn,
                )}
                data-testid={partTestId(testId, 'dayColumn', key(date))}
              >
                {windows
                  .filter(
                    (window) =>
                      window.days.includes(
                        date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                      ) && window.to > window.from,
                  )
                  .map((window, index) => (
                    <div
                      key={index}
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute inset-x-0 bg-surface',
                        classNames?.businessHours,
                      )}
                      style={{
                        top: `${position(window.from)}%`,
                        height: `${((window.to - window.from) * 100) / (max - min)}%`,
                      }}
                      data-testid={partTestId(
                        testId,
                        'businessHours',
                        key(date),
                        index,
                      )}
                    />
                  ))}
                {slots.map((second, row) => {
                  const id = slotKey(date, second);
                  const slotDate = fractionToTime(date, (second - min) / (max - min), {
                    slotDuration,
                    slotMinTime,
                    slotMaxTime,
                  });

                  return (
                    <button
                      key={second}
                      {...selectionCell(
                        atTime(date, second),
                        atTime(date, slots[row + 1] ?? max),
                        false,
                      )}
                      ref={(node) => {
                        if (node) slotsRef.current.set(id, node);
                        else slotsRef.current.delete(id);
                      }}
                      type="button"
                      tabIndex={id === focusedSlot ? 0 : -1}
                      aria-label={dateTimeLabel.format(slotDate)}
                      className={cn(
                        'absolute inset-x-0 border-t border-line focus-visible:z-20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                        second % 3600 !== 0 && 'border-dashed border-line/50',
                        classNames?.timeSlot,
                      )}
                      style={{
                        top: `${position(second)}%`,
                        height: `${(((slots[row + 1] ?? max) - second) * 100) / (max - min)}%`,
                      }}
                      data-testid={partTestId(testId, 'timeSlot', key(date), second)}
                      onFocus={() => setActive(id)}
                      onKeyDown={(event) => onSlotKeyDown(event, column, row)}
                      onClick={(event) => {
                        event.currentTarget.focus();
                        const bounds =
                          event.currentTarget.parentElement!.getBoundingClientRect();
                        const clickedDate =
                          event.detail > 0 && bounds.height > 0
                            ? fractionToTime(
                                date,
                                (event.clientY - bounds.top) / bounds.height,
                                { slotDuration, slotMinTime, slotMaxTime },
                              )
                            : slotDate;
                        onDateClick?.({ date: clickedDate, allDay: false });
                      }}
                    >
                      {selection.selected(
                        atTime(date, second),
                        atTime(date, slots[row + 1] ?? max),
                        false,
                      ) && (
                        <SelectionMirror
                          className={classNames?.selectionMirror}
                          data-testid={partTestId(
                            testId,
                            'selectionMirror',
                            key(date),
                            second,
                          )}
                        />
                      )}
                    </button>
                  );
                })}
                {segments.map((segment) => (
                  <TimeGridEvent
                    key={segment.event.id}
                    segment={segment}
                    view={view}
                    renderEvent={renderEvent}
                    eventClassName={eventClassName}
                    classNames={classNames}
                    onEventClick={onEventClick}
                    data-testid={partTestId(
                      testId,
                      'event',
                      key(date),
                      segment.event.id,
                    )}
                    style={{
                      top: `${segment.top * 100}%`,
                      height: `${segment.height * 100}%`,
                      left:
                        segment.column === 0
                          ? '0%'
                          : `calc(${(segment.column * 100) / segment.columnCount}% - 0.5rem)`,
                      width:
                        segment.column === 0
                          ? `${100 / segment.columnCount}%`
                          : `calc(${100 / segment.columnCount}% + 0.5rem)`,
                    }}
                  />
                ))}
                {showNow && (
                  <div
                    role="img"
                    aria-label={t('calendar.now', {
                      time: calendarTime(now, locale.code),
                    })}
                    className={cn(
                      'pointer-events-none absolute inset-x-0 z-20 border-t-2 border-danger-700',
                      classNames?.nowIndicator,
                    )}
                    style={{ top: `${position(secondsNow)}%` }}
                    data-testid={partTestId(testId, 'nowIndicator', key(date))}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -left-1 -top-1 size-2 rounded-full bg-danger-700',
                        classNames?.nowDot,
                      )}
                      data-testid={partTestId(testId, 'nowDot', key(date))}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
