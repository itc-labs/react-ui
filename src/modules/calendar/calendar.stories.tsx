import { useEffect, useRef, useState } from 'react';
import { ToastProvider, useToast } from '../../components/toast';
import { Dialog } from '../../components/dialog';
import { Input } from '../../components/input';
import type {
  CalendarEvent,
  CalendarSelect,
  CalendarRangeChange,
} from '@itclabs/react-ui/calendar';
import { expect, within, userEvent } from 'storybook/test';
import { UIProvider } from '../../theme/provider';
import type { CalendarProps } from '@itclabs/react-ui/calendar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar } from '@itclabs/react-ui/calendar';
import { Button } from '../../components/button';

const sampleEvents: CalendarEvent[] = [
  ...Array.from({ length: 35 }, (_, index): CalendarEvent => {
    const day = (index % 28) + 1;
    const hour = index % 3 === 0 ? 14 : 9;
    const titles = [
      'Lorem ipsum',
      'Dolor sit amet',
      'Consectetur adipiscing',
      'Sed do eiusmod',
    ];
    const tones = ['brand', 'info', 'success', 'warning', 'danger'] as const;

    return {
      id: `sample-${index}`,
      title: titles[index % titles.length]!,
      start: new Date(2026, 9, day, hour),
      end: new Date(2026, 9, day, hour, index % 2 ? 30 : 60),
      tone: tones[index % tones.length]!,
    };
  }),
  {
    id: 'span-early',
    title: 'Tempor incididunt',
    start: '2026-10-01',
    end: '2026-10-04',
    allDay: true,
    tone: 'info',
  },
  {
    id: 'span-middle',
    title: 'Ut labore et dolore',
    start: '2026-10-14',
    end: '2026-10-17',
    allDay: true,
    tone: 'warning',
  },
  {
    id: 'span-end',
    title: 'Magna aliqua',
    start: '2026-10-28',
    end: '2026-10-31',
    allDay: true,
  },
  {
    id: 'short',
    title: 'Lorem ipsum dolor sit amet',
    start: '2026-10-29T09:00',
    end: '2026-10-29T09:30',
    tone: 'success',
  },
  {
    id: 'long',
    title: 'Consectetur adipiscing elit',
    start: '2026-10-29T10:00',
    end: '2026-10-29T12:00',
    tone: 'info',
  },
  {
    id: 'afternoon',
    title: 'Sed do eiusmod tempor',
    start: '2026-10-30T13:00',
    end: '2026-10-30T15:00',
    tone: 'danger',
  },
];

const meta = {
  title: 'Modules/Calendar',
  component: Calendar,
  args: { defaultDate: new Date(2026, 9, 29), events: [] },
  parameters: {
    docs: {
      description: {
        component:
          'An event calendar with date navigation and view switching. Month view shows multi-day events and overflow; week/day views show time slots, overlapping events, and business hours. Import Calendar from @itclabs/react-ui/calendar or EventCalendar from the root entry point.',
      },
    },
  },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ['usage'],
  render: (args: CalendarProps) => <SelectableExample {...args} showAction />,
  args: {
    weekNumbers: true,
    events: sampleEvents,
    dayMaxEvents: 4,
  },
};
export const States: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { loading: true, height: 320 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('region')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  },
};
export const Views: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('tab')).toHaveLength(2);
  },
  args: { views: ['week', 'day'], defaultView: 'week' },
};
export const Month: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: {
    views: ['month'],
    dayMaxEvents: 2,
    events: [
      {
        id: 'span',
        tone: 'info',
        title: 'Lorem ipsum',
        start: '2026-09-30',
        end: '2026-10-07',
        allDay: true,
      },
      {
        id: 'first',
        tone: 'warning',
        title: 'Dolor sit amet',
        start: '2026-10-05',
        allDay: true,
      },
      {
        id: 'second',
        tone: 'success',
        title: 'Consectetur',
        start: '2026-10-05T09:00',
        end: '2026-10-05T10:00',
      },
      {
        id: 'third',
        tone: 'danger',
        title: 'Adipiscing elit',
        start: '2026-10-05T11:00',
      },
      {
        id: 'middle',
        title: 'Sed do eiusmod',
        start: '2026-10-14',
        end: '2026-10-18',
        allDay: true,
      },
      { id: 'late', title: 'Tempor incididunt', start: '2026-10-29T14:00' },
      {
        id: 'end',
        title: 'Ut labore',
        start: '2026-10-30',
        end: '2026-11-04',
        allDay: true,
      },
    ],
  },
};
const timeGridEvents = [
  {
    id: 'all',
    tone: 'brand' as const,
    title: 'Lorem ipsum',
    start: '2026-10-27',
    end: '2026-10-31',
    allDay: true,
  },
  {
    id: 'second-all',
    tone: 'warning' as const,
    title: 'Dolor sit amet',
    start: '2026-10-29',
    allDay: true,
  },
  {
    id: 'first',
    tone: 'info' as const,
    title: 'Consectetur adipiscing elit',
    start: '2026-10-29T09:00',
    end: '2026-10-29T11:00',
  },
  {
    id: 'overlap',
    tone: 'success' as const,
    title: 'Adipiscing elit sed do eiusmod',
    start: '2026-10-29T10:00',
    end: '2026-10-29T12:00',
  },
  {
    id: 'later',
    tone: 'danger' as const,
    title: 'Sed do eiusmod',
    start: '2026-10-29T14:00',
    end: '2026-10-29T15:30',
  },
  {
    id: 'overnight',
    tone: 'warning' as const,
    title: 'Tempor incididunt',
    start: '2026-10-29T23:00',
    end: '2026-10-30T09:00',
  },
];

