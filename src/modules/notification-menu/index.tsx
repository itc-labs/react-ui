'use client';
import { useState, type ReactNode } from 'react';
import { Popover as Primitive } from 'radix-ui';
import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import {
  cn,
  partTestId,
  type SlotClasses,
  type TestIdProps,
} from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { Icon, type IconGlyph, type IconName } from '../../components/icon';
import { BellIcon } from '../../components/icon/outline/bell';
import { IconButton } from '../../components/icon-button';
import { UiLink } from '../../components/link-image-provider';
import { PopoverContent } from '../../components/popover';
import { Spinner } from '../../components/spinner';
import { useUILocale } from '../../i18n/provider';

export type NotificationItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** Preformatted time, e.g. "5 min ago". */
  time?: ReactNode;
  read?: boolean;
  /** Renders the row as a link through the UIProvider link adapter. */
  href?: string;
  icon?: IconName | IconGlyph;
  /** Shows an avatar instead of an icon, e.g. for a teammate's activity. */
  avatar?: { name: string; src?: string };
};

export type NotificationMenuClassNames = SlotClasses<
  | 'trigger'
  | 'badge'
  | 'content'
  | 'header'
  | 'title'
  | 'list'
  | 'item'
  | 'unread'
  | 'empty'
  | 'footer'
>;

export type NotificationMenuProps = TestIdProps & {
  items: readonly NotificationItem[];
  /** Count on the bell. Defaults to the items without `read`, e.g. when the list is a page of results. */
  unreadCount?: number;
  onSelect?: (item: NotificationItem) => void;
  /** Shows "Mark all as read" while something is unread. */
  onMarkAllRead?: () => void;
  viewAllHref?: string;
  viewAllLabel?: string;
  title?: ReactNode;
  /** Accessible name of the bell; defaults to a localized label with the unread count. */
  label?: string;
  loading?: boolean;
  emptyState?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  className?: string;
  classNames?: NotificationMenuClassNames;
};

/** A bell with an unread badge that opens the latest notifications. Data and realtime updates stay with the host. */
export function NotificationMenu({
  items,
  unreadCount,
  onSelect,
  onMarkAllRead,
  viewAllHref,
  viewAllLabel,
  title,
  label,
  loading = false,
  emptyState,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  align = 'end',
  className,
  classNames,
  'data-testid': testId,
}: NotificationMenuProps) {
  const { t } = useUILocale();
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const unread = unreadCount ?? items.filter((item) => !item.read).length;

  const changeOpen = (next: boolean) => {
    if (controlledOpen === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  };

  const select = (item: NotificationItem) => {
    onSelect?.(item);
    changeOpen(false);
  };

  return (
    <Primitive.Root open={open} onOpenChange={changeOpen}>
      <Badge
        count={unread}
        size="sm"
        label={t('notificationMenu.unread', { count: unread })}
        data-testid={partTestId(testId, 'badge')}
        className={cn(classNames?.badge)}
      >
        <Primitive.Trigger asChild>
          <IconButton
            icon={BellIcon}
            variant="ghost"
            label={label ?? t('notificationMenu.open', { count: unread })}
            data-testid={partTestId(testId, 'trigger')}
            className={cn(classNames?.trigger, className)}
          />
        </Primitive.Trigger>
      </Badge>
      <PopoverContent
        align={align}
        aria-label={t('notificationMenu.title')}
        data-testid={partTestId(testId, 'content')}
        className={cn('w-96 p-0', classNames?.content)}
      >
        <div
          data-testid={partTestId(testId, 'header')}
          className={cn(
            'flex items-center justify-between gap-3 border-b border-line px-4 py-3',
            classNames?.header,
          )}
        >
          <p className={cn('font-semibold text-ink', classNames?.title)}>
            {title ?? t('notificationMenu.title')}
          </p>
          {onMarkAllRead && unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              data-testid={partTestId(testId, 'markAllRead')}
              onClick={onMarkAllRead}
            >
              {t('notificationMenu.markAllRead')}
            </Button>
          )}
        </div>
        {loading ? (
          <div className="grid place-items-center p-6">
            <Spinner label={t('notificationMenu.loading')} />
          </div>
        ) : items.length === 0 ? (
          <div
            data-testid={partTestId(testId, 'empty')}
            className={cn(
              'px-4 py-8 text-center text-ui-sm text-muted',
              classNames?.empty,
            )}
          >
            {emptyState ?? t('notificationMenu.empty')}
          </div>
        ) : (
          <ul
            data-testid={partTestId(testId, 'list')}
            className={cn(
              'grid max-h-96 gap-0.5 overflow-y-auto p-1.5',
              classNames?.list,
            )}
          >
            {items.map((item) => {
              const body = (
                <>
                  {item.avatar ? (
                    <Avatar
                      alt={item.avatar.name}
                      {...(item.avatar.src ? { src: item.avatar.src } : {})}
                      size="sm"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-accent"
                    >
                      <Icon
                        {...(typeof item.icon === 'string'
                          ? { name: item.icon }
                          : { glyph: item.icon ?? BellIcon })}
                        className="size-4"
                      />
                    </span>
                  )}
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="font-medium text-ink">{item.title}</span>
                    {item.description != null && (
                      <span className="line-clamp-2 text-ui-sm text-muted">
                        {item.description}
                      </span>
                    )}
                    {item.time != null && (
                      <span className="text-ui-sm text-muted">{item.time}</span>
                    )}
                  </span>
                  {!item.read && (
                    <span
                      data-testid={partTestId(testId, 'unread', item.id)}
                      className={cn(
                        'mt-1.5 size-2 shrink-0 rounded-full bg-accent',
                        classNames?.unread,
                      )}
                    >
                      <span className="sr-only">
                        {t('notificationMenu.unreadItem')}
                      </span>
                    </span>
                  )}
                </>
              );
              const rowClass = cn(
                'flex w-full items-start gap-3 rounded-control p-2.5 text-start text-control hover:bg-hover',
                !item.read && 'bg-brand-50/60',
                focusRingClassName,
                classNames?.item,
              );

              return (
                <li key={item.id} data-testid={partTestId(testId, 'item', item.id)}>
                  {item.href ? (
                    <UiLink
                      href={item.href}
                      className={rowClass}
                      onClick={() => select(item)}
                    >
                      {body}
                    </UiLink>
                  ) : (
                    <button
                      type="button"
                      className={rowClass}
                      onClick={() => select(item)}
                    >
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {viewAllHref && (
          <div className={cn('border-t border-line p-1.5', classNames?.footer)}>
            <UiLink
              href={viewAllHref}
              data-testid={partTestId(testId, 'viewAll')}
              onClick={() => changeOpen(false)}
              className={cn(
                'block rounded-control p-2 text-center text-ui-sm font-medium text-accent hover:bg-hover',
                focusRingClassName,
              )}
            >
              {viewAllLabel ?? t('notificationMenu.viewAll')}
            </UiLink>
          </div>
        )}
      </PopoverContent>
    </Primitive.Root>
  );
}
