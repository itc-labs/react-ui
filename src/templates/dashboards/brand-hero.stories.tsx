import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chart } from '@itclabs/react-ui/chart';
import { WorkspaceShell } from '@itclabs/react-ui/templates';
import { oceanTheme } from '@itclabs/react-ui/theme/presets';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { BoltIcon } from '../../components/icon/outline/bolt';
import { Tag } from '../../components/tag';
import { DataTable, type ColumnDef } from '../../modules/data-table';
import { KpiCard, KpiGrid } from '../../modules/kpi-card';
import { Navbar, type NavbarItem } from '../../modules/navbar';
import { ProgressList } from '../../modules/progress-list';
import { UserMenu } from '../../modules/user-menu';
import { DemoNotifications } from './__demo/blocks';
import { demoAccount } from './__demo/data';
import { DemoApp } from './__demo/demo-app';

type BrandHeroArgs = {
  showTopbar: boolean;
  showHero: boolean;
  showMetrics: boolean;
  showSpeed: boolean;
  showRegions: boolean;
  showTests: boolean;
};

const navigation: NavbarItem[] = [
  { id: 'overview', label: 'Overview', href: '/dashboard' },
  { id: 'tests', label: 'Tests', href: '/tests' },
  { id: 'rankings', label: 'Rankings', href: '/rankings' },
  { id: 'plans', label: 'Plans', href: '/plans' },
  { id: 'help', label: 'Help', href: '/help' },
];

// Noon UTC snapshot: 1,200 completed tests (100 per hour) and six failed tests.
// The twelve hourly means and five equally sampled region means average 86.4 Mbps.
const hourlyDownloads = [
  90.2, 89.8, 91.4, 92.1, 90.6, 88.9, 86.8, 82.4, 79.6, 80.8, 82.2, 82,
];
const downloadSpeed = hourlyDownloads.map((download, hour) => ({
  id: `2026-11-18T${String(hour).padStart(2, '0')}:00:00Z`,
  label: `${String(hour).padStart(2, '0')}:00`,
  values: { download },
}));
const regions = [
  { id: 'europe', label: 'Europe', value: 94.2, max: 120 },
  { id: 'north-america', label: 'North America', value: 90.6, max: 120 },
  { id: 'asia-pacific', label: 'Asia Pacific', value: 86.4, max: 120 },
  { id: 'latin-america', label: 'Latin America', value: 82.2, max: 120 },
  { id: 'middle-east-africa', label: 'Middle East & Africa', value: 78.6, max: 120 },
];

type SpeedTest = {
  id: string;
  time: string;
  location: string;
  isp: string;
  download: number | null;
  upload: number | null;
  ping: number | null;
  status: 'Passed' | 'Failed';
};

const latestTests: SpeedTest[] = [
  {
    id: 'test-1206',
    time: '11:59:42',
    location: 'London, UK',
    isp: 'BT',
    download: 94.8,
    upload: 36.2,
    ping: 11,
    status: 'Passed',
  },
  {
    id: 'test-1205',
    time: '11:59:18',
    location: 'New York, US',
    isp: 'Verizon',
    download: 91.2,
    upload: 34.8,
    ping: 12,
    status: 'Passed',
  },
  {
    id: 'test-1204',
    time: '11:58:53',
    location: 'Singapore, SG',
    isp: 'Singtel',
    download: 88.6,
    upload: 38.4,
    ping: 8,
    status: 'Passed',
  },
  {
    id: 'test-1203',
    time: '11:58:21',
    location: 'São Paulo, BR',
    isp: 'Vivo',
    download: 81.4,
    upload: 29.6,
    ping: 18,
    status: 'Passed',
  },
  {
    id: 'test-1202',
    time: '11:57:49',
    location: 'Cape Town, ZA',
    isp: 'Telkom',
    download: null,
    upload: null,
    ping: null,
    status: 'Failed',
  },
  {
    id: 'test-1201',
    time: '11:57:12',
    location: 'Berlin, DE',
    isp: 'Deutsche Telekom',
    download: 96.2,
    upload: 37.8,
    ping: 10,
    status: 'Passed',
  },
  {
    id: 'test-1200',
    time: '11:56:44',
    location: 'Toronto, CA',
    isp: 'Bell',
    download: 89.8,
    upload: 33.6,
    ping: 13,
    status: 'Passed',
  },
  {
    id: 'test-1199',
    time: '11:56:08',
    location: 'Sydney, AU',
    isp: 'Telstra',
    download: 84.2,
    upload: 31.4,
    ping: 16,
    status: 'Passed',
  },
  {
    id: 'test-1198',
    time: '11:55:37',
    location: 'Mexico City, MX',
    isp: 'Telmex',
    download: 79.6,
    upload: 27.2,
    ping: 20,
    status: 'Passed',
  },
  {
    id: 'test-1197',
    time: '11:55:03',
    location: 'Dubai, AE',
    isp: 'du',
    download: 80.4,
    upload: 30.6,
    ping: 17,
    status: 'Passed',
  },
  {
    id: 'test-1196',
    time: '11:54:31',
    location: 'Paris, FR',
    isp: 'Orange',
    download: 92.6,
    upload: 35.4,
    ping: 12,
    status: 'Passed',
  },
  {
    id: 'test-1195',
    time: '11:54:02',
    location: 'Tokyo, JP',
    isp: 'NTT',
    download: 87.4,
    upload: 36.8,
    ping: 9,
    status: 'Passed',
  },
];