export const Week: Story = {
  tags: ['example'],
  args: {
    defaultView: 'week',
    height: 600,
    scrollTime: '08:00',
    events: timeGridEvents,
  },
  parameters: {
    docs: {
      description: {
        story:
          'A weekly calendar with all-day events, overlapping time slots, and scrolling to scrollTime. Arrow keys move between time slots; Enter or Space triggers onDateClick.',
      },
    },
  },
};
export const Day: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: {
    defaultView: 'day',
    height: 500,
    slotDuration: 15,
    slotMinTime: '08:00',
    slotMaxTime: '18:00',
    scrollTime: '09:00',
    events: timeGridEvents,
  },
};
export const BusinessHours: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: {
    defaultView: 'week',
    height: 600,
    scrollTime: '07:00',
    events: timeGridEvents,
    businessHours: [
      { daysOfWeek: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '12:00' },
      { daysOfWeek: [1, 2, 3, 4, 5], startTime: '13:00', endTime: '17:00' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shade time outside business hours, including breaks and weekends. businessHours only affects appearance; all time slots remain interactive.',
      },
    },
  },
};

export const CustomToolbar: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Today' }));
    await expect(within(canvasElement).getByRole('grid')).toBeInTheDocument();
  },
  args: {
    renderToolbar: ({ title, onNavigate }) => (
      <>
        <span aria-live="polite">{title}</span>
        <Button onClick={() => onNavigate('today')}>Today</Button>
      </>
    ),
  },
};
export const List: Story = {
  tags: ['example'],
  args: {
    defaultView: 'list',
    responsiveView: 'list',
    events: timeGridEvents,
    onEventClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Group events by date, hide empty days, and show EmptyState when there are no events. responsiveView switches the calendar to a list below 640px wide.',
      },
    },
  },
};

export const CustomEventRender: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: {
    defaultView: 'list',
    events: [
      { id: 'tone', title: 'Lorem ipsum', start: '2026-10-29T09:00', tone: 'success' },
      {
        id: 'color',
        title: 'Dolor sit amet',
        start: '2026-10-29T11:00',
        color: 'var(--color-warning-700)',
      },
    ],
    renderEvent: ({ event, timeText }) => (
      <span className="flex flex-wrap justify-between gap-2">
        <strong>{event.title}</strong>
        <span>{timeText}</span>
      </span>
    ),
    eventClassName: ({ event }) => (event.allDay ? 'font-semibold' : 'border-l-4'),
  },
};

export const Locale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Compare Vietnamese and English calendar labels. Vietnamese is intentionally retained in this locale example.',
      },
    },
  },
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Cả ngày').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('All day').length).toBeGreaterThan(0);
  },
  render: (args: CalendarProps) => (
    <div className="grid gap-4">
      <UIProvider locale="vi-VN">
        <Calendar {...args} aria-label="Lịch tiếng Việt" />
      </UIProvider>
      <UIProvider locale="en-US">
        <Calendar {...args} aria-label="English calendar" />
      </UIProvider>
    </div>
  ),
  args: { defaultView: 'list', events: timeGridEvents },
};

