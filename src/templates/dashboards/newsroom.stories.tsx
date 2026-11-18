import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Chart } from '@itclabs/react-ui/chart';
import { WorkspaceShell } from '@itclabs/react-ui/templates';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { IconButton } from '../../components/icon-button';
import { Tag } from '../../components/tag';
import { KpiCard, KpiGrid } from '../../modules/kpi-card';
import { Navbar, type NavbarItem } from '../../modules/navbar';
import { PageHeader } from '../../modules/page-header';
import { DemoApp } from './__demo/demo-app';

type NewsroomArgs = {
  showTopbar: boolean;
  showHeader: boolean;
  showMetrics: boolean;
  showTrending: boolean;
  showReaders: boolean;
  showCalendar: boolean;
  showTopics: boolean;
};

const navigation: NavbarItem[] = [
  { id: 'home', label: 'HOME', href: '/', exact: true },
  { id: 'news', label: 'NEWS', href: '/news' },
  { id: 'wiki', label: 'WIKI', href: '/wiki' },
  { id: 'blog', label: 'BLOG', href: '/blog' },
  {
    id: 'news-desks',
    type: 'dropdown',
    label: 'SECTIONS',
    children: [
      { id: 'politics', label: 'Politics', href: '/news/politics' },
      { id: 'economy', label: 'Economy', href: '/news/economy' },
      {
        id: 'sport',
        type: 'dropdown',
        label: 'Sport',
        children: [
          { id: 'football', label: 'Football', href: '/news/sport/football' },
          { id: 'basketball', label: 'Basketball', href: '/news/sport/basketball' },
        ],
      },
    ],
  },
];

const trending = [
  {
    id: 'city-budget',
    title: 'What the proposed city budget means for your commute',
    category: 'Politics',
    author: 'Maya Chen',
    reads: '18,420',
  },
  {
    id: 'small-business',
    title: 'Small businesses find a new audience on the high street',
    category: 'Economy',
    author: 'Oliver Grant',
    reads: '14,860',
  },
  {
    id: 'cup-preview',
    title: 'Five young players to watch in tonight’s cup fixtures',
    category: 'Sport',
    author: 'Aisha Rahman',
    reads: '12,310',
  },
  {
    id: 'urban-gardens',
    title: 'The neighbours turning empty rooftops into gardens',
    category: 'Community',
    author: 'Noah Williams',
    reads: '9,740',
  },
  {
    id: 'public-libraries',
    title: 'Inside the libraries reinventing the after-school hour',
    category: 'Culture',
    author: 'Sofia Martinez',
    reads: '8,260',
  },
];

// Concurrent readers sampled on the hour; the final sample matches Readers now.
const hourlyReaders = [
  1180, 940, 760, 620, 580, 920, 1640, 2980, 4260, 3840, 4520, 5180, 6320, 5860, 6240,
].map((readers, hour) => ({
  id: `2026-11-18T${String(hour).padStart(2, '0')}:00`,
  label: `${String(hour).padStart(2, '0')}:00`,
  values: { readers },
}));

const scheduled = [
  {
    id: 'budget-explainer',
    time: '14:30',
    title: 'City budget: the key numbers, explained',
    desk: 'Politics',
    status: 'Ready',
    tone: 'success',
  },
  {
    id: 'retail-outlook',
    time: '15:00',
    title: 'Independent shops prepare for the holiday rush',
    desk: 'Economy',
    status: 'In review',
    tone: 'warning',
  },
  {
    id: 'cup-team-news',
    time: '16:00',
    title: 'Cup night: team news and the tactical talking points',
    desk: 'Sport',
    status: 'Ready',
    tone: 'success',
  },
  {
    id: 'garden-guide',
    time: '17:30',
    title: 'How to start a community rooftop garden',
    desk: 'Community',
    status: 'In review',
    tone: 'warning',
  },
  {
    id: 'evening-briefing',
    time: '18:00',
    title: 'The evening briefing: your day in five stories',
    desk: 'News',
    status: 'Draft',
    tone: 'neutral',
  },
] as const;

