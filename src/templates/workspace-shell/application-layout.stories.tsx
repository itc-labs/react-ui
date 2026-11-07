import { UIProvider } from '../../theme/provider';
import {
  useCallback,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { WorkspaceShell } from './index';
import { DashboardShell } from '@itclabs/react-ui/templates';
import { Sidebar, type SidebarEntry, type SidebarProps } from '../../modules/sidebar';
import { Navbar, type NavbarItem } from '../../modules/navbar';
import { UserMenu } from '../../modules/user-menu';
import { PageHeader } from '../../modules/page-header';
import { DataTable, type ColumnDef } from '../../modules/data-table';
import { Button } from '../../components/button';
import { Chart, type ChartPoint } from '@itclabs/react-ui/chart';
import { Timeline } from '../../components/timeline';
import { Alert } from '../../components/alert';
import { ProgressList } from '../../modules/progress-list';
import { Progress } from '../../components/progress';
import { Tag } from '../../components/tag';
import { Card } from '../../components/card';
import { Breadcrumb } from '../../components/breadcrumb';
import { type UiLinkProps } from '../../components/link-image-provider';
import { HomeIcon } from '../../components/icon/outline/home';
import { FolderIcon } from '../../components/icon/outline/folder';
import { SettingsIcon } from '../../components/icon/outline/settings';

const meta = {
  title: 'Templates/ApplicationLayout',
  component: WorkspaceShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An application layout with interactive navigation, a collapsible Sidebar, UserMenu and sample content. The host manages currentPath with state and a UiLink adapter; no router is required.',
      },
    },
  },
} satisfies Meta<typeof WorkspaceShell>;
export default meta;
type Story = StoryObj<typeof meta>;

const sidebarItems: SidebarEntry[] = [
  {
    id: 'main',
    type: 'group',
    label: 'Main',
    items: [
      { id: 'overview', label: 'Overview', href: '/overview', icon: HomeIcon },
      { id: 'files', label: 'Files', href: '/files', icon: FolderIcon, badge: 18 },
      {
        id: 'settings',
        type: 'submenu',
        label: 'Settings',
        href: '/settings',
        icon: SettingsIcon,
        badge: 3,
        items: [
          { id: 'profile', label: 'Profile', href: '/settings/profile' },
          { id: 'team', label: 'Team', href: '/settings/team' },
        ],
      },
    ],
  },
];
const navbarItems: NavbarItem[] = [
  { id: 'overview', label: 'Overview', href: '/overview', icon: HomeIcon },
  { id: 'files', label: 'Files', href: '/files', icon: FolderIcon },
  {
    id: 'resources',
    label: 'Resources',
    type: 'mega',
    sections: [
      {
        id: 'workspace',
        title: 'Workspace',
        items: [
          {
            id: 'profile',
            label: 'Profile',
            href: '/settings/profile',
            icon: SettingsIcon,
          },
          { id: 'team', label: 'Team', href: '/settings/team', icon: FolderIcon },
        ],
      },
      {
        id: 'guides',
        title: 'Guides',
        items: [
          {
            id: 'start',
            label: 'Getting started',
            href: '/guides/start',
            icon: HomeIcon,
          },
        ],
      },
    ],
  },
];
const pageLabels: Record<string, string> = {
  '/overview': 'Overview',
  '/files': 'Files',
  '/settings': 'Settings',
  '/settings/profile': 'Profile',
  '/settings/team': 'Team',
  '/guides/start': 'Getting started',
};

