export interface CalendarEvent<TData = unknown> {
  id: string;
  title: string;
  start: Date | string;
  /** Exclusive end. Omitted ends default to one hour or one all-day date. */
  end?: Date | string;
  allDay?: boolean;
  tone?: 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  color?: string;
  editable?: boolean;
  startEditable?: boolean;
  durationEditable?: boolean;
  resourceId?: string;
  data?: TData;
  className?: string;
}

export type CalendarView = 'month' | 'week' | 'day' | 'list';

export interface CalendarRange {
  start: Date;
  /** Exclusive end. */
  end: Date;
}

export interface NormalizedEvent<TData = unknown> extends Omit<
  CalendarEvent<TData>,
  'start' | 'end' | 'allDay'
> {
  start: Date;
  end: Date;
  allDay: boolean;
}

export interface CalendarRangeOptions {
  /** Sunday = 0, Monday = 1, … Saturday = 6. Defaults to Monday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Month grids use six weeks by default. */
  fixedWeekCount?: boolean;
  /** Positive integer; defaults to seven days. */
  listDays?: number;
}

export interface CalendarMonthOptions {
  /** Maximum visible packed levels per date; omitted means unlimited. */
  dayMaxEvents?: number;
}

export interface CalendarEventSegment<TData = unknown> extends CalendarRange {
  event: NormalizedEvent<TData>;
  /** True only when the segment includes the original event boundary. */
  isStart: boolean;
  isEnd: boolean;
}

export interface CalendarMonthSegment<
  TData = unknown,
> extends CalendarEventSegment<TData> {
  /** Zero-based date columns, with an exclusive end column. */
  startColumn: number;
  endColumn: number;
  level: number;
  hidden: boolean;
}

export interface CalendarMonthRow<TData = unknown> extends CalendarRange {
  days: Date[];
  /** Includes hidden segments so consumers can render overflow details. */
  segments: CalendarMonthSegment<TData>[];
  levelCount: number;
  /** One count per date column. */
  hiddenCounts: number[];
}

export interface CalendarTimeGridOptions extends CalendarMonthOptions {
  /** Local HH:mm or HH:mm:ss, defaults to 00:00. */
  slotMinTime?: string;
  /** Local HH:mm or HH:mm:ss, defaults to 24:00; maximum 24:00. */
  slotMaxTime?: string;
}

export interface CalendarTimeSegment<
  TData = unknown,
> extends CalendarEventSegment<TData> {
  /** Fractions of the visible wall-clock time window, from zero to one. */
  top: number;
  height: number;
  column: number;
  /** Maximum simultaneous columns in this connected overlap cluster. */
  columnCount: number;
}

export interface CalendarTimeGridDay<TData = unknown> {
  date: Date;
  segments: CalendarTimeSegment<TData>[];
}

export interface CalendarTimeGridLayout<TData = unknown> {
  days: CalendarTimeGridDay<TData>[];
  allDay: CalendarMonthRow<TData>[];
}

export interface CalendarListDay<TData = unknown> {
  date: Date;
  segments: CalendarEventSegment<TData>[];
}

export interface CalendarInteractionOptions {
  /** Positive whole minutes dividing 1440; defaults to 30. */
  slotDuration?: number;
}

export interface CalendarFractionOptions extends CalendarInteractionOptions {
  /** Local HH:mm or HH:mm:ss; defaults to 00:00–24:00. */
  slotMinTime?: string;
  slotMaxTime?: string;
}

export interface CalendarEventDelta {
  /** Whole local calendar days, applied before minutes; defaults to zero. */
  days?: number;
  /** Whole elapsed minutes; defaults to zero. */
  minutes?: number;
}

export interface CalendarMoveOptions {
  /** Target event kind; omitted preserves the current kind. */
  allDay?: boolean;
  /** Elapsed minutes when converting all-day to timed; defaults to 60. */
  defaultTimedDuration?: number;
}

export interface CalendarSelectionOptions extends CalendarInteractionOptions {
  /** Select whole local dates instead of timed slots. Defaults to false. */
  allDay?: boolean;
}
