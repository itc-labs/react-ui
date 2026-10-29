'use client';
import { cn, partTestId } from '../../components/common';
import { progressTones } from '../../components/progress/model';
import { useUILocale } from '../../i18n/provider';
import { EmptyState } from '../empty-state';
import { segmentColor, segmentModel } from './model';
import type { SegmentedProgressProps } from './types';
export type {
  SegmentedProgressProps,
  SegmentedProgressClassNames,
  ProgressSegment,
  ProgressSegmentValue,
} from './types';

export function SegmentedProgress({
  segments,
  label,
  showLegend = true,
  valueFormatter,
  emptyMessage,
  className,
  classNames,
  'data-testid': testId,
  'aria-label': ariaLabel,
  ...props
}: SegmentedProgressProps) {
  const { locale, t } = useUILocale();
  const rows = segmentModel(segments);
  const number = new Intl.NumberFormat(locale.code);
  const percent = new Intl.NumberFormat(locale.code, {
    style: 'percent',
    maximumFractionDigits: 0,
  });
  const formatted = rows.map((row) => ({
    ...row,
    text: valueFormatter
      ? valueFormatter(row, row.segment)
      : `${number.format(row.value)} (${percent.format(row.percent / 100)})`,
  }));
  const total = rows[0]?.total ?? 0;

  return (
    <figure
      {...props}
      aria-label={ariaLabel ?? label ?? t('progress.segmentsLabel')}
      data-testid={testId}
      className={cn('grid min-w-0 gap-3', classNames?.root, className)}
    >
      <figcaption
        data-testid={partTestId(testId, 'summary')}
        className={cn('sr-only', classNames?.summary)}
      >
        {t('progress.total', { total })}
        {formatted.length > 0
          ? `; ${formatted.map((row) => `${row.segment.label}: ${row.text}`).join('; ')}`
          : ''}
      </figcaption>
      {total > 0 ? (
        <div
          aria-hidden="true"
          data-testid={partTestId(testId, 'track')}
          className={cn(
            'flex h-3 overflow-hidden rounded-full bg-line',
            classNames?.track,
          )}
        >
          {rows.map((row) => (
            <span
              key={row.segment.id}
              data-testid={partTestId(testId, 'segment', row.segment.id)}
              style={{
                width: `${row.percent}%`,
                ...(row.segment.tone
                  ? {}
                  : { backgroundColor: segmentColor(row.segment.id) }),
              }}
              className={cn(
                'h-full min-w-0 shrink-0',
                row.segment.tone && progressTones[row.segment.tone],
                classNames?.segment,
              )}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={emptyMessage ?? t('progress.empty')}
          size="compact"
          appearance="plain"
          data-testid={partTestId(testId, 'empty')}
          className={classNames?.empty}
        />
      )}
      {showLegend && formatted.length > 0 && (
        <ul
          data-testid={partTestId(testId, 'legend')}
          className={cn(
            'flex flex-wrap gap-x-5 gap-y-2 text-control',
            classNames?.legend,
          )}
        >
          {formatted.map((row) => (
            <li
              key={row.segment.id}
              data-testid={partTestId(testId, 'legend', row.segment.id)}
              className={cn('flex min-w-0 items-start gap-2', classNames?.legendItem)}
            >
              <span
                aria-hidden="true"
                data-testid={partTestId(testId, 'swatch', row.segment.id)}
                style={
                  row.segment.tone
                    ? undefined
                    : { backgroundColor: segmentColor(row.segment.id) }
                }
                className={cn(
                  'mt-1 size-3 shrink-0 rounded-sm',
                  row.segment.tone && progressTones[row.segment.tone],
                  classNames?.swatch,
                )}
              />
              <span
                data-testid={partTestId(testId, 'label', row.segment.id)}
                className={cn('min-w-0 break-words text-ink', classNames?.label)}
              >
                {row.segment.label}
              </span>
              <span
                data-testid={partTestId(testId, 'value', row.segment.id)}
                className={cn('shrink-0 text-muted tabular-nums', classNames?.value)}
              >
                {row.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
