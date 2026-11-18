// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  createDemoNotificationsApi,
  useNotifications,
  type NotificationEvent,
  type NotificationRecord,
  type NotificationsApi,
} from './notifications';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Notifications = ReturnType<typeof useNotifications>;

let host: HTMLDivElement;
let root: Root;
let current: Notifications;

function Harness({ api }: { api: NotificationsApi }) {
  current = useNotifications(api, 15);

  return null;
}

const mount = (api: NotificationsApi) =>
  act(async () => root.render(<Harness api={api} />));

const settle = (run: () => void) =>
  act(async () => {
    run();
    await vi.runAllTimersAsync();
  });

const record = (id: string): NotificationRecord => ({
  id,
  title: id,
  description: '',
  time: 'Just now',
  read: false,
  href: '/notifications',
  actorName: null,
});

beforeEach(() => {
  vi.useFakeTimers();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.useRealTimers();
});

it('shows the server unread count without requesting the list', async () => {
  const api = createDemoNotificationsApi();
  const list = vi.spyOn(api, 'list');

  await mount(api);
  await settle(() => {});

  expect(current.unreadCount).toBe(3);
  expect(list).not.toHaveBeenCalled();
});

it('loads pages by cursor until the last one and ignores repeat requests', async () => {
  const api = createDemoNotificationsApi(20);
  const list = vi.spyOn(api, 'list');

  await mount(api);
  await settle(() => current.ensureLoaded());

  expect(current.items).toHaveLength(15);
  expect(current.hasMore).toBe(true);

  await settle(() => {
    current.loadMore();
    current.loadMore();
  });

  expect(list).toHaveBeenCalledTimes(2);
  expect(current.items).toHaveLength(20);
  expect(new Set(current.items.map((item) => item.id)).size).toBe(20);
  expect(current.hasMore).toBe(false);
});

it('puts a realtime notification first without duplicating it on the next page', async () => {
  const api = createDemoNotificationsApi(20);

  let emit: (event: NotificationEvent) => void = () => {};

  vi.spyOn(api, 'subscribe').mockImplementation((listener) => {
    emit = listener;

    return () => {};
  });

  await mount(api);
  await settle(() => current.ensureLoaded());
  await settle(() => emit({ notification: record('live'), unreadCount: 4 }));

  expect(current.items[0]!.id).toBe('live');
  expect(current.unreadCount).toBe(4);

  await settle(() => current.loadMore());

  expect(current.items).toHaveLength(21);
  expect(current.items[0]!.id).toBe('live');
});

it('restores read state and the count when the server rejects a change', async () => {
  const api = createDemoNotificationsApi();

  vi.spyOn(api, 'markRead').mockRejectedValue(new Error('offline'));
  vi.spyOn(api, 'markAllRead').mockRejectedValue(new Error('offline'));
  await mount(api);
  await settle(() => current.ensureLoaded());

  const id = current.items[0]!.id;

  await settle(() => current.markRead(id));

  expect(current.items[0]!.read).toBe(false);
  expect(current.unreadCount).toBe(3);

  await settle(() => current.markAllRead());

  expect(current.items.filter((item) => !item.read)).toHaveLength(3);
  expect(current.unreadCount).toBe(3);
});

it('retries the page that failed', async () => {
  const api = createDemoNotificationsApi(20);

  await mount(api);
  await settle(() => current.ensureLoaded());

  const list = vi.spyOn(api, 'list').mockRejectedValueOnce(new Error('offline'));

  await settle(() => current.loadMore());

  expect(current.status).toBe('error');
  expect(current.items).toHaveLength(15);

  await settle(() => current.retry());

  expect(list).toHaveBeenCalledTimes(2);
  expect(current.status).toBe('ready');
  expect(current.items).toHaveLength(20);
});

it('starts over when the API is replaced', async () => {
  const first = createDemoNotificationsApi(20);
  const second = createDemoNotificationsApi(5);
  const list = vi.spyOn(second, 'list');

  await mount(first);
  await settle(() => current.ensureLoaded());
  await mount(second);
  await settle(() => {});

  expect(current.items).toHaveLength(0);
  expect(current.status).toBe('idle');

  await settle(() => current.ensureLoaded());

  expect(list).toHaveBeenCalledOnce();
  expect(current.items).toHaveLength(5);
});

it('keeps a notification received while mark-all-read fails', async () => {
  const api = createDemoNotificationsApi();

  let emit: (event: NotificationEvent) => void = () => {};

  let reject: (reason: Error) => void = () => {};

  vi.spyOn(api, 'subscribe').mockImplementation((listener) => {
    emit = listener;

    return () => {};
  });

  vi.spyOn(api, 'markAllRead').mockImplementation(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );

  await mount(api);
  await settle(() => current.ensureLoaded());
  await settle(() => current.markAllRead());
  await settle(() => emit({ notification: record('live'), unreadCount: 4 }));
  await settle(() => reject(new Error('offline')));

  expect(current.items[0]!.id).toBe('live');
  expect(current.items.filter((item) => !item.read)).toHaveLength(4);
  expect(current.unreadCount).toBe(4);
});

it('ignores an unread count that is older than a realtime event', async () => {
  const api = createDemoNotificationsApi();

  let emit: (event: NotificationEvent) => void = () => {};

  vi.spyOn(api, 'subscribe').mockImplementation((listener) => {
    emit = listener;

    return () => {};
  });

  await mount(api);
  await act(async () => emit({ notification: record('live'), unreadCount: 4 }));
  await settle(() => {});

  expect(current.unreadCount).toBe(4);
});
