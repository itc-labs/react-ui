import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Tree } from './index';

function Demo() {
  const [value, setValue] = useState('');

  return (
    <div className="grid max-w-md gap-4">
      <Tree
        label="Example category tree"
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
          { id: 'disabled', label: 'Unavailable', disabled: true },
        ]}
      />
      <output>Selected: {value || 'none'}</output>
    </div>
  );
}

const meta = {
  title: 'Modules/Tree',
  component: Tree,
  args: {
    label: 'Categories',
    nodes: [
      {
        id: 'a',
        label: 'Lorem ipsum',
        children: [{ id: 'a1', label: 'Dolor sit amet' }],
      },
      { id: 'b', label: 'Consectetur' },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'A hierarchical list with expandable branches and single selection. Supply stable IDs in nodes. Supports arrow keys, Home/End and disabled items.',
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
      label="Categories"
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
    await expect(canvas.getByText('Selected: cats')).toBeVisible();
  },
};