function SelectableExample({
  showAction = false,
  ...args
}: CalendarProps & { showAction?: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>(() => [...(args.events ?? [])]);
  const [selection, setSelection] = useState<CalendarSelect | null>(null);
  const [title, setTitle] = useState('');

  return (
    <>
      <Calendar
        {...args}
        events={events}
        toolbarStart={
          showAction ? (
            <Button
              className="rounded-full"
              onClick={() => {
                const start = new Date(args.date ?? args.defaultDate ?? new Date());
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setDate(end.getDate() + 1);
                setTitle('');
                setSelection({
                  start,
                  end,
                  allDay: true,
                  view: args.view ?? args.defaultView ?? 'month',
                });
              }}
            >
              Add event
            </Button>
          ) : (
            args.toolbarStart
          )
        }
        selectable
        onSelect={(range) => {
          setTitle('');
          setSelection(range);
        }}
      />
      <Dialog
        title="Create event"
        open={selection !== null}
        onOpenChange={(open) => {
          if (!open) setSelection(null);
        }}
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
              },
            ]);

            setSelection(null);
          }}
        >
          {selection && (
            <p className="text-small text-muted">
              {selection.start.toLocaleString('en-US')} –{' '}
              {selection.end.toLocaleString('en-US')}
            </p>
          )}
          <Input
            label="Event title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <Button type="submit">Create</Button>
        </form>
      </Dialog>
    </>
  );
}

export const Selectable: Story = {
  tags: ['example'],
  render: (args: CalendarProps) => <SelectableExample {...args} />,
  args: {
    defaultView: 'week',
    height: 500,
    scrollTime: '08:00',
    'data-testid': 'selectable',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Drag across cells to select a time range, or press Shift+Enter to select the focused cell. On touch screens, hold for about 300ms before dragging; Escape cancels the selection. onSelect opens a Dialog to enter a title and create an event.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slot = canvas.getByTestId('selectable-timeSlot-2026-10-29-32400');
    slot.focus();
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Event title' }),
      'Lorem ipsum',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Create' }));
    await expect(canvas.getByText('Lorem ipsum')).toBeInTheDocument();
  },
};

function EditableCalendar({
  simulateFailure,
  ...args
}: CalendarProps & { simulateFailure?: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>(() => [
    ...(args.events ?? timeGridEvents),
  ]);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const toast = useToast();

  useEffect(() => {
    const pending = timers.current;

    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  return (
    <Calendar
      {...args}
      events={events}
      editable
      onEventChange={({ event, revert }) => {
        if (simulateFailure) {
          const timer = setTimeout(() => {
            timers.current.delete(timer);
            revert();
            toast.error('Could not save changes. The event has been restored.');
          }, 900);
          timers.current.add(timer);
        } else {
          setEvents((current) =>
            current.map((item) => (item.id === event.id ? event : item)),
          );
        }
      }}
    />
  );
}

function EditingExample(args: CalendarProps & { simulateFailure?: boolean }) {
  return (
    <ToastProvider client={null}>
      <EditableCalendar {...args} />
    </ToastProvider>
  );
}

export const DragAndDrop: Story = {
  tags: ['example'],
  render: (args: CalendarProps) => <EditingExample {...args} />,
  args: {
    defaultView: 'week',
    height: 600,
    scrollTime: '08:00',
    events: timeGridEvents,
    editable: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Drag events to move them by slotDuration or day. Drag between the all-day row and time grid to change allDay. On touch screens, hold for 300ms before dragging; Escape cancels. Use Alt + arrow keys for keyboard editing.',
      },
    },
  },
};

export const Resize: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: (args: CalendarProps) => <EditingExample {...args} />,
  args: {
    defaultView: 'week',
    height: 600,
    scrollTime: '08:00',
    editable: true,
    events: timeGridEvents.map((event) => ({ ...event, startEditable: false })),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Drag the bottom handle of a timed event or the end handle of an all-day event to change its end time. startEditable=false prevents moving. Focus the handle and use Alt + arrow keys to resize with the keyboard.',
      },
    },
  },
};

export const OptimisticUpdate: Story = {
  tags: ['example'],
  render: (args: CalendarProps) => <EditingExample {...args} simulateFailure />,
  args: {
    defaultView: 'week',
    height: 600,
    scrollTime: '08:00',
    events: timeGridEvents,
    editable: true,
    'data-testid': 'optimistic',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Changes appear while saving. This example simulates a failure after 900ms, calls revert(), and shows a toast. The application updates events after a successful save.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const event = canvas.getByTestId('optimistic-event-2026-10-29-first');
    event.focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await expect(
      canvas.getByTestId('optimistic-event-2026-10-29-first-time'),
    ).toHaveTextContent('9:30');
    await expect(
      within(canvasElement.ownerDocument.body).findByText(
        'Could not save changes. The event has been restored.',
      ),
    ).resolves.toBeInTheDocument();
    await expect(
      canvas.getByTestId('optimistic-event-2026-10-29-first-time'),
    ).toHaveTextContent('9:00');
  },
};

