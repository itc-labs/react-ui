import { differenceInCalendarDays } from 'date-fns';

/** Compact locale-aware labels for event lists and grid chips. */
export function calendarTime(date: Date, locale: string, compact = false) {
  const english = new Intl.Locale(locale).language === 'en';
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: english ? 'numeric' : '2-digit',
    ...(compact && english && date.getMinutes() === 0
      ? {}
      : { minute: '2-digit' as const }),
  });
  if (!compact || !english) return formatter.format(date);

  return formatter
    .formatToParts(date)
    .map((part) =>
      part.type === 'dayPeriod'
        ? part.value.slice(0, 1).toLowerCase()
        : part.type === 'literal' && part.value.trim() === ''
          ? ''
          : part.value,
    )
    .join('');
}

export function calendarTimeRange(start: Date, end: Date, locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: new Intl.Locale(locale).language === 'en' ? 'numeric' : '2-digit',
    minute: '2-digit',
  });

  const days = differenceInCalendarDays(end, start);

  const time = (date: Date) => formatter.format(date).replace(/[\u2009\u202f]/g, ' ');

  return `${time(start)}\u2009–\u2009${time(end)}${days > 0 ? ` (+${days})` : ''}`;
}
