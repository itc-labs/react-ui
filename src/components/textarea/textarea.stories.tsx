import { expect, userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './index';
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'Ô nhập nội dung nhiều dòng, hỗ trợ điều chỉnh chiều cao. Label, hint và error được liên kết với control; ứng dụng đặt giới hạn độ dài bằng maxLength hoặc validation.',
      },
    },
  },
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    label: 'Ghi chú riêng',
    placeholder: 'Lorem ipsum dolor sit amet...',
    hint: 'Consectetur adipiscing elit.',
    rows: 4,
  },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-3xl gap-5 md:grid-cols-3">
      <Textarea label="Ghi chú" hint="Kết luận riêng" />
      <Textarea label="Có lỗi" error="Nội dung vượt giới hạn." />
      <Textarea
        label="Không chỉnh sửa"
        defaultValue="Lorem ipsum dolor sit amet."
        disabled
      />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Textarea
      label="Lorem ipsum"
      error="Nhập nội dung."
      className="min-h-40 rounded-panel"
      classNames={{
        label: 'text-brand-700',
        error: 'rounded-control bg-danger-50 p-2',
      }}
    />
  ),
};

export const Focus: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: {
    rootClassName: 'max-w-lg',
    hint: 'Focus thật: viền và halo nhẹ, không outline tách rời.',
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await expect(field).toHaveFocus();
  },
};

export const FocusError: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { rootClassName: 'max-w-lg', error: 'Nội dung cần kiểm tra lại.' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await expect(field).toHaveFocus();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
  },
};
