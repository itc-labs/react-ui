import { useState } from 'react';
import { addMinutes } from 'date-fns';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { WorkspaceShell } from './index';
import { Sidebar } from '../../modules/sidebar';
import { PageHeader } from '../../modules/page-header';
import { Breadcrumb } from '../../components/breadcrumb';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Drawer } from '../../components/drawer';
import { Input } from '../../components/input';
import { UIProvider } from '../../theme/provider';
import { CalendarIcon } from '../../components/icon/outline/calendar';
import {
  Calendar,
  type CalendarEvent,
  type CalendarSelect,
  type NormalizedEvent,
} from '@itclabs/react-ui/calendar';

const fixtureEvents: CalendarEvent<{ description: string }>[] = [
  {
    id: 'alpha',
    title: 'Lorem ipsum',
    start: '2026-10-29T09:00',
    end: '2026-10-29T10:30',
    tone: 'info',
    data: { description: 'Lorem ipsum dolor sit amet.' },
  },
  {
    id: 'beta',
    title: 'Dolor sit amet',
    start: '2026-10-27',
    end: '2026-10-30',
    allDay: true,
    tone: 'success',
    data: { description: 'Consectetur adipiscing elit.' },
  },
  {
    id: 'gamma',
    title: 'Consectetur',
    start: '2026-10-30T14:00',
    end: '2026-10-30T15:00',
    tone: 'warning',
    data: { description: 'Sed do eiusmod tempor incididunt.' },
  },
];

function CalendarPageExample() {
  const [events, setEvents] = useState(fixtureEvents);
  const [date, setDate] = useState(new Date(2026, 9, 29));
  const [details, setDetails] = useState<NormalizedEvent<{
    description: string;
  }> | null>(null);
  const [selection, setSelection] = useState<CalendarSelect | null>(null);
  const [title, setTitle] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const create = (range: CalendarSelect) => {
    setTitle('');
    setSelection(range);
  };

  return (
    <UIProvider locale="en-US">
      <WorkspaceShell
        sidebar={
          <Sidebar
            header={{
              title: 'Lorem ipsum',
              subtitle: 'Workspace',
              logo: <CalendarIcon />,
            }}
            items={[
              {
                id: 'calendar',
                label: 'Calendar',
                href: '/calendar',
                icon: CalendarIcon,
              },
            ]}
            currentPath="/calendar"
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            data-testid="calendar-page-sidebar"
          />
        }
        classNames={{ main: 'w-full max-w-none' }}
        content={
          <>
            <PageHeader
              title="Calendar"
              breadcrumb={
                <Breadcrumb
                  items={[
                    { key: 'workspace', title: 'Workspace' },
                    { key: 'calendar', title: 'Calendar' },
                  ]}
                />
              }
              action={
                <Button
                  onClick={() => {
                    const start = new Date(date);
                    start.setHours(9, 0, 0, 0);
                    create({
                      start,
                      end: addMinutes(start, 60),
                      allDay: false,
                      view: 'week',
                    });
                  }}
                >
                  New event
                </Button>
              }
            />
            <Calendar
              events={events}
              date={date}
              onDateChange={setDate}
              defaultView="week"
              responsiveView="list"
              height={640}
              scrollTime="08:00"
              selectable
              onSelect={create}
              onEventClick={({ event }) => setDetails(event)}
              data-testid="calendar-page"
            />
          </>
        }
      />
      <Dialog
        title="New event"
        description="Enter a title for the selected range."
        open={selection !== null}
        onOpenChange={(open) => {
          if (!open) setSelection(null);
        }}
        data-testid="calendar-page-create"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!selection || !title.trim()) return;

            setEvents((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                title: title.trim(),
                start: selection.start,
                end: selection.end,
                allDay: selection.allDay,
                data: { description: '' },
              },
            ]);

            setSelection(null);
          }}
        >
          {selection && (
            <p className="text-small text-muted">
              {formatter.format(selection.start)} – {formatter.format(selection.end)}{' '}
              (exclusive end)
            </p>
          )}
          <Input
            label="Event title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <Button type="submit">Create event</Button>
        </form>
      </Dialog>
      <Drawer
        title={details?.title ?? 'Event details'}
        description="Event details"
        open={details !== null}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
        actions={[{ id: 'close', label: 'Done', close: true }]}
        data-testid="calendar-page-details"
      >
        {details && (
          <div className="space-y-4">
            <dl className="space-y-2 text-small">
              <dt className="font-semibold">Start</dt>
              <dd>{formatter.format(details.start)}</dd>
              <dt className="font-semibold">End (exclusive)</dt>
              <dd>{formatter.format(details.end)}</dd>
              <dt className="font-semibold">All day</dt>
              <dd>{details.allDay ? 'Yes' : 'No'}</dd>
            </dl>
            <p>{details.data?.description}</p>
          </div>
        )}
      </Drawer>
    </UIProvider>
  );
}

const meta = {
  title: 'Templates/CalendarPage',
  component: WorkspaceShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Trang lịch với Sidebar, breadcrumb và nút tạo sự kiện. Chọn khoảng để mở Dialog; bấm sự kiện để xem chi tiết trong Drawer. Dữ liệu và đường dẫn do host quản lý.',
      },
    },
  },
} satisfies Meta<typeof WorkspaceShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground = {
  name: 'CalendarPage',
  tags: ['usage'],
  render: () => <CalendarPageExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByTestId('calendar-page-event-2026-10-29-alpha'));
    const details = page.getByRole('dialog', { name: 'Lorem ipsum' });
    await expect(
      within(details).getByText('Lorem ipsum dolor sit amet.'),
    ).toBeVisible();
    await userEvent.click(within(details).getByRole('button', { name: 'Done' }));
    await userEvent.click(canvas.getByRole('button', { name: 'New event' }));
    const form = page.getByRole('dialog', { name: 'New event' });
    await userEvent.type(
      within(form).getByRole('textbox', { name: 'Event title' }),
      'Adipiscing elit',
    );
    await userEvent.click(within(form).getByRole('button', { name: 'Create event' }));
    await expect(canvas.getByText('Adipiscing elit')).toBeVisible();
  },
} satisfies Story;
