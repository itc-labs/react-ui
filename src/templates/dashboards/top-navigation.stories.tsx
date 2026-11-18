import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActivityIcon } from '../../components/icon/outline/activity';
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

type TopNavigationArgs = {
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

function TopNavigation({ showMetrics, showCharts, showTable }: TopNavigationArgs) {
  return (
    <WorkspaceShell
      variant="classic"
      topbar={
        <Navbar
          sticky={false}
          brand={{ title: 'Northwind', logo: <ActivityIcon />, href: '/dashboard' }}
          items={navigation}
          navigationLabel="Main navigation"
          actions={
            <>
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
  title: 'Templates/Dashboards/Top navigation',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The starting point without a sidebar: Navbar with its default appearance, alignment and underline, a mega menu, notifications and the account menu, and no custom classes. Copy it when the project only needs a standard top navigation.',
      },
    },
  },
  args: { showMetrics: true, showCharts: true, showTable: true },
  render: (args: TopNavigationArgs) => (
    <DemoApp>
      <TopNavigation {...args} />
    </DemoApp>
  ),
} satisfies Meta<TopNavigationArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
