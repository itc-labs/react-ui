import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../../components/common';

export function WorkspaceShell({
  sidebar,
  header,
  content,
  classNames,
  children,
  className,
  variant = 'inset',
  ...props
}: Omit<ComponentProps<'div'>, 'content'> & {
  sidebar?: ReactNode;
  header?: ReactNode;
  content?: ReactNode;
  classNames?: SlotClasses<'root' | 'body' | 'header' | 'main'>;
  /** `inset` raises the page into a rounded card beside the sidebar; `classic` divides them with a rule. */
  variant?: 'inset' | 'classic';
}) {
  const inset = sidebar != null && variant === 'inset';

  return (
    <div
      {...props}
      data-variant={inset ? 'inset' : undefined}
      className={cn(
        'group/shell',
        'mx-auto min-h-screen max-w-workspace bg-canvas text-ink',
        inset && 'lg:bg-sidebar',
        sidebar != null &&
          variant === 'classic' &&
          '[&>aside]:border-r [&>aside]:border-line',
        sidebar != null &&
          'lg:grid lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)] lg:has-[>aside[data-collapsed=true]]:grid-cols-[var(--container-sidebar-collapsed)_minmax(0,1fr)] motion-safe:transition-[grid-template-columns] motion-safe:duration-[var(--motion-duration-normal)]',
        classNames?.root,
        className,
      )}
    >
      {sidebar}
      {content !== undefined || header !== undefined ? (
        <WorkspaceBody className={classNames?.body}>
          {header != null && (
            <WorkspaceHeader className={classNames?.header}>{header}</WorkspaceHeader>
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
  ...props
}: ComponentProps<'header'> & {
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  actionsClassName?: string;
}) {
  return (
    <header
      {...props}
      className={cn(
        'flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 text-ui-sm sm:px-8 lg:px-8',
        className,
      )}
    >
      {breadcrumb}
      {children}
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
      className={cn('mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10', className)}
    />
  );
}
