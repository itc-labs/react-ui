import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable, type ColumnDef, type DataTableState } from './index';

type Example = { id: string; label: string; state: string };
const columns: ColumnDef<Example, unknown>[] = [
  { accessorKey: 'label', header: 'Tên' },
  { accessorKey: 'state', header: 'Trạng thái' },
];
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'Bảng dữ liệu có sắp xếp, phân trang, chọn dòng và tùy chỉnh cột. Dùng mode="server" với state, onStateChange và rowCount khi ứng dụng quản lý dữ liệu từ server; mặc định bảng xử lý dữ liệu tại client. ',
      },
    },
  },
  title: 'Modules/DataTable',
  component: DataTable,
  args: {
    caption: 'Danh sách',
    rowId: (row: Example) => row.id,
    columns,
    rows: [
      { id: 'a', label: 'Lorem ipsum', state: 'Mục A' },
      { id: 'b', label: 'Dolor sit amet', state: 'Mục B' },
    ],
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

type MetricFixture = { id: string; item: string; value: number | null };
const metricColumns: ColumnDef<MetricFixture, unknown>[] = [
  { accessorKey: 'item', header: 'Item minh họa' },
  {
    id: 'value',
    accessorFn: (row) => row.value ?? undefined,
    header: 'Giá trị giả lập',
    sortUndefined: 'last',
    cell: ({ row }) =>
      row.original.value === null
        ? 'Chưa có'
        : row.original.value.toLocaleString('vi-VN'),
  },
];

const pageRows: Example[] = Array.from({ length: 57 }, (_, index) => ({
  id: String(index + 1),
  label: `Mẫu ${String(index + 1).padStart(2, '0')}`,
  state: index % 2 ? 'Đáng thử' : 'Đang nghiên cứu',
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
        Ví dụ gồm 57 dòng và mô phỏng độ trễ để kiểm tra trạng thái tải.
      </p>
      <DataTable
        mode="server"
        caption="Phân trang từ server minh họa"
        rows={page}
        columns={columns}
        rowId={(row) => row.id}
        rowCount={57}
        state={state}
        onStateChange={setState}
        loading={loading}
      />
      <output
        aria-label="Tham số request minh họa"
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
      caption="Lỗi tải danh sách — fixture"
      rows={failed ? [] : pageRows.slice(0, 3)}
      columns={columns}
      rowId={(row) => row.id}
      {...(failed
        ? {
            error: 'Chưa kết nối được máy chủ. Thử lại bằng dữ liệu minh họa.',
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
          Mô phỏng tải lại
        </button>
      </div>
      <DataTable
        caption="Cập nhật không nhảy layout"
        rows={pageRows.slice(0, 5)}
        columns={columns}
        rowId={(row) => row.id}
        pagination
        loading={loading}
      />
      <output>Lần cập nhật: {revision}</output>
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
          caption="Chọn qua nhiều trang"
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
          caption="Chọn qua nhiều trang"
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

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-6">
      <DataTable<Example>
        caption="Trống"
        rows={[]}
        columns={columns}
        rowId={(row) => row.id}
      />
      <DataTable<Example>
        caption="Đang tải"
        rows={[]}
        columns={columns}
        rowId={(row) => row.id}
        loading
        skeletonRows={3}
      />
      <RetryExample />
      <RefreshExample />
    </div>
  ),
};

export const MissingValues: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-3">
      <p className="text-ui-sm text-muted">
        Fixture minh họa, không phải dữ liệu thị trường. Bấm sort để so sánh 0 và null.
      </p>
      <DataTable<MetricFixture>
        caption="Giá trị trống và số 0"
        columns={metricColumns}
        rowId={(row) => row.id}
        rows={[
          { id: 'zero', item: 'Fixture Zero', value: 0 },
          { id: 'known', item: 'Fixture Known', value: 42 },
          { id: 'unknown', item: 'Fixture Missing', value: null },
        ]}
      />
    </div>
  ),
};

export const ClientPagination: Story = {
  tags: ['example'],
  render: () => (
    <DataTable
      caption="Danh sách minh họa"
      rows={pageRows}
      columns={columns}
      rowId={(row) => row.id}
      pagination
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Trang 3' }));
    await expect(canvas.getByText('Mẫu 21')).toBeVisible();
    await userEvent.click(canvas.getByRole('combobox', { name: 'Số dòng' }));
    await userEvent.click(
      within(document.body).getByRole('option', { name: '20 dòng' }),
    );
    await expect(canvas.getByText('Trang 1 / 3')).toBeVisible();
    await expect(canvas.getByText('Mẫu 01')).toBeVisible();
  },
};

export const ServerPagination: Story = {
  tags: ['example'],
  render: () => <ServerExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole('button', { name: 'Trang sau' });
    await waitFor(() => expect(next).toBeEnabled());
    await userEvent.click(next);
    await expect(await canvas.findByText('Mẫu 11')).toBeVisible();
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Trang 4' })).toBeEnabled(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Trang 4' }));
    await expect(await canvas.findByText('Mẫu 31')).toBeVisible();
    await expect(canvas.getByLabelText('Tham số request minh họa')).toHaveTextContent(
      'page=4&pageSize=10',
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Tên' })).toBeEnabled(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Tên' }));
    await waitFor(() =>
      expect(canvas.getByLabelText('Tham số request minh họa')).toHaveTextContent(
        'page=1&pageSize=10&sort=label&direction=asc',
      ),
    );
    await expect(await canvas.findByText('Mẫu 01')).toBeVisible();
  },
};

