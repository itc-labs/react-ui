import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useImperativeHandle, useRef, type Ref } from 'react';
import { DashboardShell } from '@itclabs/react-ui/templates';
import { Chart } from '@itclabs/react-ui/chart';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { IconButton } from '../../components/icon-button';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Tabs } from '../../components/tabs';
import { Tag } from '../../components/tag';
import { WalletIcon } from '../../components/icon/outline/wallet';
import { RepeatIcon } from '../../components/icon/outline/repeat';
import { ReceiptIcon } from '../../components/icon/outline/receipt';
import { MessagesIcon } from '../../components/icon/outline/messages';
import { ProgressList } from '../../modules/progress-list';
import type { SidebarEntry } from '../../modules/sidebar';
import { DemoNotifications, OrdersTable, PromoCard } from './__demo/blocks';
import { DemoApp } from './__demo/demo-app';
import {
  demoAccount,
  demoCurrency,
  demoFooterNavigation,
  demoNavigation,
  demoRevenue,
} from './__demo/data';

type SidebarSearchArgs = {
  showSearch: boolean;
  showPromo: boolean;
  showUpcoming: boolean;
  showTransactions: boolean;
  showEarning: boolean;
  showSpending: boolean;
  showCashFlow: boolean;
  showHeader: boolean;
  showHeaderActions: boolean;
  showAccount: boolean;
  showNavigation: boolean;
  showFooterLinks: boolean;
  variant: 'inset' | 'classic';
};

const navigation: SidebarEntry[] = [
  ...demoNavigation.filter((entry) => entry.id === 'main'),
  {
    id: 'features',
    type: 'group',
    label: 'Features',
    items: [
      ...demoNavigation.flatMap((entry) =>
        entry.id === 'workspace' && entry.type === 'group' ? entry.items : [],
      ),
      { id: 'recurring', label: 'Recurring', href: '/recurring', icon: RepeatIcon },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        href: '/subscriptions',
        icon: ReceiptIcon,
      },
    ],
  },
  {
    id: 'general',
    type: 'group',
    label: 'General',
    items: [
      { id: 'feedback', label: 'Feedback', href: '/feedback', icon: MessagesIcon },
    ],
  },
];

const destinations = [...navigation, ...demoFooterNavigation]
  .flatMap((entry) => (entry.type === 'group' ? entry.items : [entry]))
  .flatMap((entry) => (entry.type === 'submenu' ? entry.items : [entry]));

const bills = [
  {
    name: 'Cloudnest',
    plan: 'Team hosting',
    amount: 89,
    date: '2026-11-20',
    due: 'Nov 20',
  },
  {
    name: 'Framewise',
    plan: 'Design workspace',
    amount: 24,
    date: '2026-11-22',
    due: 'Nov 22',
  },
  {
    name: 'Postlane',
    plan: 'Email automation',
    amount: 49,
    date: '2026-11-25',
    due: 'Nov 25',
  },
  {
    name: 'Metric Grove',
    plan: 'Product analytics',
    amount: 79,
    date: '2026-11-28',
    due: 'Nov 28',
  },
];

// Use the shared monthly series through November; December has not happened yet.
const yearRevenue = demoRevenue.slice(0, 11);
const novemberRevenue = [3, 6, 9, 12, 15, 18].map((day, index) => ({
  id: `nov-${day}`,
  label: `Nov ${day}`,
  values: {
    revenue:
      Number(demoRevenue[10]!.values.revenue) *
      [0.12, 0.15, 0.14, 0.2, 0.18, 0.21][index]!,
  },
}));
const cashFlow = yearRevenue.map((point) => ({
  ...point,
  values: {
    ...point.values,
    savings: Number(point.values.revenue) - Number(point.values.expenses),
  },
}));
const cashFlowTabs = [
  { id: 'revenue', label: 'Income' },
  { id: 'expenses', label: 'Expense' },
  { id: 'savings', label: 'Savings' },
];

