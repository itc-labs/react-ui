import type { Meta, StoryObj } from '@storybook/react-vite';
import { Transfer, type TransferItem } from '@itclabs/react-ui/transfer';
import { Button, Form, FormField, useAppForm } from '@itclabs/react-ui';

const items: TransferItem[] = [
  { id: 'lorem', label: 'Lorem', description: 'Lorem ipsum dolor sit amet.' },
  { id: 'ipsum', label: 'Ipsum' },
  { id: 'dolor', label: 'Dolor' },
  { id: 'sit', label: 'Sit', disabled: true },
  { id: 'amet', label: 'Amet' },
];
const meta = {
  title: 'Modules/Transfer',
  component: Transfer,
  args: { items, label: 'Items', defaultValue: ['amet'] },
  parameters: {
    docs: {
      description: {
        component:
          'Move items between available and selected lists. Check rows, then use the move buttons, or move the focused row with Enter. Clicking a row only checks it. Arrow keys move focus, Space checks a row, Shift+Arrow extends the checked range, and Ctrl/Cmd+A checks visible rows. Import from @itclabs/react-ui/transfer. Values contain target IDs in source order by default; order="selection" preserves the order in which rows were checked. Select-all applies to the filtered list, while move-all applies to the entire side. Moves exceeding maxSelected are disabled.',
      },
    },
  },
} satisfies Meta<typeof Transfer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const SearchableLargeList: Story = {
  tags: ['example'],
  args: {
    searchable: true,
    showMoveAll: true,
    items: Array.from({ length: 2_000 }, (_, index) => ({
      id: `item-${index}`,
      label: `Lorem ${index + 1}`,
    })),
    defaultValue: ['item-3', 'item-8'],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Search 2,000 items. Long lists mount visible rows with overscan; custom descriptions are measured as rows resize.',
      },
    },
  },
};
export const OneWay: Story = {
  tags: ['example'],
  args: { oneWay: true, defaultValue: ['ipsum', 'amet'] },
};
export const MaxSelected: Story = {
  tags: ['example'],
  args: { maxSelected: 2, hint: 'Choose up to two items.' },
};
export const CustomRender: Story = {
  tags: ['example'],
  args: {
    renderItem: (item, { side, checked }) => (
      <div className={checked ? 'font-semibold' : undefined}>
        <span>{item.label}</span>
        <p className="text-ui-sm text-muted">
          {side === 'source'
            ? 'Lorem ipsum dolor sit amet.'
            : 'Consectetur adipiscing elit.'}
        </p>
      </div>
    ),
  },
};

function FormDemo() {
  const form = useAppForm({
    defaultValues: { items: [] as string[] },
    onSubmit: async () => {},
  });

  return (
    <Form form={form} className="grid gap-4">
      <FormField name="items" label="Items" required>
        <Transfer items={items} searchable />
      </FormField>
      <Button type="submit">Save</Button>
    </Form>
  );
}

export const InForm: Story = { tags: ['example'], render: () => <FormDemo /> };
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'max-w-3xl',
    searchable: true,
    classNames: {
      root: 'gap-4',
      panel: 'rounded-none border-brand-700',
      header: 'bg-brand-50',
      search: 'rounded-full',
      list: 'p-2',
      item: 'rounded-full',
      itemChecked: 'bg-brand-100',
      actions: 'gap-3',
      button: 'rounded-full',
      empty: 'italic',
      hint: 'text-brand-700',
      error: 'font-semibold',
    },
    hint: 'Choose items to transfer.',
  },
};
