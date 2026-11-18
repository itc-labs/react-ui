/**
 * Stories only: a header bell composed from IconButton, Popover and VirtualList.
 *
 * Three layers, so an app can replace each one on its own:
 * 1. `NotificationsApi` is the contract with the backend. Implement it with your SDK.
 * 2. `useNotifications` owns the state. Replace it with useInfiniteQuery if the app has one.
 * 3. `DemoNotifications` is only the UI.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { cn } from '../../../components/common';
import { focusRingClassName } from '../../../components/common/focus-ring';
import { BellIcon } from '../../../components/icon/outline/bell';
import { IconButton } from '../../../components/icon-button';
import { UiLink } from '../../../components/link-image-provider';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/popover';
import { VirtualList } from '../../../modules/virtual-list';

export type NotificationRecord = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  href: string;
  actorName: string | null;
};

/**
 * `unreadCount` comes from the server because only part of the list is loaded.
 * `nextCursor` is the last row's id, so rows arriving at the top never shift a later page.
 */
export type NotificationPage = {
  items: NotificationRecord[];
  nextCursor: string | null;
  unreadCount: number;
};

export type NotificationEvent = {
  notification: NotificationRecord;
  unreadCount: number;
};

export type NotificationsApi = {
  list: (params: {
    cursor: string | null;
    limit: number;
    signal: AbortSignal;
  }) => Promise<NotificationPage>;
  getUnreadCount: (signal: AbortSignal) => Promise<number>;
  markRead: (id: string) => Promise<{ unreadCount: number }>;
  markAllRead: () => Promise<{ unreadCount: number }>;
  /** Connect your WebSocket or SSE stream here. Returns the unsubscribe function. */
  subscribe: (listener: (event: NotificationEvent) => void) => () => void;
};

type NotificationsStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Later rows win, and a row that is already loaded keeps its position. */
function mergeById(
  current: readonly NotificationRecord[],
  incoming: readonly NotificationRecord[],
) {
  const incomingById = new Map(incoming.map((item) => [item.id, item]));
  const currentIds = new Set(current.map((item) => item.id));

  return [
    ...current.map((item) => incomingById.get(item.id) ?? item),
    ...incoming.filter((item) => !currentIds.has(item.id)),
  ];
}

export function useNotifications(api: NotificationsApi, pageSize = 15) {
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<NotificationsStatus>('idle');
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    api
      .getUnreadCount(controller.signal)
      .then((count) => {
        if (!controller.signal.aborted) setUnreadCount(count);
      })
      .catch(() => {});

    const unsubscribe = api.subscribe((event) => {
      setItems((current) => {
        const rest = current.filter((item) => item.id !== event.notification.id);

        return [event.notification, ...rest];
      });

      setUnreadCount(event.unreadCount);
    });

    return () => {
      controller.abort();
      request.current?.abort();
      unsubscribe();
    };
  }, [api]);

  const load = useCallback(
    (cursor: string | null) => {
      if (request.current) return;

      const controller = new AbortController();

      request.current = controller;
      setStatus('loading');

      api
        .list({ cursor, limit: pageSize, signal: controller.signal })
        .then((page) => {
          if (controller.signal.aborted) return;

          setItems((current) => mergeById(current, page.items));

          setNextCursor(page.nextCursor);
          setUnreadCount(page.unreadCount);
          setStatus('ready');
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus('error');
        })
        .finally(() => {
          if (request.current === controller) request.current = null;
        });
    },
    [api, pageSize],
  );

  /** The list is requested on first open, so a closed bell only costs the unread count. */
  const ensureLoaded = useCallback(() => {
    if (status === 'idle') load(null);
  }, [load, status]);

  const loadMore = useCallback(() => {
    if (nextCursor) load(nextCursor);
  }, [load, nextCursor]);

  const retry = useCallback(() => load(nextCursor), [load, nextCursor]);

  const markRead = useCallback(
    (id: string) => {
      const target = items.find((item) => item.id === id);

      if (!target || target.read) return;

      const setRead = (read: boolean) =>
        setItems((current) =>
          current.map((item) => (item.id === id ? { ...item, read } : item)),
        );

      setRead(true);

      setUnreadCount((count) => Math.max(count - 1, 0));

      api
        .markRead(id)
        .then((result) => setUnreadCount(result.unreadCount))
        .catch(() => {
          setRead(false);

          setUnreadCount((count) => count + 1);
        });
    },
    [api, items],
  );

  const markAllRead = useCallback(() => {
    const previousItems = items;
    const previousCount = unreadCount;

    setItems((current) => current.map((item) => ({ ...item, read: true })));

    setUnreadCount(0);

    api
      .markAllRead()
      .then((result) => setUnreadCount(result.unreadCount))
      .catch(() => {
        setItems(previousItems);
        setUnreadCount(previousCount);
      });
  }, [api, items, unreadCount]);

  return {
    items,
    unreadCount,
    status,
    hasMore: nextCursor !== null,
    ensureLoaded,
    loadMore,
    retry,
    markRead,
    markAllRead,
  };
}

