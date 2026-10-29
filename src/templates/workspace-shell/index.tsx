import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../../components/common';

export function WorkspaceShell({
  sidebar,
  header,
  content,
  classNames,
  children,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'content'> & {
  sidebar?: ReactNode;
  header?: ReactNode;
  content?: ReactNode;
  classNames?: SlotClasses<'root' | 'body' | 'header' | 'main'>;
}) {
  return (
    <div
      {...props}
      className={cn(
        'mx-auto min-h-screen max-w-workspace bg-canvas text-ink',
        sidebar != null &&
          'lg:grid lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)]',
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
  return <div {...props} className={cn('min-w-0', className)} />;
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
        'flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-5 text-ui-sm sm:px-8 lg:px-10',
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
