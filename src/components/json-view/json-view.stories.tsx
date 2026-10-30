import type { Meta, StoryObj } from '@storybook/react-vite';
import { JsonView } from './index';

const meta = {
  title: 'Components/JsonView',
  component: JsonView,
  args: {
    data: {
      title: 'Lorem ipsum',
      count: 3,
      enabled: true,
      detail: null,
      items: ['Lorem', 'Ipsum'],
    },
    defaultExpandDepth: 1,
    copyable: true,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Inspect structured data with expandable objects and arrays, type colors, and JSON clipboard copying. Use arrow keys to navigate, Home and End to jump, and Enter or Space to toggle. Root depth is zero; defaultExpandDepth only supplies the initial state of each node. Copy preserves JSON.stringify formatting for JSON data; circular and extended values use safe string representations. Clipboard unavailability or failure leaves the copy state unchanged.',
      },
    },
  },
} satisfies Meta<typeof JsonView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Expansion: Story = {
  tags: ['example'],
  args: {
    rootName: 'data',
    defaultExpandDepth: true,
    sortKeys: true,
    collapseStringsAfter: 24,
    maxHeight: 240,
    data: {
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      items: [
        { title: 'Lorem ipsum', count: 5 },
        { title: 'Dolor sit amet', count: 0 },
      ],
    },
  },
};

export const ExtendedValues: Story = {
  tags: ['states'],
  render: () => {
    const data: Record<string, unknown> = {
      missing: undefined,
      date: new Date('2026-01-01T00:00:00.000Z'),
      large: BigInt('9007199254740993'),
      callback: () => undefined,
    };
    data.self = data;

    return <JsonView data={data} rootName="data" defaultExpandDepth={true} />;
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-none border-accent',
    classNames: {
      header: 'bg-canvas',
      tree: 'p-4',
      key: 'font-semibold',
      string: 'text-accent',
      count: 'font-bold',
      copyButton: 'rounded-full',
    },
  },
};
