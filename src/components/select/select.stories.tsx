import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Select } from './index';
const options = [
  { value: '', label: 'Không có — mục gốc' },
  { value: 'pets', label: 'Pets' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'later', label: 'Chưa khả dụng', disabled: true },
];

function Demo() {
  const [value, setValue] = useState<string | null>('');

  return (
    <div className="grid max-w-lg gap-5">
      <Select
        label="Category cha"
        value={value}
        onValueChange={setValue}
        options={options}
      />
      <Select
        label="Lựa chọn bị lỗi"
        options={options}
        required
        error="Hãy chọn một mục."
      />
      <Select label="Đang tải" options={[]} loading />
      <Select label="Không chỉnh sửa" options={options} disabled value="pets" />
      <Select
        label="Chọn nhiều"
        multiple
        options={options}
        defaultValue={['pets']}
        clearable
      />
      <output>Đang chọn: {value || 'gốc'}</output>
    </div>
  );
}

const meta = {
  title: 'Components/Select',
  component: Select,
  args: { label: 'Danh mục', options },
  parameters: {
    docs: {
      description: {
        component:
          'Chọn một hoặc nhiều giá trị; bật searchable để tìm trong danh sách. Với dữ liệu từ server, ứng dụng cung cấp options và xử lý tìm kiếm/tải thêm; nhãn của mục đã chọn được giữ khi danh sách thay đổi.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const remoteRows = Array.from({ length: 24 }, (_, index) => ({
  value: String(index + 1),
  label: `Option ${String(index + 1).padStart(2, '0')}`,
}));

function RemoteExample({
  multiple = false,
  initialSearch = '',
}: {
  multiple?: boolean;
  initialSearch?: string;
}) {
  const [inputValue, setInputValue] = useState(initialSearch);
  const [query, setQuery] = useState(initialSearch),
    [page, setPage] = useState(0),
    [value, setValue] = useState<string | null>('1'),
    [values, setValues] = useState<string[]>(['1']);
  const [rows, setRows] = useState<typeof remoteRows>([]),
    [loading, setLoading] = useState(true),
    [loadingMore, setLoadingMore] = useState(false),
    [total, setTotal] = useState(0),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (inputValue !== query) {
      setLoading(true);
      setLoadingMore(false);

      return;
    }
    if (page === 0) {
      setLoading(true);
      setRows([]);
    } else setLoadingMore(true);
    setError('');
    const timer = setTimeout(
      () => {
        if (query === 'fail') {
          setError('Không tải được lựa chọn. Thay từ khóa hoặc thử lại.');
          setLoading(false);
          setLoadingMore(false);

          return;
        }
        const result = remoteRows.filter((row) =>
          row.label.toLowerCase().includes(query.toLowerCase()),
        );
        setRows(result.slice(0, (page + 1) * 5));
        setTotal(result.length);
        setLoading(false);
        setLoadingMore(false);
      },
      query === 'Option 2' ? 600 : 200,
    );

    return () => clearTimeout(timer);
  }, [inputValue, query, page, attempt]);

  const common = {
    label: 'Chọn mục từ server',
    options: rows,
    selectedOptions: [remoteRows[0]!],
    searchable: true,
    searchMode: 'server' as const,
    inputValue,
    onInputChange: setInputValue,
    onSearchChange: (next: string) => {
      setQuery(next);
      setPage(0);
    },
    loading,
    loadingMore,
    hasMore: rows.length < total,
    onLoadMore: () => setPage((current) => current + 1),
    optionsError: error,
    onRetryOptions: () => setAttempt((current) => current + 1),
    clearable: true,
  };

  return (
    <div className="grid max-w-lg gap-4">
      {multiple ? (
        <Select {...common} multiple value={values} onValueChange={setValues} />
      ) : (
        <Select {...common} value={value} onValueChange={setValue} />
      )}
      <output aria-label="Trạng thái danh sách">
        {loading || loadingMore ? 'Đang tải' : 'Sẵn sàng'}
      </output>
      <output aria-label="Giá trị đã chọn">
        {multiple ? values.join(',') : (value ?? 'none')}
      </output>
      <p className="text-ui-sm text-muted">
        Mock server: 5 lựa chọn/trang. Search “Option 1”, “Option 2” hoặc “fail”. Không
        gọi API thật.
      </p>
    </div>
  );
}

function DebouncedSearchExample() {
  const [input, setInput] = useState(''),
    [query, setQuery] = useState(''),
    [calls, setCalls] = useState(0);

  return (
    <div className="grid max-w-lg gap-4">
      <Select
        label="Search debounce"
        searchable
        searchMode="server"
        searchDebounceMs={300}
        inputValue={input}
        onInputChange={setInput}
        onSearchChange={(next) => {
          setQuery(next);

          setCalls((count) => count + 1);
        }}
        options={remoteRows.filter((row) =>
          row.label.toLowerCase().includes(query.toLowerCase()),
        )}
        defaultValue="1"
        selectedOptions={[remoteRows[0]!]}
        clearable
      />
      <output aria-label="Input query">{input || '—'}</output>
      <output aria-label="Search query">{query || '—'}</output>
      <output aria-label="Search calls">{calls}</output>
    </div>
  );
}

export const Playground: Story = { tags: ['usage'] };

export const States: Story = { tags: ['states'], render: () => <Demo /> };

