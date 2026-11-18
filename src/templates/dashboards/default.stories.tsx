import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from '../../components/breadcrumb';
import { ActivityIcon } from '../../components/icon/outline/activity';
import { PageHeader } from '../../modules/page-header';
import { DashboardShell } from '@itclabs/react-ui/templates';
import {
  ActivityCard,
  DemoNotifications,
  KpiRow,
  OrdersTable,
  RevenueCard,
} from './__demo/blocks';
import { DemoApp } from './__demo/demo-app';
import { demoAccount, demoFooterNavigation, demoNavigation } from './__demo/data';

type DefaultDashboardArgs = {
  showMetrics: boolean;
  showCharts: boolean;
  showTable: boolean;
};

function DefaultDashboard({
  showMetrics,
  showCharts,
  showTable,
}: DefaultDashboardArgs) {
  return (
    <DashboardShell
      sidebar={{
        navigationLabel: 'Workspace navigation',
        header: {
          title: 'Northwind',
          subtitle: 'Workspace',
          logo: <ActivityIcon />,
        },
        items: demoNavigation,
        footerItems: demoFooterNavigation,
      }}
      account={demoAccount}
      header={
        <Breadcrumb
          items={[
            { key: 'workspace', title: 'Workspace', href: '/dashboard' },
            { key: 'dashboard', title: 'Dashboard' },
          ]}
        />
      }
      headerActions={<DemoNotifications />}
    >
      <PageHeader
        className="mb-6"
        classNames={{ title: 'text-heading' }}
        title="Dashboard"
        description="Revenue, orders and recent activity for November 2026."
      />
      <div className="grid gap-6">
        {showMetrics && <KpiRow />}
        {showCharts && (
          <div className="grid gap-6 xl:grid-cols-3">
            <RevenueCard className="xl:col-span-2" />
            <ActivityCard />
          </div>
        )}
        {showTable && <OrdersTable />}
      </div>
    </DashboardShell>
  );
}

const meta = {
  title: 'Templates/Dashboards/Default',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The starting point: DashboardShell with its default variant, sidebar appearance and spacing, and no custom classes. Copy it when the project only needs the standard dashboard, then replace the sample data.',
      },
    },
  },
  args: { showMetrics: true, showCharts: true, showTable: true },
  render: (args: DefaultDashboardArgs) => (
    <DemoApp>
      <DefaultDashboard {...args} />
    </DemoApp>
  ),
} satisfies Meta<DefaultDashboardArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
