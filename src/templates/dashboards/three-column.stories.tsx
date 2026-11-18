import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DashboardShell } from '@itclabs/react-ui/templates';
import { Avatar } from '../../components/avatar';
import { Breadcrumb } from '../../components/breadcrumb';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { IconButton } from '../../components/icon-button';
import { Input } from '../../components/input';
import { NumberInput } from '../../components/number-input';
import { Select } from '../../components/select';
import { Tag } from '../../components/tag';
import { Textarea } from '../../components/textarea';
import { BellIcon } from '../../components/icon/outline/bell';
import { BriefcaseIcon } from '../../components/icon/outline/briefcase';
import { CalendarIcon } from '../../components/icon/outline/calendar';
import { CalendarCheckIcon } from '../../components/icon/outline/calendar-check';
import { DownloadIcon } from '../../components/icon/outline/download';
import { FilterIcon } from '../../components/icon/outline/filter';
import { GripVerticalIcon } from '../../components/icon/outline/grip-vertical';
import { HomeIcon } from '../../components/icon/outline/home';
import { PlusIcon } from '../../components/icon/outline/plus';
import { SearchIcon } from '../../components/icon/outline/search';
import { SettingsIcon } from '../../components/icon/outline/settings';
import { UsersIcon } from '../../components/icon/outline/users';
import type { SidebarEntry } from '../../modules/sidebar';
import { DemoNotifications } from './__demo/blocks';
import { demoAccount } from './__demo/data';
import { DemoApp, useDemoPath } from './__demo/demo-app';

type ThreeColumnArgs = {
  showTopbar: boolean;
  showSidebar: boolean;
  showHeader: boolean;
  showAside: boolean;
  showPromo: boolean;
  showAccount: boolean;
  accountPlacement: 'header' | 'sidebar';
  showRounds: boolean;
  showInterviewOverview: boolean;
  showNotifications: boolean;
  showInterviewers: boolean;
  showSections: boolean;
};

const navigation: SidebarEntry[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { id: 'interviews', label: 'Interviews', href: '/interviews', icon: CalendarIcon },
  { id: 'candidates', label: 'Candidates', href: '/candidates', icon: UsersIcon },
  { id: 'settings', label: 'Settings', href: '/settings', icon: SettingsIcon },
  {
    id: 'departments',
    type: 'group',
    label: 'Departments',
    items: [
      {
        id: 'engineering',
        label: 'Engineering',
        href: '/departments/engineering',
        trailing: (
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-brand-500" />
        ),
      },
      {
        id: 'design',
        label: 'Design',
        href: '/departments/design',
        trailing: (
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-info-500" />
        ),
      },
      {
        id: 'operations',
        label: 'Operations',
        href: '/departments/operations',
        trailing: (
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-warning-500" />
        ),
      },
    ],
  },
];
const interviewers = ['Ashley Brooks', 'Liam Nguyen', 'Mai Tran', 'Sofia Rossi'];
const rounds = [
  {
    id: 'round-2',
    title: 'Round 2',
    dates: 'Nov 12–16, 2026',
    count: 18,
    status: 'Completed',
    tone: 'success',
  },
  {
    id: 'round-3',
    title: 'Round 3',
    dates: 'Nov 18–20, 2026',
    count: 8,
    status: 'In progress',
    tone: 'brand',
  },
] as const;
const notifications = [
  {
    id: 'schedule',
    title: 'Interview confirmed',
    detail: 'Hana Sato · today at 14:00',
    icon: CalendarCheckIcon,
  },
  {
    id: 'feedback',
    title: 'Feedback is ready',
    detail: 'Liam Nguyen reviewed Noah Fischer.',
    icon: BellIcon,
  },
  {
    id: 'candidate',
    title: 'New candidate referred',
    detail: 'Mai Tran referred Ethan Walker.',
    icon: UsersIcon,
  },
];
const initialQuestion = {
  prompt: 'How would you make a slow React page feel faster?',
  competency: 'performance',
  minutes: 15 as number | null,
  level: 'senior',
  guidelines:
    'Ask the candidate to explain how they would measure the problem first. Look for thoughtful use of profiling, rendering boundaries and accessible loading states.',
};

