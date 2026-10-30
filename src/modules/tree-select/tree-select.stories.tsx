import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { TreeSelect, type TreeSelectNode } from '@itclabs/react-ui/tree-select';
import { Button, Form, FormField, useAppForm } from '@itclabs/react-ui';

const leaf = (id: string, label: string): TreeSelectNode => ({ id, label });

const nodes: TreeSelectNode[] = [
  {
    id: 'lorem',
    label: 'Apparel',
    children: [
      {
        id: 'ipsum',
        label: 'T-shirts',
        children: [
          leaf('crew-neck', 'Crew neck'),
          leaf('v-neck', 'V-neck'),
          leaf('long-sleeve', 'Long sleeve'),
        ],
      },
      {
        id: 'dolor',
        label: 'Hoodies',
        children: [leaf('pullover', 'Pullover'), leaf('zip-up', 'Zip-up')],
      },
      leaf('polos', 'Polos'),
    ],
  },
  {
    id: 'sit',
    label: 'Home & living',
    children: [
      {
        id: 'amet',
        label: 'Mugs',
        children: [leaf('ceramic', 'Ceramic mugs'), leaf('travel', 'Travel mugs')],
      },
      {
        id: 'elit',
        label: 'Wall art',
        children: [leaf('posters', 'Posters'), leaf('canvas', 'Canvas prints')],
      },
      leaf('cafe', 'Café accessories'),
    ],
  },
  {
    id: 'bags',
    label: 'Bags',
    children: [leaf('totes', 'Tote bags'), leaf('backpacks', 'Backpacks')],
  },
  {
    id: 'kids',
    label: 'Kids & baby',
    children: [leaf('bodysuits', 'Bodysuits'), leaf('kids-tees', 'Kids T-shirts')],
  },
];

const flatten = (
  items: readonly TreeSelectNode[],
  path: string[] = [],
): TreeSelectNode[] =>
  items.flatMap((node) => [
    { id: node.id, label: node.label, path },
    ...flatten(node.children ?? [], [...path, node.label]),
  ]);

const meta = {
  title: 'Modules/TreeSelect',
  component: TreeSelect,
  args: { nodes, label: 'Category', clearable: true, searchable: true },
  parameters: {
    docs: {
      description: {
        component:
          'Choose one or more nodes in a hierarchy. Supports virtualized rows, client or remote search, lazy children, paging, and independent or cascading selection. Import from @itclabs/react-ui/tree-select. Requests and cancellation remain host-owned. With child strategy, unloaded descendants are remembered during the mounted selection session; persist parent intent in the host when restoring that selection.',
      },
    },
  },
} satisfies Meta<typeof TreeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const Multiple: Story = {
  tags: ['example'],
  args: {
    multiple: true,
    defaultValue: ['crew-neck', 'v-neck', 'pullover', 'ceramic', 'posters'],
    maxTagCount: 3,
  },
};

function CascadeDemo({ strategy }: { strategy: 'parent' | 'child' | 'all' }) {
  const [value, setValue] = useState<string[]>([]);

  return (
    <TreeSelect
      nodes={nodes}
      multiple
      cascade
      checkedStrategy={strategy}
      label={`checkedStrategy="${strategy}"`}
      value={value}
      onValueChange={setValue}
      hint={`Value: ${value.length ? value.join(', ') : '—'}`}
      clearable
    />
  );
}

export const Cascade: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-6">
      {(['parent', 'child', 'all'] as const).map((strategy) => (
        <CascadeDemo key={strategy} strategy={strategy} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Parent emits compressed parent IDs; child emits leaf IDs; all emits every checked selectable node. Disabled nodes are excluded from cascades.',
      },
    },
  },
};

function LazyDemo() {
  const [items, setItems] = useState<TreeSelectNode[]>([
    { id: 'lorem', label: 'Lorem', hasChildren: true },
    { id: 'ipsum', label: 'Ipsum', hasChildren: true },
  ]);
  const [attempted, setAttempted] = useState(false);

  return (
    <TreeSelect
      nodes={items}
      label="Category"
      loadChildren={async (node) => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        if (node.id === 'ipsum' && !attempted) {
          setAttempted(true);
          throw new Error('Retry');
        }

        setItems((previous) =>
          previous.map((item) =>
            item.id === node.id
              ? {
                  ...item,
                  children: [{ id: `${item.id}-child`, label: 'Dolor sit amet' }],
                }
              : item,
          ),
        );
      }}
    />
  );
}

