'use client';
import { cn, partTestId } from '../../components/common';
import { Progress } from '../../components/progress';
import { useUILocale } from '../../i18n/provider';
import { EmptyState } from '../empty-state';
import { itemProgress, thresholdTone } from './model';
import type { ProgressListProps } from './types';
export type {
  ProgressListProps,
  ProgressListItem,
  ProgressListClassNames,
  ProgressThreshold,
} from './types';

export function ProgressList({
  items,
  label,
  tone = 'brand',
  thresholds = [],
  sort = 'none',
  valueFormatter,
  emptyMessage,
  className,
  classNames,
  progressClassNames,
  'data-testid': testId,
  'aria-label': ariaLabel,
  ...props
}: ProgressListProps) {
  const { t } = useUILocale();
  const rows = items.map((item) => ({ item, state: itemProgress(item) }));
  if (sort !== 'none')
    rows.sort(
      (a, b) => (a.state.percent - b.state.percent) * (sort === 'ascending' ? 1 : -1),
    );

  return (
    <section
      {...props}
      aria-label={ariaLabel ?? label ?? t('progress.listLabel')}
      data-testid={testId}
      className={cn('min-w-0', classNames?.root, className)}
    >
      {rows.length === 0 ? (
        <EmptyState
          title={emptyMessage ?? t('progress.empty')}
          size="compact"
          appearance="plain"
          data-testid={partTestId(testId, 'empty')}
          className={classNames?.empty}
        />
      ) : (
        <ul
          data-testid={partTestId(testId, 'list')}
          className={cn('grid min-w-0 gap-4', classNames?.list)}
        >
          {rows.map(({ item, state }) => (
            <li
              key={item.id}
              data-testid={partTestId(testId, 'row', item.id)}
              className={cn('grid min-w-0 gap-1', classNames?.row)}
            >
              <Progress
                label={item.label}
                value={state.value}
                max={state.max}
                tone={item.tone ?? thresholdTone(state.percent, thresholds, tone)}
                showValue
                {...(valueFormatter ? { valueLabel: valueFormatter(state, item) } : {})}
                classNames={progressClassNames}
                data-testid={partTestId(testId, 'progress', item.id)}
              />
              {item.secondaryText != null && (
                <div
                  data-testid={partTestId(testId, 'secondary', item.id)}
                  className={cn(
                    'break-words text-ui-sm text-muted',
                    classNames?.secondary,
                  )}
                >
                  {item.secondaryText}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
