import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { IconButton } from '../../components/icon-button';
import { Input } from '../../components/input';
import { Tag } from '../../components/tag';
import { BoltIcon } from '../../components/icon/outline/bolt';
import { BuildingIcon } from '../../components/icon/outline/building';
import { CartIcon } from '../../components/icon/outline/cart';
import { FireIcon } from '../../components/icon/outline/fire';
import { HeartIcon } from '../../components/icon/outline/heart';
import { MailIcon } from '../../components/icon/outline/mail';
import { PhoneIcon } from '../../components/icon/outline/phone';
import { SearchIcon } from '../../components/icon/outline/search';
import { ShieldCheckIcon } from '../../components/icon/outline/shield-check';
import { SparklesIcon } from '../../components/icon/outline/sparkles';
import { TagIcon } from '../../components/icon/outline/tag';
import { TreeIcon } from '../../components/icon/outline/tree';
import { UserIcon } from '../../components/icon/outline/user';
import { KpiCard, KpiGrid } from '../../modules/kpi-card';
import { Navbar, type NavbarItem, type NavbarSection } from '../../modules/navbar';
import { PageHeader } from '../../modules/page-header';
import { ProgressList } from '../../modules/progress-list';
import { Chart } from '@itclabs/react-ui/chart';
import { WorkspaceShell } from '@itclabs/react-ui/templates';
import { OrdersTable } from './__demo/blocks';
import { demoCurrency } from './__demo/data';
import { DemoApp } from './__demo/demo-app';

type StorefrontArgs = {
  showTopbar: boolean;
  showCategories: boolean;
  showMetrics: boolean;
  showSales: boolean;
  showTopProducts: boolean;
  showOrders: boolean;
};

const section = (id: string, title: string, labels: string[]): NavbarSection => ({
  id,
  title,
  items: labels.map((label) => ({
    id: `${id}-${label}`,
    label,
    href: `/catalog/${id}/${label.toLowerCase().replaceAll(' ', '-')}`,
  })),
  more: { id: `${id}-all`, label: 'Show all →', href: `/catalog/${id}` },
});

const categories: NavbarItem = {
  id: 'catalog',
  type: 'mega',
  layout: 'categories',
  label: 'Choose the category',
  className:
    'h-14 rounded-none bg-accent px-4 text-on-brand hover:bg-brand-800 hover:text-on-brand data-[state=open]:bg-brand-800 data-[state=open]:text-on-brand',
  categories: [
    {
      id: 'construction',
      label: 'Construction',
      icon: BuildingIcon,
      href: '/catalog/construction',
      action: {
        id: 'construction-all',
        label: 'Show all products',
        href: '/catalog/construction',
      },
      sections: [
        section('paving', 'Paving tools', ['Grabs', 'Guillotines', 'Paving carts']),
        section('hand', 'Hand tools', [
          'Hammers',
          'Toolboxes',
          'Scissors and secateurs',
        ]),
        section('concrete', 'Concrete equipment', ['Concrete mixers', 'Trowels']),
      ],
    },
    {
      id: 'power',
      label: 'Power Tools',
      icon: BoltIcon,
      action: { id: 'power-all', label: 'Show all products', href: '/catalog/power' },
      sections: [
        section('drills', 'Drills', [
          'Cordless drills',
          'Hammer drills',
          'Impact drivers',
        ]),
        section('saws', 'Saws', ['Circular saws', 'Jigsaws', 'Mitre saws']),
      ],
    },
    {
      id: 'garden',
      label: 'Garden',
      icon: TreeIcon,
      sections: [section('mowers', 'Lawn mowers', ['Petrol mowers', 'Robotic mowers'])],
    },
    {
      id: 'protective',
      label: 'Protective clothing',
      icon: ShieldCheckIcon,
      sections: [section('workwear', 'Workwear', ['Jackets', 'Trousers', 'Gloves'])],
    },
  ],
};

