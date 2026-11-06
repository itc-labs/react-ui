'use client';

import { KitIcon } from '../../components/icon/kit-icon';
import { SpinnerIcon } from '../../components/icon/outline/spinner';
import { SpinnerIcon as SpinnerBoldIcon } from '../../components/icon/bold/spinner';
import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../../components/common';
import type { DataTableView } from './use-data-table';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../../components/dropdown-menu';
import { menuItemClass } from '../../components/dropdown-menu/classes';
import { ChevronDownIcon } from '../../components/icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../../components/icon/bold/chevron-down';
import { Button } from '../../components/button';
import { Pagination } from '../pagination';
import { ChevronLeftIcon } from '../../components/icon/outline/chevron-left';
import { ChevronLeftIcon as ChevronLeftBoldIcon } from '../../components/icon/bold/chevron-left';
import { ChevronRightIcon } from '../../components/icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../../components/icon/bold/chevron-right';

export type DataTablePaginationProps<T> = {
  controller: DataTableView<T>;
  variant?: 'full' | 'compact';
  className?: string;
  'data-testid'?: string | undefined;
};

export function DataTablePagination<T>({
  controller,
  ...props
}: DataTablePaginationProps<T>) {
  return <DataTableFooter view={controller} {...props} />;
}

export function DataTableFooter<T>({
  view,
  className,
  variant = 'full',
  placement = 'bottom',
  'data-testid': testId = view.testId,
}: {
  view: DataTableView<T>;
  className?: string;
  variant?: 'full' | 'compact';
  placement?: 'top' | 'bottom';
  'data-testid'?: string | undefined;
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
      data-testid={partTestId(testId, 'footer')}
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-line px-4 py-3 text-ui-sm text-muted',
        placement === 'top' ? 'border-b' : 'border-t',
        classNames?.footer,
        className,
      )}
    >
      <div
        data-testid={partTestId(testId, 'summary')}
        className={cn('flex min-h-8 items-center gap-2', classNames?.summary)}
        aria-live="off"
      >
        {loading ? (
          <>
            <KitIcon
              name="spinner"
              builtin={{ outline: SpinnerIcon, bold: SpinnerBoldIcon }}
              className="motion-safe:animate-spin"
            />
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
        {variant === 'full' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-testid={partTestId(testId, 'pageSize')}
                aria-label={t('table.pageSize')}
                variant="secondary"
                size="sm"
                className={cn('min-w-20', classNames?.pageSize)}
                disabled={loading}
              >
                {t('table.rows', { count: state.pagination.pageSize })}
                <KitIcon
                  name="chevronDown"
                  builtin={{ outline: ChevronDownIcon, bold: ChevronDownBoldIcon }}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" aria-label={t('table.pageSize')}>
              <DropdownMenuPrimitive.RadioGroup
                value={String(state.pagination.pageSize)}
                onValueChange={(value) => {
                  if (value)
                    change({
                      ...state,
                      pagination: { pageIndex: 0, pageSize: Number(value) },
                    });
                }}
              >
                {sizes.map((size) => (
                  <DropdownMenuPrimitive.RadioItem
                    key={size}
                    value={String(size)}
                    className={cn(menuItemClass, 'relative pl-8')}
                  >
                    <DropdownMenuPrimitive.ItemIndicator className="absolute left-3 size-2 rounded-full bg-current" />
                    {t('table.rows', { count: size })}
                  </DropdownMenuPrimitive.RadioItem>
                ))}
              </DropdownMenuPrimitive.RadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <span
          data-testid={partTestId(testId, 'pageStatus')}
          className={cn('tabular-nums', classNames?.pageStatus)}
        >
          {t('table.pageStatus', { page: page + 1, count: pages })}
        </span>
        {variant === 'compact' ? (
          <nav
            aria-label={t('table.pagination', { caption })}
            className={cn('flex items-center gap-1', classNames?.pagination)}
            data-testid={partTestId(testId, 'pagination')}
          >
            <Button
              variant="secondary"
              size="sm"
              className="size-8 px-0"
              data-testid={partTestId(testId, 'pagination', 'previous')}
              aria-label={t('pagination.previous')}
              disabled={loading || page === 0}
              onClick={() => table.setPageIndex(page - 1)}
            >
              <KitIcon
                name="chevronLeft"
                builtin={{ outline: ChevronLeftIcon, bold: ChevronLeftBoldIcon }}
                className="size-4"
              />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="size-8 px-0"
              data-testid={partTestId(testId, 'pagination', 'next')}
              aria-label={t('pagination.next')}
              disabled={loading || page === pages - 1}
              onClick={() => table.setPageIndex(page + 1)}
            >
              <KitIcon
                name="chevronRight"
                builtin={{ outline: ChevronRightIcon, bold: ChevronRightBoldIcon }}
                className="size-4"
              />
            </Button>
          </nav>
        ) : (
          <Pagination
            data-testid={partTestId(testId, 'pagination')}
            className={cn(classNames?.pagination)}
            aria-label={t('table.pagination', { caption })}
            pageIndex={page}
            pageCount={pages}
            disabled={loading}
            onPageChange={(next) => table.setPageIndex(next)}
          />
        )}
      </div>
    </div>
  );
}
