'use client';

import type { ComponentProps } from 'react';
import { cn } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import type { CalendarSelect } from './types';

export function SelectionMirror({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 bg-selected/70 ring-1 ring-inset ring-accent',
        className,
      )}
    />
  );
}

export function SelectionStatus({
  selection,
  className,
  ...props
}: ComponentProps<'div'> & { selection: CalendarSelect | null }) {
  const { locale, t } = useUILocale();
  const format = new Intl.DateTimeFormat(locale.code, {
    dateStyle: 'medium',
    ...(selection?.allDay ? {} : { timeStyle: 'short' as const }),
  });

  return (
    <div
      {...props}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {selection
        ? t('calendar.selection', {
            start: format.format(selection.start),
            end: format.format(selection.end),
          })
        : t('calendar.selectHint')}
    </div>
  );
}
