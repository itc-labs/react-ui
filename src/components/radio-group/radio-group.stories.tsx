import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RadioGroup } from './index';
import { expect, userEvent, within } from 'storybook/test';

function Demo() {
  const [value, setValue] = useState('explore');

  return (
    <div className="grid gap-4">
      <RadioGroup
        label="Đánh giá"
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'explore', label: 'Nghiên cứu thêm' },
          { value: 'test', label: 'Đáng thử' },
          { value: 'skip', label: 'Bỏ qua', disabled: true },
        ]}
      />
      <RadioGroup
        label="Thiếu lựa chọn"
        error="Hãy chọn một trạng thái."
        options={[{ value: 'a', label: 'Mục A' }]}
      />
    </div>
  );
}

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Lựa chọn',
    options: [
      { value: 'a', label: 'Mục A' },
      { value: 'b', label: 'Mục B' },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Chọn một giá trị trong danh sách options. Hỗ trợ điều hướng bằng bàn phím, tùy chọn disabled và thông báo lỗi cho cả nhóm.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = { tags: ['states'], render: () => <Demo /> };

export const LongLabels: Story = {
  tags: ['example'],
  render: () => (
    <div className="w-48">
      <RadioGroup
        label="Nhãn dài trong vùng hẹp"
        required
        defaultValue="review"
        options={[
          {
            value: 'review',
            label:
              'Nghiên cứu thêm trước khi đưa ra quyết định với nội dung nhiều dòng',
          },
          { value: 'test', label: 'Đáng thử với một sản phẩm minh họa' },
          {
            value: 'disabled',
            label: 'Lựa chọn bị khóa có nội dung dài',
            disabled: true,
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const radio of canvas.getAllByRole('radio')) {
      const bounds = radio.getBoundingClientRect();
      await expect(bounds.width).toBe(16);
      await expect(bounds.height).toBe(16);
    }
    await userEvent.click(canvas.getByText('Đáng thử với một sản phẩm minh họa'));
    await expect(
      canvas.getByRole('radio', { name: 'Đáng thử với một sản phẩm minh họa' }),
    ).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'Lựa chọn bị khóa có nội dung dài' }),
    ).toBeDisabled();
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <RadioGroup
      label="Lorem ipsum"
      defaultValue="a"
      options={[
        { value: 'a', label: 'Dolor sit amet' },
        { value: 'b', label: 'Consectetur adipiscing' },
      ]}
      classNames={{
        root: 'max-w-lg',
        group: 'grid-cols-2',
        option: 'rounded-panel border border-line p-4',
        control: 'border-brand-700',
        indicator: 'bg-brand-800',
        optionLabel: 'font-semibold',
      }}
    />
  ),
};
