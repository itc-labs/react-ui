import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chart } from '@itclabs/react-ui/chart';
import { WorkspaceShell } from '@itclabs/react-ui/templates';
import { forestTheme } from '@itclabs/react-ui/theme/presets';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { IconButton } from '../../components/icon-button';
import { Tag } from '../../components/tag';
import { KpiCard, KpiGrid } from '../../modules/kpi-card';
import { Navbar, type NavbarItem } from '../../modules/navbar';
import { PageHeader } from '../../modules/page-header';
import { DemoNotifications, OrdersTable } from './__demo/blocks';
import { demoCurrency, demoOrders } from './__demo/data';
import { DemoApp } from './__demo/demo-app';

type FloatingCapsuleArgs = {
  showTopbar: boolean;
  showHeader: boolean;
  showMetrics: boolean;
  showRevenue: boolean;
  showActivity: boolean;
  showTable: boolean;
};

const navigation: NavbarItem[] = [
  { id: 'overview', label: 'Overview', href: '/dashboard' },
  { id: 'analytics', label: 'Analytics', href: '/analytics' },
  { id: 'customers', label: 'Customers', href: '/customers' },
  { id: 'billing', label: 'Billing', href: '/billing' },
  { id: 'settings', label: 'Settings', href: '/settings' },
];
const metrics = [
  { label: 'Monthly revenue', value: '$48,200', change: 8.2, intent: 'positive' },
  { label: 'Active users', value: '12,480', change: 3.1, intent: 'positive' },
  { label: 'Churn rate', value: '1.9%', change: -0.4, intent: 'positive' },
  { label: 'Trial to paid', value: '24%', change: -1.2, intent: 'negative' },
] as const;
// Daily revenue totals $48,200 for the October 1–25 snapshot.
const dailyRevenue = [
  1200, 1450, 1300, 1600, 1500, 1700, 1550, 1800, 1750, 1600, 1900, 1850, 2000, 1950,
  2100, 1800, 2050, 2200, 2100, 2300, 2150, 2400, 2250, 2600, 3100,
];
const revenue = dailyRevenue.map((value, index) => ({
  id: `2026-10-${String(index + 1).padStart(2, '0')}`,
  label: `Oct ${index + 1}`,
  values: { revenue: value },
}));
const activities = [
  { name: 'Northbeam', event: 'upgraded to Pro', time: '12 min ago' },
  { name: 'Lumen Kitchen', event: 'started a trial', time: '1 hour ago' },
  { name: 'Pixel Studio', event: 'invoice paid', time: '3 hours ago' },
];
const orders = demoOrders.map((order, index) => ({
  ...order,
  date: `2026-10-${String(25 - Math.floor(index / 2)).padStart(2, '0')}${order.date.slice(10)}`,
}));

function RevenueTrend() {
  return (
    <Card title="Revenue trend" description="$48,200 · October 1–25, 2026">
      <Chart
        type="area"
        label="Daily revenue, October 1–25, 2026"
        data={revenue}
        series={[{ id: 'revenue', label: 'Revenue' }]}
        height={260}
        legend={false}
        valueFormatter={(value) => demoCurrency.format(value)}
        axisValueFormatter={(value) => `$${value / 1000}k`}
      />
    </Card>
  );
}

function RecentActivity() {
  return (
    <Card title="Recent activity" description="October 25, 2026 · Sample activity">
      <ul className="divide-y divide-line">
        {activities.map((activity) => (
          <li key={activity.name} className="flex items-start gap-3 py-5 first:pt-0">
            <Avatar alt={activity.name} size="sm" />
            <div className="min-w-0 text-ui-sm">
              <p className="text-ink">
                <span className="font-semibold">{activity.name}</span> {activity.event}
              </p>
              <p className="mt-1 text-muted">{activity.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function FloatingCapsulePage({
  showHeader,
  showMetrics,
  showRevenue,
  showActivity,
  showTable,
}: FloatingCapsuleArgs) {
  return (
    <>
      {showHeader && (
        <PageHeader
          title="Overview"
          description="Last 30 days · Sample data"
          className="mb-6"
          classNames={{ title: 'text-heading', description: 'mt-2' }}
          action={
            <Tag className="rounded-full border border-line bg-surface px-4 py-2 text-ink">
              Oct 1 – Oct 25, 2026
            </Tag>
          }
        />
      )}
      <div className="grid min-w-0 gap-6">
        {showMetrics && (
          <KpiGrid columns={4}>
            {metrics.map((metric) => (
              <KpiCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                trend={{
                  value: metric.change,
                  intent: metric.intent,
                  label: 'vs previous period',
                }}
              />
            ))}
          </KpiGrid>
        )}
        {(showRevenue || showActivity) && (
          <div
            className={`grid min-w-0 gap-6 ${showRevenue && showActivity ? 'lg:grid-cols-2' : ''}`}
          >
            {showRevenue && <RevenueTrend />}
            {showActivity && <RecentActivity />}
          </div>
        )}
        {showTable && <OrdersTable title="Recent orders" rows={orders} />}
      </div>
    </>
  );
}

function FloatingCapsule(args: FloatingCapsuleArgs) {
  return (
    <WorkspaceShell
      variant="floating"
      classNames={{
        topbar: 'border-0 bg-canvas px-0 sm:px-0 justify-center',
        main: 'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8',
      }}
      topbar={
        args.showTopbar ? (
          <Navbar
            appearance="floating"
            tone="dark"
            align="center"
            sticky
            brand={{
              title: 'Orbit',
              href: '/dashboard',
              logo: (
                <span
                  aria-hidden="true"
                  className="size-5 rounded-full border-2 border-current"
                />
              ),
            }}
            items={navigation}
            navigationLabel="Orbit navigation"
            classNames={{
              brand: 'gap-2',
              brandLogo: 'size-7 rounded-full bg-transparent text-inherit',
              actions: 'gap-1',
            }}
            actions={
              <>
                <span
                  aria-hidden="true"
                  className="mx-2 hidden h-5 w-px bg-[var(--navbar-border)] sm:block"
                />
                <IconButton
                  icon="search"
                  label="Search"
                  variant="ghost"
                  href="/search"
                  className="hidden rounded-full sm:inline-flex"
                />
                <DemoNotifications className="rounded-full" />
                <Button
                  href="/reports/new"
                  size="sm"
                  className="mx-2 hidden rounded-full sm:inline-flex"
                >
                  + New report
                </Button>
                <Avatar alt="Alex Kim" fallback="AK" size="sm" />
              </>
            }
          />
        ) : undefined
      }
      content={<FloatingCapsulePage {...args} />}
    />
  );
}

const meta = {
  title: 'Templates/Dashboards/Floating capsule',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An Orbit-inspired workspace with a floating dark capsule navbar, four headline metrics, a daily revenue chart, recent activity and a shared orders table. The October 1–25, 2026 snapshot uses sample data. Each widget owns its interactions; toggle regions in Controls to adapt the page.',
      },
    },
  },
  args: {
    showTopbar: true,
    showHeader: true,
    showMetrics: true,
    showRevenue: true,
    showActivity: true,
    showTable: true,
  },
  argTypes: {
    showTopbar: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    showMetrics: { control: 'boolean' },
    showRevenue: { control: 'boolean' },
    showActivity: { control: 'boolean' },
    showTable: { control: 'boolean' },
  },
  render: (args: FloatingCapsuleArgs) => (
    <DemoApp theme={forestTheme.light}>
      <FloatingCapsule {...args} />
    </DemoApp>
  ),
} satisfies Meta<FloatingCapsuleArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
