import {
  addDays,
  addHours,
  addMonths,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDate,
} from 'date-fns';
import type {
  CalendarEvent,
  CalendarRange,
  CalendarRangeOptions,
  CalendarView,
  NormalizedEvent,
} from './types';

function validDate(value: Date | string): Date {
  const date = typeof value === 'string' ? parseISO(value) : toDate(value);
  if (!isValid(date)) throw new RangeError('Invalid calendar date.');

  return date;
}

/** Parses ISO input without interpreting date-only strings as UTC. Never mutates input. */
export function normalizeEvent<TData>(
  event: CalendarEvent<TData>,
): NormalizedEvent<TData> {
  const allDay = event.allDay ?? false;
  const parsedStart = validDate(event.start);
  const start = allDay ? startOfDay(parsedStart) : parsedStart;
  const parsedEnd = event.end === undefined ? undefined : validDate(event.end);
  const end = parsedEnd
    ? allDay
      ? startOfDay(parsedEnd)
      : parsedEnd
    : allDay
      ? addDays(start, 1)
      : addHours(start, 1);
  if (end <= start) throw new RangeError('Calendar event end must follow start.');

  return { ...event, start, end, allDay };
}

export function weekStart(
  date: Date,
  weekStartsOn: NonNullable<CalendarRangeOptions['weekStartsOn']> = 1,
): Date {
  if (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError('weekStartsOn must be an integer from zero to six.');
  }

  return startOfWeek(validDate(date), { weekStartsOn });
}

/** Returns local calendar boundaries; all ends are exclusive. */
export function viewRange(
  view: CalendarView,
  date: Date,
  options: CalendarRangeOptions = {},
): CalendarRange {
  const day = startOfDay(validDate(date));
  switch (view) {
    case 'month': {
      const month = startOfMonth(day);
      const start = weekStart(month, options.weekStartsOn);
      const nextMonth = addMonths(month, 1);
      const lastWeek = weekStart(addDays(nextMonth, -1), options.weekStartsOn);

      return {
        start,
        end:
          options.fixedWeekCount === false ? addDays(lastWeek, 7) : addDays(start, 42),
      };
    }
    case 'week': {
      const start = weekStart(day, options.weekStartsOn);

      return { start, end: addDays(start, 7) };
    }
    case 'day':
      return { start: day, end: addDays(day, 1) };
    case 'list': {
      const listDays = options.listDays ?? 7;
      if (!Number.isSafeInteger(listDays) || listDays < 1) {
        throw new RangeError('listDays must be a positive integer.');
      }
      const end = addDays(day, listDays);
      if (!isValid(end)) throw new RangeError('Calendar range exceeds valid dates.');

      return { start: day, end };
    }
  }
}

/** List navigation advances one week; custom list ranges remain host-controlled. */
export function navigate(
  view: CalendarView,
  date: Date,
  action: 'prev' | 'next' | 'today',
): Date {
  if (action === 'today') return startOfDay(new Date());
  const current = validDate(date);
  const direction = action === 'prev' ? -1 : 1;

  return view === 'month'
    ? addMonths(current, direction)
    : addDays(current, direction * (view === 'day' ? 1 : 7));
}

/** Formats the displayed dates rather than the exclusive end boundary. */
export function viewTitle(
  view: CalendarView,
  range: CalendarRange,
  locale: string,
): string {
  const start = validDate(range.start);
  const end = validDate(range.end);
  if (end <= start) throw new RangeError('Calendar range end must follow start.');
  if (view === 'month') {
    // The second grid week always belongs to the displayed month.
    const month = addDays(start, 7);
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    });
    const isVietnamese =
      new Intl.Locale(formatter.resolvedOptions().locale).language === 'vi';
    const title = formatter
      .formatToParts(month)
      .map((part) => (isVietnamese && part.type === 'literal' ? ', ' : part.value))
      .join('');

    return title.charAt(0).toLocaleUpperCase(locale) + title.slice(1);
  }
  const formatter = new Intl.DateTimeFormat(locale, {
    month: view === 'day' ? 'long' : 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return view === 'day'
    ? formatter.format(start)
    : formatter.formatRange(start, addDays(end, -1)).replace(/[\u2009\u202f]/g, ' ');
}
