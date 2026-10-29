'use client';
import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import type { DataTableView } from './use-data-table';
import { flexRender } from '@tanstack/react-table';
import { Checkbox } from '../../components/checkbox';
import { Icon } from '../../components/icon';
import { columnAlign } from './align';

export function DataTableHeader<T>({
  view,
  className,
}: {
  view: DataTableView<T>;
  className?: string;
}) {
  const { t } = useUILocale();
  const { table, loading, selectable, resizable, stickyHeader, classNames } = view;

  return (
    <thead
      data-testid={partTestId(view.testId, 'thead')}
      className={cn(
        'border-b border-line bg-canvas text-muted',
        stickyHeader && 'sticky top-0 z-10',
        classNames?.thead,
        className,
      )}
    >
      {table.getHeaderGroups().map((group) => (
        <tr
          data-testid={partTestId(view.testId, 'headerRow', group.id)}
          key={group.id}
          className={classNames?.headerRow}
        >
          {selectable && (
            <th
              data-testid={partTestId(view.testId, 'selectPageCell', group.id)}
              scope="col"
              className={cn('w-11 px-4', classNames?.selectionCell)}
            >
              <Checkbox
                data-testid={partTestId(view.testId, 'selectPage', group.id)}
                className={classNames?.checkbox}
                aria-label={t('table.selectPage')}
                checked={
                  table.getIsAllPageRowsSelected()
                    ? true
                    : table.getIsSomePageRowsSelected()
                      ? 'indeterminate'
                      : false
                }
                disabled={loading || !table.getRowModel().rows.length}
                onCheckedChange={(checked) =>
                  table.toggleAllPageRowsSelected(checked === true)
                }
              />
            </th>
          )}
          {group.headers.map((header) => {
            const sorted = header.column.getIsSorted();

            return (
              <th
                data-testid={partTestId(view.testId, 'headerCell', header.id)}
                key={header.id}
                style={resizable ? { width: header.getSize() } : undefined}
                colSpan={header.colSpan}
                scope="col"
                aria-sort={
                  header.isPlaceholder || !header.column.getCanSort()
                    ? undefined
                    : sorted === 'asc'
                      ? 'ascending'
                      : sorted === 'desc'
                        ? 'descending'
                        : 'none'
                }
                className={cn(
                  'relative h-12 whitespace-nowrap px-4 font-medium',
                  header.subHeaders.length
                    ? 'text-left'
                    : columnAlign(table, header.column).text,
                  classNames?.headerCell,
                )}
              >
                {header.isPlaceholder ? null : header.column.getCanSort() ? (
                  <button
                    data-testid={partTestId(
                      view.testId,
                      'sortButton',
                      header.column.id,
                    )}
                    type="button"
                    disabled={loading}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      '-mx-2 inline-flex min-h-9 items-center gap-2 rounded-control px-2 text-left transition-colors hover:bg-hover-strong/60 hover:text-ink disabled:cursor-wait',
                      focusRingClassName,
                      Boolean(sorted) && 'text-accent',
                      classNames?.sortButton,
                    )}
                    title={
                      sorted === 'asc'
                        ? t('table.sortAsc')
                        : sorted === 'desc'
                          ? t('table.sortDesc')
                          : t('table.sort')
                    }
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <Icon
                      data-testid={partTestId(
                        view.testId,
                        'sortIcon',
                        header.column.id,
                      )}
                      className={cn('size-4 shrink-0', classNames?.sortIcon)}
                      name={
                        sorted === 'asc'
                          ? 'sortAscending'
                          : sorted === 'desc'
                            ? 'sortDescending'
                            : 'sortUnsorted'
                      }
                      strokeWidth={1.6}
                    />
                  </button>
                ) : (
                  flexRender(header.column.columnDef.header, header.getContext())
                )}
                {resizable && header.column.getCanResize() && (
                  <div
                    data-testid={partTestId(
                      view.testId,
                      'resizeHandle',
                      header.column.id,
                    )}
                    role="separator"
                    aria-label={t('table.resize', { id: header.column.id })}
                    aria-orientation="vertical"
                    aria-valuenow={header.getSize()}
                    aria-valuemin={header.column.columnDef.minSize ?? 20}
                    tabIndex={0}
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onDoubleClick={() => header.column.resetSize()}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                        event.preventDefault();

                        table.setColumnSizing((current) => ({
                          ...current,
                          [header.column.id]: Math.max(
                            header.column.columnDef.minSize ?? 20,
                            Math.min(
                              header.column.columnDef.maxSize ??
                                Number.MAX_SAFE_INTEGER,
                              header.getSize() +
                                (event.key === 'ArrowRight' ? 10 : -10),
                            ),
                          ),
                        }));
                      }
                    }}
                    className={cn(
                      'absolute inset-y-2 right-0 w-1 touch-none cursor-col-resize rounded bg-line opacity-60 hover:bg-focus',
                      focusRingClassName,
                      classNames?.resizeHandle,
                    )}
                  />
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
