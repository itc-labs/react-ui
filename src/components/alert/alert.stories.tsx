import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './index';

function Demo() {
  return (
    <div className="grid max-w-xl gap-3">
      <Alert tone="neutral">Lorem ipsum dolor sit amet.</Alert>
      <Alert title="Nguồn dữ liệu" tone="info">
        Chỉ là ví dụ giao diện.
      </Alert>
      <Alert tone="warning" title="Cần kiểm tra lại">
        Ngày cập nhật chưa xác định.
      </Alert>
      <Alert tone="danger">Chưa kết nối được máy chủ.</Alert>
      <Alert tone="success">Đã lưu kết luận riêng.</Alert>
      <Alert variant="inline" tone="success">
        Đã lưu.
      </Alert>
    </div>
  );
}

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: { title: 'Thông báo', children: 'Lorem ipsum dolor sit amet.' },
  parameters: {
    docs: {
      description: {
        component:
          'Hiển thị thông báo theo mức độ info, success, warning hoặc danger. Dùng tone="neutral" cho thông báo trung tính. Dùng variant="inline" cho phản hồi ngắn trong nội dung; action nhận nút hoặc liên kết do ứng dụng cung cấp.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Variants: Story = { tags: ['variants'], render: () => <Demo /> };

export const Inline: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-xl gap-3">
      <Alert variant="inline" tone="neutral">
        Lorem ipsum dolor sit amet.
      </Alert>
      <Alert variant="inline" tone="info">
        Thông tin bổ sung.
      </Alert>
      <Alert variant="inline" tone="success">
        Đã lưu.
      </Alert>
      <Alert variant="inline" tone="warning">
        Kiểm tra lại nội dung.
      </Alert>
      <Alert variant="inline" tone="danger">
        Không lưu được nội dung.
      </Alert>
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Alert
      title="Thông báo"
      className="max-w-lg rounded-panel"
      classNames={{
        icon: 'size-6 text-brand-700',
        title: 'uppercase',
        content: 'space-y-2',
      }}
    >
      Lorem ipsum dolor sit amet.
    </Alert>
  ),
};
