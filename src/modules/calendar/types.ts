import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import type { SlotClasses } from '../../components/common';
import type {
  CalendarEvent,
  CalendarRange,
  CalendarRangeOptions,
  CalendarView,
  NormalizedEvent,
} from './engine/types';

export type CalendarClassNames = SlotClasses<
  | 'root'
  | 'toolbar'
  | 'toolbarStart'
  | 'viewList'
  | 'weekNumber'
  | 'dayWeekday'
  | 'eventDot'
  | 'listDayLabel'
  | 'nowDot'
  | 'navigation'
  | 'navigationButton'
  | 'title'
  | 'viewSwitcher'
  | 'viewTab'
  | 'viewSelect'
  | 'content'
  | 'placeholder'
  | 'loading'
  | 'monthGrid'
  | 'weekdayHeader'
  | 'weekday'
  | 'week'
  | 'day'
  | 'dayNumber'
  | 'today'
  | 'otherMonthDay'
  | 'event'
  | 'eventSegment'
  | 'eventTime'
  | 'eventTitle'
  | 'list'
  | 'listDay'
  | 'listDayHeader'
  | 'listEvents'
  | 'emptyState'
  | 'moreButton'
  | 'morePopover'
  | 'moreTitle'
  | 'moreList'
  | 'timeGrid'
  | 'scrollContainer'
  | 'dayHeader'
  | 'allDayRow'
  | 'allDayLabel'
  | 'allDayCell'
  | 'timeGutter'
  | 'slotLabel'
  | 'dayColumn'
  | 'timeSlot'
  | 'businessHours'
  | 'nowIndicator'
  | 'selectionMirror'
  | 'selectionStatus'
  | 'eventMirror'
  | 'draggingEvent'
  | 'resizeHandle'
  | 'editingStatus'
>;

/** Content inside the shared event chip; keep returned content noninteractive. */
export interface CalendarEventRenderContext<TData = unknown> {
  event: NormalizedEvent<TData>;
  view: CalendarView;
  timeText: string;
  isStart: boolean;
  isEnd: boolean;
}

export interface CalendarDateClick {
  date: Date;
  allDay: boolean;
}

export interface CalendarEventClick<TData = unknown> {
  event: NormalizedEvent<TData>;
}

export interface CalendarRangeChange extends CalendarRange {
  view: CalendarView;
}

/** Selected included cells with an exclusive end boundary. */
export interface CalendarSelect extends CalendarRangeChange {
  allDay: boolean;
}

/** Proposed exclusive range passed to eventAllow. */
export interface CalendarEventChangeInfo extends CalendarSelect {
  action: 'move' | 'resize';
}

export interface CalendarEventChange<TData = unknown> {
  event: NormalizedEvent<TData>;
  oldEvent: NormalizedEvent<TData>;
  /** Idempotent; a stale revert cannot undo a newer edit or host update. */
  revert: () => void;
}

export interface CalendarBusinessHours {
  /** Sunday = 0, Saturday = 6. */
  daysOfWeek: readonly NonNullable<CalendarRangeOptions['weekStartsOn']>[];
  /** Local HH:mm or HH:mm:ss. */
  startTime: string;
  endTime: string;
}

export interface CalendarToolbarContext extends CalendarRangeChange {
  date: Date;
  title: string;
  views: readonly CalendarView[];
  onNavigate: (action: 'prev' | 'today' | 'next') => void;
  onViewChange: (view: CalendarView) => void;
}

export interface CalendarProps<TData = unknown> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'onSelect'
> {
  /** Disable calendar interactions, including event editing and navigation. */
  disabled?: boolean;
  events?: readonly CalendarEvent<TData>[];
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  /** Nonempty list; defaults to month, week, day and list. */
  views?: readonly CalendarView[];
  /** Defaults to Monday for vi and Sunday for en (other locales use UILocale). */
  weekStartsOn?: CalendarRangeOptions['weekStartsOn'];
  /** Positive whole minutes dividing 1440; defaults to 30. */
  slotDuration?: number;
  /** Local HH:mm or HH:mm:ss; defaults to 00:00–24:00. */
  slotMinTime?: string;
  slotMaxTime?: string;
  /** Initial local scroll position; defaults to 06:00 and clamps to the window. */
  scrollTime?: string;
  /** Shade nonbusiness time. true means Monday–Friday, 09:00–17:00. */
  businessHours?: boolean | CalendarBusinessHours | readonly CalendarBusinessHours[];
  /** Show current local time, updated each minute. Defaults to true. */
  nowIndicator?: boolean;
  /** Below 640px container width, display this view; restore the selected view when wider. */
  responsiveView?: 'list' | 'day';
  renderEvent?: (context: CalendarEventRenderContext<TData>) => ReactNode;
  eventClassName?:
    string | ((context: CalendarEventRenderContext<TData>) => string | undefined);
  /** Week presentation; defaults to timeGrid. */
  weekLayout?: 'timeGrid' | 'dayGrid';
  /** Display localized ISO week numbers in Month and day-grid Week. */
  weekNumbers?: boolean;
  /** Optional host-owned action before Today in the default toolbar. */
  toolbarStart?: ReactNode;
  fixedWeekCount?: boolean;
  dayMaxEvents?: number;
  height?: CSSProperties['height'];
  /** Enable drag selection; touch requires a 300ms hold. Defaults to false. */
  selectable?: boolean;
  /** Minimum mouse/pen movement in CSS pixels; defaults to 5. */
  selectMinDistance?: number;
  /** Veto proposed selections, including keyboard selection. */
  selectAllow?: (range: CalendarSelect) => boolean;
  onSelect?: (range: CalendarSelect) => void;
  onDateClick?: (info: CalendarDateClick) => void;
  /** Enable moving and resizing; individual event flags override this default. */
  editable?: boolean;
  /** Veto a proposed move/resize. The second argument is the event before editing. */
  eventAllow?: (
    info: CalendarEventChangeInfo,
    event: NormalizedEvent<TData>,
  ) => boolean;
  onEventChange?: (change: CalendarEventChange<TData>) => void;
  onEventClick?: (info: CalendarEventClick<TData>) => void;
  onRangeChange?: (range: CalendarRangeChange) => void;
  loading?: boolean;
  /** Return null to omit the toolbar. Callbacks use the same controlled state contract. */
  renderToolbar?: (context: CalendarToolbarContext) => ReactNode;
  classNames?: CalendarClassNames;
  'data-testid'?: string | undefined;
}
