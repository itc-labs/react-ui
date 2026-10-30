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
import { SidebarSections } from './sections';
import { useHoverExpansion } from './use-hover-expansion';
import { SidebarHeader } from './header';
import { useSidebarState } from './use-sidebar-state';
import type { SidebarProps } from './types';
export type {
  SidebarEntry,
  SidebarSection,
  SidebarProps,
  SidebarBrand,
  SidebarClassNames,
  SidebarSearch,
  SidebarWorkspaceSwitcher,
  SidebarItemAction,
} from './types';

const noop = () => {};

export function Sidebar<TAccess = unknown>({
  expandOnHover = false,
  sections,
  section: controlledSection,
  defaultSection,
  onSectionChange,
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

  const hover = useHoverExpansion(
    expandOnHover && collapsed && collapsible === 'icon',
    asideRef,
  );
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

  const visibleSections = sections?.map((section) => ({
    ...section,
    items: filterNavByAccess(
      section.items,
      (access, item) => !canAccess || canAccess(access, item),
    ),
  }));
  const routeSection =
    visibleSections &&
    resolveActiveNav(
      visibleSections.map((section) => ({
        ...section,
        type: 'group' as const,
        active: false,
      })),
      currentPath ?? '',
      isActive,
    )[0];
  const [selection, setSelection] = useState<{
    path: string | undefined;
    id: string | undefined;
  }>({ path: currentPath, id: undefined });

  useEffect(() => {
    setSelection({ path: currentPath, id: undefined });
  }, [currentPath]);

  const sectionId =
    controlledSection ??
    (selection.path === currentPath ? selection.id : undefined) ??
    routeSection ??
    defaultSection ??
    visibleSections?.[0]?.id;
  const activeSection = visibleSections?.find((section) => section.id === sectionId);

  const selectSection = (id: string) => {
    if (controlledSection === undefined) setSelection({ path: currentPath, id });
    onSectionChange?.(id);
  };

  const visibleItems = sections
    ? (activeSection?.items ?? [])
    : items &&
      filterNavByAccess(items, (access, item) => !canAccess || canAccess(access, item));
  const activePath = visibleItems
    ? resolveActiveNav(visibleItems, currentPath ?? '', isActive)
    : [];

  useLayoutEffect(() => {
    if (!sections || !collapsed || hover.expanded) return;
    const panel = document.getElementById(`${sidebarId}-panel`);
    if (panel?.contains(document.activeElement))
      asideRef.current?.querySelector<HTMLElement>('[data-sidebar-toggle]')?.focus();
  }, [sections, collapsed, hover.expanded, sidebarId]);

  const renderHeader = (rail: boolean, id: string | undefined, mobile = false) => (
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
          data-sidebar-toggle=""
          icon={PanelLeftIcon}
          label={
            collapsed
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
  );

  const renderFooter = (id: string | undefined) =>
    footer != null && (
      <div
        data-testid={partTestId(id, 'footer')}
        className={cn(
          'grid min-w-0 shrink-0 text-ui-sm text-[var(--sidebar-muted,var(--color-muted))] [&>*]:min-w-0',
          classNames?.footer,
        )}
      >
        {footer}
      </div>
    );

  const body = (rail: boolean, id: string | undefined, mobile = false) => (
    <>
      {(!sections || mobile) && renderHeader(rail, id, mobile)}
      {sections && (
        <h2
          id={`${sidebarId}-${mobile ? 'mobile-' : ''}section-title`}
          data-testid={partTestId(id, 'sectionTitle')}
          className={cn('px-2.5 text-control font-semibold', classNames?.sectionTitle)}
        >
          {activeSection?.label}
        </h2>
      )}
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
        {items || sections ? (
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
      {(!sections || mobile) && renderFooter(id)}
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
            {visibleSections && (
              <SidebarSections
                sections={visibleSections}
                value={sectionId}
                onChange={selectSection}
                panelId={`${sidebarId}-mobile-panel`}
                testId={partTestId(testId, 'drawer')}
                classNames={classNames}
                mobile
              />
            )}
            <div
              role={sections ? 'region' : undefined}
              aria-labelledby={
                sections ? `${sidebarId}-mobile-section-title` : undefined
              }
              id={`${sidebarId}-mobile-panel`}
              className="flex min-h-0 flex-1 flex-col gap-4"
            >
              {body(false, partTestId(testId, 'drawer'), true)}
            </div>
          </div>
        </Drawer>
      </div>
      <aside
        {...props}
        data-testid={testId}
        id={sidebarId}
        ref={composedRef}
        data-collapsed={collapsed}
        data-hover-expanded={hover.expanded}
        onPointerEnter={(event) => {
          props.onPointerEnter?.(event);
          if (!event.defaultPrevented) hover.events.onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          props.onPointerLeave?.(event);
          if (!event.defaultPrevented) hover.events.onPointerLeave?.(event);
        }}
        onFocusCapture={(event) => {
          props.onFocusCapture?.(event);
          if (!event.defaultPrevented) hover.events.onFocusCapture?.(event);
        }}
        onBlurCapture={(event) => {
          props.onBlurCapture?.(event);
          if (!event.defaultPrevented) hover.events.onBlurCapture?.(event);
        }}
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
          hover.expanded && 'z-[var(--z-index-popover)] overflow-visible',
          offcanvas && 'm-0 w-0 border-0 p-0',
          classNames?.root,
          className,
        )}
      >
        <div
          data-testid={partTestId(testId, 'overlay')}
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col gap-4',
            hover.expanded &&
              'absolute inset-y-0 left-0 w-sidebar bg-[var(--sidebar-bg)] p-3 shadow-overlay',
            hover.expanded &&
              variant === 'floating' &&
              'rounded-panel border border-[var(--sidebar-border)]',
            sections && 'flex-row gap-0',
            classNames?.overlay,
          )}
        >
          {visibleSections ? (
            <>
              <div
                data-testid={partTestId(testId, 'sectionRail')}
                className={cn(
                  'flex w-[calc(var(--container-sidebar-collapsed)-1rem)] shrink-0 flex-col gap-4',
                  classNames?.sectionRail,
                )}
              >
                {renderHeader(true, testId)}
                <SidebarSections
                  sections={visibleSections}
                  value={sectionId}
                  onChange={selectSection}
                  panelId={`${sidebarId}-panel`}
                  testId={testId}
                  classNames={classNames}
                />
                <div className="mt-auto">{renderFooter(testId)}</div>
              </div>
              <div
                role="region"
                id={`${sidebarId}-panel`}
                hidden={collapsed && !hover.expanded}
                inert={collapsed && !hover.expanded}
                aria-labelledby={`${sidebarId}-section-title`}
                data-testid={partTestId(testId, 'sectionPanel')}
                className={cn(
                  'flex min-h-0 min-w-0 flex-1 flex-col gap-4 border-l border-[var(--sidebar-border)] pl-3',
                  collapsed && !hover.expanded && 'hidden',
                  classNames?.sectionPanel,
                )}
              >
                {body(false, testId)}
              </div>
            </>
          ) : (
            body(collapsed && collapsible === 'icon' && !hover.expanded, testId)
          )}
        </div>
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
