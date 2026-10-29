import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './index';
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'Native button có variants, kích thước và loading; mặc định type=button. Dùng Form.SubmitButton cho submit được bind với form state.',
      },
    },
  },
  title: 'Components/Button',
  component: Button,
  args: { children: 'Lưu', onClick: fn() },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Variants: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['primary', 'secondary', 'ghost', 'danger'] as const).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Button key={size} size={size}>
          {size} · {size === 'sm' ? '32' : size === 'md' ? '40' : '48'}px
        </Button>
      ))}
    </div>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Sẵn sàng</Button>
      <Button loading>Đang lưu</Button>
      <Button disabled>Chưa sẵn sàng</Button>
      <Button variant="danger">Xóa bản minh họa</Button>
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Button loading className="rounded-full" classNames={{ spinner: 'text-brand-100' }}>
      Lưu nội dung
    </Button>
  ),
};

export const Primary: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Loading: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { loading: true, children: 'Đang lấy dữ liệu' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button')).toBeDisabled();
  },
};
