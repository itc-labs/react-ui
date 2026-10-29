import type { Column, RowData, Table } from '@tanstack/react-table';

export type DataTableAlign = 'left' | 'center' | 'right';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Horizontal alignment. Defaults to left; the last visible column defaults to right. */
    align?: DataTableAlign;
  }
}

const textClass = { left: 'text-left', center: 'text-center', right: 'text-right' };
const blockClass = { left: '', center: 'mx-auto', right: 'ml-auto' };

export function columnAlign<T>(table: Table<T>, column: Column<T, unknown>) {
  const leaves = table.getVisibleLeafColumns();
  const align =
    column.columnDef.meta?.align ??
    (leaves.length > 1 && leaves.at(-1)?.id === column.id ? 'right' : 'left');

  return { align, text: textClass[align], block: blockClass[align] };
}
