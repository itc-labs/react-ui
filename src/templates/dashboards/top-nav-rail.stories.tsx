import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Chart } from '@itclabs/react-ui/chart';
import { WorkspaceShell } from '@itclabs/react-ui/templates';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { IconButton } from '../../components/icon-button';
import { WalletIcon } from '../../components/icon/outline/wallet';
import { Progress } from '../../components/progress';
import { Select } from '../../components/select';
import { Tag } from '../../components/tag';
import { KpiCard, KpiGrid } from '../../modules/kpi-card';
import { Navbar } from '../../modules/navbar';
import { PageHeader } from '../../modules/page-header';
import { Sidebar } from '../../modules/sidebar';
import { UserMenu } from '../../modules/user-menu';
import { DemoNotifications, OrdersTable } from './__demo/blocks';
import { demoAccount, demoCurrency, demoNavigation, demoRevenue } from './__demo/data';
import { DemoApp, useDemoPath } from './__demo/demo-app';

type TopNavRailArgs = {
  showTopbar: boolean;
  showRail: boolean;
  showGreeting: boolean;
  showBalance: boolean;
  showWallets: boolean;
  showMetrics: boolean;
  showIncome: boolean;
  showSpendingLimit: boolean;
  showCards: boolean;
  showTable: boolean;
};

const navigation = [
  { id: 'overview', label: 'Overview', href: '/dashboard' },
  { id: 'activity', label: 'Activity', href: '/activity' },
  { id: 'manage', label: 'Manage', href: '/manage' },
  { id: 'program', label: 'Program', href: '/program' },
  { id: 'account', label: 'Account', href: '/account' },
  { id: 'reports', label: 'Reports', href: '/reports' },
];
const railItems = demoNavigation.flatMap((entry) =>
  entry.type === 'group' && entry.id === 'main' ? entry.items : [],
);
const wallets = [
  {
    currency: 'USD',
    name: 'US dollar',
    balance: 38250,
    limit: '$10,000',
    active: true,
  },
  { currency: 'EUR', name: 'Euro', balance: 12680, limit: '€5,000', active: true },
  {
    currency: 'GBP',
    name: 'British pound',
    balance: 0,
    limit: '£2,500',
    active: false,
  },
];
const balances: Record<string, number> = { USD: 51889, EUR: 47930, GBP: 40260 };
const income = demoRevenue.slice(0, 11).map((point) => ({
  ...point,
  values: {
    subscriptions: Math.round(point.values.revenue! * 0.8),
    services: Math.round(point.values.revenue! * 0.2),
  },
}));
const metrics = [
  { label: 'Total earnings', value: '$24,900', trend: 12.4, tone: 'brand' },
  { label: 'Spending', value: '$3,250', trend: -6.2, tone: 'brand' },
  { label: 'Income', value: '$8,420', trend: 8.1, tone: 'brand' },
  { label: 'Revenue', value: '$48,290', trend: 12.4, tone: 'brand' },
] as const;

