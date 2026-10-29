import type { TestIdProps } from '../../components/common/testing';
import type { ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { SlotClasses } from '../../components/common';
import type { DataTableState } from './state';
type ControlledState = {
  state: DataTableState;
  onStateChange: (next: DataTableState) => void;
};
type BaseProps<T> = {
  rows: readonly T[];
  columns: ColumnDef<T, unknown>[];
  rowId: (row: T) => string;
  classNames?: SlotClasses<
    | 'root'
    | 'toolbar'
    | 'filter'
    | 'selection'
    | 'clearSelection'
    | 'columnsTrigger'
    | 'error'
    | 'retry'
    | 'scrollArea'
    | 'table'
    | 'caption'
    | 'thead'
    | 'headerRow'
    | 'headerCell'
    | 'sortButton'
    | 'sortIcon'
    | 'resizeHandle'
    | 'tbody'
    | 'row'
    | 'selectedRow'
    | 'cell'
    | 'selectionCell'
    | 'checkbox'
    | 'skeleton'
    | 'emptyCell'
    | 'emptyState'
    | 'footer'
    | 'summary'
    | 'pageSize'
    | 'pageStatus'
    | 'pagination'
  >;
  caption: string;
  emptyText?: string;
  emptyState?: ReactNode;
  'data-testid'?: string | undefined;
  className?: string;
  loading?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  hideableColumns?: boolean;
  resizable?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
  skeletonRows?: number;
  error?: string;
  onRetry?: () => void;
  pageSizeOptions?: readonly number[];
};
export type DataTableProps<T> = (BaseProps<T> &
  (
    | (ControlledState & { mode: 'server'; rowCount: number; pagination?: never })
    | ({ mode?: 'client'; rowCount?: never; pagination?: boolean } & (
        ControlledState | { state?: never; onStateChange?: never }
      ))
  )) &
  TestIdProps;
