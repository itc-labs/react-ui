'use client';

import { cn, partTestId } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import type { CalendarClassNames } from './types';

export function CalendarDayHeading({
  date,
  today,
  classNames,
  'data-testid': testId,
}: {
  date: Date;
  today: boolean;
  classNames: CalendarClassNames | undefined;
  'data-testid': string | undefined;
}) {
  const { locale } = useUILocale();

  return (
    <>
      <span
        className={cn('block text-small uppercase text-muted', classNames?.dayWeekday)}
        data-testid={partTestId(testId, 'weekday')}
      >
        {new Intl.DateTimeFormat(locale.code, { weekday: 'short' }).format(date)}
      </span>
      <span
        className={cn(
          'mx-auto mt-1 flex size-9 items-center justify-center rounded-full text-heading font-semibold text-ink',
          today && 'bg-selected text-selected-ink',
          classNames?.dayNumber,
        )}
        data-testid={partTestId(testId, 'number')}
      >
        {new Intl.NumberFormat(locale.code).format(date.getDate())}
      </span>
    </>
  );
}
