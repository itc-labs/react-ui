'use client';
import { useRef, useState, type ReactElement } from 'react';
import { UiLink } from '../../components/link-image-provider';
import { Popover } from 'radix-ui';
import { cn, partTestId } from '../../components/common';
import { Badge, isBadgeVisible } from '../../components/badge';
import { FolderIcon } from '../../components/icon/outline/folder';
import { Icon } from '../../components/icon';
import { Tooltip } from '../../components/tooltip';
import { SidebarItem } from './item';
import { SidebarEntries } from './entries';
import type { SidebarClassNames, SidebarEntry } from './types';

type NavigableEntry = Exclude<SidebarEntry, { type: 'group' }>;

export function SidebarEntryIcon({
  item,
  collapsed,
  testId,
  classNames,
}: {
  item: NavigableEntry;
  collapsed?: boolean;
  testId?: string | undefined;
  classNames?: SidebarClassNames | undefined;
}) {
  const badge = typeof item.badge === 'number' ? { count: item.badge } : item.badge;
  const icon = (
    <Icon
      {...(typeof item.icon === 'string'
        ? { name: item.icon }
        : { glyph: item.icon ?? FolderIcon })}
      data-testid={partTestId(testId, 'icon')}
      className={classNames?.icon}
    />
  );

  return collapsed && badge && isBadgeVisible(badge) ? (
    <Badge
      {...badge}
      dot
      size="sm"
      data-testid={partTestId(testId, 'badge')}
      className={classNames?.badge}
    >
      {icon}
    </Badge>
  ) : (
    icon
  );
}

export function SidebarEntryLabel({
  item,
  testId,
  classNames,
}: {
  item: NavigableEntry;
  testId?: string | undefined;
  classNames?: SidebarClassNames | undefined;
}) {
  const badge = typeof item.badge === 'number' ? { count: item.badge } : item.badge;

  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <span
        data-testid={partTestId(testId, 'label')}
        className={cn('min-w-0 flex-1', classNames?.label)}
      >
        {item.label}
      </span>
      {typeof item.badge === 'number'
        ? item.badge > 0 && (
            <span
              data-testid={partTestId(testId, 'badge')}
              className={cn(
                'ml-auto shrink-0 text-ui-sm tabular-nums text-muted',
                classNames?.badge,
              )}
            >
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )
        : badge && (
            <Badge
              {...badge}
              data-testid={partTestId(testId, 'badge')}
              className={cn('ml-auto shrink-0', classNames?.badge)}
            />
          )}
    </span>
  );
}

export function SidebarRailEntry({
  item,
  activePath,
  testId,
  classNames,
}: {
  item: NavigableEntry;
  activePath: readonly string[];
  testId?: string | undefined;
  classNames?: SidebarClassNames | undefined;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  // Pointer-opened flyouts focus the panel, so no focus ring flashes on the first link.
  const openedByPointer = useRef(false);
  const [localOpen, setLocalOpen] = useState(
    item.type === 'submenu' ? (item.defaultOpen ?? false) : false,
  );
  const open = item.type === 'submenu' ? (item.open ?? localOpen) : false;

  const changeOpen = (next: boolean) => {
    if (item.type !== 'submenu') return;
    if (item.open === undefined) setLocalOpen(next);
    item.onOpenChange?.(next);
  };

  const active = activePath[0] === item.id;
  const icon = (
    <SidebarEntryIcon item={item} collapsed testId={testId} classNames={classNames} />
  );
  const label = <span className="sr-only">{item.label}</span>;
  const rowClass = cn(
    'relative mx-auto flex size-9 shrink-0 items-center justify-center rounded-control p-2 text-muted hover:bg-surface/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50',
    active && 'bg-surface text-accent shadow-panel ring-1 ring-line',
    classNames?.item,
    item.className,
  );

  const tooltip = (child: ReactElement) => (
    <Tooltip
      content={item.label}
      side="right"
      className={cn(classNames?.tooltip)}
      data-testid={partTestId(testId, 'tooltip')}
    >
      {child}
    </Tooltip>
  );

  if (item.type !== 'submenu') {
    return tooltip(
      <SidebarItem asChild active={active} className={rowClass}>
        {item.href && !item.disabled ? (
          <UiLink href={item.href} onClick={item.onSelect} data-testid={testId}>
            {icon}
            {label}
          </UiLink>
        ) : item.onSelect ? (
          <button
            type="button"
            disabled={item.disabled}
            onClick={item.onSelect}
            data-testid={testId}
          >
            {icon}
            {label}
          </button>
        ) : (
          <span
            data-testid={testId}
            aria-disabled={item.disabled || undefined}
            tabIndex={item.disabled ? -1 : 0}
          >
            {icon}
            {label}
          </span>
        )}
      </SidebarItem>,
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      {tooltip(
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={item.disabled}
            data-testid={testId}
            data-active={active}
            aria-label={item.toggleLabel}
            className={cn(rowClass, classNames?.submenuTrigger)}
            onPointerDown={() => {
              openedByPointer.current = true;
            }}
            onKeyDown={(event) => {
              openedByPointer.current = false;
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                changeOpen(true);
              }
            }}
          >
            {icon}
            {label}
          </button>
        </Popover.Trigger>,
      )}
      <Popover.Portal>
        <Popover.Content
          ref={contentRef}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const first = openedByPointer.current
              ? null
              : contentRef.current?.querySelector<HTMLElement>(
                  'a[href], button:not(:disabled)',
                );
            openedByPointer.current = false;
            (first ?? contentRef.current)?.focus();
          }}
          side="right"
          align="start"
          sideOffset={12}
          aria-label={typeof item.label === 'string' ? item.label : item.toggleLabel}
          data-testid={partTestId(testId, 'content')}
          className={cn(
            'ui-floating-motion z-[var(--z-index-popover)] grid max-h-[80dvh] w-sidebar gap-0.5 overflow-y-auto rounded-panel border border-line bg-surface p-1.5 text-ink shadow-floating focus:outline-none [&_[aria-current=page]]:bg-hover [&_[aria-current=page]]:shadow-none [&_[aria-current=page]]:ring-0',
            classNames?.submenuContent,
            classNames?.flyout,
          )}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a[href]')) changeOpen(false);
          }}
        >
          {item.href && (
            <SidebarItem
              href={item.href}
              active={active && activePath.length === 1}
              onClick={item.onSelect}
              data-testid={partTestId(testId, 'link')}
              className={classNames?.item}
            >
              {item.label}
            </SidebarItem>
          )}
          <SidebarEntries
            items={item.items}
            activePath={active ? activePath.slice(1) : []}
            testId={testId}
            classNames={classNames}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
