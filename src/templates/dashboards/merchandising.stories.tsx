import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../../components/card';
import { IconButton } from '../../components/icon-button';
import { Tag } from '../../components/tag';
import { SearchIcon } from '../../components/icon/outline/search';
import { ShoppingBagIcon } from '../../components/icon/outline/shopping-bag';
import { UserIcon } from '../../components/icon/outline/user';
import { DataTable, type ColumnDef } from '../../modules/data-table';
import { KpiCard, KpiGrid } from '../../modules/kpi-card';
import { Navbar, type NavbarItem, type NavbarSection } from '../../modules/navbar';
import { PageHeader } from '../../modules/page-header';
import { ProgressList } from '../../modules/progress-list';
import { Chart } from '@itclabs/react-ui/chart';
import { WorkspaceShell } from '@itclabs/react-ui/templates';
import { DemoNotifications } from './__demo/blocks';
import { demoCurrency } from './__demo/data';
import { DemoApp } from './__demo/demo-app';

type MerchandisingArgs = {
  showAnnouncement: boolean;
  showMetrics: boolean;
  showCategories: boolean;
  showSizes: boolean;
  showStyles: boolean;
};

const links = (prefix: string, labels: string[]) =>
  labels.map((label) => ({
    id: `${prefix}-${label}`,
    label,
    href: `/men/${prefix}/${label.toLowerCase().replaceAll(' & ', '-').replaceAll(' ', '-')}`,
  }));

const columns = (id: string, title: string, labels: string[]): NavbarSection => ({
  id,
  title,
  href: `/men/${id}`,
  items: links(id, labels),
});

/** Kangi: a featured column, five sections and an "All …" row along the bottom. */
const navigation: NavbarItem[] = [
  { id: 'new', label: 'New', href: '/new' },
  {
    id: 'men',
    type: 'mega',
    label: 'Men',
    featured: {
      id: 'trending',
      title: 'New & Trending',
      items: [
        { id: 'arrivals', label: 'New Arrivals', href: '/men/new' },
        { id: 'best-sellers', label: 'Best Sellers', href: '/men/best-sellers' },
        { id: 'drops', label: 'Latest Drops', href: '/men/drops' },
      ],
    },
    sections: [
      columns('shoes', 'Shoes', [
        'Basketball',
        'Lifestyle',
        'Running',
        'Training & Gym',
      ]),
      columns('clothing', 'Clothing', [
        'Hoodies',
        'Jackets & Vests',
        'Pants',
        'Shorts',
      ]),
      columns('accessories', 'Accessories', ['Bags & Backpacks', 'Hats', 'Socks']),
      columns('sport', 'Shop by sport', ['Basketball', 'Football', 'Running', 'Yoga']),
      columns('color', 'Shop by color', [
        'Elemental Pink',
        'University Red',
        'Mink Brown',
      ]),
    ],
    footer: [
      { id: 'all-shoes', label: "All Men's Shoes", href: '/men/shoes' },
      { id: 'all-clothing', label: "All Men's Clothing", href: '/men/clothing' },
      {
        id: 'all-accessories',
        label: "All Men's Accessories",
        href: '/men/accessories',
      },
      { id: 'all-sport', label: "All Men's Sport", href: '/men/sport' },
      { id: 'all-men', label: "All Men's", href: '/men' },
    ],
  },
  { id: 'women', label: 'Women', href: '/women' },
  { id: 'kids', label: 'Kids', href: '/kids' },
  { id: 'sports', label: 'Sports', href: '/sports' },
];

const categorySales = [
  { id: 'shoes', label: 'Shoes', values: { revenue: 82400, target: 76000 } },
  { id: 'clothing', label: 'Clothing', values: { revenue: 54100, target: 60000 } },
  {
    id: 'accessories',
    label: 'Accessories',
    values: { revenue: 21300, target: 18000 },
  },
  { id: 'sport', label: 'Sport', values: { revenue: 24600, target: 22000 } },
];

// Units left per size; the tone flags sizes that need a reorder.
const sizes = [
  { id: 's', label: 'S', value: 412, max: 640 },
  { id: 'm', label: 'M', value: 92, max: 820, tone: 'danger' as const },
  { id: 'l', label: 'L', value: 236, max: 760, tone: 'warning' as const },
  { id: 'xl', label: 'XL', value: 96, max: 420, tone: 'warning' as const },
];

type Style = {
  id: string;
  name: string;
  category: string;
  units: number;
  revenue: number;
  stock: 'healthy' | 'low' | 'sold out';
};

const styles: Style[] = [
  {
    id: 'K-1042',
    name: 'Court Classic',
    category: 'Shoes',
    units: 612,
    revenue: 73440,
    stock: 'low',
  },
  {
    id: 'K-2210',
    name: 'Trail Runner 3',
    category: 'Shoes',
    units: 488,
    revenue: 63440,
    stock: 'healthy',
  },
  {
    id: 'K-3305',
    name: 'Fleece Hoodie',
    category: 'Clothing',
    units: 731,
    revenue: 51170,
    stock: 'healthy',
  },
  {
    id: 'K-3318',
    name: 'Tech Jacket',
    category: 'Clothing',
    units: 214,
    revenue: 34240,
    stock: 'sold out',
  },
  {
    id: 'K-4102',
    name: 'Everyday Backpack',
    category: 'Accessories',
    units: 309,
    revenue: 18540,
    stock: 'healthy',
  },
  {
    id: 'K-5120',
    name: 'Studio Yoga Pant',
    category: 'Sport',
    units: 266,
    revenue: 21280,
    stock: 'low',
  },
];

