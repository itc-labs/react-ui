'use client';
import type { TestIdProps } from '../../components/common/testing';

import { filterNavByAccess, resolveActiveNav } from '../navigation';
import { SidebarEntries } from './entries';
import type { SidebarEntry } from './types';
export type { SidebarEntry } from './types';
import { partTestId } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../../components/common';

export type SidebarProps<TAccess = unknown> = (ComponentProps<'aside'> & {
  header?: ReactNode;
  footer?: ReactNode;
  items?: readonly SidebarEntry<TAccess>[];
  /** Absolute host pathname; no router is imported. */
  currentPath?: string;
  isActive?: (item: SidebarEntry<TAccess>, currentPath: string) => boolean;
  canAccess?: (access: TAccess, item: SidebarEntry<TAccess>) => boolean;
  navigationLabel?: string;
  classNames?: SlotClasses<
    | 'root'
    | 'header'
    | 'content'
    | 'footer'
    | 'nav'
    | 'group'
    | 'groupLabel'
    | 'item'
    | 'icon'
    | 'submenu'
    | 'submenuTrigger'
    | 'submenuContent'
    | 'submenuIcon'
    | 'submenuLabel'
    | 'submenuChevron'
    | 'submenuBody'
  >;
}) &
  TestIdProps;

export function Sidebar<TAccess = unknown>({
  header,
  footer,
  items,
  navigationLabel,
  currentPath,
  isActive,
  canAccess,
  'data-testid': testId,
  children,
  className,
  classNames,
  ...props
}: SidebarProps<TAccess>) {
  const visibleItems =
    items && (canAccess ? filterNavByAccess(items, canAccess) : items);
  const activePath = visibleItems
    ? resolveActiveNav(visibleItems, currentPath ?? '', isActive)
    : [];

  return (
    <aside
      {...props}
      data-testid={testId}
      className={cn(
        'flex min-w-0 items-center justify-between gap-4 border-b border-line bg-sidebar px-5 py-5 sm:px-8 lg:flex-col lg:items-stretch lg:justify-start lg:border-b-0 lg:border-r lg:px-5 lg:py-8',
        classNames?.root,
        className,
      )}
    >
      {header != null && (
        <div className={cn('min-w-0', classNames?.header)}>{header}</div>
      )}
      <div className={cn('min-w-0 lg:mt-12', classNames?.content)}>
        {items ? (
          <SidebarNav
            aria-label={navigationLabel}
            data-testid={partTestId(testId, 'nav')}
            className={cn('gap-4', classNames?.nav)}
          >
            <SidebarEntries
              items={visibleItems ?? []}
              activePath={activePath}
              testId={testId}
              classNames={classNames}
            />
          </SidebarNav>
        ) : (
          children
        )}
      </div>
      {footer != null && (
        <div
          className={cn(
            'mt-auto hidden border-t border-line pt-5 text-ui-sm leading-relaxed text-muted lg:block',
            classNames?.footer,
          )}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}

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
      className={cn('flex flex-wrap gap-2 lg:grid', className)}
    />
  );
}

export function SidebarGroup({
  label,
  children,
  className,
  labelClassName,
  ...props
}: ComponentProps<'div'> & { label?: ReactNode; labelClassName?: string }) {
  return (
    <div {...props} className={cn('min-w-0', className)}>
      {label != null && (
        <p
          className={cn(
            'mb-3 hidden px-3 text-eyebrow font-medium uppercase tracking-widest text-muted lg:block',
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

export { SidebarItem } from './item';
export * from './submenu';