const testColumns: ColumnDef<SpeedTest, unknown>[] = [
  { accessorKey: 'time', header: 'Time (UTC)' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'isp', header: 'ISP' },
  {
    accessorKey: 'download',
    header: 'Download',
    cell: ({ row }) =>
      row.original.download === null ? '—' : `${row.original.download.toFixed(1)} Mbps`,
  },
  {
    accessorKey: 'upload',
    header: 'Upload',
    cell: ({ row }) =>
      row.original.upload === null ? '—' : `${row.original.upload.toFixed(1)} Mbps`,
  },
  {
    accessorKey: 'ping',
    header: 'Ping',
    cell: ({ row }) => (row.original.ping === null ? '—' : `${row.original.ping} ms`),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Tag tone={row.original.status === 'Passed' ? 'success' : 'danger'}>
        {row.original.status}
      </Tag>
    ),
  },
];

function DownloadTrend() {
  return (
    <Card
      title="Download speed"
      description="Hourly average · Today, 00:00–12:00 UTC"
      className="min-w-0"
    >
      <Chart
        type="line"
        label="Average download speed by hour on November 18, 2026, UTC"
        data={downloadSpeed}
        series={[{ id: 'download', label: 'Download' }]}
        height={280}
        legend={false}
        valueFormatter={(value) => `${value.toFixed(1)} Mbps`}
        axisValueFormatter={(value) => `${value} Mbps`}
      />
    </Card>
  );
}

function RegionSpeeds() {
  return (
    <Card
      title="Regions"
      description="Average download · 240 completed tests per region"
      className="min-w-0"
    >
      <ProgressList
        label="Average download speed by region, in Mbps"
        items={regions}
        valueFormatter={({ value }) => `${value.toFixed(1)} Mbps`}
      />
    </Card>
  );
}

function LatestTests() {
  return (
    <Card
      title="Latest tests"
      description="November 18, 2026 · UTC · Failed probes timed out"
      classNames={{ root: 'min-w-0', content: 'p-0' }}
    >
      <DataTable
        caption="Latest speed tests on November 18, 2026"
        rows={latestTests}
        columns={testColumns}
        rowId={(row) => row.id}
        className="rounded-none border-0 shadow-none"
        classNames={{ cell: 'whitespace-nowrap tabular-nums' }}
        filterable
        verticalAlign="middle"
      />
    </Card>
  );
}

