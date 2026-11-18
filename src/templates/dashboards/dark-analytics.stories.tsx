import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Chart } from '@itclabs/react-ui/chart';
import { WorkspaceShell } from '@itclabs/react-ui/templates';
import { emberTheme } from '@itclabs/react-ui/theme/presets';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { ActivityIcon } from '../../components/icon/outline/activity';
import { BellIcon } from '../../components/icon/outline/bell';
import { ChartIcon } from '../../components/icon/outline/chart';
import { DatabaseIcon } from '../../components/icon/outline/database';
import { FolderIcon } from '../../components/icon/outline/folder';
import { HomeIcon } from '../../components/icon/outline/home';
import { PlugIcon } from '../../components/icon/outline/plug';
import { SettingsIcon } from '../../components/icon/outline/settings';
import { SparklesIcon } from '../../components/icon/outline/sparkles';
import { UsersIcon } from '../../components/icon/outline/users';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Slider } from '../../components/slider';
import { Tabs } from '../../components/tabs';
import {
  DataTable,
  type ColumnDef,
  type DataTableState,
} from '../../modules/data-table';
import { KpiCard, KpiGrid } from '../../modules/kpi-card';
import {
  Sidebar,
  SidebarProvider,
  SidebarMobileTrigger,
  type SidebarEntry,
} from '../../modules/sidebar';
import { UserMenu } from '../../modules/user-menu';
import { ChannelsCard, DemoNotifications } from './__demo/blocks';
import { demoAccount, demoCurrency } from './__demo/data';
import {
  analyticsKpis,
  analyticsProducts,
  analyticsRanges,
  analyticsRecommendations,
  analyticsSeries,
  type AnalyticsProduct,
} from './__demo/dark-analytics-data';
import { DemoApp, useDemoPath } from './__demo/demo-app';

type DarkAnalyticsArgs = {
  mode: 'dark' | 'light';
  showTopbar: boolean;
  showSidebar: boolean;
  showHeader: boolean;
  showKpis: boolean;
  showRevenue: boolean;
  showTraffic: boolean;
  showSimulator: boolean;
  showRecommendations: boolean;
  showTable: boolean;
};

const navigation: SidebarEntry[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  {
    id: 'sources',
    label: 'Data sources',
    href: '/sources',
    icon: DatabaseIcon,
    badge: 12,
  },
  { id: 'reports', label: 'Reports', href: '/reports', icon: FolderIcon },
  { id: 'insights', label: 'AI insights', href: '/insights', icon: SparklesIcon },
  { id: 'simulator', label: 'Simulator', href: '/simulator', icon: ActivityIcon },
  { id: 'alerts', label: 'Alerts', href: '/alerts', icon: BellIcon, badge: 3 },
  { id: 'integrations', label: 'Integrations', href: '/integrations', icon: PlugIcon },
  { id: 'team', label: 'Team', href: '/team', icon: UsersIcon },
  { id: 'settings', label: 'Settings', href: '/settings', icon: SettingsIcon },
];

const productColumns: ColumnDef<AnalyticsProduct, unknown>[] = [
  { accessorKey: 'name', header: 'Product' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'orders', header: 'Orders' },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    cell: ({ row }) => demoCurrency.format(row.original.revenue),
  },
  {
    accessorKey: 'conversion',
    header: 'Conversion',
    cell: ({ row }) => `${row.original.conversion}%`,
  },
];