export const Searchable: Story = {
  tags: ['example'],
  render: () => (
    <Select
      label="Tìm mục"
      searchable
      clearable
      options={[
        { value: 'a', label: 'Lorem ipsum' },
        { value: 'b', label: 'Dolor sit amet' },
        { value: 'c', label: 'Consectetur adipiscing' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('combobox', { name: 'Tìm mục' }), 'Dolor');
    await userEvent.click(
      await within(document.body).findByRole('option', { name: 'Dolor sit amet' }),
    );
    await expect(canvas.getByText('Dolor sit amet')).toBeVisible();
  },
};

export const RemoteSearchAndLoadMore: Story = {
  tags: ['example'],
  name: 'Remote options',
  render: () => <RemoteExample />,
};

export const RemoteMultiSelect: Story = {
  tags: ['example'],
  name: 'Remote multiple',
  render: () => <RemoteExample multiple />,
};

export const RemoteFailure: Story = {
  tags: ['example'],
  name: 'Remote error',
  render: () => <RemoteExample initialSearch="fail" />,
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Select
      label="Lorem ipsum"
      searchable
      clearable
      options={[
        { value: 'a', label: 'Dolor sit amet' },
        { value: 'b', label: 'Consectetur adipiscing' },
      ]}
      defaultValue="a"
      hint="Gõ để tìm lựa chọn."
      classNames={{
        root: 'max-w-sm',
        label: 'font-bold text-brand-700',
        control: 'min-h-12 rounded-full bg-brand-50',
        menu: 'rounded-panel shadow-overlay',
        option: ({ isSelected }) =>
          isSelected ? 'rounded-full bg-brand-800 px-5' : 'rounded-full px-5',
        hint: 'italic',
      }}
    />
  ),
};

export const KeyboardSelection: Story = {
  render: () => <Demo />,
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Category cha' });
    await userEvent.click(select);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByText('Đang chọn: pets')).toBeVisible();
  },
};

export const RemoteSelectionRetention: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RemoteExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    await waitFor(() =>
      expect(canvas.getByLabelText('Trạng thái danh sách')).toHaveTextContent(
        'Sẵn sàng',
      ),
    );
    const input = canvas.getByRole('combobox', { name: 'Chọn mục từ server' });
    await userEvent.click(input);
    await userEvent.click(body.getByRole('button', { name: 'Tải thêm lựa chọn' }));
    await waitFor(() =>
      expect(canvas.getByLabelText('Trạng thái danh sách')).toHaveTextContent(
        'Sẵn sàng',
      ),
    );
    await userEvent.click(input);
    await userEvent.type(input, 'Option 1');
    await userEvent.click(await body.findByRole('option', { name: 'Option 10' }));
    await expect(canvas.getByLabelText('Giá trị đã chọn')).toHaveTextContent('10');
    await userEvent.clear(input);
    await userEvent.type(input, 'Option 1');
    await body.findByRole('option', { name: 'Option 14' });
    await userEvent.keyboard('{Alt>}{End}{/Alt}');
    await body.findByRole('option', { name: 'Option 19' });
    await expect(canvas.getByLabelText('Giá trị đã chọn')).toHaveTextContent('10');
    await userEvent.clear(input);
    await userEvent.type(input, 'Option 2');
    await body.findByRole('option', { name: 'Option 20' });
    await expect(canvas.getByLabelText('Giá trị đã chọn')).toHaveTextContent('10');
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByText('Option 10', { exact: true })).toBeVisible();
  },
};

export const RemoteSearchRace: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RemoteExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body),
      input = canvas.getByRole('combobox', { name: 'Chọn mục từ server' });
    await waitFor(() =>
      expect(canvas.getByLabelText('Trạng thái danh sách')).toHaveTextContent(
        'Sẵn sàng',
      ),
    );
    await userEvent.type(input, 'Option 2');
    await userEvent.clear(input);
    await userEvent.type(input, 'Option 1');
    await body.findByRole('option', { name: 'Option 10' });
    await new Promise((resolve) => setTimeout(resolve, 700));
    await expect(
      body.queryByRole('option', { name: 'Option 20' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByLabelText('Giá trị đã chọn')).toHaveTextContent('1');
    await userEvent.keyboard('{Escape}');
  },
};

export const RemoteMultiRetention: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RemoteExample multiple />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body),
      input = canvas.getByRole('combobox', { name: 'Chọn mục từ server' });
    await waitFor(() =>
      expect(canvas.getByLabelText('Trạng thái danh sách')).toHaveTextContent(
        'Sẵn sàng',
      ),
    );
    await userEvent.type(input, 'Option 1');
    await userEvent.click(await body.findByRole('option', { name: 'Option 10' }));
    await userEvent.type(input, 'Option 2');
    await body.findByRole('option', { name: 'Option 20' });
    await expect(canvas.getByLabelText('Giá trị đã chọn')).toHaveTextContent('1,10');
    await expect(canvas.getByText('Option 01', { exact: true })).toBeVisible();
    await expect(canvas.getByText('Option 10', { exact: true })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const DebouncedSearch: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <DebouncedSearchExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('combobox', { name: 'Search debounce' }),
      'Option 1',
    );
    await expect(canvas.getByLabelText('Input query')).toHaveTextContent('Option 1');
    await waitFor(() =>
      expect(canvas.getByLabelText('Search query')).toHaveTextContent('Option 1'),
    );
    await expect(canvas.getByLabelText('Search calls')).toHaveTextContent('1');
  },
};
