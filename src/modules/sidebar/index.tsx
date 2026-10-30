'use client';
import {
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { useComposedRefs } from '../../components/common/refs';
import { cn, partTestId } from '../../components/common';
import { Drawer } from '../../components/drawer';
import { PanelLeftIcon } from '../../components/icon/outline/panel-left';
import { MenuIcon } from '../../components/icon/outline/menu';
import { KitIconButton } from '../../components/icon-button/kit-icon-button';
import { useUILocale } from '../../i18n/provider';
import { filterNavByAccess, resolveActiveNav } from '../navigation';
import { SidebarContext, SidebarAppearanceContext } from './context';
import { sidebarToneStyle } from './appearance';
import { SidebarEntries } from './entries';
import { SidebarSearchControl, isSidebarSearch } from './search';
import { useSidebarShortcut } from './use-sidebar-state';
import { SidebarHeader } from './header';
import { useSidebarState } from './use-sidebar-state';
import type { SidebarProps } from './types';
export type {
  SidebarEntry,
  SidebarProps,
  SidebarBrand,
  SidebarClassNames,
  SidebarSearch,
  SidebarWorkspaceSwitcher,
  SidebarItemAction,
} from './types';

const noop = () => {};

export function Sidebar<TAccess = unknown>({
  variant = 'sidebar',
  collapsible = 'icon',
  tone = 'default',
  itemVariant = 'raised',
  style,
  ref,
  header,
  footer,
  search,
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
  const searchConfig = isSidebarSearch(search) ? search : undefined;
  useSidebarShortcut(searchConfig?.shortcut, searchConfig?.onOpen ?? noop);
  const context = useContext(SidebarContext);
  const generatedId = useId();
  const sidebarId = props.id ?? context?.id ?? generatedId;
  const asideRef = useRef<HTMLElement>(null);
  const composedRef = useComposedRefs(asideRef, ref);
  const state = useSidebarState({
    ...(controlledCollapsed === undefined && !context
      ? {}
      : { collapsed: controlledCollapsed ?? context!.collapsed }),
    ...(defaultCollapsed === undefined ? {} : { defaultCollapsed }),
    ...(onCollapsedChange || context
      ? { onCollapsedChange: onCollapsedChange ?? (() => context?.toggle()) }
      : {}),
    ...(toggleShortcut && collapsible !== 'none' ? { toggleShortcut } : {}),
  });
  const collapsed = collapsible !== 'none' && state.collapsed;

  const toggle = state.toggle;
  const offcanvas = collapsible === 'offcanvas' && collapsed;

  useLayoutEffect(() => {
    if (!offcanvas || !asideRef.current?.contains(document.activeElement)) return;
    const trigger = Array.from(
      document.querySelectorAll<HTMLButtonElement>('button[aria-controls]'),
    ).find(
      (button) =>
        button.getAttribute('aria-controls') === sidebarId &&
        !asideRef.current?.contains(button),
    );
    trigger?.focus();
  }, [offcanvas, sidebarId]);

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
        className={cn(
          'flex min-w-0 shrink-0 items-center gap-1',
          rail && 'flex-col gap-2',
          classNames?.header,
        )}
      >
        {header != null && (
          <div className="min-w-0 flex-1">
            <SidebarHeader
              header={header}
              collapsed={rail}
              classNames={classNames}
              testId={id}
            />
          </div>
        )}
        {!mobile && collapsible !== 'none' && (
          <KitIconButton
            icon={PanelLeftIcon}
            label={
              rail
                ? (expandLabel ?? t('sidebar.expand'))
                : (collapseLabel ?? t('sidebar.collapse'))
            }
            aria-expanded={!collapsed}
            aria-controls={sidebarId}
            onClick={toggle}
            variant="ghost"
            data-testid={partTestId(id, 'toggle')}
            className={cn(
              'shrink-0 text-[var(--sidebar-muted,var(--color-muted))] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-fg)]',
              !header && !rail && 'ml-auto',
              classNames?.toggle,
            )}
          />
        )}
      </div>
      {search != null && (
        <SidebarSearchControl
          search={search}
          collapsed={rail}
          testId={id}
          classNames={classNames}
        />
      )}
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
            className={cn('gap-5', classNames?.nav)}
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
            'grid min-w-0 shrink-0 text-ui-sm text-[var(--sidebar-muted,var(--color-muted))] [&>*]:min-w-0',
            classNames?.footer,
          )}
        >
          {footer}
        </div>
      )}
    </>
  );

  return (
    <SidebarAppearanceContext.Provider value={itemVariant}>
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
          contentProps={{ style: sidebarToneStyle(tone) }}
          className={cn(
            'bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)]',
            classNames?.drawer,
          )}
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
        id={sidebarId}
        ref={composedRef}
        data-collapsed={collapsed}
        data-variant={variant}
        data-collapsible={collapsible}
        data-tone={tone}
        data-item-variant={itemVariant}
        inert={offcanvas}
        aria-hidden={offcanvas || undefined}
        style={{ ...sidebarToneStyle(tone), ...style }}
        className={cn(
          'group/sidebar sticky top-0 hidden h-dvh min-w-0 flex-col gap-4 overflow-hidden bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] p-3 lg:flex motion-safe:transition-[width] motion-safe:duration-[var(--motion-duration-normal)]',
          collapsed ? 'w-sidebar-collapsed px-2' : 'w-sidebar',
          variant === 'floating' &&
            'top-2 m-2 h-[calc(100dvh-1rem)] rounded-panel border border-[var(--sidebar-border)] shadow-panel',
          offcanvas && 'm-0 w-0 border-0 p-0',
          classNames?.root,
          className,
        )}
      >
        {body(collapsed && collapsible === 'icon', testId)}
      </aside>
    </SidebarAppearanceContext.Provider>
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
      className={cn('grid gap-1', className)}
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

export { SidebarItem } from './item';
export * from './submenu';

export { SidebarProvider, SidebarTrigger } from './context';
export type { SidebarProviderProps, SidebarTriggerProps } from './context';
