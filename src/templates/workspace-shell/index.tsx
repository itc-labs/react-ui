'use client';
import { useLayoutEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { type SlotClasses, cn } from '../../components/common';
import { useComposedRefs } from '../../components/common/refs';
import { SidebarTrigger, WorkspaceLayoutContext } from '../../modules/sidebar/context';

/**
 * `true` renders the desktop SidebarTrigger (with a tooltip) before the breadcrumb;
 * pass a node to supply your own trigger. Below lg the Sidebar keeps its drawer
 * trigger, so the default trigger is hidden there.
 */
export type WorkspaceSidebarToggle = boolean | ReactNode;

export type WorkspaceShellVariant = 'inset' | 'classic' | 'floating' | 'soft';

export type WorkspaceShellProps = Omit<ComponentProps<'div'>, 'content'> & {
  sidebar?: ReactNode;
  /**
   * Full-width bar above the sidebar and page (search, global actions, account). The sidebar
   * then starts below it; set `--workspace-topbar-height` (default 4rem) for a taller bar.
   */
  topbar?: ReactNode;
  header?: ReactNode;
  /** Render the sidebar collapse toggle at the start of the header; see WorkspaceHeader. */
  sidebarToggle?: WorkspaceSidebarToggle;
  content?: ReactNode;
  /** Secondary column beside the page (details, activity, inspector); shown from xl. */
  aside?: ReactNode;
  /** Keep the header pinned below the topbar (or the viewport top) while the page scrolls. */
  stickyHeader?: boolean;
  classNames?: SlotClasses<
    'root' | 'topbar' | 'frame' | 'body' | 'header' | 'main' | 'aside'
  >;
  /**
   * `inset` raises the page into a rounded card beside the sidebar; `classic` divides them with a rule;
   * `floating` leaves the page flat beside a floating sidebar; `soft` keeps a full-height sidebar with a
   * rounded trailing edge and a borderless header over a flat page. A direct Sidebar child follows the
   * variant (floating panel, soft appearance) unless its own props say otherwise.
   */
  variant?: WorkspaceShellVariant;
};

export function WorkspaceShell({
  sidebar,
  topbar,
  header,
  content,
  aside,
  classNames,
  children,
  className,
  variant = 'inset',
  sidebarToggle,
  stickyHeader = false,
  ref,
  ...props
}: WorkspaceShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const topbarRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(rootRef, ref);
  const hasTopbar = topbar != null;

  // The sticky sidebar and header sit below the topbar; track its real height (wrapping actions,
  // padding, borders) instead of assuming the 4rem default.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const bar = topbarRef.current;
    if (!hasTopbar || !root || !bar) return;

    const sync = () =>
      root.style.setProperty(
        '--workspace-topbar-height',
        `${bar.getBoundingClientRect().height}px`,
      );

    sync();
    if (typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(sync);
    observer.observe(bar);

    return () => {
      observer.disconnect();
      root.style.removeProperty('--workspace-topbar-height');
    };
  }, [hasTopbar]);

  const hasSidebar = sidebar != null;
  const inset = hasSidebar && variant === 'inset';
  // Grid that places the sidebar beside the body; on the root, or on the frame below a topbar.
  const frame = cn(
    hasSidebar && variant === 'classic' && '[&>aside]:border-r [&>aside]:border-line',
    hasSidebar &&
      variant === 'soft' &&
      '[&>aside]:border-e [&>aside]:border-[var(--sidebar-border,var(--color-line))] lg:[&>aside]:rounded-e-2xl',
    hasSidebar &&
      'lg:grid lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)] lg:has-[>aside[data-collapsed=true]]:grid-cols-[var(--container-sidebar-collapsed)_minmax(0,1fr)] lg:has-[>aside[data-collapsed=true][data-collapsible=offcanvas]]:grid-cols-[0_minmax(0,1fr)] motion-safe:transition-[grid-template-columns] motion-safe:duration-[var(--motion-duration-normal)]',
    hasSidebar &&
      variant === 'floating' &&
      'lg:grid-cols-[calc(var(--container-sidebar)+1rem)_minmax(0,1fr)] lg:has-[>aside[data-collapsed=true]]:grid-cols-[calc(var(--container-sidebar-collapsed)+1rem)_minmax(0,1fr)] lg:has-[>aside[data-collapsed=true][data-collapsible=offcanvas]]:grid-cols-[0_minmax(0,1fr)]',
  );
  const body =
    content !== undefined || header !== undefined || sidebarToggle || aside != null ? (
      <WorkspaceBody
        className={cn(
          // overflow-hidden on the inset card would stop the header from sticking; clip instead.
          stickyHeader && 'lg:group-data-[variant=inset]/shell:overflow-clip',
          classNames?.body,
        )}
      >
        {(header != null || sidebarToggle) && (
          <WorkspaceHeader
            className={cn(
              stickyHeader &&
                'sticky top-[var(--workspace-topbar-height,0px)] z-10 bg-canvas lg:group-data-[variant=floating]/shell:top-[calc(var(--workspace-topbar-height,0px)+0.5rem)] lg:group-data-[variant=inset]/shell:top-[calc(var(--workspace-topbar-height,0px)+0.5rem)]',
              classNames?.header,
            )}
            sidebarToggle={sidebarToggle}
          >
            {header}
          </WorkspaceHeader>
        )}
        {aside != null ? (
          <div className="min-w-0 xl:flex">
            <WorkspaceMain className={cn('xl:flex-1', classNames?.main)}>
              {content ?? children}
            </WorkspaceMain>
            <WorkspaceAside className={classNames?.aside}>{aside}</WorkspaceAside>
          </div>
        ) : (
          <WorkspaceMain className={classNames?.main}>
            {content ?? children}
          </WorkspaceMain>
        )}
      </WorkspaceBody>
    ) : (
      children
    );

  return (
    <WorkspaceLayoutContext.Provider value={hasSidebar ? variant : undefined}>
      <div
        {...props}
        ref={composedRef}
        data-variant={hasSidebar ? variant : undefined}
        data-topbar={topbar != null || undefined}
        className={cn(
          'group/shell',
          'min-h-screen bg-canvas text-ink',
          inset && 'lg:bg-sidebar',
          hasSidebar && variant === 'soft' && 'bg-surface',
          topbar != null ? 'flex flex-col [--workspace-topbar-height:4rem]' : frame,
          classNames?.root,
          className,
        )}
      >
        {topbar != null ? (
          <>
            <div
              ref={topbarRef}
              data-workspace-topbar=""
              className={cn(
                'sticky top-0 z-20 flex min-h-[var(--workspace-topbar-height)] shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6',
                'group-data-[variant=inset]/shell:border-b-0 lg:group-data-[variant=inset]/shell:bg-sidebar',
                // A Navbar draws its own surface, border and padding.
                'has-[>.navbar-root]:border-b-0 has-[>.navbar-root]:bg-transparent has-[>.navbar-root]:p-0 sm:has-[>.navbar-root]:p-0',
                classNames?.topbar,
              )}
            >
              {topbar}
            </div>
            <div className={cn('min-w-0 flex-1', frame, classNames?.frame)}>
              {sidebar}
              {body}
            </div>
          </>
        ) : (
          <>
            {sidebar}
            {body}
          </>
        )}
      </div>
    </WorkspaceLayoutContext.Provider>
  );
}

