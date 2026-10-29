import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from './index';
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'Ô nhập một dòng với label, hint, error và biểu tượng tùy chọn. Nhận các thuộc tính input chuẩn, ref và className; dùng FormField khi cần nối với trạng thái form.',
      },
    },
  },
  title: 'Components/Input',
  component: Input,
  args: {
    label: 'Nội dung',
    placeholder: 'Lorem ipsum',
    hint: 'Dolor sit amet.',
    required: true,
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Sizes: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-lg gap-5">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Input
          key={size}
          size={size}
          label={`Kích thước ${size}`}
          placeholder="Nhập nội dung"
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
      <Input label="Mặc định" placeholder="Nhập nội dung" hint="Helper text" />
      <Input label="Có nội dung" defaultValue="Item minh họa" />
      <Input label="Có lỗi" error="Nhập nội dung hợp lệ." required />
      <Input label="Disabled" defaultValue="Chưa sẵn sàng" disabled />
    </div>
  ),
};

export const Icons: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-sm gap-4">
      <Input label="Tìm kiếm" icon="search" placeholder="Nhập từ khóa" />
      <Input
        label="Email"
        type="email"
        icon="mail"
        iconRight="info"
        placeholder="name@example.com"
      />
      <Input
        label="Website"
        icon="globe"
        endAddon={<span className="px-2 text-ui-sm text-muted">.com</span>}
        className="pr-16"
      />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Input
      label="Lorem ipsum"
      icon="search"
      iconRight="info"
      required
      hint="Dolor sit amet."
      className="h-12 rounded-full bg-brand-50"
      classNames={{
        root: 'max-w-md gap-3',
        icon: 'text-brand-700',
        iconRight: 'text-brand-700',
        label: 'text-brand-700 font-bold',
        required: 'text-warning-700',
        hint: 'italic text-brand-700',
      }}
    />
  ),
};

export const Default: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: /Nội dung/ });
    await userEvent.clear(field);
    await userEvent.type(field, 'Lorem ipsum');
    await expect(field).toHaveValue('Lorem ipsum');
  },
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
