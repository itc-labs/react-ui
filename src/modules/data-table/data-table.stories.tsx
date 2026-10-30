import { createRowReorder } from '@itclabs/react-ui/dnd';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable, type ColumnDef, type DataTableState } from './index';

type Example = { id: string; label: string; state: string };
const columns: ColumnDef<Example, unknown>[] = [
  { accessorKey: 'label', header: 'Name' },
  { accessorKey: 'state', header: 'Status' },
];
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'A data table with sorting, pagination, row selection, and column customization. Use mode="server" with state, onStateChange, and rowCount when the application manages server data; by default, the table processes data on the client.',
      },
    },
  },
  title: 'Modules/DataTable',
  component: DataTable,
  args: {
    caption: 'List',
    rowId: (row: Example) => row.id,
    columns,
    rows: [
      { id: 'a', label: 'Lorem ipsum', state: 'Lorem ipsum' },
      { id: 'b', label: 'Dolor sit amet', state: 'Dolor sit amet' },
    ],
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

type MetricFixture = { id: string; item: string; value: number | null };
const metricColumns: ColumnDef<MetricFixture, unknown>[] = [
  { accessorKey: 'item', header: 'Sample item' },
  {
    id: 'value',
    accessorFn: (row) => row.value ?? undefined,
    header: 'Sample value',
    sortUndefined: 'last',
    cell: ({ row }) =>
      row.original.value === null
        ? 'Not available'
        : row.original.value.toLocaleString('en-US'),
  },
];

const pageRows: Example[] = Array.from({ length: 57 }, (_, index) => ({
  id: String(index + 1),
  label: `Lorem ipsum ${String(index + 1).padStart(2, '0')}`,
  state: index % 2 ? 'Dolor sit amet' : 'Consectetur adipiscing',
}));

function ServerExample() {
  const [state, setState] = useState<DataTableState>({
    sorting: [],
    pagination: { pageIndex: 0, pageSize: 10 },
  });
  const [page, setPage] = useState<Example[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Mock backend latency; fixture-only. In a feature, queryKey includes state
    // and queryFn sends page/pageSize/sort to a real internal API.
    const timer = setTimeout(() => {
      const sort = state.sorting[0];
      const sorted = pageRows
        .filter(
          (row) =>
            !state.globalFilter ||
            `${row.label} ${row.state}`
              .toLowerCase()
              .includes(state.globalFilter.toLowerCase()),
        )
        .sort((a, b) =>
          sort
            ? String(a[sort.id as keyof Example]).localeCompare(
                String(b[sort.id as keyof Example]),
              ) * (sort.desc ? -1 : 1)
            : 0,
        );
      setPage(
        sorted.slice(
          state.pagination.pageIndex * state.pagination.pageSize,
          (state.pagination.pageIndex + 1) * state.pagination.pageSize,
        ),
      );
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [state.pagination, state.sorting, state.globalFilter]);

  return (
    <div className="grid gap-4">
      <p className="text-ui-sm text-muted">
        This example has 57 rows and simulates latency to demonstrate loading states.
      </p>
      <DataTable
        mode="server"
        caption="Server pagination example"
        rows={page}
        columns={columns}
        rowId={(row) => row.id}
        rowCount={57}
        state={state}
        onStateChange={setState}
        loading={loading}
      />
      <output
        aria-label="Sample request parameters"
        className="min-w-0 break-all rounded-control bg-canvas p-3 font-mono text-ui-sm text-muted"
      >
        page={state.pagination.pageIndex + 1}&amp;pageSize={state.pagination.pageSize}
        &amp;sort={state.sorting[0]?.id ?? ''}&amp;direction=
        {state.sorting[0] ? (state.sorting[0].desc ? 'desc' : 'asc') : ''}
      </output>
    </div>
  );
}

function RetryExample() {
  const [failed, setFailed] = useState(true);

  return (
    <DataTable<Example>
      caption="List loading error example"
      rows={failed ? [] : pageRows.slice(0, 3)}
      columns={columns}
      rowId={(row) => row.id}
      {...(failed
        ? {
            error: 'Could not connect to the server. Retry with sample data.',
            onRetry: () => setFailed(false),
          }
        : {})}
      pagination
    />
  );
}

function RefreshExample() {
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);

      setRevision((value) => value + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="grid gap-4">
      <div>
        <button
          type="button"
          disabled={loading}
          className="rounded-control border border-line bg-surface px-4 py-2 text-control disabled:opacity-50"
          onClick={() => setLoading(true)}
        >
          Simulate refresh
        </button>
      </div>
      <DataTable
        caption="Refresh without layout shift"
        rows={pageRows.slice(0, 5)}
        columns={columns}
        rowId={(row) => row.id}
        pagination
        loading={loading}
      />
      <output>Revision: {revision}</output>
    </div>
  );
}

function SelectionPages({ server = false }: { server?: boolean }) {
  const [state, setState] = useState<DataTableState>({
    sorting: [],
    pagination: { pageIndex: 0, pageSize: 10 },
    rowSelection: {},
  });
  const page = pageRows.slice(
    state.pagination.pageIndex * state.pagination.pageSize,
    (state.pagination.pageIndex + 1) * state.pagination.pageSize,
  );

  return (
    <div className="grid gap-4">
      {server ? (
        <DataTable
          mode="server"
          caption="Selection across pages"
          rows={page}
          rowCount={pageRows.length}
          columns={columns}
          rowId={(row) => row.id}
          state={state}
          onStateChange={setState}
          selectable
        />
      ) : (
        <DataTable
          caption="Selection across pages"
          rows={pageRows}
          columns={columns}
          rowId={(row) => row.id}
          state={state}
          onStateChange={setState}
          pagination
          selectable
          filterable
        />
      )}
      <output aria-label="Selected IDs">
        {Object.entries(state.rowSelection ?? {})
          .filter(([, selected]) => selected)
          .map(([id]) => id)
          .join(',') || 'none'}
      </output>
    </div>
  );
}

export const Sortable: Story = { tags: ['usage'], name: 'Playground' };

function MissingValuesExample() {
  return (
    <div className="grid gap-3">
      <p className="text-ui-sm text-muted">
        Sample data. Click a column header to compare sorting of 0 and null.
      </p>
      <DataTable<MetricFixture>
        caption="Missing and zero values"
        columns={metricColumns}
        rowId={(row) => row.id}
        rows={[
          { id: 'zero', item: 'Fixture Zero', value: 0 },
          { id: 'known', item: 'Fixture Known', value: 42 },
          { id: 'unknown', item: 'Fixture Missing', value: null },
        ]}
      />
    </div>
  );
}

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-6">
      <DataTable<Example>
        caption="Empty"
        rows={[]}
        columns={columns}
        rowId={(row) => row.id}
      />
      <DataTable<Example>
        caption="Loading"
        rows={[]}
        columns={columns}
        rowId={(row) => row.id}
        loading
        skeletonRows={3}
      />
      <RetryExample />
      <RefreshExample />
      <MissingValuesExample />
    </div>
  ),
};

