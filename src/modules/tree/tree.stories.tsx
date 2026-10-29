import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Tree } from './index';

function Demo() {
  const [value, setValue] = useState('');

  return (
    <div className="grid max-w-md gap-4">
      <Tree
        label="Cây danh mục minh họa"
        value={value}
        onValueChange={setValue}
        nodes={[
          {
            id: 'pets',
            label: 'Pets',
            children: [
              { id: 'cats', label: 'Cats' },
              { id: 'dogs', label: 'Dogs' },
            ],
          },
          { id: 'gifts', label: 'Gifts' },
          { id: 'disabled', label: 'Không khả dụng', disabled: true },
        ]}
      />
      <output>Đang chọn: {value || 'chưa có'}</output>
    </div>
  );
}

const meta = {
  title: 'Modules/Tree',
  component: Tree,
  args: {
    label: 'Danh mục',
    nodes: [
      { id: 'a', label: 'Nhóm A', children: [{ id: 'a1', label: 'Mục A1' }] },
      { id: 'b', label: 'Nhóm B' },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Danh sách phân cấp có thể mở/đóng từng nhánh và chọn một mục. nodes cung cấp ID ổn định; hỗ trợ phím mũi tên, Home/End và các mục disabled.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Tree
      label="Danh mục"
      nodes={[
        {
          id: 'a',
          label: 'Lorem ipsum',
          children: [{ id: 'b', label: 'Dolor sit amet' }],
        },
      ]}
      expanded={['a']}
      classNames={{
        root: 'max-w-sm rounded-panel border border-line p-4',
        item: 'min-h-12 rounded-full',
        selectedItem: 'bg-brand-700 text-on-brand',
        label: 'font-semibold',
        toggle: 'rounded-full',
      }}
    />
  ),
};

export const KeyboardNavigation: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Pets'));
    await userEvent.keyboard('{ArrowRight}{ArrowDown}{Enter}');
    await expect(canvas.getByText('Đang chọn: cats')).toBeVisible();
  },
};
