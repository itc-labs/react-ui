import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../components/button';
import { ActivityIcon } from '../../components/icon/outline/activity';
import { LockIcon } from '../../components/icon/outline/lock';
import { ChartPieIcon } from '../../components/icon/outline/chart-pie';
import { HomeIcon } from '../../components/icon/outline/home';
import { ReceiptIcon } from '../../components/icon/outline/receipt';
import { UsersIcon } from '../../components/icon/outline/users';
import { Navbar, type NavbarItem } from '../../modules/navbar';
import { PageHeader } from '../../modules/page-header';
import { UserMenu } from '../../modules/user-menu';
import { WorkspaceShell } from '@itclabs/react-ui/templates';
import {
  ChannelsCard,
  DemoNotifications,
  KpiRow,
  OrdersTable,
  RevenueCard,
} from './__demo/blocks';
import { DemoApp } from './__demo/demo-app';
import { demoAccount } from './__demo/data';

type CenteredPillArgs = {
  showMetrics: boolean;
  showCharts: boolean;
  showTable: boolean;
};

const navigation: NavbarItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: ChartPieIcon },
  {
    id: 'sales',
    label: 'Sales',
    type: 'mega',
    sections: [
      {
        id: 'billing',
        title: 'Billing',
        items: [
          { id: 'orders', label: 'Orders', href: '/sales/orders', icon: ReceiptIcon },
          {
            id: 'invoices',
            label: 'Invoices',
            href: '/sales/invoices',
            icon: ReceiptIcon,
          },
        ],
      },
      {
        id: 'people',
        title: 'People',
        items: [
          { id: 'customers', label: 'Customers', href: '/customers', icon: UsersIcon },
        ],
      },
    ],
  },
];

function CenteredPill({ showMetrics, showCharts, showTable }: CenteredPillArgs) {
  return (
    <WorkspaceShell
      variant="classic"
      topbar={
        <Navbar
          sticky={false}
          itemVariant="pill"
          align="center"
          brand={{ title: 'Northwind', logo: <ActivityIcon />, href: '/dashboard' }}
          items={navigation}
          navigationLabel="Main navigation"
          className="border-0 bg-transparent"
          actions={
            <>
              <Button
                href="/settings/workspace"
                variant="secondary"
                size="sm"
                className="hidden rounded-full xl:inline-flex"
              >
                <LockIcon />
                Billing workspace
              </Button>
              <DemoNotifications />
              <UserMenu {...demoAccount} compact />
            </>
          }
        />
      }
      content={
        <>
          <PageHeader
            className="mb-6"
            classNames={{ title: 'text-heading' }}
            title="Dashboard"
            description="Revenue, orders and traffic for November 2026."
          />
          <div className="grid gap-6">
            {showMetrics && <KpiRow />}
            {showCharts && (
              <div className="grid gap-6 xl:grid-cols-3">
                <RevenueCard className="xl:col-span-2" />
                <ChannelsCard />
              </div>
            )}
            {showTable && <OrdersTable />}
          </div>
        </>
      }
    />
  );
}

const meta = {
  title: 'Templates/Dashboards/Centered pill',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A dashboard without a sidebar: a centred Navbar with solid pill items and a mega menu, a workspace chip, notifications and the account menu in a full-width topbar.',
      },
    },
  },
  args: { showMetrics: true, showCharts: true, showTable: true },
  render: (args: CenteredPillArgs) => (
    <DemoApp>
      <CenteredPill {...args} />
    </DemoApp>
  ),
} satisfies Meta<CenteredPillArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
