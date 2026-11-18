'use client';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../components/common';
import { useUILocale } from '../../i18n/provider';

/** Desktop layout starts at Tailwind's lg breakpoint; below it the sidebar becomes a drawer. */
export const SIDEBAR_DESKTOP_QUERY = '(min-width: 64rem)';

export function SidebarNav({
  className,
  'aria-label': label,
  ...props
}: ComponentProps<'nav'>) {
  const { t } = useUILocale();

  return (
    <nav
      {...props}
      aria-label={label ?? t('sidebar.label')}
      className={cn('grid gap-1', className)}
    />
  );
}

/** A labelled group of entries; the label names the group for assistive technology. */
export function SidebarGroup({
  label,
  children,
  className,
  labelClassName,
  ...props
}: ComponentProps<'div'> & { label?: ReactNode; labelClassName?: string }) {
  const labelId = useId();

  return (
    <div
      data-sidebar-group=""
      role={label != null ? 'group' : undefined}
      aria-labelledby={label != null ? labelId : undefined}
      {...props}
      className={cn('min-w-0', className)}
    >
      {label != null && (
        <p
          id={labelId}
          data-sidebar-group-label=""
          className={cn(
            'mb-1 px-2.5 text-ui-sm font-medium text-[var(--sidebar-muted,var(--color-muted))] break-words',
            labelClassName,
          )}
        >
          {label}
        </p>
      )}
      {children}
    </div>
  );
}
