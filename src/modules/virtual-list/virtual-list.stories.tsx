import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  VirtualGrid,
  VirtualList,
  type VirtualGridProps,
} from '@itclabs/react-ui/virtual-list';
import { UiImage } from '@itclabs/react-ui';

const products = Array.from({ length: 500 }, (_, index) => ({
  id: String(index),
  title: `Lorem ipsum ${index + 1}`,
  image: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="hsl(${(index * 31) % 360} 25% 90%)"/><circle cx="160" cy="90" r="45" fill="hsl(${(index * 31) % 360} 30% 65%)"/></svg>`)}`,
}));
type Product = (typeof products)[number];

function ProductCard({ item }: { item: Product }) {
  return (
    <article className="overflow-hidden rounded-panel border border-line bg-surface">
      <UiImage
        src={item.image}
        alt=""
        width={320}
        height={180}
        className="aspect-video w-full object-cover"
      />
      <div className="p-3">
        <h3>{item.title}</h3>
        <p className="text-ui-sm text-muted">Dolor sit amet</p>
      </div>
    </article>
  );
}

function InfiniteProducts({
  fail = false,
  ...props
}: VirtualGridProps<Product> & { fail?: boolean }) {
  const [count, setCount] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(fail);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const load = () => {
    setLoading(true);
    timer.current = setTimeout(() => {
      setCount((value) => Math.min(500, value + 24));

      setLoading(false);
    }, 1200);
  };

  return (
    <VirtualGrid
      {...props}
      items={products.slice(0, count)}
      loading={loading}
      hasMore={count < 500}
      onLoadMore={load}
      error={error ? 'Unable to load items.' : undefined}
      onRetry={() => {
        setError(false);
        load();
      }}
    />
  );
}

const meta = {
  title: 'Modules/VirtualList',
  component: VirtualList<Product>,
  args: {
    items: products,
    getItemKey: (item: Product) => item.id,
    renderItem: (item: Product, _index: number) => (
      <div className="border-b border-line p-4">{item.title}</div>
    ),
    estimateSize: 56,
    height: 400,
    'aria-label': 'Items',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Render large collections with measured rows, container or window scrolling, loading feedback and scroll restoration. Import VirtualList and VirtualGrid from @itclabs/react-ui/virtual-list. Supply stable getItemKey values. Container mode requires height, maxHeight or class sizing. Arrow keys and Home/End move item focus; nested controls retain their native keys. Loading and items are host controlled. Auto loading requests once per item count; use onRetry after an error. VirtualGrid columns follow viewport breakpoints, while minItemWidth uses the container width. gap and estimateSize are pixels; aspectRatio estimates card height when estimateSize is omitted. className and ref target the viewport; role and itemRole customize semantics. restoreKey stores the scroll offset in sessionStorage.',
      },
    },
  },
} satisfies Meta<typeof VirtualList<Product>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const ProductGrid: Story = {
  tags: ['example'],
  args: { loadingIndicator: 'skeleton' },
  argTypes: {
    loadingIndicator: {
      control: 'inline-radio',
      options: ['spinner', 'skeleton', 'bar'],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'A simulated API returns 500 products in pages of 24. Scroll toward the last rendered items to request another page. Switch loadingIndicator to compare placeholder cards, a spinner with text, or a slim bar pinned to the bottom of the viewport.',
      },
    },
  },
  render: (args: VirtualGridProps<Product>) => (
    <InfiniteProducts
      {...args}
      estimateSize={260}
      minItemWidth={200}
      gap={16}
      renderItem={(item: Product) => <ProductCard item={item} />}
    />
  ),
};

export const LoadMoreButton: Story = {
  tags: ['example'],
  render: (args: VirtualGridProps<Product>) => (
    <InfiniteProducts
      {...args}
      loadMore="button"
      estimateSize={260}
      columns={{ base: 1, sm: 2, lg: 3 }}
      renderItem={(item: Product) => <ProductCard item={item} />}
    />
  ),
};

export const VariableHeights: Story = {
  tags: ['example'],
  args: {
    renderItem: (item: Product, index: number) => (
      <div className="border-b border-line p-4">
        <h3>{item.title}</h3>
        <p className="text-muted">
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(
            (index % 5) + 1,
          )}
        </p>
      </div>
    ),
  },
};

export const WindowScrollingPage: Story = {
  tags: ['example'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Uses the page scroll position and measures the collection offset below the page introduction.',
      },
    },
  },
  render: (args: VirtualGridProps<Product>) => (
    <main className="p-6">
      <h2 className="mb-8 text-title">Lorem ipsum</h2>
      <VirtualGrid
        {...args}
        scroll="window"
        minItemWidth={220}
        estimateSize={260}
        renderItem={(item: Product) => <ProductCard item={item} />}
      />
    </main>
  ),
};

export const ErrorAndRetry: Story = {
  tags: ['states'],
  render: (args: VirtualGridProps<Product>) => (
    <InfiniteProducts
      {...args}
      fail
      estimateSize={260}
      columns={2}
      renderItem={(item: Product) => <ProductCard item={item} />}
    />
  ),
};

export const LoadingStates: Story = {
  name: 'Loading states',
  tags: ['states'],
  parameters: {
    docs: {
      description: {
        story:
          'Frozen loading states for comparison: the first page shows skeleton rows, and later pages use loadingIndicator spinner, skeleton or bar below existing items.',
      },
    },
  },
  render: (args: VirtualGridProps<Product>) => (
    <div className="grid gap-6 sm:grid-cols-2">
      {(
        [
          ['First page', { items: [] }],
          ['spinner', { loadingIndicator: 'spinner' }],
          ['skeleton', { loadingIndicator: 'skeleton' }],
          ['bar', { loadingIndicator: 'bar' }],
        ] as const
      ).map(([label, state]) => (
        <section key={label} className="grid gap-2">
          <h3 className="text-ui-sm text-muted">{label}</h3>
          <VirtualList
            {...args}
            items={products.slice(0, 3)}
            {...state}
            aria-label={label}
            height={260}
            loading
            hasMore
            skeletonCount={4}
            className="rounded-panel border border-line bg-surface"
          />
        </section>
      ))}
    </div>
  ),
};

export const Empty: Story = {
  tags: ['states'],
  args: { items: [] },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-panel border border-line',
    classNames: {
      root: 'bg-canvas',
      viewport: 'p-2',
      list: 'bg-surface',
      row: 'px-2',
      item: 'rounded-control text-brand-700',
      loader: 'p-6',
      loadMore: 'rounded-full',
      retry: 'bg-danger-50',
      empty: 'py-12',
      skeleton: 'p-2',
    },
  },
};