/** Secondary column beside WorkspaceMain; hidden below xl, where hosts can offer it in a Drawer. */
export function WorkspaceAside({ className, ...props }: ComponentProps<'aside'>) {
  return (
    <aside
      {...props}
      data-workspace-aside=""
      className={cn(
        'hidden w-[var(--container-aside)] shrink-0 border-s border-line px-5 py-8 xl:block',
        className,
      )}
    />
  );
}

export function WorkspaceBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'min-w-0',
        // Inset shells raise the body into a card, whether it comes from slots or children.
        'lg:group-data-[variant=inset]/shell:my-2 lg:group-data-[variant=inset]/shell:mr-2 lg:group-data-[variant=inset]/shell:min-h-[calc(100dvh-1rem-var(--workspace-topbar-height,0px))] lg:group-data-[variant=inset]/shell:overflow-hidden lg:group-data-[variant=inset]/shell:rounded-panel lg:group-data-[variant=inset]/shell:border lg:group-data-[variant=inset]/shell:border-line lg:group-data-[variant=inset]/shell:bg-canvas lg:group-data-[variant=inset]/shell:shadow-panel',
        className,
      )}
    />
  );
}

export function WorkspaceHeader({
  breadcrumb,
  actions,
  children,
  className,
  actionsClassName,
  sidebarToggle,
  ...props
}: ComponentProps<'header'> & {
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  actionsClassName?: string;
  /**
   * Place the desktop sidebar collapse toggle before the breadcrumb. Use inside a
   * SidebarProvider and set `collapseToggle="none"` on the Sidebar.
   */
  sidebarToggle?: WorkspaceSidebarToggle;
}) {
  const toggle =
    sidebarToggle === true ? (
      <SidebarTrigger tooltip className="hidden shrink-0 lg:inline-flex" />
    ) : sidebarToggle === false ? null : (
      sidebarToggle
    );

  return (
    <header
      {...props}
      className={cn(
        'flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 text-ui-sm sm:px-8 lg:px-8',
        // Floating and soft shells keep the header on the page surface instead of a ruled strip.
        'lg:group-data-[variant=floating]/shell:mt-2 lg:group-data-[variant=floating]/shell:border-b-0 group-data-[variant=soft]/shell:border-b-0 lg:group-data-[variant=soft]/shell:pt-4',
        className,
      )}
    >
      {toggle != null ? (
        <>
          {toggle}
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
            {breadcrumb}
            {children}
          </div>
        </>
      ) : (
        <>
          {breadcrumb}
          {children}
        </>
      )}
      {actions != null && (
        <div
          className={cn('flex shrink-0 flex-wrap items-center gap-2', actionsClassName)}
        >
          {actions}
        </div>
      )}
    </header>
  );
}

export function WorkspaceMain({ className, ...props }: ComponentProps<'main'>) {
  return (
    <main
      {...props}
      // Fills the workspace column; constrain readable pages (forms, articles) at the page level.
      className={cn('w-full min-w-0 px-5 py-8 sm:px-8 sm:py-10 lg:px-10', className)}
    />
  );
}
