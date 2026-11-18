// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import {
  NotificationMenu,
  type NotificationItem,
  type NotificationMenuProps,
} from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

const items: NotificationItem[] = [
  {
    id: 'paid',
    title: 'Olivia Martin paid INV-20481',
    time: '2 min ago',
    href: '/invoices/20481',
  },
  {
    id: 'trial',
    title: 'Liam Nguyen started a trial',
    description: 'Team plan',
    time: '1 h ago',
  },
  { id: 'report', title: 'Report ready', time: 'Yesterday', read: true },
];

function render(props: Partial<NotificationMenuProps> = {}, locale = 'en-US') {
  return act(async () =>
    root.render(
      <UILocaleProvider locale={locale}>
        <NotificationMenu items={items} data-testid="notifications" {...props} />
      </UILocaleProvider>,
    ),
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-testid="notifications-${name}"]`);

it('labels the bell with the unread count derived from items', async () => {
  await render();
  const trigger = part('trigger')!;
  expect(trigger.getAttribute('aria-label')).toBe('Notifications, 2 unread');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(part('badge')!.textContent).toContain('2');
});

it('prefers an explicit unread count and hides the badge at zero', async () => {
  await render({ unreadCount: 12 });
  expect(part('trigger')!.getAttribute('aria-label')).toBe('Notifications, 12 unread');
  await render({ unreadCount: 0 });
  expect(part('badge')!.textContent).not.toMatch(/\d/);
});

it('opens a localized list with unread markers, selection and view-all', async () => {
  const onSelect = vi.fn();
  await render({ onSelect, viewAllHref: '/notifications' }, 'vi-VN');
  await act(async () => part('trigger')!.click());
  expect(part('content')!.getAttribute('aria-label')).toBe('Thông báo');
  expect(part('unread-paid')).not.toBeNull();
  expect(part('unread-report')).toBeNull();
  expect(part('item-paid')!.querySelector('a')!.getAttribute('href')).toBe(
    '/invoices/20481',
  );
  expect(part('viewAll')!.textContent).toBe('Xem tất cả thông báo');
  await act(async () => part('item-trial')!.querySelector('button')!.click());
  expect(onSelect).toHaveBeenCalledWith(items[1]);
  expect(part('content')).toBeNull();
});

it('offers mark-all-read only while something is unread', async () => {
  const onMarkAllRead = vi.fn();
  await render({ onMarkAllRead, defaultOpen: true });
  await act(async () => part('markAllRead')!.click());
  expect(onMarkAllRead).toHaveBeenCalledOnce();
  await render({
    onMarkAllRead,
    defaultOpen: true,
    items: [{ id: 'x', title: 'X', read: true }],
  });
  expect(part('markAllRead')).toBeNull();
});

it('shows empty and loading states', async () => {
  await render({ items: [], defaultOpen: true });
  expect(part('empty')!.textContent).toBe("You're all caught up.");
  await render({ items: [], defaultOpen: true, emptyState: 'Nothing yet' });
  expect(part('empty')!.textContent).toBe('Nothing yet');
  await render({ loading: true, defaultOpen: true });
  expect(part('list')).toBeNull();
  expect(part('content')!.textContent).toContain('Loading notifications');
});

it('keeps a controlled open state with the host', async () => {
  const onOpenChange = vi.fn();
  await render({ open: false, onOpenChange });
  await act(async () => part('trigger')!.click());
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(part('content')).toBeNull();
  await render({ open: true, onOpenChange });
  expect(part('content')).not.toBeNull();
});
