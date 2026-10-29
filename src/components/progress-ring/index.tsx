'use client';
import type { ComponentProps } from 'react';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import type { ProgressTone } from '../progress';
import { normalizeProgress, ringTones } from '../progress/model';
export type ProgressRingClassNames = SlotClasses<
  'root' | 'svg' | 'track' | 'indicator' | 'center'
>;
export type ProgressRingProps = ComponentProps<'div'> &
  TestIdProps & {
    value?: number | null;
    max?: number;
    indeterminate?: boolean;
    /** Diameter and stroke thickness in pixels. */
    size?: number;
    thickness?: number;
    tone?: ProgressTone;
    label?: string;
    classNames?: ProgressRingClassNames;
  };

export function ProgressRing({
  value,
  max,
  indeterminate = value == null,
  size = 96,
  thickness = 8,
  tone = 'brand',
  label,
  children,
  className,
  classNames,
  style,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-valuetext': ariaValueText,
  ...props
}: ProgressRingProps) {
  const { locale, t } = useUILocale();
  const state = normalizeProgress(value, max);
  const diameter = Number.isFinite(size) && size > 0 ? size : 96;
  const stroke =
    Number.isFinite(thickness) && thickness > 0
      ? Math.min(thickness, diameter / 2)
      : Math.min(8, diameter / 2);
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const text = indeterminate
    ? t('common.loading')
    : new Intl.NumberFormat(locale.code, {
        style: 'percent',
        maximumFractionDigits: 0,
      }).format(state.percent / 100);

  return (
    <div
      {...props}
      role="progressbar"
      aria-label={ariaLabel ?? label ?? t('progress.label')}
      aria-valuemin={0}
      aria-valuemax={state.max}
      aria-valuenow={indeterminate ? undefined : state.value}
      aria-valuetext={ariaValueText ?? text}
      data-state={
        indeterminate
          ? 'indeterminate'
          : state.value === state.max
            ? 'complete'
            : 'loading'
      }
      data-tone={tone}
      data-testid={testId}
      style={{ width: diameter, height: diameter, ...style }}
      className={cn(
        'relative inline-grid shrink-0 place-items-center align-middle',
        classNames?.root,
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${diameter} ${diameter}`}
        data-testid={partTestId(testId, 'svg')}
        className={cn(
          'size-full -rotate-90',
          indeterminate && 'motion-safe:animate-spin',
          classNames?.svg,
        )}
      >
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          data-testid={partTestId(testId, 'track')}
          className={cn('text-line', classNames?.track)}
        />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference * (1 - (indeterminate ? 0.25 : state.percent / 100))
          }
          data-testid={partTestId(testId, 'indicator')}
          className={cn(
            ringTones[tone],
            state.percent === 0 && !indeterminate && 'opacity-0',
            classNames?.indicator,
          )}
        />
      </svg>
      <div
        aria-hidden="true"
        data-testid={partTestId(testId, 'center')}
        className={cn(
          'absolute inset-0 grid place-items-center overflow-hidden p-2 text-control text-ink tabular-nums',
          classNames?.center,
        )}
      >
        {children !== undefined ? children : indeterminate ? null : text}
      </div>
    </div>
  );
}
