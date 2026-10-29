'use client';
import type { ComponentProps } from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import {
  normalizeProgress,
  progressTones,
  type ProgressTone,
  type ProgressSize,
  type ProgressValue,
} from './model';
export type { ProgressTone, ProgressSize, ProgressValue } from './model';
export type ProgressClassNames = SlotClasses<
  'root' | 'header' | 'label' | 'value' | 'track' | 'indicator'
>;
export type ProgressProps = Omit<ComponentProps<'div'>, 'children'> &
  TestIdProps & {
    /** Null or omitted value selects indeterminate progress. */
    value?: number | null;
    max?: number;
    indeterminate?: boolean;
    label?: string;
    showValue?: boolean;
    valueLabel?: string | ((value: ProgressValue) => string);
    size?: ProgressSize;
    tone?: ProgressTone;
    striped?: boolean;
    classNames?: ProgressClassNames | undefined;
  };
const sizes: Record<ProgressSize, string> = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

export function Progress({
  value,
  max,
  indeterminate = value == null,
  label,
  showValue = false,
  valueLabel,
  size = 'md',
  tone = 'brand',
  striped = false,
  className,
  classNames,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-valuetext': ariaValueText,
  ...props
}: ProgressProps) {
  const { locale, t } = useUILocale();
  const state = normalizeProgress(value, max);
  const text = indeterminate
    ? t('common.loading')
    : typeof valueLabel === 'function'
      ? valueLabel(state)
      : (valueLabel ??
        new Intl.NumberFormat(locale.code, {
          style: 'percent',
          maximumFractionDigits: 0,
        }).format(state.percent / 100));

  return (
    <ProgressPrimitive.Root
      {...props}
      value={indeterminate ? null : state.value}
      max={state.max}
      aria-label={ariaLabel ?? label ?? t('progress.label')}
      aria-valuetext={ariaValueText ?? text}
      data-testid={testId}
      data-tone={tone}
      className={cn('grid min-w-0 gap-2', classNames?.root, className)}
    >
      {(label != null || showValue || valueLabel !== undefined) && (
        <div
          data-testid={partTestId(testId, 'header')}
          className={cn(
            'flex min-w-0 items-start justify-between gap-3 text-control',
            classNames?.header,
          )}
        >
          {label != null && (
            <span
              data-testid={partTestId(testId, 'label')}
              className={cn('min-w-0 break-words text-ink', classNames?.label)}
            >
              {label}
            </span>
          )}
          {(showValue || valueLabel !== undefined) && (
            <span
              data-testid={partTestId(testId, 'value')}
              className={cn('shrink-0 text-muted tabular-nums', classNames?.value)}
            >
              {text}
            </span>
          )}
        </div>
      )}
      <div
        data-testid={partTestId(testId, 'track')}
        className={cn(
          'overflow-hidden rounded-full bg-line',
          sizes[size],
          classNames?.track,
        )}
      >
        <ProgressPrimitive.Indicator
          data-testid={partTestId(testId, 'indicator')}
          className={cn(
            'h-full rounded-full',
            progressTones[tone],
            indeterminate && 'motion-safe:animate-table-loading',
            striped &&
              'bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,var(--color-on-brand)_4px,var(--color-on-brand)_6px)]',
            classNames?.indicator,
          )}
          style={{ width: `${indeterminate ? 25 : state.percent}%` }}
        />
      </div>
    </ProgressPrimitive.Root>
  );
}
