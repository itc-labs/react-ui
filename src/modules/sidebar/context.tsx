'use client';
import { createContext, useContext, useId, type ReactNode } from 'react';
import { useSidebarState } from './use-sidebar-state';
import type { SidebarProps } from './types';
import { KitIconButton } from '../../components/icon-button/kit-icon-button';
import { PanelLeftIcon } from '../../components/icon/outline/panel-left';
import { useUILocale } from '../../i18n/provider';

type SidebarState = { collapsed: boolean; toggle: () => void; id: string };
export const SidebarContext = createContext<SidebarState | null>(null);
export const SidebarAppearanceContext =
  createContext<NonNullable<SidebarProps['itemVariant']>>('raised');

export type SidebarProviderProps = Pick<
  SidebarProps,
  'collapsed' | 'defaultCollapsed' | 'onCollapsedChange'
> & { children: ReactNode };

/** Share desktop collapse state between a Sidebar and triggers in the page header. */
export function SidebarProvider({ children, ...props }: SidebarProviderProps) {
  const state = useSidebarState(props);
  const id = useId();

  return (
    <SidebarContext.Provider value={{ ...state, id }}>
      {children}
    </SidebarContext.Provider>
  );
}

export type SidebarTriggerProps = Omit<
  React.ComponentProps<typeof KitIconButton>,
  'icon' | 'builtin' | 'label'
> &
  Pick<SidebarProps, 'collapsed' | 'onCollapsedChange'> & { label?: string };

/** Use a SidebarProvider, or pass the same controlled state as the Sidebar. */
export function SidebarTrigger({
  collapsed: controlled,
  onCollapsedChange,
  label,
  onClick,
  ...props
}: SidebarTriggerProps) {
  const context = useContext(SidebarContext);
  const collapsed = controlled ?? context?.collapsed ?? false;
  const { t } = useUILocale();

  return (
    <KitIconButton
      {...props}
      icon={PanelLeftIcon}
      variant={props.variant ?? 'ghost'}
      label={label ?? t(collapsed ? 'sidebar.expand' : 'sidebar.collapse')}
      aria-expanded={!collapsed}
      aria-controls={props['aria-controls'] ?? context?.id}
      disabled={props.disabled ?? (!context && !onCollapsedChange)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (onCollapsedChange) onCollapsedChange(!collapsed);
        else context?.toggle();
      }}
    />
  );
}