const stockTone = { healthy: 'success', low: 'warning', 'sold out': 'danger' } as const;

const styleColumns: ColumnDef<Style, unknown>[] = [
  { accessorKey: 'id', header: 'Style' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'units',
    header: 'Units',
    cell: ({ row }) => <span className="tabular-nums">{row.original.units}</span>,
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    cell: ({ row }) => (
      <span className="tabular-nums">{demoCurrency.format(row.original.revenue)}</span>
    ),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => (
      <Tag tone={stockTone[row.original.stock]} className="capitalize">
        {row.original.stock}
      </Tag>
    ),
  },
];

function MerchandisingPage({
  showMetrics,
  showCategories,
  showSizes,
  showStyles,
}: Omit<MerchandisingArgs, 'showAnnouncement'>) {
  return (
    <>
      <PageHeader
        className="mb-6"
        classNames={{ title: 'text-heading' }}
        title="Men · Fall/Winter 2026"
        description="Collection performance from September 1 to November 18, 2026."
      />
      <div className="grid min-w-0 gap-6">
        {showMetrics && (
          <KpiGrid columns={4}>
            <KpiCard
              label="Revenue"
              value="$182,400"
              trend={{ value: 9.6, label: 'vs plan' }}
            />
            <KpiCard
              label="Sell-through"
              value="64%"
              trend={{ value: 5.2, label: 'vs last season' }}
            />
            <KpiCard
              label="Units sold"
              value="3,912"
              trend={{ value: 7.1, label: 'vs plan' }}
            />
            <KpiCard
              label="Return rate"
              value="4.1%"
              trend={{ value: 0.6, label: 'vs last season', intent: 'negative' }}
            />
          </KpiGrid>
        )}
        {(showCategories || showSizes) && (
          <div className="grid min-w-0 gap-6 xl:grid-cols-3">
            {showCategories && (
              <Card
                title="Revenue by category"
                description="Actual against plan"
                className={
                  showSizes ? 'min-w-0 xl:col-span-2' : 'min-w-0 xl:col-span-3'
                }
              >
                <Chart
                  type="bar"
                  label="Revenue by category against plan"
                  data={categorySales}
                  series={[
                    { id: 'revenue', label: 'Revenue', color: 'var(--color-chart-1)' },
                    { id: 'target', label: 'Plan', color: 'var(--color-chart-3)' },
                  ]}
                  height={260}
                  valueFormatter={(value) => demoCurrency.format(value)}
                  axisValueFormatter={(value) => `$${value / 1000}k`}
                />
              </Card>
            )}
            {showSizes && (
              <Card
                title="Stock by size"
                description="Units left · Court Classic"
                className="min-w-0"
              >
                <ProgressList label="Units left by size" items={sizes} />
              </Card>
            )}
          </div>
        )}
        {showStyles && (
          <Card title="Top styles" classNames={{ root: 'min-w-0', content: 'p-0' }}>
            <DataTable
              caption="Top styles"
              className="rounded-none border-0 shadow-none"
              verticalAlign="middle"
              rows={styles}
              columns={styleColumns}
              rowId={(row) => row.id}
              filterable
              classNames={{ toolbar: 'px-0' }}
            />
          </Card>
        )}
      </div>
    </>
  );
}

function Merchandising({
  showAnnouncement,
  showMetrics,
  showCategories,
  showSizes,
  showStyles,
}: MerchandisingArgs) {
  return (
    <WorkspaceShell
      variant="classic"
      classNames={{ topbar: 'border-0 bg-transparent p-0 sm:p-0' }}
      topbar={
        <Navbar
          sticky={false}
          appearance="dark"
          itemVariant="underline"
          align="center"
          brand={{ title: 'KĀNGI', href: '/dashboard' }}
          items={navigation}
          navigationLabel="Collection navigation"
          classNames={{ topbar: 'justify-center bg-accent text-center text-on-brand' }}
          {...(showAnnouncement
            ? {
                topbar: (
                  <span>
                    Members get early access to the Holiday drop on November 24
                  </span>
                ),
              }
            : {})}
          actions={
            <>
              <IconButton
                href="/search"
                icon={SearchIcon}
                label="Search"
                variant="ghost"
                className="hidden sm:inline-flex"
              />
              <IconButton
                href="/orders"
                icon={ShoppingBagIcon}
                label="Orders"
                variant="ghost"
                className="hidden sm:inline-flex"
              />
              <DemoNotifications />
              <IconButton
                href="/account"
                icon={UserIcon}
                label="Account"
                variant="ghost"
              />
            </>
          }
        />
      }
      content={
        <MerchandisingPage
          showMetrics={showMetrics}
          showCategories={showCategories}
          showSizes={showSizes}
          showStyles={showStyles}
        />
      }
    />
  );
}

const meta = {
  title: 'Templates/Dashboards/Merchandising',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A collection dashboard with a dark editorial Navbar: a centred menu with an underline, a column mega menu with a featured column and an "All …" row, and a brand announcement bar above it.',
      },
    },
  },
  args: {
    showAnnouncement: true,
    showMetrics: true,
    showCategories: true,
    showSizes: true,
    showStyles: true,
  },
  render: (args: MerchandisingArgs) => (
    <DemoApp initialPath="/men/shoes/running">
      <Merchandising {...args} />
    </DemoApp>
  ),
} satisfies Meta<MerchandisingArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