/** The category row on desktop; the main bar keeps the same list for the mobile drawer. */
const storeNavigation: NavbarItem[] = [
  categories,
  {
    id: 'power-tools',
    type: 'dropdown',
    label: 'Electric power tools',
    children: [
      { id: 'all-power', label: 'All power tools', href: '/catalog/power' },
      {
        id: 'drills',
        type: 'dropdown',
        label: 'Drills',
        children: [
          {
            id: 'cordless',
            label: 'Cordless drills',
            href: '/catalog/drills/cordless',
          },
          { id: 'hammer', label: 'Hammer drills', href: '/catalog/drills/hammer' },
        ],
      },
    ],
  },
  { id: 'garden-tools', label: 'Garden tools', href: '/catalog/garden' },
  { id: 'air', label: 'Air conditioners', href: '/catalog/air' },
  {
    id: 'bestsellers',
    label: 'Bestsellers',
    icon: FireIcon,
    href: '/bestsellers',
    className:
      'ms-3 before:absolute before:-start-2 before:h-5 before:w-px before:bg-line',
  },
  { id: 'new', label: 'New', icon: SparklesIcon, href: '/new' },
  { id: 'sales', label: 'Sales', icon: TagIcon, href: '/sales' },
];

const dailySales = [
  'Nov 12',
  'Nov 13',
  'Nov 14',
  'Nov 15',
  'Nov 16',
  'Nov 17',
  'Nov 18',
].map((label, index) => ({
  id: label,
  label,
  values: {
    online: [6200, 7100, 6800, 8400, 9900, 9100, 7600][index]!,
    store: [2100, 2400, 2300, 3100, 3800, 3500, 2600][index]!,
  },
}));

const topProducts = [
  { id: 'drill', label: 'Cordless drill 18V', value: 182, max: 200 },
  { id: 'mixer', label: 'Concrete mixer 140 L', value: 96, max: 200 },
  { id: 'mower', label: 'Robotic mower R600', value: 74, max: 200 },
  { id: 'gloves', label: 'Work gloves, pack of 12', value: 61, max: 200 },
];

/** An icon action with a caption under it, as storefront headers show. */
function CaptionAction({
  icon,
  label,
  href,
  badge,
}: {
  icon: typeof UserIcon;
  label: string;
  href: string;
  badge?: number;
}) {
  return (
    <Button
      href={href}
      variant="ghost"
      className="relative h-auto flex-col gap-0.5 px-2 py-1 text-xs font-medium"
    >
      <IconButton
        icon={icon}
        label={label}
        variant="ghost"
        size="sm"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none size-6"
        {...(badge ? { badge } : {})}
      />
      {label}
    </Button>
  );
}

function StorefrontPage({
  showMetrics,
  showSales,
  showTopProducts,
  showOrders,
}: Pick<
  StorefrontArgs,
  'showMetrics' | 'showSales' | 'showTopProducts' | 'showOrders'
>) {
  return (
    <>
      <PageHeader
        className="mb-6"
        classNames={{ title: 'text-heading' }}
        title="Store overview"
        description="Online and in-store sales for November 12–18, 2026."
        action={<Tag tone="success">All stores open</Tag>}
      />
      <div className="grid min-w-0 gap-6">
        {showMetrics && (
          <KpiGrid columns={4}>
            <KpiCard
              label="Sales today"
              value="$10,200"
              trend={{ value: 6.4, label: 'vs last Wednesday' }}
            />
            <KpiCard
              label="Orders"
              value="214"
              trend={{ value: 3.2, label: 'vs last week' }}
            />
            <KpiCard
              label="Average order"
              value="$47.66"
              trend={{ value: -1.8, label: 'vs last week' }}
            />
            <KpiCard
              label="Low stock items"
              value="18"
              trend={{ value: 12, label: 'need reorder', intent: 'negative' }}
            />
          </KpiGrid>
        )}
        {(showSales || showTopProducts) && (
          <div className="grid min-w-0 gap-6 xl:grid-cols-3">
            {showSales && (
              <Card
                title="Sales by channel"
                description="Last 7 days"
                className={
                  showTopProducts ? 'min-w-0 xl:col-span-2' : 'min-w-0 xl:col-span-3'
                }
              >
                <Chart
                  type="bar"
                  stacked
                  label="Online and in-store sales for the last 7 days"
                  data={dailySales}
                  series={[
                    { id: 'online', label: 'Online', color: 'var(--color-chart-1)' },
                    { id: 'store', label: 'In store', color: 'var(--color-chart-2)' },
                  ]}
                  height={260}
                  valueFormatter={(value) => demoCurrency.format(value)}
                  axisValueFormatter={(value) => `$${value / 1000}k`}
                />
              </Card>
            )}
            {showTopProducts && (
              <Card
                title="Best sellers"
                description="Units sold this week"
                className="min-w-0"
              >
                <ProgressList label="Units sold this week" items={topProducts} />
              </Card>
            )}
          </div>
        )}
        {showOrders && <OrdersTable title="Latest orders" />}
      </div>
    </>
  );
}