export const MissingValues: Story = {
  tags: ['!dev', '!autodocs', 'example'],
  render: () => <MissingValuesExample />,
};

export const ClientPagination: Story = {
  tags: ['example'],
  render: () => (
    <DataTable
      caption="Sample list"
      rows={pageRows}
      columns={columns}
      rowId={(row) => row.id}
      pagination
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }));
    await expect(canvas.getByText('Lorem ipsum 21')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Rows per page' }));
    await userEvent.click(
      within(document.body).getByRole('menuitemradio', { name: '20 rows' }),
    );
    await expect(canvas.getByText('Page 1 / 3')).toBeVisible();
    await expect(canvas.getByText('Lorem ipsum 01')).toBeVisible();
  },
};

export const ServerPagination: Story = {
  tags: ['example'],
  render: () => <ServerExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole('button', { name: 'Next page' });
    await waitFor(() => expect(next).toBeEnabled());
    await userEvent.click(next);
    await expect(await canvas.findByText('Lorem ipsum 11')).toBeVisible();
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Page 4' })).toBeEnabled(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Page 4' }));
    await expect(await canvas.findByText('Lorem ipsum 31')).toBeVisible();
    await expect(canvas.getByLabelText('Sample request parameters')).toHaveTextContent(
      'page=4&pageSize=10',
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Name' })).toBeEnabled(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Name' }));
    await waitFor(() =>
      expect(canvas.getByLabelText('Sample request parameters')).toHaveTextContent(
        'page=1&pageSize=10&sort=label&direction=asc',
      ),
    );
    await expect(await canvas.findByText('Lorem ipsum 01')).toBeVisible();
  },
};

export const Advanced: Story = {
  tags: ['example'],
  name: 'Column controls',
  render: () => (
    <DataTable
      caption="Full-featured list"
      rows={pageRows}
      columns={columns}
      rowId={(row) => row.id}
      pagination
      filterable
      selectable
      hideableColumns
      resizable
      stickyHeader
      maxHeight="22rem"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select all rows on this page' }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('10 rows selected');
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Search Full-featured list' }),
      'Lorem ipsum 57',
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '10 rows selected · 0 on this page',
    );
    await expect(canvas.getByText('1–1 / 1 result')).toBeVisible();
    const resize = canvas.getByRole('separator', { name: 'Resize column label' });
    const width = Number(resize.getAttribute('aria-valuenow'));
    await userEvent.click(resize);
    await userEvent.keyboard('{ArrowRight}');
    await expect(resize).toHaveAttribute('aria-valuenow', String(width + 10));
    await userEvent.click(canvas.getByRole('button', { name: 'Show columns' }));
    await userEvent.click(
      await within(document.body).findByRole('menuitemcheckbox', {
        name: 'Status',
      }),
    );
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.queryByRole('button', { name: 'Status' }),
    ).not.toBeInTheDocument();
  },
};

