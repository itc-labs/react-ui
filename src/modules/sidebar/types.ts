import type { ComponentProps, ReactNode } from 'react';
import type { SlotClasses, TestIdProps } from '../../components/common';
import type { BadgeProps } from '../../components/badge';
import type { IconName, IconGlyph } from '../../components/icon';

type EntryBase<TAccess> = {
  id: string;
  label: ReactNode;
  className?: string;
  access?: TAccess;
  exact?: boolean;
  end?: boolean;
  active?: boolean;
};
type NavigationEntry<TAccess> = EntryBase<TAccess> & {
  icon?: IconName | IconGlyph;
  badge?: number | Omit<BadgeProps, 'children'>;
  disabled?: boolean;
};
export type SidebarEntry<TAccess = unknown> =
  | (NavigationEntry<TAccess> & { type?: 'item'; href?: string; onSelect?: () => void })
  | (EntryBase<TAccess> & { type: 'group'; items: readonly SidebarEntry<TAccess>[] })
  | (NavigationEntry<TAccess> & {
      type: 'submenu';
      items: readonly SidebarEntry<TAccess>[];
      defaultOpen?: boolean;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
      toggleLabel?: string;
    } & ({ href: string; onSelect?: () => void } | { href?: never; onSelect?: never }));

export type SidebarBrand = {
  logo?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  href?: string;
};
export type SidebarClassNames = SlotClasses<
  | 'root'
  | 'header'
  | 'brand'
  | 'brandLogo'
  | 'brandTitle'
  | 'brandSubtitle'
  | 'content'
  | 'footer'
  | 'nav'
  | 'group'
  | 'groupLabel'
  | 'item'
  | 'icon'
  | 'label'
  | 'badge'
  | 'toggle'
  | 'tooltip'
  | 'flyout'
  | 'mobileTrigger'
  | 'drawer'
  | 'submenu'
  | 'submenuTrigger'
  | 'submenuContent'
  | 'submenuIcon'
  | 'submenuLabel'
  | 'submenuChevron'
  | 'submenuBody'
>;
export type SidebarProps<TAccess = unknown> = ComponentProps<'aside'> &
  TestIdProps & {
    variant?: 'sidebar' | 'floating';
    collapsible?: 'icon' | 'offcanvas' | 'none';
    tone?: 'default' | 'dark' | 'brand';
    itemVariant?: 'raised' | 'subtle' | 'bar' | 'solid';
    header?: ReactNode | SidebarBrand;
    footer?: ReactNode;
    items?: readonly SidebarEntry<TAccess>[];
    /** Absolute host pathname; no router is imported. */
    currentPath?: string;
    isActive?: (item: SidebarEntry<TAccess>, currentPath: string) => boolean;
    canAccess?: (access: TAccess, item: SidebarEntry<TAccess>) => boolean;
    navigationLabel?: string;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    /** Opt-in key chord, e.g. mod+b. Ignored in editable controls. */
    toggleShortcut?: string;
    collapseLabel?: string;
    expandLabel?: string;
    /** A native button or ref/props-forwarding control, e.g. IconButton. */
    mobileTrigger?: ReactNode;
    mobileTriggerLabel?: string;
    drawerTitle?: string;
    classNames?: SidebarClassNames;
  };