function Storefront(args: StorefrontArgs) {
  return (
    <WorkspaceShell
      variant="classic"
      classNames={{ topbar: 'border-0 bg-transparent p-0 sm:p-0' }}
      topbar={
        <Navbar
          sticky={false}
          brand={{ title: 'HIMART', href: '/dashboard' }}
          items={storeNavigation}
          navigationLabel="Store navigation"
          classNames={{
            brandTitle: 'text-heading font-black italic tracking-tight',
            // The menu lives in the category row on desktop; this list feeds the mobile drawer.
            nav: 'lg:hidden',
            secondary: 'hidden p-0 lg:block',
          }}
          {...(args.showTopbar
            ? {
                topbar: (
                  <>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 [&>span+span]:border-s [&>span+span]:border-current/30 [&>span+span]:ps-3">
                      <span>Delivery in 24h</span>
                      <span>Free delivery from $500</span>
                      <span className="hidden sm:inline">30 days for returns</span>
                    </span>
                    <span className="flex flex-wrap gap-4">
                      <a
                        href="tel:+48290977318"
                        className="inline-flex items-center gap-1.5"
                      >
                        <PhoneIcon className="size-4" /> +48 290 977 318
                      </a>
                      <a
                        href="mailto:contact@himart.com"
                        className="hidden items-center gap-1.5 sm:inline-flex"
                      >
                        <MailIcon className="size-4" /> contact@himart.com
                      </a>
                    </span>
                  </>
                ),
              }
            : {})}
          actions={
            <>
              <Input
                aria-label="Search products"
                icon={SearchIcon}
                placeholder="Search product, brand or category…"
                rootClassName="me-4 hidden w-[30rem] max-w-full md:grid"
                endAddon={
                  <Button variant="soft" size="sm" className="bg-canvas text-ink">
                    Search
                  </Button>
                }
              />
              <CaptionAction icon={UserIcon} label="Profile" href="/account" />
              <CaptionAction icon={HeartIcon} label="Favorites" href="/favorites" />
              <CaptionAction icon={CartIcon} label="Cart" href="/cart" badge={2} />
            </>
          }
          {...(args.showCategories
            ? {
                secondary: (
                  <div className="bg-canvas">
                    <Navbar
                      sticky={false}
                      itemVariant="ghost"
                      className="border-0 bg-transparent"
                      classNames={{ inner: 'min-h-14 px-0' }}
                      items={storeNavigation}
                      navigationLabel="Categories"
                    />
                  </div>
                ),
              }
            : {})}
        />
      }
      content={<StorefrontPage {...args} />}
    />
  );
}

const meta = {
  title: 'Templates/Dashboards/Storefront',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A store back office with a storefront header: a top bar for delivery notes and contacts, a wide search, captioned account actions and a category row whose first item opens a category mega menu. Below lg the menu moves into the drawer, one level at a time.',
      },
    },
  },
  args: {
    showTopbar: true,
    showCategories: true,
    showMetrics: true,
    showSales: true,
    showTopProducts: true,
    showOrders: true,
  },
  render: (args: StorefrontArgs) => (
    <DemoApp initialPath="/catalog/garden">
      <Storefront {...args} />
    </DemoApp>
  ),
} satisfies Meta<StorefrontArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
