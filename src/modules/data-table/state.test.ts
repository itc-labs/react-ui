import { createTable, type TableOptionsResolved } from '@tanstack/react-table';
import { expect, it } from 'vitest';
import { getDataTableModels, type DataTableState } from './state';

type Row = { id: string; value: number };

function table(
  mode: 'client' | 'server',
  state: DataTableState,
  data: Row[],
  rowCount = data.length,
) {
  return createTable<Row>({
    ...getDataTableModels<Row>(mode, true),
    data,
    ...(mode === 'server' ? { rowCount } : {}),
    columns: [{ accessorKey: 'value' }],
    state: { columnFilters: [], rowSelection: {}, columnVisibility: {}, ...state },
    onStateChange: () => {},
    renderFallbackValue: null,
    getRowId: (row) => row.id,
  } as TableOptionsResolved<Row>);
}

it('client sorts the full dataset before slicing the requested page', () => {
  const result = table(
    'client',
    {
      sorting: [{ id: 'value', desc: true }],
      pagination: { pageIndex: 1, pageSize: 2 },
    },
    [1, 4, 2, 3, 5].map((value) => ({ id: String(value), value })),
  );
  expect(result.getRowModel().rows.map((row) => row.original.value)).toEqual([3, 2]);
  expect(result.getPageCount()).toBe(3);
  expect(result.getCanNextPage()).toBe(true);
});

it('server preserves BE row order and does not paginate the current page a second time', () => {
  const result = table(
    'server',
    {
      sorting: [{ id: 'value', desc: true }],
      pagination: { pageIndex: 2, pageSize: 2 },
    },
    [
      { id: 'a', value: 1 },
      { id: 'b', value: 9 },
    ],
    6,
  );
  expect(result.getRowModel().rows.map((row) => row.original.value)).toEqual([1, 9]);
  expect(result.getPageCount()).toBe(3);
  expect(result.getCanNextPage()).toBe(false);
  expect(result.getCanPreviousPage()).toBe(true);
});

it('empty result has no previous or next page', () => {
  const result = table(
    'server',
    { sorting: [], pagination: { pageIndex: 0, pageSize: 10 } },
    [],
    0,
  );
  expect(result.getRowModel().rows).toEqual([]);
  expect(result.getCanNextPage()).toBe(false);
  expect(result.getCanPreviousPage()).toBe(false);
});

it('client filtering changes the pagination total; server filtering preserves the supplied page', () => {
  const data = [99, 1, 2, 3].map((value) => ({ id: String(value), value }));
  const state: DataTableState = {
    sorting: [],
    pagination: { pageIndex: 0, pageSize: 2 },
    globalFilter: '99',
  };
  const client = table('client', state, data);
  expect(client.getRowModel().rows.map((row) => row.original.value)).toEqual([99]);
  expect(client.getPageCount()).toBe(1);
  const server = table('server', state, data.slice(0, 2), 20);
  expect(server.getRowModel().rows).toHaveLength(2);
  expect(server.getPageCount()).toBe(10);
});

it('column visibility and selection keep stable row identity when values repeat', () => {
  const result = table(
    'client',
    {
      sorting: [],
      pagination: { pageIndex: 0, pageSize: 10 },
      rowSelection: { b: true },
    },
    [
      { id: 'a', value: 7 },
      { id: 'b', value: 7 },
    ],
  );
  expect(result.getSelectedRowModel().rows.map((row) => row.id)).toEqual(['b']);
});

it('manual pagination preserves selected IDs without retaining previous-page row objects', () => {
  const state: DataTableState = {
    sorting: [],
    pagination: { pageIndex: 1, pageSize: 2 },
    rowSelection: { a: true, c: true },
  };
  const second = table(
    'server',
    state,
    [
      { id: 'c', value: 3 },
      { id: 'd', value: 4 },
    ],
    4,
  );
  expect(second.getState().rowSelection).toEqual({ a: true, c: true });
  expect(second.getSelectedRowModel().rows.map((row) => row.id)).toEqual(['c']);
  expect(second.getCoreRowModel().rowsById.a).toBeUndefined();
  const first = table(
    'server',
    { ...state, pagination: { pageIndex: 0, pageSize: 2 } },
    [
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
    ],
    4,
  );
  expect(
    first
      .getRowModel()
      .rows.find((row) => row.id === 'a')
      ?.getIsSelected(),
  ).toBe(true);
});
