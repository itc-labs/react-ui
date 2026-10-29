import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataTable, type ColumnDef } from './index';
type Row = { id: string; name: string };
const columns: ColumnDef<Row, unknown>[] = [{ accessorKey: 'name', header: 'Tên' }];

const render = (rows: Row[]) =>
  renderToStaticMarkup(
    <DataTable
      caption="Test table"
      rows={rows}
      columns={columns}
      rowId={(row) => row.id}
      loading
      skeletonRows={3}
      emptyText="EMPTY_STATE_MARKER"
    />,
  );

it('shows skeleton rows rather than an empty-state flash during the initial request', () => {
  const html = render([]);
  const body = html.slice(html.indexOf('<tbody'), html.indexOf('</tbody>'));
  expect(body.match(/<tr\b/g)).toHaveLength(3);
  expect(html).not.toContain('EMPTY_STATE_MARKER');
  expect(html).toContain('aria-busy="true"');
});

it('keeps only caller-supplied rows readable and makes their actions inert while refreshing', () => {
  const html = render([{ id: 'one', name: 'RETAINED_ROW' }]);
  expect(html).toContain('RETAINED_ROW');
  expect(html).toContain('<tbody inert=""');
  expect(html).not.toContain('EMPTY_STATE_MARKER');
  expect(render([])).not.toContain('RETAINED_ROW'); // No internal cache of prior provider rows.
});