function ApplicationExample({
  topNavigation = false,
  variant = 'inset',
}: {
  topNavigation?: boolean;
  variant?: NonNullable<ComponentProps<typeof WorkspaceShell>['variant']>;
}) {
  const [currentPath, setCurrentPath] = useState('/overview');
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState('');
  const DemoLink = useCallback(
    ({ href, onClick, ...props }: UiLinkProps) => (
      <a
        {...props}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          event.preventDefault();
          setCurrentPath(href);
        }}
      />
    ),
    [],
  );
  const userMenu = (
    <UserMenu
      name="Lorem Ipsum"
      description="lorem@example.com"
      collapseOnMobile={false}
      classNames={{
        trigger:
          'w-full border-transparent bg-transparent hover:bg-surface/60 group-data-[collapsed=true]/sidebar:justify-center',
        details: 'group-data-[collapsed=true]/sidebar:hidden',
        chevron: 'group-data-[collapsed=true]/sidebar:hidden',
      }}
      items={[
        { id: 'profile', label: 'Profile', href: '/settings/profile' },
        { id: 'separator', type: 'separator' },
        {
          id: 'logout',
          label: 'Sign out',
          onSelect: () => setNotice('Sign out selected'),
        },
      ]}
    />
  );
  const title = pageLabels[currentPath] ?? 'Overview';

  return (
    <UIProvider link={DemoLink}>
      <WorkspaceShell
        variant={variant}
        {...(topNavigation
          ? {}
          : {
              sidebar: (
                <Sidebar
                  variant={variant === 'floating' ? 'floating' : 'sidebar'}
                  collapsed={collapsed}
                  onCollapsedChange={setCollapsed}
                  toggleShortcut="mod+b"
                  header={{
                    title: 'Lorem ipsum',
                    subtitle: 'Workspace',
                    logo: <HomeIcon />,
                    href: '/overview',
                  }}
                  footer={userMenu}
                  items={sidebarItems}
                  currentPath={currentPath}
                  data-testid="app-sidebar"
                />
              ),
            })}
        classNames={{ header: 'p-0 sm:p-0 lg:p-0 border-b-0', main: 'w-full' }}
        header={
          topNavigation ? (
            <Navbar
              brand={{ title: 'Lorem ipsum', logo: <HomeIcon />, href: '/overview' }}
              items={navbarItems}
              currentPath={currentPath}
              activeIndicator="underline"
              actions={userMenu}
            />
          ) : (
            <div className="flex min-h-16 w-full items-center justify-between gap-3 border-b border-line bg-surface px-5">
              <span className="font-semibold">Workspace</span>
              <Tag tone="success">Ready</Tag>
            </div>
          )
        }
        content={
          <>
            <PageHeader
              title={title}
              breadcrumb={
                <Breadcrumb
                  items={[
                    { key: 'home', title: 'Workspace', href: '/overview' },
                    { key: 'current', title },
                  ]}
                />
              }
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              action={<Tag tone="info">Fixture data</Tag>}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <Card title="Lorem ipsum" description="Dolor sit amet.">
                <Progress value={64} label="Completion" showValue />
              </Card>
              <Card title="Consectetur" action={<Tag tone="success">Active</Tag>}>
                <Progress variant="circular" value={76} label="Coverage" />
              </Card>
              <Card title="Adipiscing elit" className="md:col-span-2">
                <ProgressList
                  items={[
                    { id: 'alpha', label: 'Group A', value: 42, max: 60 },
                    { id: 'beta', label: 'Group B', value: 28, max: 40 },
                    { id: 'gamma', label: 'Group C', value: 9, max: 30, tone: 'info' },
                  ]}
                />
              </Card>
            </div>
            <p role="status" className="mt-4 text-ui-sm text-muted">
              {notice}
            </p>
          </>
        }
      />
    </UIProvider>
  );
}

export const Playground: Story = {
  tags: ['usage'],
  name: 'ApplicationLayout',
  args: { variant: 'inset' },
  argTypes: {
    variant: { control: 'select', options: ['inset', 'classic', 'floating'] },
  },
  render: (args: ComponentProps<typeof WorkspaceShell>) => (
    <ApplicationExample variant={args.variant ?? 'inset'} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (window.innerWidth < 1024)
      await userEvent.click(canvas.getByRole('button', { name: 'Open sidebar' }));
    const scope =
      window.innerWidth < 1024
        ? within(canvasElement.ownerDocument.body).getByRole('dialog')
        : canvasElement;
    await userEvent.click(within(scope).getByRole('link', { name: /Files/ }));
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Files' }),
    ).toBeVisible();
  },
};
export const TopNavigationLayout: Story = {
  tags: ['example'],
  render: () => <ApplicationExample topNavigation />,
};
type DashboardSection = Pick<
  Extract<SidebarEntry, { type?: 'item' }>,
  'id' | 'label' | 'icon'
