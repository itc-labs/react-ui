import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataTable, type ColumnDef } from './index';

type Row = { id: string; name: string; qty: number; action: string };
const rows: Row[] = [{ id: 'one', name: 'Lorem', qty: 2, action: 'Ipsum' }];

const render = (columns: ColumnDef<Row, unknown>[]) =>
  renderToStaticMarkup(
    <DataTable
      caption="Alignment"
      rows={rows}
      columns={columns}
      rowId={(row) => row.id}
      data-testid="table"
    />,
  );

const classOf = (html: string, testId: string) =>
  html.match(new RegExp(`data-testid="${testId}"[^>]*class="([^"]*)"`))?.[1] ?? '';

it('aligns the first column left and the last column right by default', () => {
  const html = render([
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'qty', header: 'Qty' },
    { accessorKey: 'action', header: 'Action' },
  ]);

  expect(classOf(html, 'table-headerCell-name')).toContain('text-left');
  expect(classOf(html, 'table-cell-one-name')).toContain('text-left');
  expect(classOf(html, 'table-cell-one-qty')).toContain('text-left');
  expect(classOf(html, 'table-headerCell-action')).toContain('text-right');
  expect(classOf(html, 'table-cell-one-action')).toContain('text-right');
});

it('lets column meta override alignment and keeps a single column left', () => {
  const html = render([
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'qty', header: 'Qty', meta: { align: 'right' } },
    { accessorKey: 'action', header: 'Action', meta: { align: 'center' } },
  ]);

  expect(classOf(html, 'table-cell-one-qty')).toContain('text-right');
  expect(classOf(html, 'table-cell-one-action')).toContain('text-center');
  expect(
    classOf(render([{ accessorKey: 'name', header: 'Name' }]), 'table-cell-one-name'),
  ).toContain('text-left');
});
