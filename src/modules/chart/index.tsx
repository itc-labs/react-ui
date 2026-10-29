'use client';

import { useMemo, type CSSProperties } from 'react';
import { Button } from '../../components/button';
import { Skeleton } from '../../components/skeleton';
import { cn, partTestId } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import { chartModel } from './model';
import { ChartLegend, ChartDataTable } from './content';
import { ChartPlot } from './plot';
import type { ChartProps } from './types';

export type {
  ChartProps,
  ChartType,
  ChartPoint,
  ChartSlice,
  ChartSeries,
  ChartClassNames,
} from './types';

export function Chart(props: ChartProps) {
  const {
    label,
    title,
    description,
    height,
    loading = false,
    error,
    onRetry,
    emptyMessage,
    loadingLabel,
    retryLabel,
    missingValueLabel,
    legend = true,
    showDataTable = false,
    valueFormatter,
    className,
    classNames,
    'data-testid': testId,
    ...rest
  } = props;
  // Forward native figure attributes only; type-specific data never reaches DOM.
  const {
    type: _type,
    data: _data,
    series: _series,
    grid: _grid,
    xAxis: _xAxis,
    yAxis: _yAxis,
    curve: _curve,
    dots: _dots,
    stacked: _stacked,
    orientation: _orientation,
    innerRadius: _innerRadius,
    tooltip: _tooltip,
    ...figureProps
  } = rest as typeof rest & Record<string, unknown>;
  const { t, locale } = useUILocale();
  const number = useMemo(() => new Intl.NumberFormat(locale.code), [locale.code]);
  const formatValue = valueFormatter ?? ((value: number) => number.format(value));
  const missingLabel = missingValueLabel ?? t('chart.missing');
  const model = chartModel(props);
  const radial = props.type === 'pie' || props.type === 'donut';
  const invalidSize = height !== undefined && (!Number.isFinite(height) || height <= 0);
  const invalidRadius =
    props.type === 'donut' &&
    props.innerRadius !== undefined &&
    (!Number.isFinite(props.innerRadius) ||
      props.innerRadius < 0 ||
      props.innerRadius >= 1);
  const failure =
    error ||
    (model.invalid || invalidSize || invalidRadius ? t('chart.invalid') : undefined);
  const ready = !loading && !failure;

  return (
    <figure
      {...figureProps}
      aria-label={figureProps['aria-label'] ?? label}
      aria-busy={loading || undefined}
      data-testid={testId}
      className={cn(
        'grid min-w-0 content-start gap-4 text-control text-ink',
        classNames?.root,
        className,
      )}
    >
      {(title || description) && (
        <figcaption className={cn('grid gap-1', classNames?.caption)}>
          {title && (
            <p className={cn('text-section font-semibold', classNames?.title)}>
              {title}
            </p>
          )}
          {description && (
            <p className={cn('text-ui-sm text-muted', classNames?.description)}>
              {description}
            </p>
          )}
        </figcaption>
      )}
      <div
        data-testid={partTestId(testId, 'viewport')}
        style={
          {
            '--chart-height': invalidSize
              ? 'var(--spacing-chart-height)'
              : height === undefined
                ? 'var(--spacing-chart-height)'
                : `${height}px`,
          } as CSSProperties
        }
        className={cn('h-[var(--chart-height)] min-w-0', classNames?.viewport)}
      >
        {loading ? (
          <div
            role="status"
            data-testid={partTestId(testId, 'loading')}
            className={cn(
              'flex h-full flex-col justify-center gap-4',
              classNames?.status,
            )}
          >
            <span className="sr-only">{loadingLabel ?? t('chart.loading')}</span>
            <Skeleton className="h-full w-full" />
          </div>
        ) : failure ? (
          <div
            role="alert"
            data-testid={partTestId(testId, 'error')}
            className={cn(
              'flex h-full flex-col items-center justify-center gap-3 text-center text-danger-700',
              classNames?.status,
            )}
          >
            <p>{failure}</p>
            {onRetry && (
              <Button
                variant="secondary"
                data-testid={partTestId(testId, 'retry')}
                className={cn(classNames?.retry)}
                onClick={onRetry}
              >
                {retryLabel ?? t('chart.retry')}
              </Button>
            )}
          </div>
        ) : model.hasData ? (
          <div
            data-testid={partTestId(testId, 'plot')}
            className={cn('size-full min-w-0 text-ui-sm', classNames?.plot)}
          >
            <ChartPlot
              config={props}
              model={model}
              formatValue={formatValue}
              missingLabel={missingLabel}
            />
          </div>
        ) : (
          <div
            role="status"
            data-testid={partTestId(testId, 'empty')}
            className={cn(
              'flex h-full items-center justify-center text-center text-muted',
              classNames?.status,
            )}
          >
            {emptyMessage ?? t('chart.empty')}
          </div>
        )}
      </div>
      {ready && legend && model.hasData && (
        <ChartLegend model={model} classNames={classNames} testId={testId} />
      )}
      {ready && model.rows.length > 0 && (
        <ChartDataTable
          model={model}
          label={label}
          radial={radial}
          visible={showDataTable}
          formatValue={formatValue}
          missingLabel={missingLabel}
          classNames={classNames}
          testId={testId}
        />
      )}
    </figure>
  );
}
