import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chart } from '@itclabs/react-ui/chart';
import { DashboardShell } from '@itclabs/react-ui/templates';
import { Card } from '../../components/card';
import { DateRangePicker } from '../../components/date-range-picker';
import { DropdownMenu } from '../../components/dropdown-menu';
import { IconButton } from '../../components/icon-button';
import { Input } from '../../components/input';
import { ActivityIcon } from '../../components/icon/outline/activity';
import { BanknotesIcon } from '../../components/icon/outline/banknotes';
import { PackageIcon } from '../../components/icon/outline/package';
import { ShoppingBagIcon } from '../../components/icon/outline/shopping-bag';
import { UsersIcon } from '../../components/icon/outline/users';
import { MetricTrend, KpiGrid } from '../../modules/kpi-card';
import type { SidebarEntry } from '../../modules/sidebar';
import { UserMenu } from '../../modules/user-menu';
import { OrdersTable } from './__demo/blocks';
import { demoAccount, demoCurrency } from './__demo/data';
import { DemoApp, useDemoPath } from './__demo/demo-app';

type FloatingCardsArgs = {
  showTopbar: boolean;
  showHeader: boolean;
  showMetrics: boolean;
  showOrderInformation: boolean;
  showSales: boolean;
  showHeatmap: boolean;
  showTable: boolean;
  density: 'compact' | 'default' | 'comfortable';
};

const navigation: SidebarEntry[] = [
  {
    id: 'menu',
    type: 'group',
    label: 'Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'home' },
      {
        id: 'orders',
        label: 'Order',
        href: '/orders',
        icon: ShoppingBagIcon,
        badge: 12,
      },
      { id: 'products', label: 'Products', href: '/products', icon: PackageIcon },
      { id: 'customers', label: 'Customers', href: '/customers', icon: UsersIcon },
      { id: 'report', label: 'Report', href: '/report', icon: 'chart' },
    ],
  },
  {
    id: 'tools',
    type: 'group',
    label: 'Tools',
    items: [
      { id: 'store', label: 'My store', href: '/store', icon: ShoppingBagIcon },
      {
        id: 'integration',
        label: 'Integration',
        href: '/integration',
        icon: 'settings',
      },
      { id: 'discount', label: 'Discount', href: '/discount', icon: 'tag' },
      { id: 'invoice', label: 'Invoice', href: '/invoice', icon: 'receipt' },
    ],
  },
  {
    id: 'support',
    type: 'group',
    label: 'Support',
    items: [
      { id: 'settings', label: 'Settings', href: '/settings', icon: 'settings' },
      { id: 'help', label: 'Help desk', href: '/help', icon: 'help' },
    ],
  },
];

const metrics = [
  {
    id: 'revenue',
    label: 'Total revenue',
    value: '$48,290',
    trend: 12.4,
    icon: BanknotesIcon,
  },
  {
    id: 'average',
    label: 'Average order',
    value: '$137.98',
    trend: 4.1,
    icon: ShoppingBagIcon,
  },
  {
    id: 'customers',
    label: 'Total customers',
    value: '1,842',
    trend: 8.6,
    icon: UsersIcon,
  },
  {
    id: 'products',
    label: 'Products sold',
    value: '526',
    trend: -2.3,
    icon: PackageIcon,
  },
];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const sales = weekdays.map((label, index) => ({
  id: label,
  label,
  values: { sales: [5210, 6340, 4820, 7680, 8940, 9670, 5630][index]! },
}));
const orderStatus = [
  { id: 'shipped', label: 'Shipped', value: 118 },
  { id: 'delivered', label: 'Delivered', value: 220 },
  { id: 'pending', label: 'Pending', value: 12 },
];
const marketplaces = [
  { name: 'Metrica store', visits: [120, 245, 390, 485, 680, 720, 520] },
  { name: 'Amazon', visits: [340, 480, 240, 560, 710, 640, 450] },
  { name: 'Etsy', visits: [75, 180, 280, 390, 480, 580, 320] },
  { name: 'eBay', visits: [95, 210, 140, 295, 380, 465, 250] },
];
// Five steps of the accent; only brand-50…800 exist as tokens, so opacity builds the scale.
const reachColors = [
  'bg-brand-700/10',
  'bg-brand-700/25',
  'bg-brand-700/45',
  'bg-brand-700/70',
  'bg-brand-700',
];
const maxVisits = Math.max(...marketplaces.flatMap(({ visits }) => visits));