function ThreeColumnPage({
  showRounds,
  showInterviewOverview,
}: Pick<ThreeColumnArgs, 'showRounds' | 'showInterviewOverview'>) {
  const { navigate } = useDemoPath();
  const [saved, setSaved] = useState(initialQuestion);
  const [draft, setDraft] = useState(initialQuestion);
  const [message, setMessage] = useState('');

  return (
    <div className="grid min-w-0 gap-8">
      {showRounds && (
        <section
          aria-label="Interview rounds"
          className="grid min-w-0 gap-4 md:grid-cols-2"
        >
          {rounds.map((round) => (
            <Card
              key={round.id}
              title={round.title}
              description={round.dates}
              className="p-4"
              contentClassName="grid gap-4"
            >
              <Tag tone={round.tone} className="justify-self-start">
                {round.status}
              </Tag>
              <p>
                <span className="text-section font-semibold text-ink">
                  {round.count}
                </span>{' '}
                candidates shortlisted
              </p>
              <div className="flex -space-x-2" aria-label="Round interviewers">
                {interviewers.slice(0, 3).map((name) => (
                  <Avatar
                    key={name}
                    alt={name}
                    size="sm"
                    className="ring-2 ring-surface"
                  />
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="justify-self-start"
                onClick={() => navigate(`/candidates/frontend-developer/${round.id}`)}
              >
                View candidates
              </Button>
            </Card>
          ))}
        </section>
      )}
      {showInterviewOverview && (
        <section aria-labelledby="interview-overview" className="min-w-0">
          <h2 id="interview-overview" className="text-section font-semibold text-ink">
            Interview overview
          </h2>
          <p className="mt-1 text-ui-sm text-muted">
            Frontend Developer · technical interview · 45 minutes
          </p>
          <ol className="mt-5 grid min-w-0 gap-3">
            {[
              'Tell us about a frontend project you are proud of.',
              saved.prompt,
              'How do you approach an accessible component API?',
            ].map((question, index) => (
              <li
                key={index}
                className="min-w-0 rounded-panel border border-line bg-surface p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-ui-sm font-semibold text-accent">
                    {index + 1}
                  </span>
                  <h3 className="min-w-0 flex-1 text-ui-sm font-semibold text-ink">
                    {question}
                  </h3>
                  <Tag size="sm">
                    {index === 1 ? `${saved.minutes ?? 0} min` : '15 min'}
                  </Tag>
                </div>
                {index === 1 && (
                  <form
                    className="mt-5 grid min-w-0 gap-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setSaved(draft);
                      setMessage('Question saved.');
                    }}
                  >
                    <Input
                      label="Question prompt"
                      required
                      value={draft.prompt}
                      onChange={(event) => {
                        setDraft({ ...draft, prompt: event.target.value });
                        setMessage('');
                      }}
                    />
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                      <Select
                        label="Competency"
                        options={[
                          { value: 'performance', label: 'Performance' },
                          { value: 'architecture', label: 'Architecture' },
                          { value: 'accessibility', label: 'Accessibility' },
                        ]}
                        value={draft.competency}
                        onValueChange={(value) =>
                          setDraft({ ...draft, competency: value ?? 'performance' })
                        }
                      />
                      <NumberInput
                        label="Duration (minutes)"
                        min={1}
                        max={60}
                        required
                        value={draft.minutes}
                        onValueChange={(minutes) => setDraft({ ...draft, minutes })}
                      />
                      <Select
                        label="Level"
                        options={[
                          { value: 'mid', label: 'Mid-level' },
                          { value: 'senior', label: 'Senior' },
                          { value: 'lead', label: 'Lead' },
                        ]}
                        value={draft.level}
                        onValueChange={(value) =>
                          setDraft({ ...draft, level: value ?? 'senior' })
                        }
                      />
                    </div>
                    <Textarea
                      label="Interviewer guidelines"
                      rows={4}
                      value={draft.guidelines}
                      onChange={(event) =>
                        setDraft({ ...draft, guidelines: event.target.value })
                      }
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" size="sm">
                        Save question
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setDraft(saved);
                          setMessage('Changes discarded.');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    <p role="status" className="text-ui-sm text-muted">
                      {message}
                    </p>
                  </form>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function ThreeColumn(args: ThreeColumnArgs) {
  const { path, navigate } = useDemoPath();
  const hasAside =
    args.showAside &&
    (args.showNotifications || args.showInterviewers || args.showSections);

  return (
    <DashboardShell
      variant="classic"
      classNames={{
        topbar: 'flex-wrap gap-2 py-3',
        aside: 'space-y-6 bg-surface',
        header: 'gap-4',
      }}
      sidebar={{
        navigationLabel: 'Hiring navigation',
        header: { title: 'Hiring', subtitle: 'People & talent' },
        items: navigation,
        currentPath: path,
        collapsible: args.showSidebar ? 'icon' : 'offcanvas',
        ...(!args.showSidebar
          ? { collapsed: true, mobileTrigger: false as const }
          : {}),
        footer: args.showPromo ? (
          <Card
            title="Hire better with PRO"
            description="Bring your hiring team together with shared scorecards and unlimited roles."
            className="bg-brand-50 p-3"
            classNames={{ title: 'text-ui-sm' }}
            footer={
              <Button size="sm" className="w-full">
                Explore PRO
              </Button>
            }
          />
        ) : undefined,
      }}
      {...(args.showAccount
        ? {
            account: {
              ...demoAccount,
              name: 'Ashley Brooks',
              description: 'ashley.brooks@example.com',
            },
          }
        : {})}
      accountPlacement={args.accountPlacement}
      topbar={
        args.showTopbar ? (
          <>
            <Button
              variant="ghost"
              className="px-2 text-accent"
              onClick={() => navigate('/dashboard')}
            >
              <BriefcaseIcon /> Northwind
            </Button>
            <Button
              variant="secondary"
              className="min-w-0 flex-1 justify-start text-muted sm:max-w-48"
            >
              <SearchIcon />
              Search
            </Button>
            {/* Secondary actions appear from lg; small screens keep search and Create. */}
            <Button variant="ghost" size="sm" className="hidden lg:inline-flex">
              <PlusIcon />
              Add person
            </Button>
            <DemoNotifications className="hidden lg:inline-flex" />
            <IconButton
              variant="ghost"
              size="sm"
              icon="more"
              label="More workspace actions"
              className="hidden lg:inline-flex"
            />
            <Select
              aria-label="Language"
              rootClassName="ms-auto hidden w-20 lg:block"
              size="sm"
              defaultValue="en"
              options={[
                { value: 'en', label: 'EN' },
                { value: 'vi', label: 'VI' },
              ]}
            />
            <Tag icon={CalendarIcon} className="hidden xl:inline-flex">
              <time dateTime="2026-11-18">Nov 18, 2026</time>
            </Tag>
            <Button size="sm" className="ms-auto lg:ms-0">
              <PlusIcon />
              Create
            </Button>
          </>
        ) : undefined
      }
      header={
        args.showHeader ? (
          <>
            <Breadcrumb
              aria-label="Candidate breadcrumb"
              items={[
                { key: 'candidates', title: 'Candidates', href: '/candidates' },
                {
                  key: 'role',
                  title: 'Frontend Developer',
                  href: '/candidates/frontend-developer',
                },
                { key: 'round', title: 'Round 3' },
              ]}
            />
            <h1 className="mt-2 text-heading font-semibold text-ink">Round 3</h1>
          </>
        ) : undefined
      }
      headerActions={
        args.showHeader ? (
          <>
            <Select
              aria-label="Department"
              rootClassName="w-44"
              defaultValue="all"
              options={[
                { value: 'all', label: 'All departments' },
                { value: 'engineering', label: 'Engineering' },
                { value: 'design', label: 'Design' },
                { value: 'operations', label: 'Operations' },
              ]}
            />
            <Button variant="secondary" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button variant="secondary" size="sm">
              <FilterIcon />
              Filter
            </Button>
          </>
        ) : undefined
      }
      aside={
        hasAside ? (
          <>
            {args.showNotifications && (
              <Card title="Notifications" className="border-0 p-0 shadow-none">
                <ul className="grid gap-5">
                  {notifications.map(({ id, title, detail, icon: Glyph }) => (
                    <li key={id} className="flex items-start gap-3">
                      <Glyph className="mt-0.5 shrink-0 text-accent" />
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{title}</p>
                        <p className="mt-1">{detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {args.showInterviewers && (
              <Card
                title="Assigned interviewers"
                description="Your panel for Round 3"
                className="border-0 p-0 shadow-none"
              >
                <div className="flex -space-x-2" aria-label="Assigned interviewers">
                  {interviewers.map((name) => (
                    <Avatar
                      key={name}
                      alt={name}
                      size="sm"
                      className="ring-2 ring-surface"
                    />
                  ))}
                </div>
                <p className="mt-3">Ashley, Liam, Mai and Sofia</p>
              </Card>
            )}
            {args.showSections && (
              <Card
                title="Sections"
                className="border-0 p-0 shadow-none"
                footer={
                  <Button variant="secondary" size="sm" className="w-full">
                    <PlusIcon />
                    Add section
                  </Button>
                }
              >
                <ol className="grid gap-3">
                  {['Introduction', 'Technical skills', 'Candidate questions'].map(
                    (section) => (
                      <li
                        key={section}
                        className="flex items-center gap-2 rounded-control border border-line p-2"
                      >
                        <GripVerticalIcon
                          aria-hidden="true"
                          className="shrink-0 text-muted"
                        />
                        <span className="min-w-0 flex-1 text-ink">{section}</span>
                        <span className="shrink-0 text-ui-sm">15 min</span>
                      </li>
                    ),
                  )}
                </ol>
              </Card>
            )}
          </>
        ) : undefined
      }
    >
      <ThreeColumnPage
        showRounds={args.showRounds}
        showInterviewOverview={args.showInterviewOverview}
      />
    </DashboardShell>
  );
}

const meta = {
  title: 'Templates/Dashboards/Three column',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A recruiting workspace with a full-width product bar, Hiring navigation, round summaries and an editable interview question, plus a right column for notifications, interviewers and sections. Copy the DashboardShell frame configuration separately from ThreeColumnPage. Toggle each region in Controls; the sidebar becomes a drawer on small screens and the info column appears from xl. Actions are illustrative; question edits are saved locally in the demo. The date is pinned to November 18, 2026 for a stable preview.',
      },
    },
  },
  args: {
    showTopbar: true,
    showSidebar: true,
    showHeader: true,
    showAside: true,
    showPromo: true,
    showAccount: true,
    accountPlacement: 'sidebar',
    showRounds: true,
    showInterviewOverview: true,
    showNotifications: true,
    showInterviewers: true,
    showSections: true,
  },
  argTypes: {
    accountPlacement: { control: 'inline-radio', options: ['sidebar', 'header'] },
    showTopbar: { control: 'boolean' },
    showSidebar: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    showAside: { control: 'boolean' },
    showPromo: { control: 'boolean' },
    showAccount: { control: 'boolean' },
    showRounds: { control: 'boolean' },
    showInterviewOverview: { control: 'boolean' },
    showNotifications: { control: 'boolean' },
    showInterviewers: { control: 'boolean' },
    showSections: { control: 'boolean' },
  },
  render: (args: ThreeColumnArgs) => (
    <DemoApp initialPath="/candidates/frontend-developer/round-3">
      <ThreeColumn {...args} />
    </DemoApp>
  ),
} satisfies Meta<ThreeColumnArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
