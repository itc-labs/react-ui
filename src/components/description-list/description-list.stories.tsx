import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from '../tag';
import { DescriptionList } from './index';

const items = [
  { id: 'name', label: 'Name', value: 'Lorem ipsum dolor' },
  { id: 'code', label: 'Code', value: 'LOREM-001' },
  { id: 'status', label: 'Status', value: <Tag tone="success">Active</Tag> },
  { id: 'quantity', label: 'Quantity', value: 0 },
  { id: 'owner', label: 'Owner', value: null },
  {
    id: 'notes',
    label: 'Notes',
    value:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor.',
    span: 'full' as const,
  },
];

const meta = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  args: { items, columns: 2, layout: 'stacked', size: 'md' },
  parameters: {
    docs: {
      description: {
        component:
          'Displays read-only label/value pairs with native dl/dt/dd semantics, for detail panels and dialogs. Missing values (null, undefined or an empty string) show a dash with a localized spoken label; 0 is shown as a value.',
      },
    },
  },
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const Layouts: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid max-w-3xl gap-8">
      <DescriptionList items={items} columns={3} />
      <DescriptionList items={items} layout="inline" />
    </div>
  ),
};
export const Sizes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid max-w-3xl gap-8">
      <DescriptionList items={items.slice(0, 4)} columns={2} size="sm" />
      <DescriptionList items={items.slice(0, 4)} columns={2} size="md" />
    </div>
  ),
};
export const EmptyValues: Story = {
  tags: ['states'],
  args: {
    columns: 1,
    items: [
      { id: 'owner', label: 'Owner', value: null },
      { id: 'quantity', label: 'Quantity', value: 0 },
    ],
    emptyValue: 'Lorem ipsum',
  },
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'max-w-2xl',
    classNames: {
      root: 'rounded-lg border border-line p-4',
      label: 'font-medium uppercase',
      value: 'font-semibold',
    },
  },
};
