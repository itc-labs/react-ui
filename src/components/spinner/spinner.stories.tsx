import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './index';

function Demo() {
  return (
    <div className="flex gap-3 text-muted">
      <Spinner label="Đang mở dữ liệu minh họa" />
      Đang mở…
    </div>
  );
}

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { label: 'Đang tải' },
  parameters: {
    docs: {
      description: {
        component:
          'Biểu thị tác vụ đang xử lý. label cung cấp nội dung cho trình đọc màn hình; size thay đổi kích thước biểu tượng.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Sizes: Story = { tags: ['example'], render: () => <Demo /> };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Spinner
      label="Đang tải"
      className="rounded-full bg-brand-50 p-3"
      classNames={{ icon: 'size-6 text-brand-700' }}
    />
  ),
};