const reachLevel = (count: number) =>
  Math.min(
    reachColors.length - 1,
    Math.floor((count / maxVisits) * reachColors.length),
  );

function FloatingCardsPage({
  showMetrics,
  showOrderInformation,
  showSales,
  showHeatmap,
  showTable,
}: FloatingCardsArgs) {
  return (
    <div className="grid min-w-0 gap-6">
      {showMetrics && (
        <KpiGrid columns={4}>
          {metrics.map(({ id, label, value, trend, icon: Glyph }) => (
            <Card key={id} aria-label={label}>
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="grid size-10 place-items-center rounded-control bg-brand-50 text-accent">
                  <Glyph />
                </span>
                <DropdownMenu
                  triggerAsChild
                  trigger={
                    <IconButton
                      icon="more"
                      label={`${label} options`}
                      variant="ghost"
                      size="sm"
                    />
                  }
                  items={[
                    { id: 'report', label: 'View report', href: `/report/${id}` },
                  ]}
                />
              </div>
              <h2 className="text-ui-sm font-medium text-muted">{label}</h2>
              <p className="mt-2 text-heading font-bold text-ink tabular-nums">
                {value}
              </p>
              <MetricTrend className="mt-3" value={trend} label="vs previous period" />
            </Card>
          ))}
        </KpiGrid>
      )}
      {(showOrderInformation || showSales) && (
        <div
          className={`grid min-w-0 gap-6 ${showOrderInformation && showSales ? 'xl:grid-cols-3' : ''}`}
        >
          {showOrderInformation && (
            <Card title="Order information" description="350 orders · Nov 8–18, 2026">
              <Chart
                type="donut"
                label="Orders by fulfillment status"
                data={orderStatus}
                height={260}
                valueFormatter={(value) => `${value} orders`}
              />
            </Card>
          )}
          {showSales && (
            <Card
              title="Total sales"
              description="Nov 9–15, 2026 · $48,290"
              className={showOrderInformation ? 'xl:col-span-2' : undefined}
            >
              <Chart
                type="bar"
                label="Total sales by weekday, November 9–15, 2026"
                data={sales}
                series={[{ id: 'sales', label: 'Sales' }]}
                height={260}
                legend={false}
                valueFormatter={(value) => demoCurrency.format(value)}
                axisValueFormatter={(value) => `$${Math.round(value / 1000)}k`}
              />
            </Card>
          )}
        </div>
      )}
      {showHeatmap && (
        <Card
          title="Product reach"
          description="Product page visits by marketplace · Nov 9–15, 2026"
        >
          <div
            className="min-w-0 overflow-x-auto focus-visible:outline-2 focus-visible:outline-focus"
            tabIndex={0}
            role="region"
            aria-label="Scrollable product reach table"
          >
            <table className="w-full min-w-120 table-fixed border-separate border-spacing-1.5 text-left text-ui-sm">
              <caption className="sr-only">
                Visits by marketplace and weekday. Darker cells indicate more visits.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-32">
                    Marketplace
                  </th>
                  {weekdays.map((day) => (
                    <th key={day} scope="col" className="text-center font-medium">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marketplaces.map(({ name, visits }) => (
                  <tr key={name}>
                    <th scope="row" className="whitespace-nowrap font-medium text-ink">
                      {name}
                    </th>
                    {visits.map((count, index) => (
                      <td
                        key={weekdays[index]}
                        // relative keeps the sr-only label inside the scroll area.
                        className={`relative h-10 rounded-control ${reachColors[reachLevel(count)]}`}
                        title={`${name}, ${weekdays[index]}: ${count} visits`}
                      >
                        <span className="sr-only">{count} visits</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="mt-4 flex items-center justify-end gap-1 text-ui-sm text-muted"
            aria-hidden="true"
          >
            <span className="mr-2">Fewer visits</span>
            {reachColors.map((color) => (
              <span key={color} className={`size-3 rounded-sm ${color}`} />
            ))}
            <span className="ml-2">More visits</span>
          </div>
        </Card>
      )}
      {showTable && <OrdersTable title="Recent orders" />}
    </div>
  );
}

function FloatingCards(args: FloatingCardsArgs) {
  const { path, navigate } = useDemoPath();

  return (
    <DashboardShell
      variant="floating"
      topbar={
        args.showTopbar ? (
          <>
            <span className="flex shrink-0 items-center gap-2 font-semibold text-ink">
              <span className="grid size-8 place-items-center rounded-control bg-accent text-on-brand">
                <ActivityIcon className="size-4" />
              </span>
              Metrica
            </span>
            <Input
              icon="search"
              type="search"
              aria-label="Search Metrica"
              placeholder="Search anything…"
              rootClassName="mx-auto hidden w-full max-w-md md:block"
            />
            <div className="ms-auto flex shrink-0 items-center gap-1 md:ms-0">
              <IconButton
                icon="messages"
                label="Chat"
                variant="ghost"
                onClick={() => navigate('/messages')}
              />
              <IconButton
                icon="bell"
                label="Notifications"
                variant="ghost"
                onClick={() => navigate('/notifications')}
              />
              <UserMenu {...demoAccount} description="Admin" />
            </div>
          </>
        ) : undefined
      }
      sidebar={{
        navigationLabel: 'Metrica navigation',
        // The topbar carries the brand; show it in the sidebar only without one.
        ...(args.showTopbar
          ? {}
          : {
              header: {
                title: 'Metrica',
                subtitle: 'Sales workspace',
                logo: <ActivityIcon />,
              },
            }),
        items: navigation,
        footerItems: [
          { id: 'logout', label: 'Logout', href: '/logout', icon: 'logout' },
        ],
        density: args.density,
        currentPath: path,
      }}
      header={
        args.showHeader ? (
          <h1 className="text-heading font-semibold text-ink">Sales overview</h1>
        ) : undefined
      }
      headerActions={
        args.showHeader ? (
          <DateRangePicker
            aria-label="Sales date range"
            defaultValue={{ from: '2026-11-08', to: '2026-11-18' }}
            today="2026-11-18"
            clearable={false}
          />
        ) : undefined
      }
    >
      <FloatingCardsPage {...args} />
    </DashboardShell>
  );
}

const meta = {
  title: 'Templates/Dashboards/Floating cards',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A sales workspace with a floating sidebar and rounded surface cards on a light canvas. Copy the DashboardShell configuration independently from FloatingCardsPage. The topbar combines the Metrica brand, search, chat, notifications and an Admin account menu; the page includes sales metrics, fulfillment and weekday charts, marketplace reach and recent orders. Toggle each page region in Controls and choose the sidebar density. Dates and values are illustrative; changing the date picker does not filter the fixtures.',
      },
    },
  },
  args: {
    showTopbar: true,
    showHeader: true,
    showMetrics: true,
    showOrderInformation: true,
    showSales: true,
    showHeatmap: true,
    showTable: true,
    density: 'default',
  },
  argTypes: {
    showTopbar: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    showMetrics: { control: 'boolean' },
    showOrderInformation: { control: 'boolean' },
    showSales: { control: 'boolean' },
    showHeatmap: { control: 'boolean' },
    showTable: { control: 'boolean' },
    density: { control: 'select', options: ['compact', 'default', 'comfortable'] },
  },
  render: (args: FloatingCardsArgs) => (
    <DemoApp>
      <FloatingCards {...args} />
    </DemoApp>
  ),
} satisfies Meta<FloatingCardsArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
