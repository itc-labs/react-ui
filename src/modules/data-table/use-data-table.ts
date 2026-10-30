'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { functionalUpdate, useReactTable } from '@tanstack/react-table';
import { useUILocale } from '../../i18n/provider';
import { getDataTableModels, type DataTableState } from './state';
import type { DataTableProps } from './types';

export function useDataTable<T>(props: DataTableProps<T>) {
  const { t } = useUILocale();
  const {
    rows,
    columns,
    rowId,
    caption,
    emptyText = t('table.empty'),
    loading = false,
    error,
    onRetry,
    filterable = false,
    selectable = false,
    hideableColumns = false,
    resizable = false,
    stickyHeader = false,
    maxHeight = '28rem',
    skeletonRows,
    classNames,
    mode = 'client',
    pageSizeOptions = [10, 20, 50],
  } = props;
  const paginated = mode === 'server' || props.pagination === true;
  const [localState, setLocalState] = useState<DataTableState>({
    sorting: [],
    pagination: { pageIndex: 0, pageSize: 10 },
  });
  const state = props.state ?? localState;
  const change = props.onStateChange ?? setLocalState;
  const scrollRef = useRef<HTMLDivElement>(null);
  const data = useMemo(() => [...rows], [rows]);
  const table = useReactTable({
    data,
    columns,
    getRowId: rowId,
    state: {
      ...state,
      globalFilter: state.globalFilter ?? '',
      columnFilters: state.columnFilters ?? [],
      columnVisibility: state.columnVisibility ?? {},
      rowSelection: state.rowSelection ?? {},
      columnSizing: state.columnSizing ?? {},
    },
    ...getDataTableModels<T>(mode, paginated),
    ...(mode === 'server' ? { rowCount: props.rowCount! } : {}),
    enableRowSelection: selectable,
    enableColumnResizing: resizable,
    columnResizeMode: 'onChange',
    enableMultiSort: false,
    onGlobalFilterChange: (updater) =>
      change({
        ...state,
        globalFilter: functionalUpdate(updater, state.globalFilter ?? ''),
        pagination: { ...state.pagination, pageIndex: 0 },
      }),
    onColumnFiltersChange: (updater) =>
      change({
        ...state,
        columnFilters: functionalUpdate(updater, state.columnFilters ?? []),
        pagination: { ...state.pagination, pageIndex: 0 },
      }),
    onColumnVisibilityChange: (updater) =>
      change({
        ...state,
        columnVisibility: functionalUpdate(updater, state.columnVisibility ?? {}),
      }),
    onRowSelectionChange: (updater) =>
      change({
        ...state,
        rowSelection: functionalUpdate(updater, state.rowSelection ?? {}),
      }),
    onColumnSizingChange: (updater) =>
      change({
        ...state,
        columnSizing: functionalUpdate(updater, state.columnSizing ?? {}),
      }),
    onSortingChange: (updater) =>
      change({
        ...state,
        sorting: functionalUpdate(updater, state.sorting),
        pagination: { ...state.pagination, pageIndex: 0 },
      }),
    onPaginationChange: (updater) =>
      change({ ...state, pagination: functionalUpdate(updater, state.pagination) }),
  });

  useEffect(() => {
    if (
      !resizable ||
      Object.keys(state.columnSizing ?? {}).length ||
      !scrollRef.current
    )
      return;
    const visible = table.getVisibleLeafColumns();
    const available =
      scrollRef.current.clientWidth -
      (selectable ? 44 : 0) -
      (props.rowReorder && props.rowReorder.handle !== false ? 44 : 0);
    if (available <= 0 || !visible.length) return;
    change({
      ...state,
      columnSizing: Object.fromEntries(
        visible.map((column) => [
          column.id,
          Math.max(
            column.columnDef.minSize ?? 20,
            Math.min(
              column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER,
              Math.floor(available / visible.length),
            ),
          ),
        ]),
      ),
    });
  }, [resizable, selectable, state, table, change]);

  const count =
    mode === 'server' ? props.rowCount! : table.getFilteredRowModel().rows.length;
  const pages = Math.max(1, Math.ceil(count / state.pagination.pageSize));

  // A deletion/filter can remove the last page; request the new last page once.
  useEffect(() => {
    if (paginated && !loading && !error && state.pagination.pageIndex >= pages) {
      change({ ...state, pagination: { ...state.pagination, pageIndex: pages - 1 } });
    }
  }, [paginated, loading, error, state, pages, change]);

  const visibleRows = table.getRowModel().rows;
  const page = Math.min(state.pagination.pageIndex, pages - 1);
  const start = count === 0 ? 0 : page * state.pagination.pageSize + 1;
  const end = Math.min(count, start + visibleRows.length - 1);
  const sizes = [
    ...new Set([
      ...pageSizeOptions.filter((size) => size > 0 && Number.isInteger(size)),
      state.pagination.pageSize,
    ]),
  ].sort((a, b) => a - b);
  const initialLoading = loading && visibleRows.length === 0;
  const placeholders = Math.max(
    1,
    Math.floor(skeletonRows ?? (paginated ? state.pagination.pageSize : 5)),
  );

  const rowReorder = props.rowReorder;
  const reorderReason = state.sorting.length
    ? t('table.reorderSorted')
    : mode === 'server' && !rowReorder?.allowServerReorder
      ? t('table.reorderServer')
      : undefined;
  const reorderDisabled = Boolean(loading || rowReorder?.disabled || reorderReason);
  const reorderHandle = Boolean(rowReorder && rowReorder.handle !== false);

  return {
    rowReorder,
    reorderDisabled,
    reorderHandle,
    reorderReason,
    testId: props['data-testid'],
    table,
    state,
    change,
    scrollRef,
    count,
    pages,
    visibleRows,
    page,
    start,
    end,
    sizes,
    initialLoading,
    placeholders,
    paginated,
    loading,
    error,
    onRetry,
    selectable,
    resizable,
    stickyHeader,
    caption,
    filterable,
    hideableColumns,
    emptyText,
    classNames,
    maxHeight,
    emptyState: props.emptyState,
  };
}

export type DataTableView<T> = ReturnType<typeof useDataTable<T>>;