function BrandHeroPage({
  showHero,
  showMetrics,
  showSpeed,
  showRegions,
  showTests,
}: BrandHeroArgs) {
  return (
    <>
      {showHero && (
        <section
          aria-label="Network performance today"
          className="rounded-b-panel bg-accent text-on-brand"
        >
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
            <p className="text-ui-sm text-on-brand/80">
              November 18, 2026 · 12:00 UTC · Sample network data
            </p>
            <h1 className="mt-3 text-heading font-semibold">
              A clearer view of your connection.
            </h1>
            <dl className="mt-8 grid min-w-0 gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-ui-sm text-on-brand/80">Average download</dt>
                <dd className="mt-2 text-display font-semibold tracking-tight tabular-nums">
                  86.4 <span className="text-section font-medium">Mbps</span>
                </dd>
              </div>
              <div>
                <dt className="text-ui-sm text-on-brand/80">Average ping</dt>
                <dd className="mt-2 text-display font-semibold tracking-tight tabular-nums">
                  14 <span className="text-section font-medium">ms</span>
                </dd>
              </div>
              <div>
                <dt className="text-ui-sm text-on-brand/80">
                  Monitoring service uptime
                </dt>
                <dd className="mt-2 text-display font-semibold tracking-tight tabular-nums">
                  99.98%
                </dd>
              </div>
            </dl>
          </div>
        </section>
      )}
      <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {showMetrics && (
          <KpiGrid columns={4}>
            <KpiCard
              label="Tests today"
              value="1,206"
              hint="1,200 completed · 6 failed"
            />
            <KpiCard
              label="Median download"
              value="87.1 Mbps"
              hint="Completed tests today"
            />
            <KpiCard
              label="Median upload"
              value="32.8 Mbps"
              hint="Completed tests today"
            />
            <KpiCard label="Failed tests" value="6" hint="0.50% of attempts today" />
          </KpiGrid>
        )}
        {(showSpeed || showRegions) && (
          <div
            className={`grid min-w-0 gap-6 ${showSpeed && showRegions ? 'xl:grid-cols-2' : ''}`}
          >
            {showSpeed && <DownloadTrend />}
            {showRegions && <RegionSpeeds />}
          </div>
        )}
        {showTests && <LatestTests />}
      </div>
    </>
  );
}

function BrandHero(args: BrandHeroArgs) {
  return (
    <WorkspaceShell
      variant="classic"
      classNames={{
        topbar: 'border-0 bg-transparent p-0 sm:p-0',
        main: 'p-0 sm:p-0 lg:p-0',
      }}
      topbar={
        args.showTopbar ? (
          <div className="w-full min-w-0 bg-accent pt-3">
            <Navbar
              appearance="transparent"
              itemVariant="ghost"
              align="center"
              sticky={false}
              brand={{ title: 'Brisk', href: '/dashboard', logo: <BoltIcon /> }}
              items={navigation}
              navigationLabel="Brisk navigation"
              className="mx-auto max-w-7xl"
              classNames={{
                brandLogo: 'size-8 rounded-control bg-brand-50 text-accent',
                inner: 'px-4 sm:px-6 lg:gap-2 lg:px-8',
                item: 'px-2.5',
                actions: 'gap-2',
              }}
              actions={
                <>
                  <Button
                    href="/tests/new"
                    variant="secondary"
                    size="sm"
                    className="hidden rounded-full border-0 sm:inline-flex"
                  >
                    Run speed check
                  </Button>
                  <Button
                    href="/sign-in"
                    variant="ghost"
                    size="sm"
                    className="hidden rounded-full border border-current/40 xl:inline-flex"
                  >
                    Sign in
                  </Button>
                  <DemoNotifications className="rounded-full" />
                  <UserMenu
                    {...demoAccount}
                    compact
                    className="rounded-full border-on-brand/40 bg-transparent text-on-brand hover:bg-on-brand/10"
                  />
                </>
              }
            />
          </div>
        ) : undefined
      }
      content={<BrandHeroPage {...args} />}
    />
  );
}

const meta = {
  title: 'Templates/Dashboards/Brand hero',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A Brisk-inspired speed monitoring dashboard with a transparent grouped Navbar over a blue hero, network KPIs, hourly download speeds, regional averages and twelve latest tests. Sample data is a November 18, 2026 noon UTC snapshot; service uptime is monitored separately from client speed-test failures. Widgets own their interactions; toggle each region in Controls.',
      },
    },
  },
  args: {
    showTopbar: true,
    showHero: true,
    showMetrics: true,
    showSpeed: true,
    showRegions: true,
    showTests: true,
  },
  argTypes: {
    showTopbar: { control: 'boolean' },
    showHero: { control: 'boolean' },
    showMetrics: { control: 'boolean' },
    showSpeed: { control: 'boolean' },
    showRegions: { control: 'boolean' },
    showTests: { control: 'boolean' },
  },
  render: (args: BrandHeroArgs) => (
    <DemoApp theme={oceanTheme.light}>
      <BrandHero {...args} />
    </DemoApp>
  ),
} satisfies Meta<BrandHeroArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
