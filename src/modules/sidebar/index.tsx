'use client';
import {
  useCallback,
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
import { UserMenu } from '../user-menu';
import { filterNavByAccess, resolveActiveNav } from '../navigation';
import {
  SidebarContext,
  SidebarAppearanceContext,
  WorkspaceLayoutContext,
} from './context';
import { resolveSidebarAppearance } from './appearance';
import { SidebarEntries } from './entries';
import { SIDEBAR_DESKTOP_QUERY, SidebarNav } from './nav';
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
  SidebarAppearance,
} from './types';

const noop = () => {};

/** A SidebarTrigger outside the aside, e.g. in WorkspaceHeader, that controls it. */
function findExternalTrigger(aside: HTMLElement | null, sidebarId: string) {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement>('button[aria-controls]'),
  ).find(
    (button) =>
      button.getAttribute('aria-controls') === sidebarId && !aside?.contains(button),
  );
}

export function Sidebar<TAccess = unknown>({
  expandOnHover = false,
  sections,
  section: controlledSection,
  defaultSection,
  onSectionChange,
  variant: variantProp,
  collapsible = 'icon',
  appearance: appearanceProp,
  tone: toneProp,
  itemVariant: itemVariantProp,
  density: densityProp,
  groupLabel = 'default',
  groupDividers = false,
  style,
  ref,
  header,
  footer,
  footerItems,
  account,
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
  collapseToggle = 'sidebar',
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
  const shellVariant = useContext(WorkspaceLayoutContext);
  // Inside WorkspaceShell the sidebar follows the shell unless its own props say otherwise.
  const variant = variantProp ?? (shellVariant === 'floating' ? 'floating' : 'sidebar');
  const appearance = appearanceProp ?? (shellVariant === 'soft' ? 'soft' : undefined);
  const { tone, itemVariant, density } = resolveSidebarAppearance({
    appearance,
    tone: toneProp,
    itemVariant: itemVariantProp,
    density: densityProp,
  });
  const searchConfig = isSidebarSearch(search) ? search : undefined;
  useSidebarShortcut(searchConfig?.shortcut, searchConfig?.onOpen ?? noop);
  const context = useContext(SidebarContext);
  const generatedId = useId();
  const sidebarId = props.id ?? context?.id ?? generatedId;
  const asideRef = useRef<HTMLElement>(null);
  const composedRef = useComposedRefs(asideRef, ref);
  // Precedence: the `collapsed` prop, then a SidebarProvider, then local state.
  // onCollapsedChange always reports; an uncontrolled sidebar also updates its provider.
  const sharedCollapsed = controlledCollapsed ?? context?.collapsed;
  const contextToggle = context?.toggle;
  const reportCollapsed = useCallback(
    (next: boolean) => {
      onCollapsedChange?.(next);
      if (controlledCollapsed === undefined) contextToggle?.();
    },
    [onCollapsedChange, controlledCollapsed, contextToggle],
  );
  const state = useSidebarState({
    ...(sharedCollapsed === undefined ? {} : { collapsed: sharedCollapsed }),
    ...(defaultCollapsed === undefined ? {} : { defaultCollapsed }),
    onCollapsedChange: reportCollapsed,
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
    findExternalTrigger(asideRef.current, sidebarId)?.focus();
  }, [offcanvas, sidebarId]);

  const [localMobileOpen, setLocalMobileOpen] = useState(false);
  // A SidebarProvider shares the drawer state with SidebarMobileTrigger in the page header.
  const mobileOpen = context?.mobileOpen ?? localMobileOpen;
  const setMobileOpen = context?.setMobileOpen ?? setLocalMobileOpen;

  useEffect(() => setMobileOpen(false), [currentPath, setMobileOpen]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(SIDEBAR_DESKTOP_QUERY);

    const close = () => {
      if (media.matches) setMobileOpen(false);
    };

    media.addEventListener('change', close);

    return () => media.removeEventListener('change', close);
  }, [setMobileOpen]);

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
  const visibleFooterItems =
    footerItems &&
    filterNavByAccess(
      footerItems,
      (access, item) => !canAccess || canAccess(access, item),
    );
  // Resolve once across both lists so only one row is current.
  const activePath =
    visibleItems || visibleFooterItems
      ? resolveActiveNav(
          [...(visibleItems ?? []), ...(visibleFooterItems ?? [])],
          currentPath ?? '',
          isActive,
        )
      : [];

  useLayoutEffect(() => {
    if (!sections || !collapsed || hover.expanded) return;
    const panel = document.getElementById(`${sidebarId}-panel`);
    if (panel?.contains(document.activeElement))
      (
        asideRef.current?.querySelector<HTMLElement>('[data-sidebar-toggle]') ??
        findExternalTrigger(asideRef.current, sidebarId)
      )?.focus();
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
      {!mobile && collapsible !== 'none' && collapseToggle !== 'none' && (
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

  const renderFooter = (
    id: string | undefined,
    rail = false,
    onNavigate?: () => void,
  ) =>
    (footer != null || visibleFooterItems?.length || account) && (
      <div
        data-testid={partTestId(id, 'footer')}
        className={cn(
          'grid min-w-0 shrink-0 gap-2 text-ui-sm text-[var(--sidebar-muted,var(--color-muted))] [&>*]:min-w-0',
          classNames?.footer,
        )}
      >
        {!!visibleFooterItems?.length && (
          <SidebarNav
            aria-label={t('sidebar.secondary')}
            data-testid={partTestId(id, 'footerNav')}
            className={cn('gap-0.5', classNames?.footerNav)}
          >
            <SidebarEntries
              items={visibleFooterItems}
              activePath={activePath}
              testId={id}
              classNames={classNames}
              collapsed={rail}
              {...(onNavigate ? { onNavigate } : {})}
            />
          </SidebarNav>
        )}
        {footer}
        {account && (
          <UserMenu
            collapseOnMobile={false}
            {...account}
            data-testid={account['data-testid'] ?? partTestId(id, 'account')}
            className={cn(
              'w-full border-transparent bg-transparent text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-hover)]',
              rail && 'justify-center px-0',
              account.className,
            )}
            classNames={{
              ...account.classNames,
              details: cn(rail && 'sr-only', account.classNames?.details),
              chevron: cn(rail && 'hidden', account.classNames?.chevron),
            }}
          />
        )}
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
          // Extend the navigation to the panel edges while keeping header and footer padding.
          itemVariant === 'indicator' && !mobile && (rail ? '-mx-2' : '-mx-3'),
          // Let the pill's edge bar reach the sidebar edge in both the expanded panel and the rail.
          itemVariant === 'pill' && !mobile && (rail ? '-me-2 pe-2' : '-me-3 pe-3'),
          classNames?.content,
        )}
      >
        {items || sections ? (
          <SidebarNav
            aria-label={navigationLabel}
            data-testid={partTestId(id, 'nav')}
            // Items stay as tight as inside a group; only group boundaries get the 20px gap
            // (2px gap + 18px margin), so a flat item list is not spread out.
            className={cn(
              'gap-0.5 [&>[data-sidebar-group]+*]:mt-4.5 [&>[data-sidebar-group]:not(:first-child)]:mt-4.5',
              groupDividers &&
                '[&>[data-sidebar-group]:not(:first-child)]:mt-3 [&>[data-sidebar-group]:not(:first-child)]:border-t [&>[data-sidebar-group]:not(:first-child)]:border-[var(--sidebar-border,var(--color-line))] [&>[data-sidebar-group]:not(:first-child)]:pt-3',
              groupLabel === 'caps' &&
                '[&_[data-sidebar-group-label]]:text-[0.6875rem] [&_[data-sidebar-group-label]]:font-semibold [&_[data-sidebar-group-label]]:uppercase [&_[data-sidebar-group-label]]:tracking-wider',
              classNames?.nav,
            )}
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
      {(!sections || mobile) &&
        renderFooter(id, rail, mobile ? () => setMobileOpen(false) : undefined)}
    </>
  );

  const mobileDrawer = (
    <Drawer
      title={drawerTitle ?? navigationLabel ?? t('sidebar.label')}
      side="left"
      open={mobileOpen}
      onOpenChange={setMobileOpen}
      {...(mobileTrigger === false
        ? {}
        : {
            trigger: mobileTrigger ?? (
              <KitIconButton
                label={mobileTriggerLabel ?? t('sidebar.open')}
                icon={MenuIcon}
                variant="ghost"
              />
            ),
            triggerAsChild: true,
          })}
      {...(testId ? { 'data-testid': partTestId(testId, 'drawer')! } : {})}
      // Data attributes are valid on the content element; the props type omits them.
      contentProps={
        {
          'data-sidebar-tone': tone,
          'data-sidebar-density': density,
        } as Record<string, string>
      }
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
          aria-labelledby={sections ? `${sidebarId}-mobile-section-title` : undefined}
          id={`${sidebarId}-mobile-panel`}
          className="flex min-h-0 flex-1 flex-col gap-4"
        >
          {body(false, partTestId(testId, 'drawer'), true)}
        </div>
      </div>
    </Drawer>
  );

  return (
    <SidebarAppearanceContext.Provider value={itemVariant}>
      {mobileTrigger === false ? (
        mobileDrawer
      ) : (
        <div className="p-3 lg:hidden">{mobileDrawer}</div>
      )}
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
        data-sidebar-tone={tone}
        data-sidebar-density={density}
        data-appearance={appearance ?? 'default'}
        data-item-variant={itemVariant}
        inert={offcanvas}
        aria-hidden={offcanvas || undefined}
        style={style}
        className={cn(
          'group/sidebar sticky top-[var(--workspace-topbar-height,0px)] hidden h-[calc(100dvh-var(--workspace-topbar-height,0px))] min-w-0 flex-col gap-4 overflow-hidden bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] p-3 lg:flex motion-safe:transition-[width] motion-safe:duration-[var(--motion-duration-normal)]',
          collapsed ? 'w-sidebar-collapsed px-2' : 'w-sidebar',
          variant === 'floating' &&
            'top-[calc(var(--workspace-topbar-height,0px)+0.5rem)] m-2 h-[calc(100dvh-1rem-var(--workspace-topbar-height,0px))] rounded-panel border border-[var(--sidebar-border)] shadow-panel',
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
                <div className="mt-auto">{renderFooter(testId, true)}</div>
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

export { SidebarNav, SidebarGroup } from './nav';
export { SidebarItem } from './item';
export * from './submenu';

export { SidebarProvider, SidebarTrigger, SidebarMobileTrigger } from './context';
export type {
  SidebarProviderProps,
  SidebarTriggerProps,
  SidebarMobileTriggerProps,
} from './context';
