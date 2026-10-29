'use client';
import type { ComponentProps } from 'react';
import { Slot } from 'radix-ui';
import { UiLink } from '../link-image-provider';
import { cn } from '../common';
import { focusRingClassName } from '../common/focus-ring';

export const breadcrumbLinkClasses = cn(
  focusRingClassName,
  'rounded-sm motion-safe:transition-colors hover:text-ink focus-visible:outline-offset-2',
);

export function BreadcrumbLink({
  asChild = false,
  className,
  ...props
}: ComponentProps<'a'> & { asChild?: boolean }) {
  const classes = cn(breadcrumbLinkClasses, className);
  if (!asChild && props.href)
    return <UiLink {...props} href={props.href} className={classes} />;
  const Component = asChild ? Slot.Root : 'span';

  return <Component {...props} className={classes} />;
}