const topics = [
  { label: 'City budget', count: 6 },
  { label: 'Small business', count: 4 },
  { label: 'Cup night', count: 5 },
  { label: 'Urban gardens', count: 3 },
  { label: 'Public libraries', count: 2 },
  { label: 'Housing', count: 7 },
  { label: 'Clean energy', count: 4 },
  { label: 'Local transport', count: 5 },
];

function TrendingArticles() {
  return (
    <Card
      title="Trending now"
      description="Most-read stories today · Updated at 14:00"
      className="min-w-0"
    >
      <ol className="divide-y divide-line">
        {trending.map((article, index) => (
          <li key={article.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <span
              className="w-8 shrink-0 text-heading font-bold tabular-nums text-muted"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <Tag size="sm">{article.category}</Tag>
              <Button
                href={`/news/articles/${article.id}`}
                variant="ghost"
                className="mt-2 h-auto justify-start whitespace-normal p-0 text-start font-semibold text-ink"
              >
                {article.title}
              </Button>
              <p className="mt-2 text-ui-sm text-muted">
                {article.author} · {article.reads} reads
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function ReadersChart() {
  return (
    <Card
      title="Readers per hour"
      description="November 18, 2026 · 00:00–14:00 · Concurrent readers"
      className="min-w-0"
    >
      <Chart
        type="area"
        label="Concurrent readers sampled hourly on November 18, 2026"
        data={hourlyReaders}
        series={[{ id: 'readers', label: 'Readers' }]}
        height={300}
        legend={false}
        valueFormatter={(value) => value.toLocaleString('en-US')}
        axisValueFormatter={(value) => `${value / 1000}k`}
      />
      <p className="mt-4 text-ui-sm text-muted">
        The lunchtime peak reached 6,320 readers at 12:00. There are 6,240 readers
        online now.
      </p>
    </Card>
  );
}

function PublishingCalendar() {
  return (
    <Card
      title="Publishing calendar"
      description="Next five pieces · Today, November 18"
      className="min-w-0"
    >
      <ol className="divide-y divide-line">
        {scheduled.map((piece) => (
          <li
            key={piece.id}
            className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
          >
            <time
              dateTime={`2026-11-18T${piece.time}`}
              className="shrink-0 pt-1 text-ui-sm font-semibold tabular-nums text-ink"
            >
              {piece.time}
            </time>
            <div className="min-w-0 flex-1">
              <Button
                href={`/editorial/pieces/${piece.id}`}
                variant="ghost"
                className="h-auto justify-start whitespace-normal p-0 text-start font-medium text-ink"
              >
                {piece.title}
              </Button>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-ui-sm text-muted">
                <span>{piece.desk}</span>
                <Tag size="sm" tone={piece.tone}>
                  {piece.status}
                </Tag>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function HotTopics() {
  const [selected, setSelected] = useState<string | null>(null);
  const topic = topics.find((item) => item.label === selected);

  return (
    <Card
      title="Hot topics"
      description="Follow the conversations shaping today's coverage"
      className="min-w-0"
    >
      <div className="flex flex-wrap gap-2" role="group" aria-label="Coverage topics">
        {topics.map((item) => (
          <Tag
            key={item.label}
            tone={selected === item.label ? 'brand' : 'neutral'}
            selected={selected === item.label}
            onClick={() => setSelected(selected === item.label ? null : item.label)}
            className="rounded-full"
          >
            {item.label}
          </Tag>
        ))}
      </div>
      <p className="mt-5 text-ui-sm text-muted" aria-live="polite">
        {topic
          ? `${topic.count} published stories about ${topic.label.toLowerCase()} today.`
          : 'Select a topic to see how many stories the desk has published today.'}
      </p>
    </Card>
  );
}

function NewsroomPage({
  showHeader,
  showMetrics,
  showTrending,
  showReaders,
  showCalendar,
  showTopics,
}: NewsroomArgs) {
  return (
    <>
      {showHeader && (
        <PageHeader
          title="Editorial desk"
          description="Wednesday, November 18, 2026 · 14:00 newsroom snapshot"
          className="mb-6"
          classNames={{ title: 'text-heading' }}
        />
      )}
      <div className="grid min-w-0 gap-6">
        {showMetrics && (
          <KpiGrid columns={4}>
            <KpiCard
              label="Published today"
              value="24"
              hint="Across all desks · Since midnight"
            />
            <KpiCard
              label="Readers now"
              value="6,240"
              hint="Concurrent readers · As of 14:00"
            />
            <KpiCard
              label="Avg read time"
              value="4m 32s"
              hint="Today's published stories"
            />
            <KpiCard
              label="Subscriptions"
              value="86"
              hint="New paid subscriptions today"
            />
          </KpiGrid>
        )}
        {(showTrending || showReaders) && (
          <div
            className={`grid min-w-0 items-start gap-6 ${showTrending && showReaders ? 'lg:grid-cols-2' : ''}`}
          >
            {showTrending && <TrendingArticles />}
            {showReaders && <ReadersChart />}
          </div>
        )}
        {(showCalendar || showTopics) && (
          <div
            className={`grid min-w-0 items-start gap-6 ${showCalendar && showTopics ? 'lg:grid-cols-2' : ''}`}
          >
            {showCalendar && <PublishingCalendar />}
            {showTopics && <HotTopics />}
          </div>
        )}
      </div>
    </>
  );
}

function Newsroom(args: NewsroomArgs) {
  return (
    <WorkspaceShell
      variant="classic"
      classNames={{ topbar: 'border-0 bg-transparent p-0 sm:p-0' }}
      topbar={
        args.showTopbar ? (
          <Navbar
            sticky={false}
            align="split"
            itemVariant="underline"
            brand={{ title: 'ambisius', subtitle: 'NEWS', href: '/' }}
            items={navigation}
            navigationLabel="Newsroom navigation"
            drawerTitle="Explore ambisius"
            classNames={{
              brandTitle: 'text-heading font-bold tracking-tight',
              brandSubtitle: 'text-center tracking-widest',
              inner: 'py-3 lg:pb-0',
            }}
            actions={
              <>
                <IconButton
                  icon="search"
                  label="Search articles"
                  variant="ghost"
                  href="/search"
                />
                <IconButton
                  icon="sun"
                  label="Theme settings"
                  variant="ghost"
                  href="/settings/appearance"
                  className="hidden sm:inline-flex"
                />
                <Button
                  href="/sign-in"
                  variant="outline"
                  size="sm"
                  className="hidden rounded-full sm:inline-flex"
                >
                  Sign in
                </Button>
              </>
            }
          />
        ) : undefined
      }
      content={<NewsroomPage {...args} />}
    />
  );
}

const meta = {
  title: 'Templates/Dashboards/Newsroom',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An ambisius-inspired editorial dashboard with a split masthead, nested news navigation, headline metrics, trending articles, hourly readership, a publishing calendar and selectable hot topics. English sample content reflects November 18, 2026 at 14:00. Each widget owns its interactions; toggle each region in Controls.',
      },
    },
  },
  args: {
    showTopbar: true,
    showHeader: true,
    showMetrics: true,
    showTrending: true,
    showReaders: true,
    showCalendar: true,
    showTopics: true,
  },
  argTypes: {
    showTopbar: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    showMetrics: { control: 'boolean' },
    showTrending: { control: 'boolean' },
    showReaders: { control: 'boolean' },
    showCalendar: { control: 'boolean' },
    showTopics: { control: 'boolean' },
  },
  render: (args: NewsroomArgs) => (
    <DemoApp initialPath="/">
      <Newsroom {...args} />
    </DemoApp>
  ),
} satisfies Meta<NewsroomArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
