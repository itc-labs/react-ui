import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputPassword } from './index';
const meta = {
  title: 'Components/InputPassword',
  component: InputPassword,
  tags: ['autodocs'],
  args: { label: 'Mật khẩu', autoComplete: 'new-password', icon: 'lock' },
} satisfies Meta<typeof InputPassword>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-sm gap-4">
      <InputPassword label="Required" required autoComplete="new-password" />
      <InputPassword label="Error" error="Nhập ít nhất 8 ký tự." />
      <InputPassword label="Disabled" disabled defaultValue="example-password" />
      <InputPassword label="Read only" readOnly defaultValue="example-password" />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-full',
    classNames: {
      icon: 'text-brand-700',
      iconRight: 'rounded-full text-brand-700',
      label: 'font-bold',
    },
  },
};
