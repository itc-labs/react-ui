'use client';
import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../../components/common';
import type { DataTableView } from './use-data-table';
import { Button } from '../../components/button';

export function DataTableFeedback<T>({
  view,
  className,
}: {
  view: DataTableView<T>;
  className?: string;
}) {
  const { t } = useUILocale();
  const { error, onRetry, loading, classNames } = view;

  return (
    <div
      data-testid={partTestId(view.testId, 'error')}
      role="alert"
      className={cn(
        'flex items-center justify-between gap-3 border-b border-line bg-danger-50 px-4 py-3 text-ui-sm text-danger-700',
        classNames?.error,
        className,
      )}
    >
      <span>{error}</span>
      {onRetry && (
        <Button
          data-testid={partTestId(view.testId, 'retry')}
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className={classNames?.retry}
          disabled={loading}
        >
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
