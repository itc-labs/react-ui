import { useContext, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../components/common';
import {
  Sidebar,
  SidebarMobileTrigger,
  SidebarProvider,
  type SidebarProps,
} from '../../modules/sidebar';
import { SidebarContext } from '../../modules/sidebar/context';
import { UserMenu, type UserMenuProps } from '../../modules/user-menu';
import { WorkspaceShell } from '../workspace-shell';

export type DashboardShellProps<TAccess = unknown> = Omit<
  ComponentProps<typeof WorkspaceShell>,
  'sidebar' | 'content' | 'header'
> & {
  sidebar: SidebarProps<TAccess>;
  /** Account menu; omit it when the app shows the account elsewhere. */
  account?: UserMenuProps;
  /** `header` (default) puts the account menu in the page header; `sidebar` pins it to the sidebar footer. */
  accountPlacement?: 'header' | 'sidebar';
  /** Page title, greeting or breadcrumb at the start of the header. */
  header?: ReactNode;
  headerActions?: ReactNode;
  stickyHeader?: boolean;
};

/**
 * Application frame: responsive sidebar navigation, a header with actions and an account menu,
 * and optional topbar/aside slots. Below lg the header's menu button opens the sidebar drawer.
 */
export function DashboardShell<TAccess = unknown>({
  sidebar,
  account,
  accountPlacement = 'header',
  header,
  headerActions,
  stickyHeader = true,
  variant = 'inset',
  className,
  classNames,
  children,
  ...props
}: DashboardShellProps<TAccess>) {
  const sharedState = useContext(SidebarContext);
  // The header's menu button replaces the sidebar's own drawer trigger unless the host set one.
  const headerTrigger = sidebar.mobileTrigger === undefined;
  const accountInHeader = account && accountPlacement === 'header';

  const shell = (
    <WorkspaceShell
      {...props}
      variant={variant}
      className={className}
      classNames={{
        ...classNames,
        body: cn(
          stickyHeader && 'lg:group-data-[variant=inset]/shell:overflow-clip',
          classNames?.body,
        ),
        header: cn(
          variant === 'floating' ? 'bg-canvas' : 'bg-surface',
          // With nothing but the mobile menu button, the header is only needed below lg.
          header == null && headerActions == null && !accountInHeader && 'lg:hidden',
          stickyHeader && 'sticky top-[var(--workspace-topbar-height,0px)] z-10',
          classNames?.header,
        ),
      }}
      sidebar={
        <Sidebar
          {...(headerTrigger ? { mobileTrigger: false as const } : {})}
          {...(account && accountPlacement === 'sidebar' ? { account } : {})}
          {...sidebar}
        />
      }
      header={
        <>
          {headerTrigger && <SidebarMobileTrigger className="-ms-2 shrink-0" />}
          {header != null && <div className="min-w-0 flex-[1_1_12rem]">{header}</div>}
          {(headerActions != null || accountInHeader) && (
            <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
              {headerActions}
              {accountInHeader && <UserMenu {...account} />}
            </div>
          )}
        </>
      }
      content={children}
    />
  );

  return sharedState ? (
    shell
  ) : (
    <SidebarProvider
      {...(sidebar.collapsed === undefined ? {} : { collapsed: sidebar.collapsed })}
      {...(sidebar.defaultCollapsed === undefined
        ? {}
        : { defaultCollapsed: sidebar.defaultCollapsed })}
    >
      {shell}
    </SidebarProvider>
  );
}