export const Advanced: Story = {
  tags: ['example'],
  name: 'Column controls',
  render: () => (
    <DataTable
      caption="Danh sách đầy đủ tính năng"
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
      canvas.getByRole('checkbox', { name: 'Chọn tất cả dòng trên trang' }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('10 dòng đã chọn');
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Tìm trong Danh sách đầy đủ tính năng' }),
      'Mẫu 57',
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '10 dòng đã chọn · 0 trên trang này',
    );
    await expect(canvas.getByText('1–1 / 1 kết quả')).toBeVisible();
    const resize = canvas.getByRole('separator', { name: 'Đổi độ rộng cột label' });
    const width = Number(resize.getAttribute('aria-valuenow'));
    await userEvent.click(resize);
    await userEvent.keyboard('{ArrowRight}');
    await expect(resize).toHaveAttribute('aria-valuenow', String(width + 10));
    await userEvent.click(canvas.getByRole('button', { name: 'Cột hiển thị' }));
    await userEvent.click(
      await within(document.body).findByRole('menuitemcheckbox', {
        name: 'Trạng thái',
      }),
    );
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.queryByRole('button', { name: 'Trạng thái' }),
    ).not.toBeInTheDocument();
  },
};

export const ResponsiveLongContent: Story = {
  tags: ['example'],
  name: 'Responsive',
  render: () => (
    <div className="grid gap-4">
      <DataTable
        caption="Dữ liệu dài giữ scroll trong bảng"
        columns={columns}
        rowId={(row) => row.id}
        rows={[{ id: 'long', label: 'LongItem'.repeat(30), state: 'Đang nghiên cứu' }]}
        pagination
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', {
      name: 'Dữ liệu dài giữ scroll trong bảng',
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
          'Selection dùng row ID ổn định nên được giữ khi chuyển trang. Hai ví dụ lần lượt phân trang tại client và server; checkbox tiêu đề chỉ chọn trang hiện tại.',
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
    await userEvent.click(canvas.getByRole('button', { name: 'Mô phỏng tải lại' }));
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByText('Mẫu 01')).toBeVisible();
    await expect(table.getBoundingClientRect().height).toBe(height);
    await expect(table.querySelector('tbody')).toHaveAttribute('inert');
    await expect(canvas.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
    await waitFor(() => expect(table).toHaveAttribute('aria-busy', 'false'), {
      timeout: 2500,
    });
    await expect(canvas.getByText('Lần cập nhật: 1')).toBeVisible();
  },
};

export const NoResults: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <DataTable
      caption="Tìm trong danh sách"
      rows={pageRows}
      columns={columns}
      rowId={(row) => row.id}
      pagination
      filterable
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      input = canvas.getByRole('textbox', { name: 'Tìm trong Tìm trong danh sách' });
    await userEvent.type(input, 'no-match-example');
    await expect(
      canvas.getByRole('heading', { name: 'Không có kết quả phù hợp' }),
    ).toBeVisible();
    await expect(canvas.getByText('0 kết quả')).toBeVisible();
    await userEvent.clear(input);
    await expect(canvas.getByText('Mẫu 01')).toBeVisible();
  },
};

export const ServerCrossPageSelection: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SelectionPages server />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Chọn dòng 1' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Trang 2' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Chọn dòng 11' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Trang 3' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Chọn dòng 21' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Trang 1' }));
    await expect(canvas.getByRole('checkbox', { name: 'Chọn dòng 1' })).toBeChecked();
    await expect(
      canvas.getByRole('status', { name: 'Trạng thái lựa chọn' }),
    ).toHaveTextContent('3 dòng đã chọn · 1 trên trang này');
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Chọn tất cả dòng trên trang' }),
    );
    await expect(
      canvas.getByRole('status', { name: 'Trạng thái lựa chọn' }),
    ).toHaveTextContent('12 dòng đã chọn · 10 trên trang này');
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Chọn tất cả dòng trên trang' }),
    );
    await expect(
      canvas.getByRole('status', { name: 'Trạng thái lựa chọn' }),
    ).toHaveTextContent('2 dòng đã chọn · 0 trên trang này');
    await userEvent.click(canvas.getByRole('button', { name: 'Trang 2' }));
    await expect(canvas.getByRole('checkbox', { name: 'Chọn dòng 11' })).toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Bỏ chọn tất cả' }));
    await expect(canvas.getByLabelText('Selected IDs')).toHaveTextContent('none');
  },
};

export const ClientCrossPageSelection: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SelectionPages />,
  play: ServerCrossPageSelection.play!,
};