function DarkAnalyticsPage({
  showKpis,
  showRevenue,
  showTraffic,
  showSimulator,
  showRecommendations,
  showTable,
}: DarkAnalyticsArgs) {
  const { navigate } = useDemoPath();
  const [tableState, setTableState] = useState<DataTableState>({
    sorting: [{ id: 'revenue', desc: true }],
    pagination: { pageIndex: 0, pageSize: 5 },
  });
  const [budget, setBudget] = useState(20);
  const [conversion, setConversion] = useState(10);
  const [retention, setRetention] = useState(5);
  const projectedRevenue =
    48291 * (1 + budget / 500) * (1 + conversion / 100) * (1 + retention / 100);

  return (
    <div className="grid min-w-0 gap-6">
      {showKpis && (
        <KpiGrid columns={5} classNames={{ grid: '@3xl:grid-cols-5 @6xl:grid-cols-5' }}>
          {analyticsKpis.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              trend={{ value: kpi.trend, label: 'vs last period' }}
            />
          ))}
        </KpiGrid>
      )}
      {(showRevenue || showTraffic) && (
        <div
          className={`grid min-w-0 gap-6 ${showRevenue && showTraffic ? 'xl:grid-cols-3' : ''}`}
        >
          {showRevenue && (
            <Card
              title="Revenue vs conversion"
              description="Change since first observation · each metric starts at 0%"
              className={showTraffic ? 'xl:col-span-2' : ''}
            >
              <Tabs
                defaultValue="30D"
                variant="segmented"
                size="sm"
                label="Chart time range"
                keepMounted={false}
                classNames={{ content: 'border-0 p-0' }}
                items={analyticsRanges.map((range) => ({
                  value: range,
                  label: range,
                  content: (
                    <Chart
                      type="line"
                      label={`Revenue and conversion percentage change, ${range}, ending November 18, 2026`}
                      data={analyticsSeries(range)}
                      series={[
                        { id: 'revenue', label: 'Revenue change' },
                        { id: 'conversion', label: 'Conversion change' },
                      ]}
                      height={260}
                      valueFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                  ),
                }))}
              />
            </Card>
          )}
          {showTraffic && <ChannelsCard distinctColors />}
        </div>
      )}
      {showSimulator && (
        <Card
          title="Strategy simulator"
          description="Explore a scenario for your next 30 days. Estimates are illustrative, based on November 2026 revenue."
        >
          <div className="grid min-w-0 gap-6 md:grid-cols-3">
            <Slider
              label="Marketing budget increase"
              min={0}
              max={100}
              value={budget}
              onValueChange={setBudget}
              showValue="always"
              formatValue={(value) => `${value}%`}
            />
            <Slider
              label="Conversion improvement"
              min={0}
              max={50}
              value={conversion}
              onValueChange={setConversion}
              showValue="always"
              formatValue={(value) => `${value}%`}
            />
            <Slider
              label="Retention improvement"
              min={0}
              max={30}
              value={retention}
              onValueChange={setRetention}
              showValue="always"
              formatValue={(value) => `${value}%`}
            />
          </div>
          <p className="mt-6 text-ink" aria-live="polite">
            Projected monthly revenue:{' '}
            <strong className="text-accent tabular-nums">
              {demoCurrency.format(projectedRevenue)}
            </strong>
          </p>
        </Card>
      )}
      {showRecommendations && (
        <section aria-labelledby="recommendations-title" className="grid min-w-0 gap-4">
          <h2
            id="recommendations-title"
            className="text-section font-semibold text-ink"
          >
            AI recommendations
          </h2>
          <div className="grid min-w-0 gap-4 xl:grid-cols-3">
            {analyticsRecommendations.map((item) => (
              <Card
                key={item.id}
                title={item.title}
                classNames={{ title: 'text-body' }}
              >
                <p className="mb-3 font-semibold text-accent">{item.impact}</p>
                <p>{item.reason}</p>
                <Button
                  className="mt-4"
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/insights/${item.id}`)}
                >
                  {item.action}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}
      {showTable && (
        <Card
          title="Top performing products"
          description="October 20 – November 18, 2026 · ranked by revenue"
          classNames={{ content: 'p-0' }}
        >
          <DataTable
            caption="Top performing products"
            className="border-0 shadow-none"
            classNames={{ toolbar: 'px-0' }}
            rows={analyticsProducts}
            columns={productColumns}
            rowId={(row) => row.id}
            filterable
            pagination
            pageSizeOptions={[5, 10, 20]}
            state={tableState}
            onStateChange={setTableState}
          />
        </Card>
      )}
    </div>
  );
}

function DarkAnalytics(args: DarkAnalyticsArgs) {
  const { path, navigate } = useDemoPath();
  const [workspace, setWorkspace] = useState('growth');

  return (
    <WorkspaceShell
      variant="classic"
      stickyHeader
      classNames={{ topbar: 'flex-wrap gap-3 py-3', header: 'justify-start gap-3' }}
      topbar={
        args.showTopbar ? (
          <>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ChartIcon /> Buildora
            </Button>
            <Input
              aria-label="Search reports, metrics, datasets"
              placeholder="Search reports, metrics, datasets…"
              icon="search"
              rootClassName="order-last w-full min-w-0 md:order-none md:w-auto md:flex-1 md:max-w-xl"
            />
            <Button
              className="ms-auto shrink-0"
              onClick={() => navigate('/sources/new')}
            >
              Add data
            </Button>
            <DemoNotifications />
            <UserMenu
              {...demoAccount}
              name="Liam Nguyen"
              description="liam.nguyen@example.com"
              compact
            />
          </>
        ) : undefined
      }
      sidebar={
        args.showSidebar ? (
          <Sidebar
            {...(args.showHeader ? { mobileTrigger: false as const } : {})}
            appearance={args.mode === 'dark' ? 'default' : 'dark'}
            currentPath={path}
            navigationLabel="Analytics navigation"
            items={navigation}
            header={{
              title: workspace === 'growth' ? 'Growth team' : 'Product team',
              subtitle: 'Buildora workspace',
              logo: <ChartIcon />,
              switcher: {
                value: workspace,
                onValueChange: setWorkspace,
                items: [
                  { id: 'growth', label: 'Growth team' },
                  { id: 'product', label: 'Product team' },
                ],
              },
            }}
          />
        ) : undefined
      }
      header={
        args.showHeader ? (
          <>
            {args.showSidebar && <SidebarMobileTrigger />}
            <h1 className="min-w-0 flex-1 text-heading font-semibold text-ink">
              Welcome back, Liam
            </h1>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:ms-auto">
              <Select
                aria-label="Reporting period"
                rootClassName="w-full sm:w-44"
                defaultValue="30"
                options={[
                  { value: '30', label: 'Last 30 days' },
                  { value: '7', label: 'Last 7 days' },
                  { value: '90', label: 'Last 90 days' },
                ]}
              />
              <Button variant="secondary" onClick={() => navigate('/reports/export')}>
                Export
              </Button>
              <Button variant="secondary" onClick={() => navigate('/reports/share')}>
                Share
              </Button>
            </div>
          </>
        ) : undefined
      }
    >
      <DarkAnalyticsPage {...args} />
    </WorkspaceShell>
  );
}

const meta = {
  title: 'Templates/Dashboards/Dark analytics',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An ember-themed growth analytics workspace with a global search bar, workspace switcher, five headline metrics, revenue and conversion percentage changes, traffic sources, an interactive strategy simulator, AI recommendations and a product performance table. Copy the WorkspaceShell frame separately from DarkAnalyticsPage, switch between dark and light, and toggle each region in Controls.',
      },
    },
  },
  args: {
    mode: 'dark',
    showTopbar: true,
    showSidebar: true,
    showHeader: true,
    showKpis: true,
    showRevenue: true,
    showTraffic: true,
    showSimulator: true,
    showRecommendations: true,
    showTable: true,
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['dark', 'light'] },
    showTopbar: { control: 'boolean' },
    showSidebar: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    showKpis: { control: 'boolean' },
    showRevenue: { control: 'boolean' },
    showTraffic: { control: 'boolean' },
    showSimulator: { control: 'boolean' },
    showRecommendations: { control: 'boolean' },
    showTable: { control: 'boolean' },
  },
  render: (args: DarkAnalyticsArgs) => (
    <DemoApp theme={args.mode === 'dark' ? emberTheme.dark : emberTheme.light}>
      <SidebarProvider>
        <DarkAnalytics {...args} />
      </SidebarProvider>
    </DemoApp>
  ),
} satisfies Meta<DarkAnalyticsArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
