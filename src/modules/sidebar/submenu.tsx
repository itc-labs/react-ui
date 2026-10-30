'use client';

import { KitIcon } from '../../components/icon/kit-icon';
import { ChevronDownIcon } from '../../components/icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../../components/icon/bold/chevron-down';
import type { TestIdProps } from '../../components/common/testing';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from 'react';
import { Collapsible } from 'radix-ui';
import { type SlotClasses, cn } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { useComposedRefs } from '../../components/common/refs';

const SubmenuContext = createContext<{
  open: boolean;
  active: boolean;
  trigger: RefObject<HTMLButtonElement | null>;
  content: RefObject<HTMLDivElement | null>;
} | null>(null);

function useSubmenu() {
  const value = useContext(SubmenuContext);
  if (!value)
    throw new Error('SidebarSubmenuTrigger/Content must be inside SidebarSubmenu.');

  return value;
}

export type SidebarSubmenuProps = (ComponentProps<typeof Collapsible.Root> & {
  active?: boolean;
}) &
  TestIdProps;

/** active is an ancestor highlight, not aria-current=page. Routing stays with the host. */
export function SidebarSubmenu({
  active = false,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  className,
  children,
  ...props
}: SidebarSubmenuProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen ?? active);
  const open = controlledOpen ?? localOpen;
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const changeOpen = useCallback(
    (next: boolean) => {
      if (!next && content.current?.contains(document.activeElement))
        trigger.current?.focus();
      if (controlledOpen === undefined) setLocalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );
  const previousActive = useRef(active);

  useEffect(() => {
    // Entering a branch reveals the current page; manual collapse still works within that branch.
    if (active && !previousActive.current && controlledOpen === undefined)
      changeOpen(true);
    previousActive.current = active;
  }, [active, controlledOpen, changeOpen]);

  return (
    <SubmenuContext.Provider value={{ open, active, trigger, content }}>
      <Collapsible.Root
        {...props}
        open={open}
        onOpenChange={changeOpen}
        data-active={active}
        className={cn('w-full min-w-0', className)}
      >
        {children}
      </Collapsible.Root>
    </SubmenuContext.Provider>
  );
}

export function SidebarSubmenuRow({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('flex min-w-0 items-center gap-1 [&>a]:flex-1', className)}
    />
  );
}

export type SidebarSubmenuTriggerProps = (Omit<
  ComponentProps<typeof Collapsible.Trigger>,
  'asChild'
> & {
  children: ReactNode;
  icon?: ReactNode;
  iconOnly?: boolean;
  classNames?: SlotClasses<'icon' | 'label' | 'chevron'>;
}) &
  TestIdProps;

export function SidebarSubmenuTrigger({
  icon,
  iconOnly = false,
  children,
  className,
  classNames,
  ref,
  ...props
}: SidebarSubmenuTriggerProps) {
  const context = useSubmenu();
  const composedRef = useComposedRefs(context.trigger, ref);

  return (
    <Collapsible.Trigger
      {...props}
      ref={composedRef}
      className={cn(
        'group flex min-w-0 items-center gap-2.5 rounded-control text-control motion-safe:transition-colors focus-visible:-outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        focusRingClassName,
        iconOnly
          ? 'size-9 shrink-0 justify-center'
          : 'min-h-9 w-full px-2.5 py-1.5 text-left',
        context.active ? 'text-ink' : 'text-muted hover:bg-surface/60 hover:text-ink',
        className,
      )}
    >
      {icon != null && <span className={cn('shrink-0', classNames?.icon)}>{icon}</span>}
      <span
        className={cn(
          'min-w-0 [overflow-wrap:anywhere]',
          iconOnly && 'sr-only',
          classNames?.label,
        )}
      >
        {children}
      </span>
      <KitIcon
        name="chevronDown"
        builtin={{ outline: ChevronDownIcon, bold: ChevronDownBoldIcon }}
        className={cn(
          'size-4 shrink-0 text-muted motion-safe:transition-transform duration-[var(--motion-duration-control)] group-data-[state=open]:rotate-180',
          !iconOnly && 'ml-auto',
          classNames?.chevron,
        )}
      />
    </Collapsible.Trigger>
  );
}

export function SidebarSubmenuContent({
  className,
  contentClassName,
  children,
  ref,
  forceMount,
  ...props
}: Omit<ComponentProps<typeof Collapsible.Content>, 'asChild'> & {
  contentClassName?: string;
}) {
  const context = useSubmenu();
  const composedRef = useComposedRefs(context.content, ref);

  return (
    <Collapsible.Content
      {...props}
      {...(forceMount ? { forceMount } : {})}
      ref={composedRef}
      inert={!context.open}
      {...(forceMount && !context.open ? { hidden: true } : {})}
      className={cn('ui-submenu-motion overflow-hidden', className)}
    >
      <div
        className={cn(
          'ml-[1.125rem] mt-0.5 grid min-w-0 gap-0.5 border-l border-line pb-1 pl-2.5',
          contentClassName,
        )}
      >
        {children}
      </div>
    </Collapsible.Content>
  );
}