function EarningCard() {
  const [period, setPeriod] = useState<string | null>('month');

  return (
    <Card
      title="Earning overview"
      description={period === 'year' ? 'January–November 2026' : 'November 1–18, 2026'}
      classNames={{ header: 'flex-wrap', heading: 'min-w-0' }}
      action={
        <Select
          aria-label="Earning period"
          size="sm"
          rootClassName="w-36"
          value={period}
          onValueChange={setPeriod}
          searchable={false}
          options={[
            { value: 'month', label: 'This month' },
            { value: 'year', label: 'Yearly' },
          ]}
        />
      }
    >
      <p className="mb-4 text-heading font-semibold tabular-nums text-ink">
        {demoCurrency.format(
          (period === 'year' ? yearRevenue : novemberRevenue).reduce(
            (total, point) => total + Number(point.values.revenue),
            0,
          ),
        )}
      </p>
      <Chart
        type="area"
        label={
          period === 'year'
            ? 'Income by month in 2026 through November'
            : 'Income every three days in November 2026'
        }
        data={period === 'year' ? yearRevenue : novemberRevenue}
        series={[{ id: 'revenue', label: 'Income' }]}
        height={240}
        legend={false}
        valueFormatter={(value) => demoCurrency.format(value)}
        axisValueFormatter={(value) => `$${value / 1000}k`}
      />
    </Card>
  );
}

type WorkspaceSearchHandle = { open: () => void };

function WorkspaceSearch({ ref }: { ref: Ref<WorkspaceSearchHandle> }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = destinations.filter((entry) =>
    String(entry.label).toLowerCase().includes(query.trim().toLowerCase()),
  );

  useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);

  return (
    <Dialog
      title="Search Ledgerly"
      description="Find a page in your finance workspace."
      open={open}
      onOpenChange={setOpen}
    >
      <Input
        aria-label="Search workspace pages"
        icon="search"
        placeholder="Search pages…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div
        className="mt-4 grid max-h-72 gap-1 overflow-y-auto"
        aria-label="Search results"
      >
        {results.map((entry) => (
          <Button
            key={entry.id}
            variant="ghost"
            className="justify-start"
            {...('href' in entry && entry.href ? { href: entry.href } : {})}
            onClick={() => {
              setOpen(false);
              setQuery('');
            }}
          >
            {entry.label}
          </Button>
        ))}
        {results.length === 0 && (
          <p className="text-ui-sm text-muted" role="status">
            No pages found. Try “Invoices” or “Subscriptions”.
          </p>
        )}
      </div>
    </Dialog>
  );
}