>;

function DashboardLayout({
  title,
  sections,
  variant,
  sidebarAppearance,
  children,
}: {
  title: string;
  sections: readonly DashboardSection[];
  variant: NonNullable<ComponentProps<typeof WorkspaceShell>['variant']>;
  sidebarAppearance: Pick<
    SidebarProps,
    'tone' | 'itemVariant' | 'defaultCollapsed' | 'expandOnHover'
  >;
  children: ReactNode;
}) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const content = useRef<HTMLDivElement>(null);

  const [notice, setNotice] = useState('');

  const selectSection = (section: DashboardSection) => {
    setActiveSection(section.id);
    content.current
      ?.querySelector(`#${section.id}`)
      ?.scrollIntoView({ block: 'start' });
  };

  return (
    <DashboardShell
      variant={variant}
      sidebar={{
        ...sidebarAppearance,
        navigationLabel: `${title} navigation`,
        header: { title, logo: <HomeIcon /> },
        items: sections.map((section) => ({
          ...section,
          active: section.id === activeSection,
          onSelect: () => selectSection(section),
        })),
      }}
      account={{
        name: 'Alex Morgan',
        description: 'Workspace admin',
        items: [
          {
            id: 'account',
            label: 'Account details',
            onSelect: () => setNotice('Alex Morgan · alex@example.com'),
          },
          {
            id: 'overview',
            label: 'Back to overview',
            onSelect: () => {
              const overview = sections[0];
              if (overview) selectSection(overview);
            },
          },
        ],
      }}
      classNames={{ main: variant === 'inset' ? 'max-w-6xl' : 'max-w-none' }}
      header={<span className="font-semibold">{title}</span>}
    >
      <div ref={content}>{children}</div>
      <p role="status" className="text-ui-sm text-muted">
        {notice}
      </p>
    </DashboardShell>
  );
}

type DashboardMetric = { label: string; value: string; detail: string };