const demoEvents = [
  {
    title: 'Olivia Martin paid INV-20481',
    description: 'Pro plan · monthly · $49',
    href: '/sales/invoices',
    actorName: 'Olivia Martin',
  },
  {
    title: 'Refund requested for INV-20477',
    description: 'Sofia Rossi · API add-on · $99',
    href: '/sales/refunds',
    actorName: 'Sofia Rossi',
  },
  {
    title: 'Plan limit almost reached',
    description: '9,200 of 10,000 monthly API calls used.',
    href: '/billing',
    actorName: null,
  },
  {
    title: 'Mai Tran joined the workspace',
    description: 'Accepted your invitation as a Designer.',
    href: '/customers',
    actorName: 'Mai Tran',
  },
  {
    title: 'Card declined for INV-20475',
    description: 'Noah Fischer · Priority support · $299',
    href: '/sales/invoices',
    actorName: 'Noah Fischer',
  },
  {
    title: 'October revenue export is ready',
    description: 'CSV · 2.4 MB',
    href: '/documents',
    actorName: null,
  },
] as const;

function relativeTime(minutes: number) {
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} h ago`;

  return `${Math.floor(minutes / 1440)} d ago`;
}

function wait(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

/** An in-memory backend with network delay. Replace it with calls to your API. */
export function createDemoNotificationsApi(
  total = 48,
  latency = 450,
): NotificationsApi {
  let rows: NotificationRecord[] = Array.from({ length: total }, (_, index) => ({
    ...demoEvents[index % demoEvents.length]!,
    id: `notification-${index + 1}`,
    time: relativeTime(2 + index * 37),
    read: index >= 3,
  }));
  const listeners = new Set<(event: NotificationEvent) => void>();

  const countUnread = () => rows.filter((row) => !row.read).length;

  return {
    async list({ cursor, limit, signal }) {
      await wait(latency, signal);

      const start = cursor ? rows.findIndex((row) => row.id === cursor) + 1 : 0;
      const items = rows.slice(start, start + limit);
      const hasMore = start + limit < rows.length;

      return {
        items,
        nextCursor: hasMore ? items[items.length - 1]!.id : null,
        unreadCount: countUnread(),
      };
    },
    async getUnreadCount(signal) {
      await wait(latency, signal);

      return countUnread();
    },
    async markRead(id) {
      await wait(latency);
      rows = rows.map((row) => (row.id === id ? { ...row, read: true } : row));

      return { unreadCount: countUnread() };
    },
    async markAllRead() {
      await wait(latency);
      rows = rows.map((row) => ({ ...row, read: true }));

      return { unreadCount: 0 };
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
}

function NotificationRow({
  item,
  onSelect,
}: {
  item: NotificationRecord;
  onSelect: (item: NotificationRecord) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        'flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left hover:bg-canvas',
        focusRingClassName,
      )}
    >
      {item.actorName ? (
        <Avatar alt={item.actorName} size="sm" />
      ) : (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-accent">
          <BellIcon className="size-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-ui-sm font-medium text-ink">{item.title}</span>
        <span className="block truncate text-ui-sm text-muted">{item.description}</span>
        <span className="block text-ui-sm text-muted">{item.time}</span>
      </span>
      {!item.read && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </button>
  );
}

/**
 * Keeps its state here, so a new notification re-renders the bell and not the dashboard.
 * Pass your own `api` to connect a backend; the markup stays the same.
 */
export function DemoNotifications({
  api,
  className,
}: {
  api?: NotificationsApi;
  className?: string;
}) {
  const [demoApi] = useState(() => createDemoNotificationsApi());
  const [open, setOpen] = useState(false);
  const notifications = useNotifications(api ?? demoApi);

  const changeOpen = (next: boolean) => {
    setOpen(next);

    if (next) notifications.ensureLoaded();
  };

  const select = (item: NotificationRecord) => {
    notifications.markRead(item.id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <IconButton
          icon={BellIcon}
          variant="ghost"
          label="Notifications"
          badge={{
            count: notifications.unreadCount,
            label: `${notifications.unreadCount} unread`,
          }}
          {...(className ? { className } : {})}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={16}
        aria-label="Notifications"
        className="w-96 overflow-hidden p-0"
      >
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-4 py-2">
          <p className="font-semibold text-ink">Notifications</p>
          {notifications.unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={notifications.markAllRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <VirtualList
          aria-label="Latest notifications"
          items={notifications.items}
          getItemKey={(item) => item.id}
          renderItem={(item) => <NotificationRow item={item} onSelect={select} />}
          estimateSize={88}
          height={360}
          hasMore={notifications.hasMore}
          loading={notifications.status === 'loading'}
          onLoadMore={notifications.loadMore}
          error={
            notifications.status === 'error'
              ? 'Notifications could not be loaded.'
              : undefined
          }
          onRetry={notifications.retry}
          skeletonCount={4}
          emptyContent={
            <p className="p-6 text-center text-ui-sm text-muted">
              You&apos;re all caught up.
            </p>
          }
        />
        <div className="border-t border-line p-2 text-center">
          <UiLink
            href="/notifications"
            className={cn(
              'inline-block rounded-control px-3 py-1.5 text-ui-sm font-medium text-accent hover:bg-canvas',
              focusRingClassName,
            )}
          >
            View all notifications
          </UiLink>
        </div>
      </PopoverContent>
    </Popover>
  );
}
