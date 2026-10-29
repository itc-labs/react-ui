'use client';
import { useUILocale } from '../../i18n/provider';
import { normalizeProgress } from './model';
import { LinearProgress } from './linear';
import { CircularProgress } from './circular';
import type { ProgressProps } from './types';
export type { ProgressTone, ProgressSize, ProgressValue } from './model';
export type {
  ProgressProps,
  ProgressClassNames,
  LinearProgressProps,
  CircularProgressProps,
} from './types';

export function Progress(props: ProgressProps) {
  const { locale, t } = useUILocale();
  const state = normalizeProgress(props.value, props.max);
  const indeterminate = props.indeterminate ?? props.value == null;
  const text = indeterminate
    ? t('common.loading')
    : typeof props.valueLabel === 'function'
      ? props.valueLabel(state)
      : (props.valueLabel ??
        new Intl.NumberFormat(locale.code, {
          style: 'percent',
          maximumFractionDigits: 0,
        }).format(state.percent / 100));
  const label = props.label ?? t('progress.label');

  return props.variant === 'circular' ? (
    <CircularProgress
      {...props}
      label={label}
      state={state}
      text={text}
      indeterminate={indeterminate}
    />
  ) : (
    <LinearProgress
      {...props}
      aria-label={props['aria-label'] ?? label}
      state={state}
      text={text}
      indeterminate={indeterminate}
    />
  );
}