function TopNavRailPage({
  showGreeting,
  showBalance,
  showWallets,
  showMetrics,
  showIncome,
  showSpendingLimit,
  showCards,
  showTable,
}: TopNavRailArgs) {
  const [currency, setCurrency] = useState('USD');
  const formatBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <>
      {showGreeting && (
        <PageHeader
          title="Good morning, Olivia"
          description="Your money at a glance. Here is your financial overview for November 18, 2026."
          classNames={{ title: 'text-heading', description: 'mt-2' }}
          className="mb-6"
        />
      )}
      <div className="grid min-w-0 gap-6">
        {(showBalance || showWallets) && (
          <Card
            title={showBalance ? 'Total balance' : 'Wallets'}
            description={
              showBalance ? 'Available across your wallets' : 'Your currency accounts'
            }
            action={
              showBalance ? (
                <Select
                  aria-label="Balance currency"
                  size="sm"
                  rootClassName="w-24 shrink-0"
                  options={wallets.map(({ currency: code }) => ({
                    value: code,
                    label: code,
                  }))}
                  value={currency}
                  onValueChange={(value) => value && setCurrency(value)}
                />
              ) : undefined
            }
            classNames={{ header: 'flex-wrap' }}
          >
            {showBalance && (
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="grid gap-3">
                  <p className="text-display font-semibold text-ink tabular-nums">
                    {formatBalance.format(balances[currency]!)}
                  </p>
                  <p className="flex flex-wrap items-center gap-2">
                    <Tag tone="success">+8.2%</Tag>
                    <span>vs October · indicative exchange rates</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button>Transfer</Button>
                  <Button variant="secondary">Request</Button>
                </div>
              </div>
            )}
            {showWallets && (
              <div
                className={`grid min-w-0 gap-4 md:grid-cols-3 ${showBalance ? 'mt-6' : ''}`}
              >
                {wallets.map((wallet) => (
                  <Card key={wallet.currency} className="bg-canvas p-4 shadow-none">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-ink">{wallet.currency}</h3>
                      <Tag size="sm" tone={wallet.active ? 'success' : 'neutral'}>
                        {wallet.active ? 'Active' : 'Inactive'}
                      </Tag>
                    </div>
                    <p className="mt-1">{wallet.name}</p>
                    <p className="mt-4 text-section font-semibold text-ink tabular-nums">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: wallet.currency,
                        maximumFractionDigits: 0,
                      }).format(wallet.balance)}
                    </p>
                    <p className="mt-2">Monthly transfer limit · {wallet.limit}</p>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}
        {showMetrics && (
          <KpiGrid columns={4}>
            {metrics.map((metric) => (
              <KpiCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                tone={metric.tone}
                trend={{ value: metric.trend, label: 'vs October', intent: 'positive' }}
              />
            ))}
          </KpiGrid>
        )}
        {(showIncome || showSpendingLimit || showCards) && (
          <div className="grid min-w-0 gap-6 xl:grid-cols-3">
            {showIncome && (
              <Card
                title="Total income"
                description="Subscriptions and services · January–November 2026"
                className={`flex flex-col ${showSpendingLimit || showCards ? 'xl:col-span-2' : 'xl:col-span-3'}`}
                contentClassName="flex flex-1 flex-col"
              >
                <Chart
                  type="bar"
                  stacked
                  label="Monthly income from subscriptions and services in 2026"
                  data={income}
                  series={[
                    {
                      id: 'subscriptions',
                      label: 'Subscriptions',
                      color: 'var(--color-chart-1)',
                    },
                    {
                      id: 'services',
                      label: 'Services',
                      color: 'var(--color-chart-2)',
                    },
                  ]}
                  height={300}
                  className="flex flex-1 flex-col"
                  classNames={{ viewport: 'flex-auto' }}
                  valueFormatter={(value) => demoCurrency.format(value)}
                  axisValueFormatter={(value) => `$${value / 1000}k`}
                />
              </Card>
            )}
            {(showSpendingLimit || showCards) && (
              <div
                className={`grid min-w-0 gap-6 ${showIncome ? '' : 'xl:col-span-3 md:grid-cols-2'}`}
              >
                {showSpendingLimit && (
                  <Card
                    title="Monthly spending limit"
                    description="November 2026 · resets December 1"
                  >
                    <p className="mb-4 text-section font-semibold text-ink tabular-nums">
                      $3,250{' '}
                      <span className="text-ui-sm font-normal text-muted">
                        of $5,000
                      </span>
                    </p>
                    <Progress
                      value={3250}
                      max={5000}
                      label="Monthly spending"
                      showValue
                    />
                    <p className="mt-3">$1,750 left to spend this month.</p>
                  </Card>
                )}
                {showCards && (
                  <Card title="My cards" description="Olivia Martin · 2 debit cards">
                    <div className="grid gap-4">
                      {[
                        {
                          name: 'Everyday debit',
                          number: '4821',
                          expires: '11/29',
                          active: true,
                        },
                        {
                          name: 'Travel debit',
                          number: '9016',
                          expires: '08/28',
                          active: false,
                        },
                      ].map((card) => (
                        <Card
                          key={card.number}
                          className={
                            card.active
                              ? 'bg-brand-50 p-4 shadow-none'
                              : 'bg-canvas p-4 shadow-none'
                          }
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold text-ink">{card.name}</h3>
                            <Tag tone={card.active ? 'brand' : 'neutral'} size="sm">
                              {card.active ? 'Active' : 'Frozen'}
                            </Tag>
                          </div>
                          <p
                            className="my-4 font-medium tracking-widest text-ink"
                            aria-label={`Card ending in ${card.number}`}
                          >
                            •••• •••• •••• {card.number}
                          </p>
                          <p className="flex flex-wrap justify-between gap-2">
                            <span>Olivia Martin</span>
                            <span>Expires {card.expires}</span>
                          </p>
                        </Card>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
        {showTable && <OrdersTable title="Recent activities" />}
      </div>
    </>
  );
}

function TopNavRail(args: TopNavRailArgs) {
  const { path } = useDemoPath();

  return (
    <WorkspaceShell
      variant="floating"
      classNames={{
        topbar: 'm-2 rounded-panel border shadow-panel px-2 sm:px-3',
        main: 'px-4 py-6 sm:px-6 lg:px-8',
      }}
      topbar={
        args.showTopbar ? (
          <Navbar
            sticky={false}
            brand={{ title: 'Finexo', logo: <WalletIcon />, href: '/dashboard' }}
            items={navigation}
            currentPath={path}
            activeIndicator="pill"
            navigationLabel="Finexo navigation"
            className="rounded-panel border-0"
            classNames={{
              inner: 'gap-2 px-0 xl:gap-4',
              actions: 'gap-1',
              nav: 'lg:hidden xl:flex',
              mobileTrigger: 'lg:inline-flex xl:hidden',
            }}
            actions={
              <>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon="search"
                  className="hidden sm:inline-flex"
                  label="Search"
                />
                <DemoNotifications />
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon="info"
                  className="hidden sm:inline-flex"
                  label="Information"
                />
                <UserMenu {...demoAccount} compact />
              </>
            }
          />
        ) : undefined
      }
      sidebar={
        args.showRail ? (
          <Sidebar
            navigationLabel="Workspace shortcuts"
            // The topbar Navbar owns mobile navigation; avoid a second menu button.
            mobileTrigger={false}
            items={railItems}
            currentPath={path}
            collapsible="icon"
            defaultCollapsed
            collapseToggle="none"
            classNames={{ mobileTrigger: 'm-4' }}
          />
        ) : undefined
      }
      content={<TopNavRailPage {...args} />}
    />
  );
}

const meta = {
  title: 'Templates/Dashboards/Top nav rail',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A fintech workspace with a floating rounded topbar, pill navigation and a compact icon rail. The copyable WorkspaceShell frame is separate from TopNavRailPage, which combines balances, currency wallets, financial metrics, income, spending limits, debit cards and recent activities. Toggle each region in Controls to adapt the layout.',
      },
    },
  },
  args: {
    showTopbar: true,
    showRail: true,
    showGreeting: true,
    showBalance: true,
    showWallets: true,
    showMetrics: true,
    showIncome: true,
    showSpendingLimit: true,
    showCards: true,
    showTable: true,
  },
  argTypes: {
    showTopbar: { control: 'boolean' },
    showRail: { control: 'boolean' },
    showGreeting: { control: 'boolean' },
    showBalance: { control: 'boolean' },
    showWallets: { control: 'boolean' },
    showMetrics: { control: 'boolean' },
    showIncome: { control: 'boolean' },
    showSpendingLimit: { control: 'boolean' },
    showCards: { control: 'boolean' },
    showTable: { control: 'boolean' },
  },
  render: (args: TopNavRailArgs) => (
    <DemoApp>
      <TopNavRail {...args} />
    </DemoApp>
  ),
} satisfies Meta<TopNavRailArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