export const Keyboard: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: (args: CalendarProps) => <EditingExample {...args} />,
  args: {
    defaultView: 'week',
    height: 500,
    scrollTime: '08:00',
    editable: true,
    events: timeGridEvents,
    'data-testid': 'keyboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tab to an event and press Enter to start editing. Arrow keys move by time slot/day; Shift + arrow keys change the end time. Enter confirms once; Escape cancels. A live region announces the new range; Tab cancels and moves focus normally.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const event = canvas.getByTestId('keyboard-event-2026-10-29-first');
    event.focus();
    await userEvent.keyboard('{Enter}{ArrowDown}{Shift>}{ArrowDown}{/Shift}');
    await expect(canvas.getByTestId('keyboard-editingStatus')).toHaveTextContent(
      'Resized',
    );
    await expect(event).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByTestId('keyboard-event-2026-10-29-first-time'),
    ).toHaveTextContent('9:30');
    await expect(
      canvas.getByTestId('keyboard-event-2026-10-29-first-time'),
    ).toHaveTextContent('12:00');
    await userEvent.keyboard('{Enter}{ArrowDown}{Escape}');
    await expect(canvas.getByTestId('keyboard-editingStatus')).toHaveTextContent(
      'Cancelled editing',
    );
    await expect(
      canvas.getByTestId('keyboard-event-2026-10-29-first-time'),
    ).toHaveTextContent('9:30');
  },
};

export const DayGridWeek: Story = {
  tags: ['example'],
  args: {
    defaultView: 'week',
    weekLayout: 'dayGrid',
    weekNumbers: true,
    events: sampleEvents,
    height: 520,
  },
  parameters: {
    docs: {
      description: {
        story:
          'A weekly day grid without a time axis. Multi-day events span columns; weekNumbers shows ISO week numbers.',
      },
    },
  },
};

function AsyncRangeExample(args: CalendarProps) {
  const [range, setRange] = useState<CalendarRangeChange | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!range) return;
    setLoading(true);
    const timer = setTimeout(() => {
      setEvents(
        sampleEvents.filter(
          (event) =>
            new Date(event.start) < range.end &&
            new Date(event.end ?? event.start) > range.start,
        ),
      );
      setLoading(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [range]);

  return (
    <Calendar {...args} events={events} loading={loading} onRangeChange={setRange} />
  );
}

export const AsyncRange: Story = {
  tags: ['usage'],
  render: (args: CalendarProps) => <AsyncRangeExample {...args} />,
  args: { defaultView: 'month', weekNumbers: true, dayMaxEvents: 4 },
  parameters: {
    docs: {
      description: {
        story:
          'Use onRangeChange to request data for the visible range and loading to indicate progress. This example simulates an asynchronous request and discards stale results when the range changes.',
      },
    },
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    defaultView: 'week',
    weekNumbers: true,
    height: 500,
    businessHours: true,
    editable: true,
    selectable: true,
    dayMaxEvents: 1,
    events: [
      {
        id: 'span',
        tone: 'info',
        title: 'Lorem ipsum',
        start: '2026-10-28',
        end: '2026-11-03',
        allDay: true,
      },
      { id: 'extra', title: 'Dolor sit amet', start: '2026-10-29T09:00' },
    ],
    className: 'rounded-none border-accent',
    classNames: {
      toolbarStart: 'pr-1',
      viewList: 'border-accent',
      weekNumber: 'bg-info-50 text-info-700',
      dayWeekday: 'font-semibold',
      eventDot: 'size-2',
      listDayLabel: 'text-accent',
      nowDot: 'bg-accent',
      eventMirror: 'ring-info-700',
      draggingEvent: 'opacity-30',
      resizeHandle: 'bg-accent',
      selectionMirror: 'bg-info-50 ring-info-700',
      selectionStatus: 'sr-only',
      editingStatus: 'sr-only',
      list: 'bg-surface',
      listDayHeader: 'text-accent',
      listEvents: 'space-y-3',
      eventTime: 'font-semibold',
      timeGrid: 'bg-surface',
      scrollContainer: 'max-h-96',
      dayHeader: 'text-accent',
      allDayLabel: 'font-semibold',
      timeGutter: 'bg-hover',
      slotLabel: 'text-accent',
      dayColumn: 'border-accent/20',
      timeSlot: 'border-dashed',
      businessHours: 'bg-hover/40',
      nowIndicator: 'border-accent',
      toolbar: 'bg-hover',
      title: 'text-accent',
      navigationButton: 'rounded-full',
      viewTab: 'rounded-full',
      content: 'bg-canvas',
      weekday: 'text-accent',
      day: 'min-h-28',
      today: 'bg-hover',
      event: 'rounded-none',
      moreButton: 'font-semibold',
      morePopover: 'rounded-none',
    },
  },
};
