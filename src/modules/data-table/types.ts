import type { DataTableRowReorderPlugin } from '../dnd/integration-types';
export type { DataTableRowReorderPlugin } from '../dnd/integration-types';
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
  rowReorder?: {
    plugin: DataTableRowReorderPlugin;
    onReorder: (
      orderedIds: string[],
      move: { id: string; from: number; to: number },
    ) => void;
    handle?: boolean;
    disabled?: boolean;
    /** Explicitly permit reordering the supplied server page/group. Sorting still blocks reorder. */
    allowServerReorder?: boolean;
  };
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
    | 'dragHandle'
    | 'dragOverlay'
    | 'reorderCell'
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
