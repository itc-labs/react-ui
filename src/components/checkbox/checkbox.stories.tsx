import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './index';

function Demo() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="grid gap-4">
      <Checkbox
        label="Chọn bản minh họa"
        checked={checked}
        onCheckedChange={(value) => setChecked(value === true)}
      />
      <Checkbox label="Một phần được chọn" checked="indeterminate" />
      <Checkbox label="Không chỉnh sửa" disabled />
      <Checkbox label="Cần đồng ý" error="Chọn để tiếp tục." />
      <output>{checked ? 'Đã chọn' : 'Chưa chọn'}</output>
    </div>
  );
}

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Chọn mục' },
  parameters: {
    docs: {
      description: {
        component:
          'Chọn hoặc bỏ chọn một giá trị, hỗ trợ trạng thái indeterminate. Label, hint và error được liên kết với control; checked/onCheckedChange dùng cho trạng thái có kiểm soát.',
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
    <Checkbox
      label="Lorem ipsum"
      hint="Dolor sit amet."
      defaultChecked
      className="size-5 rounded-md"
      classNames={{
        root: 'gap-3',
        label: 'font-semibold text-brand-700',
        hint: 'italic',
        icon: 'size-4',
      }}
    />
  ),
};

export const ControlInteraction: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Chọn bản minh họa' }));
    await expect(canvas.getByText('Đã chọn')).toBeVisible();
  },
};
