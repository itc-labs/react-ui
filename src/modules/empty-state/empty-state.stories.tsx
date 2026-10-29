import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { EmptyState } from './index';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
const meta = {
  title: 'Modules/EmptyState',
  component: EmptyState,
  args: {
    title: 'Chưa có dữ liệu',
    description: 'Các mục được tạo sẽ xuất hiện tại đây.',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Hiển thị khi chưa có dữ liệu, không có kết quả, không tìm thấy trang hoặc gặp lỗi. Chọn variant theo ngữ cảnh và cung cấp action để người dùng tiếp tục; size="compact" phù hợp với bảng.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

function CreateExample() {
  const [created, setCreated] = useState(false);

  return created ? (
    <div className="rounded-panel border border-line bg-surface p-6">
      <h2 className="text-section font-semibold">Lorem ipsum</h2>
      <p className="mt-2 text-control text-muted">
        Dolor sit amet, consectetur adipiscing elit.
      </p>
      <Button className="mt-4" variant="secondary" onClick={() => setCreated(false)}>
        Đặt lại ví dụ
      </Button>
    </div>
  ) : (
    <EmptyState
      title="Chưa có mục nào"
      description="Thêm mục đầu tiên để bắt đầu danh sách."
      action={<Button onClick={() => setCreated(true)}>Thêm mục</Button>}
    />
  );
}

function SearchExample() {
  const [query, setQuery] = useState('no-match');
  const rows = ['Lorem ipsum', 'Dolor sit amet'].filter((row) =>
    row.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="grid gap-4">
      <Input
        label="Tìm trong danh sách"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {rows.length ? (
        <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
          {rows.map((row) => (
            <li key={row} className="px-5 py-4 text-control">
              {row}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          variant="no-results"
          title="Không có kết quả phù hợp"
          description="Thử từ khóa khác hoặc xóa nội dung tìm kiếm."
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Xóa tìm kiếm
            </Button>
          }
        />
      )}
    </div>
  );
}

function NotFoundExample() {
  const [home, setHome] = useState(false);

  return home ? (
    <div className="grid justify-items-start gap-4 p-6">
      <h1 className="text-heading font-semibold">Trang chủ</h1>
      <p className="text-control text-muted">Lorem ipsum dolor sit amet.</p>
      <Button variant="secondary" onClick={() => setHome(false)}>
        Mở lại ví dụ 404
      </Button>
    </div>
  ) : (
    <EmptyState
      variant="not-found"
      headingLevel={1}
      code="404"
      title="Không tìm thấy trang"
      description="Trang không tồn tại hoặc đã được chuyển. Kiểm tra đường dẫn hoặc quay về trang chủ."
      action={<Button onClick={() => setHome(true)}>Về trang chủ</Button>}
      secondaryAction={
        <a
          href="#not-found-help"
          className="text-control font-medium text-brand-700 underline underline-offset-4"
        >
          Xem hướng dẫn
        </a>
      }
    />
  );
}

function RetryExample() {
  const [retried, setRetried] = useState(false),
    [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setRetried(true);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <EmptyState
      variant={retried ? 'empty' : 'error'}
      title={retried ? 'Chưa có dữ liệu' : 'Không tải được dữ liệu'}
      description={
        retried
          ? 'Kết nối đã khôi phục. Danh sách hiện chưa có mục nào.'
          : 'Kết nối bị gián đoạn. Thử tải lại để tiếp tục.'
      }
      action={
        !retried && (
          <Button loading={loading} onClick={() => setLoading(true)}>
            Thử lại
          </Button>
        )
      }
    />
  );
}

export const Default: Story = { tags: ['usage'], name: 'Playground' };

export const Gallery: Story = {
  tags: ['variants'],
  name: 'Variants',
  render: () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <EmptyState
        title="Chưa có dữ liệu"
        description="Thêm mục đầu tiên để bắt đầu danh sách."
      />
      <EmptyState
        variant="no-results"
        title="Không có kết quả phù hợp"
        description="Thử từ khóa khác hoặc bỏ bớt bộ lọc."
      />
      <EmptyState
        variant="not-found"
        code="404"
        title="Không tìm thấy trang"
        description="Kiểm tra đường dẫn hoặc quay về trang chủ."
      />
      <EmptyState
        variant="error"
        title="Không tải được dữ liệu"
        description="Kiểm tra kết nối và thử tải lại."
      />
      <EmptyState
        variant="forbidden"
        code="403"
        title="Không có quyền truy cập"
        description="Liên hệ người quản lý để được hỗ trợ."
      />
    </div>
  ),
};

export const WithAction: Story = {
  tags: ['example'],
  name: 'Actions',
  render: () => <CreateExample />,
};

export const NotFound: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-5">
      <NotFoundExample />
      <p id="not-found-help" className="text-ui-sm text-muted">
        Kiểm tra địa chỉ trang hoặc dùng menu điều hướng để mở nội dung cần tìm.
      </p>
    </div>
  ),
};

export const Layouts: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <EmptyState
        size="compact"
        title="Chưa có dữ liệu"
        description="Thêm mục đầu tiên để bắt đầu."
      />
      <EmptyState
        appearance="plain"
        title="Chưa có dữ liệu"
        description="Thêm mục đầu tiên để bắt đầu."
      />
      <EmptyState
        illustration={null}
        title="Chưa có dữ liệu"
        description="Thêm mục đầu tiên để bắt đầu."
      />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <EmptyState
      title="Chưa có dữ liệu"
      description="Các mục sẽ xuất hiện tại đây."
      classNames={{
        root: 'max-w-2xl bg-brand-50',
        illustration: 'w-40',
        title: 'text-brand-700 text-section',
        description: 'max-w-xs',
        actions: 'flex-col',
      }}
      action={<Button>Thêm mục</Button>}
    />
  ),
};

export const CreateInteraction: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <CreateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Thêm mục' }));
    await expect(canvas.getByRole('heading', { name: 'Lorem ipsum' })).toBeVisible();
  },
};

export const SearchInteraction: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SearchExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Xóa tìm kiếm' }));
    await expect(canvas.getByText('Lorem ipsum', { exact: true })).toBeVisible();
    await expect(
      canvas.getByRole('textbox', { name: 'Tìm trong danh sách' }),
    ).toHaveValue('');
  },
};

export const RetryInteraction: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RetryExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Thử lại' }));
    await expect(
      await canvas.findByRole('heading', { name: 'Chưa có dữ liệu' }),
    ).toBeVisible();
  },
};
