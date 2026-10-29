import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch } from './index';

function Demo() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="grid gap-4">
      <Switch label="Chế độ xem gọn" checked={checked} onCheckedChange={setChecked} />
      <Switch label="Không chỉnh sửa" checked disabled />
      <output>{checked ? 'Gọn' : 'Đầy đủ'}</output>
    </div>
  );
}

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Bật tùy chọn' },
  parameters: {
    docs: {
      description: {
        component:
          'Bật hoặc tắt một tùy chọn. Dùng checked/onCheckedChange để quản lý giá trị; disabled ngăn thay đổi nhưng vẫn giữ nhãn và trạng thái hiện tại.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = { tags: ['states'], render: () => <Demo /> };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Switch
      label="Lorem ipsum"
      defaultChecked
      classNames={{
        root: 'flex-row-reverse justify-end gap-4',
        control: 'data-[state=checked]:bg-brand-800',
        thumb: 'shadow-floating',
        label: 'font-bold text-brand-700',
      }}
    />
  ),
};