function DashboardMetrics({
  items,
  layout,
}: {
  items: readonly DashboardMetric[];
  layout: 'strip' | 'tiles';
}) {
  return (
    <dl
      className={
        layout === 'strip'
          ? 'm-0 grid divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0'
          : 'm-0 grid gap-3 sm:grid-cols-3'
      }
    >
      {items.map(({ label, value, detail }) => (
        <div
          key={label}
          className={
            layout === 'strip'
              ? 'px-4 py-4 sm:px-5'
              : 'border border-line bg-surface p-4'
          }
        >
          <dt className="text-ui-sm font-medium text-muted">{label}</dt>
          <dd className="mt-1 text-heading font-semibold text-ink tabular-nums">
            {value}
          </dd>
          <dd className="mt-1 text-ui-sm text-muted">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

const salesByDay = [12, 15, 11, 19, 17, 24, 20, 18, 23, 21, 26, 24, 32, 29].map(
  (orders, index) => ({
    day: index + 1,
    online: orders,
    retail: 5 + (index % 4) * 2,
  }),
);
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function SalesDashboardExample() {
  const [days, setDays] = useState<7 | 14>(7);
  const sales = salesByDay.slice(-days);
  const online = sales.reduce((total, day) => total + day.online, 0);
  const retail = sales.reduce((total, day) => total + day.retail, 0);
  const revenue = online * 48 + retail * 36;
  const trend = sales.map((day) => ({
    id: String(day.day),
    label: `Nov ${day.day}`,
    values: { revenue: day.online * 48 + day.retail * 36 },
  }));

  return (
    <DashboardLayout
      title="Commerce workspace"
      variant="inset"
      sidebarAppearance={{ itemVariant: 'indicator' }}
      sections={[
        { id: 'sales-overview', label: 'Overview', icon: HomeIcon },
        { id: 'sales-revenue', label: 'Revenue', icon: FolderIcon },
        { id: 'sales-channels', label: 'Sales channels', icon: SettingsIcon },
      ]}
    >
      <PageHeader
        id="sales-overview"
        className="mb-6 scroll-mt-20"
        classNames={{ title: 'text-heading', description: 'mt-2' }}
        title="Sales overview"
        description="Track revenue, order volume, and sales channels."
        action={
          <div role="group" aria-label="Date range" className="flex gap-2">
            {([7, 14] as const).map((range) => (
              <Button
                key={range}
                variant={days === range ? 'soft' : 'outline'}
                aria-pressed={days === range}
                onClick={() => setDays(range)}
              >
                {range} days
              </Button>
            ))}
          </div>
        }
      />
      <div className="grid gap-5">
        <DashboardMetrics
          layout="strip"
          items={[
            {
              label: 'Revenue',
              value: currency.format(revenue),
              detail: `Last ${days} days`,
            },
            {
              label: 'Orders',
              value: String(online + retail),
              detail: 'Across both channels',
            },
            {
              label: 'Average order value',
              value: currency.format(revenue / (online + retail)),
              detail: 'Revenue per order',
            },
          ]}
        />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card
            id="sales-revenue"
            className="scroll-mt-20 rounded-control shadow-none"
            title="Revenue trend"
          >
            <Chart
              type="area"
              label="Daily revenue"
              data={trend}
              series={[{ id: 'revenue', label: 'Revenue' }]}
              valueFormatter={(value) => currency.format(value)}
              height={240}
            />
          </Card>
          <Card
            id="sales-channels"
            className="scroll-mt-20 rounded-control shadow-none"
            title="Orders by channel"
          >
            <Chart
              type="donut"
              label="Orders by channel"
              data={[
                { id: 'online', label: 'Online', value: online },
                { id: 'retail', label: 'Retail', value: retail },
              ]}
              height={240}
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export const SalesDashboard: Story = {
  tags: ['example'],
  render: () => <SalesDashboardExample />,
};

const fulfillmentQueue = [
  { id: 'ORD-104', owner: 'Alex Morgan', stage: 'Picking', due: '10:30' },
  { id: 'ORD-103', owner: 'Jamie Chen', stage: 'Packing', due: '11:15' },
  { id: 'ORD-102', owner: 'Sam Rivera', stage: 'Ready', due: '12:00' },
];
const fulfillmentColumns: ColumnDef<(typeof fulfillmentQueue)[number], unknown>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'owner', header: 'Assignee' },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ row }) => (
      <Tag tone={row.original.stage === 'Ready' ? 'success' : 'info'}>
        {row.original.stage}
      </Tag>
    ),
  },
  { accessorKey: 'due', header: 'Due' },
];

export const OperationsDashboard: Story = {
  tags: ['example'],
  render: () => (
    <DashboardLayout
      title="Fulfillment workspace"
      variant="classic"
      sidebarAppearance={{ tone: 'dark', itemVariant: 'raised' }}
      sections={[
        { id: 'operations-overview', label: 'Overview', icon: HomeIcon },
        { id: 'operations-orders', label: 'Order queue', icon: FolderIcon },
        { id: 'operations-stations', label: 'Stations', icon: SettingsIcon },
      ]}
    >
      <PageHeader
        id="operations-overview"
        className="mb-6 scroll-mt-20"
        classNames={{ title: 'text-heading', description: 'mt-2' }}
        title="Fulfillment overview"
        description="Track today’s output and see what is due next."
      />
      <div className="grid gap-5">
        <DashboardMetrics
          layout="tiles"
          items={[
            { label: 'Ready for pickup', value: '24', detail: 'Today' },
            { label: 'In progress', value: '18', detail: 'Across active stations' },
            { label: 'Due within an hour', value: '3', detail: 'Priority orders' },
          ]}
        />
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card
            id="operations-orders"
            className="scroll-mt-20 rounded-none p-4 shadow-none"
            title="Next orders due"
          >
            <DataTable
              caption="Next orders due"
              className="rounded-none border-0 shadow-none"
              rows={fulfillmentQueue}
              columns={fulfillmentColumns}
              rowId={(row) => row.id}
              filterable
            />
          </Card>
          <Card
            id="operations-stations"
            className="scroll-mt-20 rounded-none p-4 shadow-none"
            title="Station throughput"
            description="Orders processed against today's target."
          >
            <ProgressList
              items={[
                { id: 'picking', label: 'Picking', value: 42, max: 50 },
                { id: 'packing', label: 'Packing', value: 32, max: 50 },
                { id: 'dispatch', label: 'Dispatch', value: 24, max: 50 },
              ]}
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  ),
};

const serviceSamples: ChartPoint[] = [
  { id: '09', label: '09:00', values: { rate: 96, errors: 0.3, latency: 125 } },
  { id: '10', label: '10:00', values: { rate: 120, errors: 0.4, latency: 142 } },
  { id: '11', label: '11:00', values: { rate: 184, errors: 1.2, latency: 218 } },
  { id: '12', label: '12:00', values: { rate: 145, errors: 0.6, latency: 164 } },
  { id: '13', label: '13:00', values: { rate: 132, errors: 0.4, latency: 148 } },
];
const serviceMetrics = [
  { id: 'rate', label: 'Request rate', unit: ' req/s' },
  { id: 'errors', label: 'Error rate', unit: '%' },
  { id: 'latency', label: 'P95 latency', unit: ' ms' },
] as const;

export const ServiceHealthDashboard: Story = {
  tags: ['example'],
  render: () => (
    <DashboardLayout
      title="Service operations"
      variant="floating"
      sidebarAppearance={{ defaultCollapsed: true, itemVariant: 'subtle' }}
      sections={[
        { id: 'service-overview', label: 'Overview', icon: HomeIcon },
        { id: 'service-metrics', label: 'API metrics', icon: SettingsIcon },
        { id: 'service-incidents', label: 'Incidents', icon: FolderIcon },
      ]}
    >
      <PageHeader
        id="service-overview"
        className="mb-6 scroll-mt-20"
        classNames={{ title: 'text-heading', description: 'mt-2' }}
        title="Service health"
        description="Monitor the API and review recent incidents."
        action={<Tag tone="success">Operational</Tag>}
      />
      <div className="grid gap-5">
        <Alert variant="inline" tone="info" title="Incident resolved">
          API latency returned to its normal range at 12:00 UTC.
        </Alert>
        <div
          id="service-metrics"
          className="grid scroll-mt-20 divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0"
        >
          {serviceMetrics.map(({ id, label, unit }) => (
            <Card
              key={id}
              title={label}
              className="rounded-none border-0 bg-transparent p-4 shadow-none"
            >
              <p className="mb-2 text-heading font-semibold text-ink tabular-nums">
                {serviceSamples.at(-1)?.values[id]}
                {unit}
              </p>
              <Chart
                type="line"
                label={label}
                data={serviceSamples}
                series={[{ id, label }]}
                valueFormatter={(value) => `${value}${unit}`}
                height={160}
                legend={false}
              />
            </Card>
          ))}
        </div>
        <Card
          id="service-incidents"
          className="scroll-mt-20 rounded-none border-0 bg-transparent px-0 shadow-none"
          title="Incident timeline"
          description="All times in UTC."
        >
          <Timeline
            items={[
              {
                id: 'resolved',
                title: 'Latency returned to normal',
                time: '12:00',
                status: 'success',
                statusLabel: 'Resolved',
              },
              {
                id: 'detected',
                title: 'Elevated API latency detected',
                time: '11:00',
                status: 'warning',
                statusLabel: 'Investigating',
              },
            ]}
          />
        </Card>
      </div>
    </DashboardLayout>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <WorkspaceShell
      className="min-h-0 rounded-panel border border-line"
      classNames={{ header: 'bg-brand-50', main: 'p-6 sm:p-6 lg:p-6' }}
      header={<span className="font-semibold">Workspace</span>}
      content={
        <Card title="Lorem ipsum">
          <Progress label="Completion" value={45} showValue />
        </Card>
      }
    />
  ),
};
