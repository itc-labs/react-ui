'use client';
import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../../components/common';
import type { DataTableView } from './use-data-table';
import { flexRender } from '@tanstack/react-table';
import { Checkbox } from '../../components/checkbox';
import { Skeleton } from '../../components/skeleton';
import { EmptyState } from '../empty-state';
import { columnAlign } from './align';

export function DataTableBody<T>({
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
    loading,
    error,
    visibleRows,
    initialLoading,
    placeholders,
    selectable,
    resizable,
    emptyText,
    emptyState,
    classNames,
  } = view;

  return (
    <tbody
      data-testid={partTestId(view.testId, 'tbody')}
      inert={loading}
      className={cn('divide-y divide-line', classNames?.tbody, className)}
    >
      {initialLoading &&
        Array.from({ length: placeholders }, (_, index) => (
          <tr key={`skeleton-${index}`} aria-hidden="true" className="h-12">
            {selectable && (
              <td className="w-11 px-4 py-3.5">
                <Skeleton className="size-4 rounded" />
              </td>
            )}
            {table.getVisibleLeafColumns().map((column, columnIndex) => (
              <td
                data-testid={partTestId(view.testId, 'skeletonCell', index, column.id)}
                key={column.id}
                className={cn(
                  'px-4 py-3.5',
                  columnAlign(table, column).text,
                  classNames?.cell,
                )}
              >
                <Skeleton
                  data-testid={partTestId(view.testId, 'skeleton', index, column.id)}
                  className={cn(
                    'h-[1.6em]',
                    columnIndex % 2 ? 'w-2/3' : 'w-3/4',
                    columnAlign(table, column).block,
                    classNames?.skeleton,
                  )}
                />
              </td>
            ))}
          </tr>
        ))}
      {visibleRows.map((row) => (
        <tr
          data-testid={partTestId(view.testId, 'row', row.id)}
          data-row-id={row.id}
          key={row.id}
          data-selected={row.getIsSelected()}
          className={cn(
            'transition-colors hover:bg-hover/70 data-[selected=true]:bg-hover',
            classNames?.row,
            row.getIsSelected() && classNames?.selectedRow,
          )}
        >
          {selectable && (
            <td
              data-testid={partTestId(view.testId, 'selectionCell', row.id)}
              className={cn('w-11 px-4 py-3.5 align-top', classNames?.selectionCell)}
            >
              <Checkbox
                data-testid={partTestId(view.testId, 'checkbox', row.id)}
                className={classNames?.checkbox}
                // One text line tall so the box centers on the row's first line.
                classNames={{ row: 'h-[1.6em]' }}
                aria-label={t('table.selectRow', { id: row.id })}
                checked={row.getIsSelected()}
                disabled={loading}
                onCheckedChange={(checked) => row.toggleSelected(checked === true)}
              />
            </td>
          )}
          {row.getVisibleCells().map((cell) => (
            <td
              data-testid={partTestId(view.testId, 'cell', row.id, cell.column.id)}
              key={cell.id}
              className={cn(
                'px-4 py-3.5 align-top',
                columnAlign(table, cell.column).text,
                resizable && 'overflow-hidden text-ellipsis',
                classNames?.cell,
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
      {!loading && !visibleRows.length && (
        <tr>
          <td
            data-testid={partTestId(view.testId, 'emptyCell')}
            colSpan={Math.max(
              1,
              table.getVisibleLeafColumns().length + (selectable ? 1 : 0),
            )}
            className={cn('p-0', classNames?.emptyCell)}
          >
            {emptyState ?? (
              <EmptyState
                data-testid={partTestId(view.testId, 'emptyState')}
                size="compact"
                variant={
                  error
                    ? 'error'
                    : state.globalFilter || state.columnFilters?.length
                      ? 'no-results'
                      : 'empty'
                }
                title={
                  error
                    ? t('table.errorTitle')
                    : state.globalFilter || state.columnFilters?.length
                      ? t('table.noResults')
                      : emptyText
                }
                description={
                  error
                    ? t('table.retryDescription')
                    : state.globalFilter || state.columnFilters?.length
                      ? t('table.filterDescription')
                      : t('table.emptyDescription')
                }
                className={cn(
                  'rounded-none border-0 bg-transparent',
                  classNames?.emptyState,
                )}
              />
            )}
          </td>
        </tr>
      )}
    </tbody>
  );
}
