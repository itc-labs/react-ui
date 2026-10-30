'use client';
import { useContext, type ComponentProps, type ReactNode } from 'react';
import { UiLink } from '../../components/link-image-provider';
import { Slot } from 'radix-ui';
import { cn } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';

import { SidebarAppearanceContext } from './context';
import { sidebarItemClasses } from './appearance';

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
  const variant = useContext(SidebarAppearanceContext);
  const Component = asChild ? Slot.Root : 'span';
  const classes = cn(
    'flex min-h-9 min-w-0 items-center gap-2.5 rounded-control px-2.5 py-1.5 text-control [overflow-wrap:anywhere] motion-safe:transition-colors focus-visible:-outline-offset-2',
    focusRingClassName,
    sidebarItemClasses(variant, active),
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
      {icon != null && <span className={cn('shrink-0', iconClassName)}>{icon}</span>}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Component>
  );
}
