import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../../components/button';
import { Calendar } from '../../components/calendar';
import { Card } from '../../components/card';
import { IconButton } from '../../components/icon-button';
import { SparklesIcon } from '../../components/icon/outline/sparkles';
import { ActivityIcon } from '../../components/icon/outline/activity';
import { CrownIcon } from '../../components/icon/outline/crown';
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

type SoftWorkspaceArgs = {
  accountPlacement: 'header' | 'sidebar';
  showOnboarding: boolean;
  showMetrics: boolean;
  showCharts: boolean;
  showTransactions: boolean;
};

const steps = [
  {
    id: 'contacts',
    title: 'Import your customers',
    description:
      'Upload a CSV or connect your store so invoices and reminders reach the right people.',
    action: 'Import customers',
  },
  {
    id: 'invoice',
    title: 'Send your first invoice',
    description:
      'Pick a template, add line items and schedule the payment reminder in one place.',
    action: 'Create invoice',
  },
];

function OverviewCalendar() {
  const [date, setDate] = useState<string | null>('2026-11-18');

  return (
    <Card className="w-fit max-w-full">
      <Calendar
        value={date}
        onValueChange={setDate}
        defaultMonth="2026-11-01"
        today="2026-11-18"
        classNames={{ selects: 'hidden' }}
      />
    </Card>
  );
}

function SoftWorkspace({
  accountPlacement,
  showOnboarding,
  showMetrics,
  showCharts,
  showTransactions,
}: SoftWorkspaceArgs) {
  return (
    <DashboardShell
      variant="soft"
      sidebar={{
        navigationLabel: 'Workspace navigation',
        header: {
          title: 'Northwind',
          subtitle: 'Billing workspace',
          logo: <ActivityIcon />,
        },
        items: demoNavigation,
        footerItems: demoFooterNavigation,
        toggleShortcut: 'mod+b',
      }}
      account={demoAccount}
      accountPlacement={accountPlacement}
      headerActions={
        <>
          <Button variant="ghost" size="sm">
            <SparklesIcon />
            Ask AI
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Usage and plan
          </Button>
          <IconButton variant="ghost" size="sm" icon="help" label="Help" />
          <DemoNotifications />
        </>
      }
    >
      <PageHeader
        className="mb-6"
        classNames={{ title: 'text-heading' }}
        title="Good morning, Olivia"
        description="Here is what happened in your workspace since yesterday."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost">Customize page</Button>
            <Button variant="secondary">
              <CrownIcon />
              Upgrade now
            </Button>
          </div>
        }
      />
      <div className="grid gap-6">
        {showOnboarding && (
          <div className="grid gap-6 xl:grid-cols-[auto_minmax(0,1fr)]">
            <OverviewCalendar />
            <Card
              title="Get started with Northwind"
              description="Two steps to your first paid invoice."
              action={<Button size="sm">Create invoice</Button>}
              className="flex min-w-0 flex-col"
              contentClassName="flex flex-1"
            >
              <ol className="grid flex-1 gap-4 md:grid-cols-2">
                {steps.map((step, index) => (
                  <li
                    key={step.id}
                    className="flex flex-col items-start gap-2 rounded-panel border border-line bg-surface p-4"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-ui-sm font-semibold text-accent">
                      {index + 1}
                    </span>
                    <p className="font-semibold text-ink">{step.title}</p>
                    <p className="text-ui-sm text-muted">{step.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-auto px-0 text-accent"
                    >
                      {step.action} →
                    </Button>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}
        {showMetrics && <KpiRow />}
        {showCharts && (
          <div className="grid gap-6 xl:grid-cols-3">
            <RevenueCard className="xl:col-span-2" />
            <ActivityCard />
          </div>
        )}
        {showTransactions && <OrdersTable />}
      </div>
    </DashboardShell>
  );
}

const meta = {
  title: 'Templates/Dashboards/Soft workspace',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A soft workspace: tinted full-height sidebar with pinned Settings/Help and the account at the bottom, a borderless header with quick actions, and a home page with a calendar, onboarding steps, metrics, charts and recent transactions. Toggle each block in Controls; every part is a kit component you can keep, hide or replace.',
      },
    },
  },
  args: {
    accountPlacement: 'sidebar',
    showOnboarding: true,
    showMetrics: true,
    showCharts: true,
    showTransactions: true,
  },
  argTypes: {
    accountPlacement: { control: 'inline-radio', options: ['sidebar', 'header'] },
  },
  render: (args: SoftWorkspaceArgs) => (
    <DemoApp>
      <SoftWorkspace {...args} />
    </DemoApp>
  ),
} satisfies Meta<SoftWorkspaceArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
