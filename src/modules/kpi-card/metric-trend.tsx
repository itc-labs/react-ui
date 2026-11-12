'use client';
import { useMemo } from 'react';
import { cn, partTestId } from '../../components/common';
import { KitIcon, type KitIconBuiltin } from '../../components/icon/kit-icon';
import { TrendingUpIcon } from '../../components/icon/outline/trending-up';
import { TrendingUpIcon as TrendingUpBoldIcon } from '../../components/icon/bold/trending-up';
import { TrendingDownIcon } from '../../components/icon/outline/trending-down';
import { TrendingDownIcon as TrendingDownBoldIcon } from '../../components/icon/bold/trending-down';
import { MinusIcon } from '../../components/icon/outline/minus';
import { MinusIcon as MinusBoldIcon } from '../../components/icon/bold/minus';
import type { IconName } from '../../components/icon';
import { useUILocale } from '../../i18n/provider';
import type {
  MetricTrendDirection,
  MetricTrendIntent,
  MetricTrendProps,
} from './types';

const glyphs: Record<
  MetricTrendDirection,
  { name: IconName; builtin: KitIconBuiltin }
> = {
  up: {
    name: 'trendingUp',
    builtin: { outline: TrendingUpIcon, bold: TrendingUpBoldIcon },
  },
  down: {
    name: 'trendingDown',
    builtin: { outline: TrendingDownIcon, bold: TrendingDownBoldIcon },
  },
  flat: { name: 'minus', builtin: { outline: MinusIcon, bold: MinusBoldIcon } },
};
export const trendIntentClasses: Record<MetricTrendIntent, string> = {
  positive: 'text-success-700',
  negative: 'text-danger-700',
  neutral: 'text-muted',
};
const defaultIntent: Record<MetricTrendDirection, MetricTrendIntent> = {
  up: 'positive',
  down: 'negative',
  flat: 'neutral',
};

export function trendDirection(
  value: number | null | undefined,
  direction?: MetricTrendDirection,
): MetricTrendDirection {
  if (direction) return direction;
  if (typeof value !== 'number' || !Number.isFinite(value) || value === 0)
    return 'flat';

  return value > 0 ? 'up' : 'down';
}

export function MetricTrend({
  value,
  direction: directionProp,
  intent: intentProp,
  valueFormatter,
  label,
  children,
  directionLabel,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: MetricTrendProps) {
  const { t, locale } = useUILocale();
  const percent = useMemo(
    () =>
      new Intl.NumberFormat(locale.code, {
        style: 'percent',
        maximumFractionDigits: 1,
      }),
    [locale.code],
  );

  const direction = trendDirection(value, directionProp);
  const intent = intentProp ?? defaultIntent[direction];
  const finite = typeof value === 'number' && Number.isFinite(value);
  const text = finite
    ? valueFormatter
      ? valueFormatter(Math.abs(value))
      : percent.format(Math.abs(value) / 100)
    : undefined;
  const srText = directionLabel ?? t(`trend.${direction}`);
  const glyph = glyphs[direction];

  return (
    <span
      {...props}
      data-testid={testId}
      data-direction={direction}
      data-intent={intent}
      className={cn(
        'inline-flex min-w-0 flex-wrap items-center gap-x-1 text-ui-sm font-medium',
        trendIntentClasses[intent],
        classNames?.root,
        className,
      )}
    >
      <KitIcon
        name={glyph.name}
        builtin={glyph.builtin}
        size={14}
        className={cn('shrink-0', classNames?.icon)}
        data-testid={partTestId(testId, 'icon')}
      />
      {srText && <span className="sr-only">{srText} </span>}
      {children ?? (
        <>
          {text !== undefined && (
            <span
              data-testid={partTestId(testId, 'value')}
              className={cn('tabular-nums', classNames?.value)}
            >
              {text}
            </span>
          )}
          {label != null && (
            <span
              data-testid={partTestId(testId, 'label')}
              className={cn('font-normal text-muted', classNames?.label)}
            >
              {label}
            </span>
          )}
        </>
      )}
    </span>
  );
}
