'use client';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Collapsible } from 'radix-ui';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { KitIcon } from '../../components/icon/kit-icon';
import { ChevronDownIcon } from '../../components/icon/outline/chevron-down';
import { SidebarGroup } from './index';
import type { SidebarEntry, SidebarClassNames } from './types';

export function SidebarEntryGroup({
  item,
  activeKey,
  collapsed,
  testId,
  classNames,
  children,
}: {
  item: Extract<SidebarEntry, { type: 'group' }>;
  activeKey: string;
  collapsed: boolean;
  testId?: string | undefined;
  classNames?: SidebarClassNames | undefined;
  children: ReactNode;
}) {
  const [localOpen, setLocalOpen] = useState(
    Boolean(activeKey) || (item.defaultOpen ?? true),
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveKey = useRef(activeKey);
  const open = item.open ?? localOpen;

  useEffect(() => {
    if (item.collapsible && activeKey && previousActiveKey.current !== activeKey) {
      if (item.open === undefined) setLocalOpen(true);
      if (!open) item.onOpenChange?.(true);
    }
    previousActiveKey.current = activeKey;
  }, [activeKey, item.collapsible, item.open, item.onOpenChange, open]);

  useLayoutEffect(() => {
    if (!open && contentRef.current?.contains(document.activeElement))
      triggerRef.current?.focus();
  }, [open]);

  if (!item.collapsible || collapsed)
    return (
      <SidebarGroup
        label={item.label}
        data-testid={testId}
        className={cn(classNames?.group, item.className)}
        labelClassName={cn(collapsed && 'sr-only', classNames?.groupLabel)}
      >
        {children}
      </SidebarGroup>
    );

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={(next) => {
        if (item.open === undefined) setLocalOpen(next);
        item.onOpenChange?.(next);
      }}
      data-testid={testId}
      className={cn('min-w-0', classNames?.group, item.className)}
    >
      <Collapsible.Trigger
        ref={triggerRef}
        data-testid={partTestId(testId, 'trigger')}
        className={cn(
          'group mb-1 flex w-full items-center gap-2 rounded-control px-2.5 text-left text-ui-sm font-medium text-[var(--sidebar-muted,var(--color-muted))]',
          focusRingClassName,
          classNames?.groupLabel,
        )}
      >
        <span className="min-w-0 flex-1 break-words">{item.label}</span>
        <KitIcon
          name="chevronDown"
          builtin={{ outline: ChevronDownIcon, bold: ChevronDownIcon }}
          className="size-3 shrink-0 motion-safe:transition-transform group-data-[state=open]:rotate-180"
        />
      </Collapsible.Trigger>
      <Collapsible.Content
        ref={contentRef}
        inert={!open}
        data-testid={partTestId(testId, 'content')}
        className={cn('ui-submenu-motion overflow-hidden', classNames?.groupContent)}
      >
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