export const ResponsiveLongContent: Story = {
  tags: ['example'],
  name: 'Responsive',
  render: () => (
    <div className="grid gap-4">
      <DataTable
        caption="Long content scrolls within the table"
        columns={columns}
        rowId={(row) => row.id}
        rows={[
          {
            id: 'long',
            label: 'LoremIpsum'.repeat(30),
            state: 'Consectetur adipiscing',
          },
        ]}
        pagination
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', {
      name: 'Long content scrolls within the table',
    });
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    await userEvent.click(region);
    await expect(region).toHaveFocus();
  },
};

export const Selection: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-6">
      <SelectionPages />
      <SelectionPages server />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Selection persists across pages using stable row IDs. These examples show client and server pagination; the header checkbox selects only the current page.',
      },
    },
  },
};

function RowReorderExample() {
  const [rows, setRows] = useState<Example[]>([
    { id: 'a', label: 'Lorem ipsum', state: 'Dolor sit amet' },
    { id: 'b', label: 'Dolor sit amet', state: 'Lorem ipsum' },
    { id: 'c', label: 'Consectetur adipiscing', state: 'Lorem ipsum' },
  ]);

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowId={(row) => row.id}
      caption="Reorder rows"
      rowReorder={{
        plugin: createRowReorder(),
        getLabel: (row) => row.label,
        onReorder: (ids) =>
          setRows(ids.map((id) => rows.find((row) => row.id === id)!)),
      }}
    />
  );
}

export const RowReorder: Story = {
  name: 'Row reorder',
  tags: ['example'],
  render: () => <RowReorderExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Inject createRowReorder() from @itclabs/react-ui/dnd and persist ordered IDs in onReorder. rowId supplies stable identity through getRowId. Space/Enter picks up and drops; Up/Down changes position and Escape cancels. Sorting disables reorder. Server pages and server groups require allowServerReorder: true; the host owns persistence across pages. handle defaults to true; handle: false makes the row the keyboard and pointer activator. The callback returns every supplied ID with zero-based from/to positions.',
      },
    },
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <DataTable
      caption="Lorem ipsum"
      rows={pageRows}
      columns={columns}
      rowId={(row) => row.id}
      pagination
      selectable
      filterable
      classNames={{
        root: 'rounded-none shadow-none',
        toolbar: 'bg-brand-50 p-5',
        thead: 'bg-brand-700 text-on-brand',
        headerCell: 'h-14',
        row: 'hover:bg-brand-100',
        cell: 'py-5',
        selectedRow: 'bg-brand-100',
        footer: 'bg-canvas',
        pagination: 'rounded-full border border-line bg-surface p-1',
      }}
    />
  ),
};

export const Refreshing: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RefreshExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table');
    const height = table.getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole('button', { name: 'Simulate refresh' }));
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByText('Lorem ipsum 01')).toBeVisible();
    await expect(table.getBoundingClientRect().height).toBe(height);
    await expect(table.querySelector('tbody')).toHaveAttribute('inert');
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await waitFor(() => expect(table).toHaveAttribute('aria-busy', 'false'), {
      timeout: 2500,
    });
    await expect(canvas.getByText('Revision: 1')).toBeVisible();
  },
};

export const NoResults: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <DataTable
      caption="Items"
      rows={pageRows}
      columns={columns}
      rowId={(row) => row.id}
      pagination
      filterable
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      input = canvas.getByRole('textbox', { name: 'Search Items' });
    await userEvent.type(input, 'no-match-example');
    await expect(
      canvas.getByRole('heading', { name: 'No matching results' }),
    ).toBeVisible();
    await expect(canvas.getByText('0 results')).toBeVisible();
    await userEvent.clear(input);
    await expect(canvas.getByText('Lorem ipsum 01')).toBeVisible();
  },
};

export const ServerCrossPageSelection: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SelectionPages server />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 1' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Page 2' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 11' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 21' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Page 1' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select row 1' })).toBeChecked();
    await expect(
      canvas.getByRole('status', { name: 'Selection status' }),
    ).toHaveTextContent('3 rows selected · 1 on this page');
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select all rows on this page' }),
    );
    await expect(
      canvas.getByRole('status', { name: 'Selection status' }),
    ).toHaveTextContent('12 rows selected · 10 on this page');
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select all rows on this page' }),
    );
    await expect(
      canvas.getByRole('status', { name: 'Selection status' }),
    ).toHaveTextContent('2 rows selected · 0 on this page');
    await userEvent.click(canvas.getByRole('button', { name: 'Page 2' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select row 11' })).toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }));
    await expect(canvas.getByLabelText('Selected IDs')).toHaveTextContent('none');
  },
};

export const ClientCrossPageSelection: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SelectionPages />,
  play: ServerCrossPageSelection.play!,
};