function SidebarSearchPage({
  showEarning,
  showSpending,
  showCashFlow,
  showUpcoming,
  showTransactions,
}: SidebarSearchArgs) {
  return (
    <>
      <div className="grid min-w-0 gap-6">
        {(showEarning || showSpending) && (
          <div
            className={`grid min-w-0 gap-6 ${showEarning && showSpending ? 'xl:grid-cols-2' : ''}`}
          >
            {showEarning && <EarningCard />}
            {showSpending && (
              <Card
                title="Spending overview"
                description="November 2026 · month to date"
              >
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <p className="text-heading font-semibold tabular-nums text-ink">
                    $25,000
                  </p>
                  <Tag tone="success">↓ 6.2% vs October</Tag>
                </div>
                <ProgressList
                  label="Spending by category"
                  valueFormatter={(_, item) => demoCurrency.format(item.value ?? 0)}
                  items={[
                    { id: 'payroll', label: 'Payroll', value: 12500, max: 25000 },
                    {
                      id: 'operations',
                      label: 'Operations',
                      value: 6250,
                      max: 25000,
                      tone: 'info',
                    },
                    {
                      id: 'marketing',
                      label: 'Marketing',
                      value: 3750,
                      max: 25000,
                      tone: 'warning',
                    },
                    {
                      id: 'software',
                      label: 'Software & subscriptions',
                      value: 2500,
                      max: 25000,
                      tone: 'success',
                    },
                  ]}
                />
              </Card>
            )}
          </div>
        )}
        {(showCashFlow || showUpcoming) && (
          <div
            className={`grid min-w-0 gap-6 ${showCashFlow && showUpcoming ? 'xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]' : ''}`}
          >
            {showCashFlow && (
              <Card title="Cash flow" description="January–November 2026">
                <Tabs
                  label="Cash flow category"
                  size="sm"
                  keepMounted={false}
                  classNames={{ content: 'border-0 p-0' }}
                  items={cashFlowTabs.map((tab) => ({
                    value: tab.id,
                    label: tab.label,
                    content: (
                      <Chart
                        type="bar"
                        label={`${tab.label} by month in 2026 through November`}
                        data={cashFlow}
                        series={[{ id: tab.id, label: tab.label }]}
                        height={250}
                        legend={false}
                        valueFormatter={(value) => demoCurrency.format(value)}
                        axisValueFormatter={(value) => `$${value / 1000}k`}
                      />
                    ),
                  }))}
                />
              </Card>
            )}
            {showUpcoming && (
              <Card
                title="Upcoming bills"
                description="Your next scheduled subscriptions"
                classNames={{ header: 'flex-wrap' }}
                action={
                  <Button variant="ghost" size="sm" href="/subscriptions">
                    View all
                  </Button>
                }
              >
                <ul className="divide-y divide-line">
                  {bills.map((bill) => (
                    <li
                      key={bill.name}
                      className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{bill.name}</p>
                        <p className="text-ui-sm text-muted">{bill.plan}</p>
                        <time dateTime={bill.date} className="text-ui-sm text-muted">
                          Due {bill.due}, 2026
                        </time>
                      </div>
                      <div className="grid shrink-0 justify-items-end gap-1">
                        <p className="font-semibold tabular-nums text-ink">
                          {demoCurrency.format(bill.amount)}
                        </p>
                        <Tag size="sm" tone="info">
                          Scheduled
                        </Tag>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
        {showTransactions && <OrdersTable title="Recent transactions" />}
      </div>
    </>
  );
}

function SidebarSearch(args: SidebarSearchArgs) {
  const search = useRef<WorkspaceSearchHandle>(null);

  return (
    <DashboardShell
      variant={args.variant}
      sidebar={{
        navigationLabel: 'Ledgerly navigation',
        appearance: 'default',
        collapsible: 'none',
        defaultCollapsed: false,
        header: {
          title: 'Ledgerly',
          subtitle: 'Finance workspace',
          logo: <WalletIcon />,
        },
        items: args.showNavigation ? navigation : [],
        footerItems: args.showFooterLinks ? demoFooterNavigation : [],
        search: args.showSearch
          ? {
              placeholder: 'Search workspace',
              shortcut: 'mod+k',
              onOpen: () => search.current?.open(),
            }
          : undefined,
        footer: args.showPromo ? <PromoCard /> : undefined,
      }}
      header={
        args.showHeader ? (
          <h1 className="text-section font-semibold text-ink">
            Welcome back, Olivia <span aria-hidden="true">👋</span>
          </h1>
        ) : undefined
      }
      headerActions={
        args.showHeaderActions ? (
          <>
            <IconButton
              variant="ghost"
              size="sm"
              icon="help"
              label="Help"
              href="/help"
            />
            <IconButton
              variant="ghost"
              size="sm"
              icon="messages"
              label="Messages"
              href="/messages"
            />
            <DemoNotifications />
          </>
        ) : undefined
      }
      {...(args.showAccount ? { account: demoAccount } : {})}
      accountPlacement="header"
    >
      <SidebarSearchPage {...args} />
      {args.showSearch && <WorkspaceSearch ref={search} />}
    </DashboardShell>
  );
}

const meta = {
  title: 'Templates/Dashboards/Sidebar search',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A classic finance workspace with an expanded Ledgerly sidebar, a mod+k search launcher, grouped navigation and a Starter plan upgrade. The header greets Olivia and holds quick actions and her account menu; the separate page combines earning and spending overviews, cash flow tabs, upcoming subscriptions and recent transactions. Copy the DashboardShell configuration for the frame and customise SidebarSearchPage independently. Toggle regions and switch between inset and classic frames in Controls.',
      },
    },
  },
  args: {
    showSearch: true,
    showPromo: true,
    showUpcoming: true,
    showTransactions: true,
    showEarning: true,
    showSpending: true,
    showCashFlow: true,
    showHeader: true,
    showHeaderActions: true,
    showAccount: true,
    showNavigation: true,
    showFooterLinks: true,
    variant: 'classic',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['inset', 'classic'] },
    showSearch: { control: 'boolean' },
    showPromo: { control: 'boolean' },
    showUpcoming: { control: 'boolean' },
    showTransactions: { control: 'boolean' },
    showEarning: { control: 'boolean' },
    showSpending: { control: 'boolean' },
    showCashFlow: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    showHeaderActions: { control: 'boolean' },
    showAccount: { control: 'boolean' },
    showNavigation: { control: 'boolean' },
    showFooterLinks: { control: 'boolean' },
  },
  render: (args: SidebarSearchArgs) => (
    <DemoApp>
      <SidebarSearch {...args} />
    </DemoApp>
  ),
} satisfies Meta<SidebarSearchArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
