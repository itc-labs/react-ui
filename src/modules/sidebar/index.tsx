'use client';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { cn, partTestId } from '../../components/common';
import { Drawer } from '../../components/drawer';
import { ChevronLeftIcon } from '../../components/icon/outline/chevron-left';
import { ChevronRightIcon } from '../../components/icon/outline/chevron-right';
import { MenuIcon } from '../../components/icon/outline/menu';
import { KitIconButton } from '../../components/icon-button/kit-icon-button';
import { useUILocale } from '../../i18n/provider';
import { filterNavByAccess, resolveActiveNav } from '../navigation';
import { SidebarEntries } from './entries';
import { SidebarHeader } from './header';
import { useSidebarState } from './use-sidebar-state';
import type { SidebarProps } from './types';
export type {
  SidebarEntry,
  SidebarProps,
  SidebarBrand,
  SidebarClassNames,
} from './types';

export function Sidebar<TAccess = unknown>({
  header,
  footer,
  items,
  navigationLabel,
  currentPath,
  isActive,
  canAccess,
  collapsed: controlledCollapsed,
  defaultCollapsed,
  onCollapsedChange,
  toggleShortcut,
  collapseLabel,
  expandLabel,
  mobileTrigger,
  mobileTriggerLabel,
  drawerTitle,
  'data-testid': testId,
  children,
  className,
  classNames,
  ...props
}: SidebarProps<TAccess>) {
  const { t } = useUILocale();
  const { collapsed, toggle } = useSidebarState({
    ...(controlledCollapsed === undefined ? {} : { collapsed: controlledCollapsed }),
    ...(defaultCollapsed === undefined ? {} : { defaultCollapsed }),
    ...(onCollapsedChange ? { onCollapsedChange } : {}),
    ...(toggleShortcut ? { toggleShortcut } : {}),
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [currentPath]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(min-width: 64rem)');

    const close = () => {
      if (media.matches) setMobileOpen(false);
    };

    media.addEventListener('change', close);

    return () => media.removeEventListener('change', close);
  }, []);

  const visibleItems =
    items &&
    filterNavByAccess(items, (access, item) => !canAccess || canAccess(access, item));
  const activePath = visibleItems
    ? resolveActiveNav(visibleItems, currentPath ?? '', isActive)
    : [];

  const body = (rail: boolean, id: string | undefined, mobile = false) => (
    <>
      <div
        data-testid={partTestId(id, mobile ? 'sidebarHeader' : 'header')}
        className={cn('min-w-0 shrink-0', classNames?.header)}
      >
        {header != null && (
          <SidebarHeader
            header={header}
            collapsed={rail}
            classNames={classNames}
            testId={id}
          />
        )}
        {!mobile && (
          <KitIconButton
            icon={rail ? ChevronRightIcon : ChevronLeftIcon}
            label={
              rail
                ? (expandLabel ?? t('sidebar.expand'))
                : (collapseLabel ?? t('sidebar.collapse'))
            }
            aria-expanded={!rail}
            onClick={toggle}
            variant="ghost"
            data-testid={partTestId(id, 'toggle')}
            className={cn('mt-2', classNames?.toggle)}
          />
        )}
      </div>
      <div
        data-testid={partTestId(id, 'content')}
        className={cn(
          'min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden',
          classNames?.content,
        )}
      >
        {items ? (
          <SidebarNav
            aria-label={navigationLabel}
            data-testid={partTestId(id, 'nav')}
            className={cn('gap-4', classNames?.nav)}
          >
            <SidebarEntries
              items={visibleItems ?? []}
              activePath={activePath}
              testId={id}
              classNames={classNames}
              collapsed={rail}
              {...(mobile ? { onNavigate: () => setMobileOpen(false) } : {})}
            />
          </SidebarNav>
        ) : (
          children
        )}
      </div>
      {footer != null && (
        <div
          data-testid={partTestId(id, 'footer')}
          className={cn(
            'min-w-0 shrink-0 border-t border-line pt-3 text-ui-sm text-muted',
            classNames?.footer,
          )}
        >
          {footer}
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="p-3 lg:hidden">
        <Drawer
          title={drawerTitle ?? navigationLabel ?? t('sidebar.label')}
          side="left"
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          trigger={
            mobileTrigger ?? (
              <KitIconButton
                label={mobileTriggerLabel ?? t('sidebar.open')}
                icon={MenuIcon}
                variant="ghost"
              />
            )
          }
          triggerAsChild
          {...(testId ? { 'data-testid': partTestId(testId, 'drawer')! } : {})}
          className={cn('bg-sidebar', classNames?.drawer)}
          classNames={{
            trigger: classNames?.mobileTrigger ?? '',
            body: 'flex min-h-0 flex-1 flex-col overflow-hidden',
            header: 'shrink-0',
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {body(false, partTestId(testId, 'drawer'), true)}
          </div>
        </Drawer>
      </div>
      <aside
        {...props}
        data-testid={testId}
        data-collapsed={collapsed}
        className={cn(
          'group/sidebar sticky top-0 hidden h-dvh min-w-0 flex-col gap-4 overflow-hidden border-r border-line bg-sidebar p-3 lg:flex motion-safe:transition-[width] motion-safe:duration-[var(--motion-duration-normal)]',
          collapsed ? 'w-sidebar-collapsed px-2' : 'w-sidebar',
          classNames?.root,
          className,
        )}
      >
        {body(collapsed, testId)}
      </aside>
    </>
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
      className={cn('grid gap-2', className)}
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
            'mb-3 px-1 text-eyebrow font-medium uppercase tracking-widest text-muted break-words',
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
