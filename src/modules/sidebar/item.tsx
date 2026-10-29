'use client';
import type { ComponentProps, ReactNode } from 'react';
import { UiLink } from '../../components/link-image-provider';
import { Slot } from 'radix-ui';
import { cn } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';

export function SidebarItem({
  active = false,
  asChild = false,
  icon,
  children,
  className,
  iconClassName,
  ...props
}: ComponentProps<'a'> & {
  active?: boolean;
  asChild?: boolean;
  icon?: ReactNode;
  iconClassName?: string;
}) {
  const Component = asChild ? Slot.Root : 'span';
  const classes = cn(
    'flex min-w-0 items-center gap-3 rounded-control px-3 py-2.5 text-control font-medium [overflow-wrap:anywhere] transition-colors focus-visible:outline-offset-2',
    focusRingClassName,
    active
      ? 'bg-selected text-selected-ink'
      : 'text-muted hover:bg-hover hover:text-ink',
    className,
  );

  const content = (
    <>
      {icon != null && <span className={cn('shrink-0', iconClassName)}>{icon}</span>}
      <Slot.Slottable>{children}</Slot.Slottable>
    </>
  );
  if (!asChild && props.href)
    return (
      <UiLink
        {...props}
        href={props.href}
        aria-current={active ? 'page' : props['aria-current']}
        className={classes}
      >
        {content}
      </UiLink>
    );

  return (
    <Component
      {...props}
      aria-current={active ? 'page' : props['aria-current']}
      className={classes}
    >
      {content}
    </Component>
  );
}
