import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../../components/common';
import { SidebarTrigger } from '../../modules/sidebar/context';

/**
 * `true` renders the desktop SidebarTrigger (with a tooltip) before the breadcrumb;
 * pass a node to supply your own trigger. Below lg the Sidebar keeps its drawer
 * trigger, so the default trigger is hidden there.
 */
export type WorkspaceSidebarToggle = boolean | ReactNode;

export function WorkspaceShell({
  sidebar,
  header,
  content,
  classNames,
  children,
  className,
  variant = 'inset',
  sidebarToggle,
  ...props
}: Omit<ComponentProps<'div'>, 'content'> & {
  sidebar?: ReactNode;
  header?: ReactNode;
  /** Render the sidebar collapse toggle at the start of the header; see WorkspaceHeader. */
  sidebarToggle?: WorkspaceSidebarToggle;
  content?: ReactNode;
  classNames?: SlotClasses<'root' | 'body' | 'header' | 'main'>;
  /** `inset` raises the page into a rounded card beside the sidebar; `classic` divides them with a rule; `floating` leaves the page flat beside a floating sidebar. */
  variant?: 'inset' | 'classic' | 'floating';
}) {
  const inset = sidebar != null && variant === 'inset';

  return (
    <div
      {...props}
      data-variant={sidebar != null ? variant : undefined}
      className={cn(
        'group/shell',
        'mx-auto min-h-screen max-w-workspace bg-canvas text-ink',
        inset && 'lg:bg-sidebar',
        sidebar != null &&
          variant === 'classic' &&
          '[&>aside]:border-r [&>aside]:border-line',
        sidebar != null &&
          'lg:grid lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)] lg:has-[>aside[data-collapsed=true]]:grid-cols-[var(--container-sidebar-collapsed)_minmax(0,1fr)] lg:has-[>aside[data-collapsed=true][data-collapsible=offcanvas]]:grid-cols-[0_minmax(0,1fr)] motion-safe:transition-[grid-template-columns] motion-safe:duration-[var(--motion-duration-normal)]',
        sidebar != null &&
          variant === 'floating' &&
          'lg:grid-cols-[calc(var(--container-sidebar)+1rem)_minmax(0,1fr)] lg:has-[>aside[data-collapsed=true]]:grid-cols-[calc(var(--container-sidebar-collapsed)+1rem)_minmax(0,1fr)] lg:has-[>aside[data-collapsed=true][data-collapsible=offcanvas]]:grid-cols-[0_minmax(0,1fr)]',
        classNames?.root,
        className,
      )}
    >
      {sidebar}
      {content !== undefined || header !== undefined || sidebarToggle ? (
        <WorkspaceBody className={classNames?.body}>
          {(header != null || sidebarToggle) && (
            <WorkspaceHeader
              className={classNames?.header}
              sidebarToggle={sidebarToggle}
            >
              {header}
            </WorkspaceHeader>
          )}
          <WorkspaceMain className={classNames?.main}>
            {content ?? children}
          </WorkspaceMain>
        </WorkspaceBody>
      ) : (
        children
      )}
    </div>
  );
}

export function WorkspaceBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'min-w-0',
        // Inset shells raise the body into a card, whether it comes from slots or children.
        'lg:group-data-[variant=inset]/shell:my-2 lg:group-data-[variant=inset]/shell:mr-2 lg:group-data-[variant=inset]/shell:min-h-[calc(100dvh-1rem)] lg:group-data-[variant=inset]/shell:overflow-hidden lg:group-data-[variant=inset]/shell:rounded-panel lg:group-data-[variant=inset]/shell:border lg:group-data-[variant=inset]/shell:border-line lg:group-data-[variant=inset]/shell:bg-canvas lg:group-data-[variant=inset]/shell:shadow-panel',
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
