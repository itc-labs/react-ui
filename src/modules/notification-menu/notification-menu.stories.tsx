import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../../components/button';
import { NotificationMenu, type NotificationItem } from './index';

const items: NotificationItem[] = [
  {
    id: 'paid',
    title: 'Olivia Martin paid INV-20481',
    description: 'Pro plan · monthly · $49',
    time: '2 min ago',
    href: '#invoice-20481',
    avatar: { name: 'Olivia Martin' },
  },
  {
    id: 'trial',
    title: 'Liam Nguyen started a Team plan trial',
    time: '1 h ago',
    icon: 'user',
  },
  {
    id: 'export',
    title: 'October revenue export is ready',
    description: 'CSV · 2.4 MB',
    time: 'Yesterday',
    read: true,
    icon: 'download',
  },
];

const meta = {
  title: 'Modules/NotificationMenu',
  component: NotificationMenu,
  args: { items, viewAllHref: '#notifications', align: 'start' },
  parameters: {
    docs: {
      description: {
        component:
          'A bell with an unread badge that opens the latest notifications. The host owns the data and realtime updates: pass the current items (and unreadCount when the list is only a page), handle onSelect and onMarkAllRead, and keep the state inside the component that renders the menu so a new notification re-renders only the bell. Place it in a header, topbar or Navbar actions.',
      },
    },
  },
} satisfies Meta<typeof NotificationMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

function RealtimeExample() {
  const [list, setList] = useState(items);
  const [next, setNext] = useState(1);

  const receive = () => {
    setList((current) => [
      {
        id: `new-${next}`,
        title: `New order #${20481 + next} from Mai Tran`,
        time: 'Just now',
        icon: 'cart',
      },
      ...current,
    ]);

    setNext((value) => value + 1);
  };

  return (
    <div className="flex items-center gap-3">
      <NotificationMenu
        items={list}
        align="start"
        onMarkAllRead={() =>
          setList((current) => current.map((item) => ({ ...item, read: true })))
        }
        onSelect={(item) =>
          setList((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, read: true } : entry,
            ),
          )
        }
      />
      <Button variant="secondary" size="sm" onClick={receive}>
        Simulate a new notification
      </Button>
    </div>
  );
}

export const Realtime: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Simulate a pushed notification: the badge increases by one. Selecting an item or "Mark all as read" updates the host state, and the count follows.',
      },
    },
  },
  render: () => <RealtimeExample />,
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <NotificationMenu items={[]} align="start" />
      <NotificationMenu items={items} unreadCount={128} align="start" />
      <NotificationMenu items={[]} loading align="start" />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    classNames: {
      trigger: 'rounded-full bg-surface',
      header: 'bg-canvas',
      unread: 'bg-danger-700',
    },
  },
};
