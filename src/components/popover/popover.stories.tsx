import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from './index';
import { Button } from '../button';
import { Select } from '../select';

function Demo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Popover
      trigger="Mở bộ lọc"
      label="Bộ lọc"
      content={
        <div className="grid gap-3">
          <p className="font-semibold">Lorem ipsum</p>
          <Select
            label="Danh mục"
            searchable
            value={value}
            onValueChange={setValue}
            options={[
              { value: 'pets', label: 'Pets' },
              { value: 'gifts', label: 'Gifts' },
            ]}
          />
        </div>
      }
    />
  );
}

const meta = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    trigger: 'Mở bộ lọc',
    label: 'Bộ lọc',
    content: (
      <div className="grid gap-3">
        <p className="font-semibold">Lorem ipsum</p>
        <Select
          label="Danh mục"
          searchable
          options={[
            { value: 'pets', label: 'Pets' },
            { value: 'gifts', label: 'Gifts' },
          ]}
        />
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Truyền trigger và content để mở nội dung bổ sung. Component tự căn vị trí, tránh cạnh màn hình, đóng khi tương tác bên ngoài và giữ đúng scope cho Select. Có prop content để dùng API dựng sẵn; bỏ prop này khi ghép các phần primitive. content không nhận null/undefined; chuỗi rỗng và 0 vẫn dùng API dựng sẵn.',
      },
    },
  },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const SelectInteraction: Story = {
  tags: ['example'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Mở bộ lọc' });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('combobox', { name: 'Danh mục' }));
    await userEvent.click(await body.findByRole('option', { name: 'Gifts' }));
    await expect(body.getByText('Gifts')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Popover
      trigger="Mở nội dung"
      label="Nội dung tùy chỉnh"
      content="Lorem ipsum dolor sit amet."
      className="w-80"
      classNames={{ trigger: 'rounded-full', content: 'border-brand-700 bg-brand-50' }}
    />
  ),
};
