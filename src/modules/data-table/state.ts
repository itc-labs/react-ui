import {
  getFilteredRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type ColumnSizingState,
} from '@tanstack/react-table';

export interface DataTableState {
  sorting: SortingState;
  pagination: PaginationState;
  globalFilter?: string;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  rowSelection?: RowSelectionState;
  columnSizing?: ColumnSizingState;
}

export function getDataTableModels<T>(mode: 'client' | 'server', paginated: boolean) {
  return {
    getCoreRowModel: getCoreRowModel<T>(),
    manualFiltering: mode === 'server',
    manualSorting: mode === 'server',
    manualPagination: mode === 'server',
    autoResetPageIndex: false,
    ...(mode === 'client'
      ? {
          getSortedRowModel: getSortedRowModel<T>(),
          getFilteredRowModel: getFilteredRowModel<T>(),
        }
      : {}),
    ...(mode === 'client' && paginated
      ? { getPaginationRowModel: getPaginationRowModel<T>() }
      : {}),
  };
}
