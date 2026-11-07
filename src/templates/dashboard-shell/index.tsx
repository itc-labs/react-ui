import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../components/common';
import { Sidebar, type SidebarProps } from '../../modules/sidebar';
import { UserMenu, type UserMenuProps } from '../../modules/user-menu';
import { WorkspaceShell } from '../workspace-shell';

export type DashboardShellProps<TAccess = unknown> = Omit<
  ComponentProps<typeof WorkspaceShell>,
  'sidebar' | 'content' | 'header'
> & {
  sidebar: SidebarProps<TAccess>;
  account: UserMenuProps;
  header?: ReactNode;
  headerActions?: ReactNode;
  stickyHeader?: boolean;
};

/** Application frame with responsive navigation, a toolbar and an account menu. */
export function DashboardShell<TAccess = unknown>({
  sidebar,
  account,
  header,
  headerActions,
  stickyHeader = true,
  variant = 'inset',
  className,
  classNames,
  children,
  ...props
}: DashboardShellProps<TAccess>) {
  return (
    <WorkspaceShell
      {...props}
      variant={variant}
      className={cn('max-w-none', className)}
      classNames={{
        ...classNames,
        body: cn(
          stickyHeader && 'lg:group-data-[variant=inset]/shell:overflow-clip',
          classNames?.body,
        ),
        header: cn(
          'bg-surface',
          stickyHeader && 'sticky top-0 z-10',
          classNames?.header,
        ),
      }}
      sidebar={
        <Sidebar
          variant={variant === 'floating' ? 'floating' : 'sidebar'}
          {...sidebar}
        />
      }
      header={
        <>
          {header != null && <div className="min-w-0">{header}</div>}
          <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
            {headerActions}
            <UserMenu {...account} />
          </div>
        </>
      }
      content={children}
    />
  );
}
