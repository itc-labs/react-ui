'use client';

import { KitIconButton } from '../icon-button/kit-icon-button';
import { ChevronLeftIcon } from '../icon/outline/chevron-left';
import { ChevronLeftIcon as ChevronLeftBoldIcon } from '../icon/bold/chevron-left';
import { ChevronRightIcon } from '../icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../icon/bold/chevron-right';
import { partTestId } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../common';
import { Select } from '../select';
import { atMonth, monthKey } from './model';
import type { CalendarProps } from './types';

export function CalendarHeader({
  'data-testid': testId,
  month,
  setMonth,
  min,
  max,
  classNames,
  className,
}: {
  month: Date;
  setMonth: (date: Date) => void;
  min: Date;
  max: Date;
  classNames: CalendarProps['classNames'];
  className?: string;
} & { 'data-testid'?: string | undefined }) {
  const { t, locale } = useUILocale();
  const previous = atMonth(month.getFullYear(), month.getMonth() - 1);
  const next = atMonth(month.getFullYear(), month.getMonth() + 1);

  return (
    <div
      data-testid={partTestId(testId, 'header')}
      className={cn('grid shrink-0 gap-2', classNames?.header, className)}
    >
      <div
        data-testid={partTestId(testId, 'navigation')}
        className={cn(
          'grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2',
          classNames?.navigation,
        )}
      >
        <KitIconButton
          data-testid={partTestId(testId, 'previous')}
          className={classNames?.navigationButton}
          label={t('calendar.previous')}
          icon="chevronLeft"
          builtin={{ outline: ChevronLeftIcon, bold: ChevronLeftBoldIcon }}
          variant="ghost"
          size="sm"
          disabled={monthKey(previous) < monthKey(min)}
          onClick={() => setMonth(previous)}
        />
        <p
          data-testid={partTestId(testId, 'caption')}
          aria-live="polite"
          className={cn(
            'text-center text-control font-semibold text-ink',
            classNames?.caption,
          )}
        >
          {new Intl.DateTimeFormat(locale.code, {
            month: 'long',
            year: 'numeric',
          }).format(month)}
        </p>
        <KitIconButton
          data-testid={partTestId(testId, 'next')}
          className={classNames?.navigationButton}
          label={t('calendar.next')}
          icon="chevronRight"
          builtin={{ outline: ChevronRightIcon, bold: ChevronRightBoldIcon }}
          variant="ghost"
          size="sm"
          disabled={monthKey(next) > monthKey(max)}
          onClick={() => setMonth(next)}
        />
      </div>
      <div
        data-testid={partTestId(testId, 'selects')}
        className={cn('grid grid-cols-2 gap-2', classNames?.selects)}
      >
        <Select
          data-testid={partTestId(testId, 'monthSelect')}
          className={cn(classNames?.monthSelect)}
          aria-label={t('calendar.month')}
          size="sm"
          value={String(month.getMonth())}
          options={Array.from({ length: 12 }, (_, index) => ({
            value: String(index),
            label: new Intl.DateTimeFormat(locale.code, { month: 'long' }).format(
              atMonth(month.getFullYear(), index),
            ),
            disabled:
              monthKey(atMonth(month.getFullYear(), index)) < monthKey(min) ||
              monthKey(atMonth(month.getFullYear(), index)) > monthKey(max),
          }))}
          onValueChange={(value) => {
            if (value != null) setMonth(atMonth(month.getFullYear(), Number(value)));
          }}
        />
        <Select
          data-testid={partTestId(testId, 'yearSelect')}
          className={cn(classNames?.yearSelect)}
          aria-label={t('calendar.year')}
          searchable
          size="sm"
          value={String(month.getFullYear())}
          options={Array.from(
            { length: max.getFullYear() - min.getFullYear() + 1 },
            (_, index) => ({
              value: String(min.getFullYear() + index),
              label: String(min.getFullYear() + index),
            }),
          )}
          onValueChange={(value) => {
            if (value) {
              const target = atMonth(Number(value), month.getMonth());
              setMonth(
                monthKey(target) < monthKey(min)
                  ? min
                  : monthKey(target) > monthKey(max)
                    ? max
                    : target,
              );
            }
          }}
        />
      </div>
    </div>
  );
}