export const LazyLoading: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-6">
      <LazyDemo />
      <PagingDemo />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Expand Ipsum to see one simulated failure, then use the inline retry action. The second control pages children and root nodes.',
      },
    },
  },
};

function PagingDemo() {
  const [items, setItems] = useState<TreeSelectNode[]>([
    {
      id: 'lorem',
      label: 'Lorem',
      children: [{ id: 'ipsum', label: 'Ipsum' }],
      hasMore: true,
    },
  ]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState<(string | null)[]>([]);

  return (
    <TreeSelect
      nodes={items}
      label="Category"
      hasMore={hasMore}
      loadingIds={loading}
      onLoadMore={(parent) => {
        setLoading((previous) => [...previous, parent]);

        setTimeout(() => {
          if (parent === null) {
            setItems((previous) => [...previous, { id: 'sit', label: 'Sit amet' }]);

            setHasMore(false);
          } else
            setItems((previous) =>
              previous.map((item) =>
                item.id === parent
                  ? {
                      ...item,
                      hasMore: false,
                      children: [
                        ...(item.children ?? []),
                        { id: 'dolor', label: 'Dolor' },
                      ],
                    }
                  : item,
              ),
            );

          setLoading((previous) => previous.filter((id) => id !== parent));
        }, 700);
      }}
    />
  );
}

export const LoadMore: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <PagingDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    await expect(within(document.body).getByRole('tree')).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

function RemoteDemo() {
  const [items, setItems] = useState(nodes);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string | null>('ipsum');
  const [request, setRequest] = useState<ReturnType<typeof setTimeout>>();

  return (
    <TreeSelect
      nodes={items}
      label="Category"
      searchable
      value={value}
      onValueChange={setValue}
      selectedOptions={[{ id: 'ipsum', label: 'T-shirts', path: ['Apparel'] }]}
      showPath
      searchLoading={loading}
      onSearchChange={(query) => {
        clearTimeout(request);
        setLoading(true);
        setRequest(
          setTimeout(() => {
            setItems(
              query
                ? flatten(nodes).filter((node) =>
                    node.label.toLowerCase().includes(query.toLowerCase()),
                  )
                : nodes,
            );
            setLoading(false);
          }, 600),
        );
      }}
    />
  );
}

export const RemoteSearch: Story = { tags: ['example'], render: () => <RemoteDemo /> };

const largeNodes: TreeSelectNode[] = Array.from({ length: 100 }, (_, parent) => ({
  id: `group-${parent}`,
  label: `Lorem ${parent + 1}`,
  children: Array.from({ length: 49 }, (_, child) => ({
    id: `item-${parent}-${child}`,
    label: `Ipsum ${parent + 1}.${child + 1}`,
  })),
}));
export const LargeTree: Story = {
  tags: ['example'],
  args: { nodes: largeNodes },
  parameters: {
    docs: {
      description: {
        story:
          'Search and browse 5,000 nodes. Only visible rows and a small overscan are mounted.',
      },
    },
  },
};

export const DisabledSubtree: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { label: 'Parent category', disabledSubtreeIds: ['lorem'], searchable: false },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    await expect(
      within(document.body).getByRole('treeitem', { name: /Apparel/ }),
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{Escape}');
  },
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-6">
      <TreeSelect
        nodes={nodes}
        label="Parent category"
        disabledSubtreeIds={['lorem']}
      />
      <TreeSelect nodes={nodes} label="Disabled" disabled />
      <TreeSelect nodes={[]} label="Empty" />
      <TreeSelect nodes={nodes} label="Required" required error="Choose a category" />
      <TreeSelect nodes={nodes} label="Hint" hint="Choose a parent category" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('combobox', { name: 'Disabled' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      within(canvasElement).getByRole('combobox', { name: 'Required' }),
    ).toHaveAttribute('aria-invalid', 'true');
  },
};

function FormDemo() {
  const form = useAppForm({
    defaultValues: { category: null as string | null },
    onSubmit: async () => {},
  });

  return (
    <Form form={form} className="grid gap-4">
      <FormField name="category" label="Category" required>
        <TreeSelect nodes={nodes} />
      </FormField>
      <Button type="submit">Save</Button>
    </Form>
  );
}

export const InForm: Story = { tags: ['example'], render: () => <FormDemo /> };
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-full',
    classNames: {
      root: 'max-w-sm',
      label: 'font-bold',
      control: 'border-brand-700',
      popover: 'rounded-panel',
      rowSelected: 'bg-brand-100',
      row: 'rounded-lg',
      highlight: 'bg-brand-100',
      tag: 'rounded-full',
      search: 'rounded-full',
    },
  },
};
