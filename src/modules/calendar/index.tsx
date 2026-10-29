'use client';

import { useId, useRef, useImperativeHandle } from 'react';
import { Button } from '../../components/button';
import { IconButton } from '../../components/icon-button';
import { Select } from '../../components/select';
import { Spinner } from '../../components/spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/tabs';
import { cn, partTestId } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import { viewTitle } from './engine/dates';
import type { CalendarView } from './engine/types';
import { CalendarList } from './list';
import { useNarrowCalendar } from './responsive';
import { CalendarMonth } from './month';
import { CalendarEditing } from './editing-context';
import { useCalendarEditing } from './editing';
import { useCalendarState } from './state';
import { CalendarTimeGrid } from './timegrid';
import type { CalendarProps } from './types';

export * from './engine';
export type {
  CalendarProps,
  CalendarClassNames,
  CalendarToolbarContext,
  CalendarRangeChange,
  CalendarDateClick,
  CalendarSelect,
  CalendarEventChange,
  CalendarEventChangeInfo,
  CalendarEventClick,
  CalendarBusinessHours,
  CalendarEventRenderContext,
} from './types';

export function Calendar<TData = unknown>(props: CalendarProps<TData>) {
  const {
    events,
    view,
    defaultView,
    onViewChange,
    date,
    defaultDate,
    onDateChange,
    views,
    weekStartsOn,
    slotDuration,
    slotMinTime,
    slotMaxTime,
    scrollTime,
    businessHours,
    nowIndicator,
    fixedWeekCount,
    weekLayout = 'timeGrid',
    weekNumbers,
    toolbarStart,
    dayMaxEvents,
    height,
    responsiveView,
    renderEvent,
    eventClassName,
    onRangeChange,
    selectable,
    selectMinDistance,
    selectAllow,
    onSelect,
    onDateClick,
    onEventClick,
    editable,
    eventAllow,
    onEventChange,
    loading = false,
    disabled = false,
    renderToolbar,
    className,
    classNames,
    'data-testid': testId,
    ref,
    style,
    'aria-label': label,
    ...domProps
  } = props;
  const { locale, t } = useUILocale();
  const titleId = useId();
  const language = new Intl.Locale(locale.code).language;
  const startOfWeek =
    weekStartsOn ??
    (language === 'vi'
      ? 1
      : language === 'en'
        ? 0
        : (locale.calendarLocale.options?.weekStartsOn ?? 0));
  const rootRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => rootRef.current!, []);

  const narrow = useNarrowCalendar(rootRef, responsiveView !== undefined);
  const state = useCalendarState(props, startOfWeek, narrow);
  const editing = useCalendarEditing(
    props,
    rootRef,
    state.view,
    `${+state.start}-${+state.end}-${slotDuration}-${slotMinTime}-${slotMaxTime}-${weekLayout}`,
  );
  const editedEvents = editing.events;
  const title = viewTitle(state.view, state, locale.code);
  const content =
    state.view === 'month' || (state.view === 'week' && weekLayout === 'dayGrid') ? (
      <CalendarMonth
        {...{
          events: editedEvents,
          dayMaxEvents,
          weekNumbers,
          classNames,
          selectable: selectable && !loading && !disabled,
          selectMinDistance,
          selectAllow,
          onSelect,
          onDateClick,
          onEventClick,
          renderEvent,
          eventClassName,
        }}
        view={state.view}
        date={state.date}
        start={state.start}
        end={state.end}
        title={title}
        onDateChange={state.onSetDate}
        data-testid={testId}
      />
    ) : state.view === 'week' || state.view === 'day' ? (
      <CalendarTimeGrid
        {...{
          events: editedEvents,
          slotDuration,
          slotMinTime,
          slotMaxTime,
          scrollTime,
          businessHours,
          nowIndicator,
          classNames,
          selectable: selectable && !loading && !disabled,
          selectMinDistance,
          selectAllow,
          onSelect,
          onDateClick,
          onEventClick,
          renderEvent,
          eventClassName,
        }}
        start={state.start}
        end={state.end}
        view={state.view}
        title={title}
        data-testid={testId}
      />
    ) : (
      <CalendarList
        {...{
          events: editedEvents,
          classNames,
          onEventClick,
          renderEvent,
          eventClassName,
        }}
        start={state.start}
        end={state.end}
        data-testid={testId}
      />
    );

  return (
    <CalendarEditing value={editing.context}>
      <div
        {...domProps}
        onBlurCapture={(event) => {
          domProps.onBlurCapture?.(event);
          editing.handlers.onBlurCapture(event);
        }}
        tabIndex={domProps.tabIndex ?? -1}
        onPointerDownCapture={(event) => {
          if (
            disabled ||
            (loading && (event.target as Element).closest('[data-calendar-content]'))
          ) {
            event.preventDefault();
            event.stopPropagation();

            return;
          }
          domProps.onPointerDownCapture?.(event);
          if (!event.defaultPrevented) editing.handlers.onPointerDownCapture(event);
        }}
        onKeyDownCapture={(event) => {
          if (
            disabled ||
            (loading && (event.target as Element).closest('[data-calendar-content]'))
          ) {
            if (event.key === 'Tab') return;
            event.preventDefault();
            event.stopPropagation();

            return;
          }
          domProps.onKeyDownCapture?.(event);
          if (!event.defaultPrevented) editing.handlers.onKeyDownCapture(event);
        }}
        onClickCapture={(event) => {
          if (
            disabled ||
            (loading && (event.target as Element).closest('[data-calendar-content]'))
          ) {
            event.preventDefault();
            event.stopPropagation();

            return;
          }
          domProps.onClickCapture?.(event);
          if (!event.defaultPrevented) editing.handlers.onClickCapture(event);
        }}
        ref={rootRef}
        role={props.role ?? 'region'}
        aria-label={label ?? t('calendar.label')}
        aria-busy={loading}
        aria-disabled={disabled || undefined}
        data-testid={testId}
        data-view={state.view}
        className={cn(
          'flex min-w-0 flex-col bg-surface text-ink',
          classNames?.root,
          className,
        )}
        style={{ ...style, ...(height === undefined ? {} : { height }) }}
      >
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn('sr-only', classNames?.editingStatus)}
          data-testid={partTestId(testId, 'editingStatus')}
        >
          {editing.announcement}
        </div>
        <Tabs
          value={state.view}
          onValueChange={(next) => state.onViewChange(next as CalendarView)}
          variant="segmented"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            className={cn(
              'flex flex-wrap items-center gap-2 px-3 py-3',
              classNames?.toolbar,
            )}
            inert={disabled}
            data-testid={partTestId(testId, 'toolbar')}
          >
            {renderToolbar ? (
              renderToolbar({ ...state, title })
            ) : (
              <>
                {toolbarStart != null && (
                  <div
                    className={classNames?.toolbarStart}
                    data-testid={partTestId(testId, 'toolbarStart')}
                  >
                    {toolbarStart}
                  </div>
                )}
                <div
                  className={cn('flex items-center gap-1', classNames?.navigation)}
                  data-testid={partTestId(testId, 'navigation')}
                >
                  <Button
                    variant="secondary"
                    disabled={state.start <= new Date() && state.end > new Date()}
                    className={cn('rounded-full px-4', classNames?.navigationButton)}
                    data-testid={partTestId(testId, 'today')}
                    onClick={() => state.onNavigate('today')}
                  >
                    {t('calendar.todayButton')}
                  </Button>
                  <IconButton
                    icon="chevronLeft"
                    label={t('calendar.prev')}
                    variant="ghost"
                    className={classNames?.navigationButton}
                    data-testid={partTestId(testId, 'prev')}
                    onClick={() => state.onNavigate('prev')}
                  />
                  <IconButton
                    icon="chevronRight"
                    label={t('calendar.nextPeriod')}
                    variant="ghost"
                    className={classNames?.navigationButton}
                    data-testid={partTestId(testId, 'next')}
                    onClick={() => state.onNavigate('next')}
                  />
                </div>
                <div
                  id={titleId}
                  aria-live="polite"
                  aria-atomic="true"
                  className={cn(
                    'min-w-0 flex-1 text-title font-bold',
                    classNames?.title,
                  )}
                  data-testid={partTestId(testId, 'title')}
                >
                  {title}
                </div>
                <div
                  className={cn('ml-auto hidden sm:block', classNames?.viewSwitcher)}
                  data-testid={partTestId(testId, 'viewSwitcher')}
                >
                  <TabsList
                    aria-label={t('calendar.views')}
                    className={cn(
                      'gap-0 rounded-full border border-line bg-surface p-0.5',
                      classNames?.viewList,
                    )}
                    data-testid={partTestId(testId, 'viewList')}
                  >
                    {state.views.map((item) => (
                      <TabsTrigger
                        key={item}
                        value={item}
                        className={cn(
                          'min-h-8 rounded-full px-4 data-[state=active]:bg-selected data-[state=active]:text-selected-ink data-[state=active]:shadow-none',
                          classNames?.viewTab,
                        )}
                        data-testid={partTestId(testId, 'view', item)}
                      >
                        {t(`calendar.views.${item}`)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className={cn('w-40 sm:hidden', classNames?.viewSelect)}>
                  <Select
                    aria-label={t('calendar.views')}
                    value={state.view}
                    options={state.views.map((item) => ({
                      value: item,
                      label: t(`calendar.views.${item}`),
                    }))}
                    onValueChange={(next) => {
                      if (next) state.onViewChange(next as CalendarView);
                    }}
                    data-testid={partTestId(testId, 'viewSelect')}
                  />
                </div>
              </>
            )}
          </div>
          <div
            className={cn('relative flex min-h-0 flex-1 flex-col', classNames?.content)}
            data-calendar-content=""
            inert={loading || disabled}
            data-testid={partTestId(testId, 'content')}
          >
            {renderToolbar
              ? content
              : state.views.map((item) => (
                  <TabsContent
                    key={item}
                    value={item}
                    className="mt-0 flex min-h-0 flex-1 flex-col"
                    aria-label={t(`calendar.views.${item}`)}
                    data-testid={partTestId(testId, 'panel', item)}
                  >
                    {state.view === item && content}
                  </TabsContent>
                ))}
            {loading && (
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center bg-surface/80',
                  classNames?.loading,
                )}
                data-testid={partTestId(testId, 'loading')}
              >
                <Spinner />
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </CalendarEditing>
  );
}
