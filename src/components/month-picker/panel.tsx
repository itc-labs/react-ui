'use client';

import { KitIconButton } from '../icon-button/kit-icon-button';
import { ChevronLeftIcon } from '../icon/outline/chevron-left';
import { ChevronLeftIcon as ChevronLeftBoldIcon } from '../icon/bold/chevron-left';
import { ChevronRightIcon } from '../icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../icon/bold/chevron-right';
import { partTestId } from '../common/testing';
import { focusRingClassName } from '../common/focus-ring';

import { useUILocale } from '../../i18n/provider';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../common';
import { Button } from '../button';
import { clampMonthIndex, monthIndexDate, monthIndexString } from './model';
import type { MonthPanelClassNames } from './types';

const keyDeltas: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -3,
  ArrowDown: 3,
  PageUp: -12,
  PageDown: 12,
};

export function MonthPanel({
  'data-testid': testId,
  selected,
  hasValue,
  min,
  max,
  current,
  clearable,
  classNames,
  onSelect,
}: {
  selected: number | null;
  hasValue: boolean;
  min: number;
  max: number;
  current: number;
  clearable: boolean;
  classNames: MonthPanelClassNames | undefined;
  onSelect: (index: number | null) => void;
} & { 'data-testid'?: string | undefined }) {
  const { t, locale } = useUILocale();
  const [active, setActive] = useState(() =>
    clampMonthIndex(selected ?? current, min, max),
  );
  const grid = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(true);

  const formats = useMemo(
    () => ({
      short: new Intl.DateTimeFormat(locale.code, { month: 'short' }),
      full: new Intl.DateTimeFormat(locale.code, { month: 'long', year: 'numeric' }),
    }),
    [locale.code],
  );

  const year = Math.floor(active / 12);
  const currentAvailable = current >= min && current <= max;

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [active]);

  const move = (target: number, focus: boolean) => {
    shouldFocus.current = focus;
    setActive(clampMonthIndex(target, min, max));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = keyDeltas[event.key];
    const target =
      delta != null
        ? active + delta
        : event.key === 'Home'
          ? year * 12
          : event.key === 'End'
            ? year * 12 + 11
            : null;
    if (target == null) return;
    event.preventDefault();
    move(target, true);
  };

  return (
    <div
      data-testid={testId}
      className={cn('flex w-72 max-w-full flex-col gap-3', classNames?.root)}
    >
      <div
        data-testid={partTestId(testId, 'header')}
        className={cn(
          'grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2',
          classNames?.header,
        )}
      >
        <KitIconButton
          data-testid={partTestId(testId, 'previous')}
          className={classNames?.navigationButton}
          label={t('month.previousYear')}
          icon="chevronLeft"
          builtin={{ outline: ChevronLeftIcon, bold: ChevronLeftBoldIcon }}
          variant="ghost"
          size="sm"
          disabled={year * 12 <= min}
          onClick={() => move(active - 12, false)}
        />
        <p
          data-testid={partTestId(testId, 'caption')}
          aria-live="polite"
          className={cn(
            'text-center text-control font-semibold text-ink',
            classNames?.caption,
          )}
        >
          {year}
        </p>
        <KitIconButton
          data-testid={partTestId(testId, 'next')}
          className={classNames?.navigationButton}
          label={t('month.nextYear')}
          icon="chevronRight"
          builtin={{ outline: ChevronRightIcon, bold: ChevronRightBoldIcon }}
          variant="ghost"
          size="sm"
          disabled={year * 12 + 11 >= max}
          onClick={() => move(active + 12, false)}
        />
      </div>
      <div
        ref={grid}
        data-testid={partTestId(testId, 'grid')}
        role="grid"
        aria-label={t('month.grid', { year: String(year) })}
        className={cn('grid gap-1', classNames?.grid)}
        onKeyDown={onKeyDown}
      >
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            role="row"
            className={cn('grid grid-cols-3 gap-1', classNames?.row)}
          >
            {[0, 1, 2].map((column) => {
              const index = year * 12 + row * 3 + column;
              const isSelected = index === selected;
              const isCurrent = index === current;
              const date = monthIndexDate(index);
              let label = formats.full.format(date);
              if (isCurrent) label = t('month.currentLabel', { date: label });
              if (isSelected) label = t('calendar.selected', { date: label });

              return (
                <div key={column} role="gridcell" aria-selected={isSelected}>
                  <button
                    type="button"
                    data-testid={partTestId(testId, 'month', monthIndexString(index))}
                    tabIndex={index === active ? 0 : -1}
                    disabled={index < min || index > max}
                    aria-label={label}
                    aria-current={isCurrent ? 'date' : undefined}
                    onClick={() => onSelect(index)}
                    onFocus={() => {
                      if (index !== active) move(index, false);
                    }}
                    className={cn(
                      focusRingClassName,
                      'flex h-control-md w-full items-center justify-center rounded-control px-1 text-ui-sm text-ink focus-visible:outline-offset-2 enabled:hover:bg-hover-strong disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors',
                      isCurrent && 'font-semibold text-brand-700',
                      isSelected &&
                        'bg-accent font-semibold text-on-brand enabled:hover:bg-accent',
                      classNames?.month,
                    )}
                  >
                    {formats.short.format(date)}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        data-testid={partTestId(testId, 'footer')}
        className={cn(
          'flex items-center justify-between gap-2 border-t border-line pt-3',
          classNames?.footer,
        )}
      >
        <Button
          data-testid={partTestId(testId, 'currentMonth')}
          variant="ghost"
          size="sm"
          className={classNames?.currentMonth}
          disabled={!currentAvailable}
          onClick={() => onSelect(current)}
        >
          {t('month.current')}
        </Button>
        {clearable && hasValue && (
          <Button
            data-testid={partTestId(testId, 'clearSelection')}
            variant="ghost"
            size="sm"
            className={classNames?.clearSelection}
            onClick={() => onSelect(null)}
          >
            {t('month.clearAction')}
          </Button>
        )}
      </div>
    </div>
  );
}
