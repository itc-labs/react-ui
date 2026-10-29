'use client';
import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../../components/common';
import type { DataTableView } from './use-data-table';
import { Icon } from '../../components/icon';
import { Select } from '../../components/select';
import { Pagination } from '../pagination';

export function DataTableFooter<T>({
  view,
  className,
}: {
  view: DataTableView<T>;
  className?: string;
}) {
  const { t } = useUILocale();
  const {
    table,
    state,
    change,
    count,
    page,
    pages,
    start,
    end,
    sizes,
    loading,
    initialLoading,
    caption,
    classNames,
  } = view;

  return (
    <div
      data-testid={partTestId(view.testId, 'footer')}
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line px-4 py-3 text-ui-sm text-muted',
        classNames?.footer,
        className,
      )}
    >
      <div
        data-testid={partTestId(view.testId, 'summary')}
        className={cn('flex min-h-8 items-center gap-2', classNames?.summary)}
        aria-live="off"
      >
        {loading ? (
          <>
            <Icon name="spinner" className="motion-safe:animate-spin" />
            <span>{initialLoading ? t('select.loading') : t('table.updating')}</span>
          </>
        ) : (
          <span>
            {count === 0
              ? t('table.zeroResults', { count: 0 })
              : t('table.results', { start, end: Math.max(start, end), count })}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Select
          data-testid={partTestId(view.testId, 'pageSize')}
          aria-label={t('table.pageSize')}
          size="sm"
          searchable={false}
          rootClassName={cn('min-w-20', classNames?.pageSize)}
          disabled={loading}
          value={String(state.pagination.pageSize)}
          options={sizes.map((size) => ({
            value: String(size),
            label: t('table.rows', { count: size }),
          }))}
          onValueChange={(value) => {
            if (value)
              change({
                ...state,
                pagination: { pageIndex: 0, pageSize: Number(value) },
              });
          }}
          menuPlacement="auto"
        />
        <span
          data-testid={partTestId(view.testId, 'pageStatus')}
          className={cn('tabular-nums', classNames?.pageStatus)}
        >
          {t('table.pageStatus', { page: page + 1, count: pages })}
        </span>
        <Pagination
          data-testid={partTestId(view.testId, 'pagination')}
          className={cn(classNames?.pagination)}
          aria-label={t('table.pagination', { caption })}
          pageIndex={page}
          pageCount={pages}
          disabled={loading}
          onPageChange={(next) => table.setPageIndex(next)}
        />
      </div>
    </div>
  );
}
