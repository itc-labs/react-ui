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
  actions?: SidebarItemAction[];
  onAdd?: () => void;
  addLabel?: string;
};
export type SidebarEntry<TAccess = unknown> =
  | (NavigationEntry<TAccess> & { type?: 'item'; href?: string; onSelect?: () => void })
  | (EntryBase<TAccess> & {
      type: 'group';
      items: readonly SidebarEntry<TAccess>[];
      collapsible?: boolean;
      defaultOpen?: boolean;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    })
  | (NavigationEntry<TAccess> & {
      type: 'submenu';
      items: readonly SidebarEntry<TAccess>[];
      defaultOpen?: boolean;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
      toggleLabel?: string;
    } & ({ href: string; onSelect?: () => void } | { href?: never; onSelect?: never }));

export type SidebarSection<TAccess = unknown> = {
  id: string;
  label: string;
  icon: IconName | IconGlyph;
  badge?: number;
  items: readonly SidebarEntry<TAccess>[];
};

export type SidebarItemAction = {
  id: string;
  label: string;
  icon?: IconName | IconGlyph;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
};
export type SidebarSearch = {
  placeholder?: string;
  shortcut?: string;
  onOpen: () => void;
};
export type SidebarWorkspaceSwitcher = {
  items: { id: string; label: ReactNode; description?: ReactNode; logo?: ReactNode }[];
  value: string;
  onValueChange: (id: string) => void;
  footer?: ReactNode;
};
export type SidebarBrand = {
  switcher?: SidebarWorkspaceSwitcher;
  logo?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  href?: string;
};
export type SidebarClassNames = SlotClasses<
  | 'root'
  | 'overlay'
  | 'sectionRail'
  | 'sections'
  | 'section'
  | 'sectionPanel'
  | 'sectionTitle'
  | 'header'
  | 'brand'
  | 'brandLogo'
  | 'brandTitle'
  | 'brandSubtitle'
  | 'search'
  | 'workspaceMenu'
  | 'workspaceItem'
  | 'groupContent'
  | 'itemActions'
  | 'actionButton'
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
    /** Preview a collapsed icon sidebar without changing its layout width. */
    expandOnHover?: boolean;
    sections?: readonly SidebarSection<TAccess>[];
    section?: string;
    defaultSection?: string;
    onSectionChange?: (section: string) => void;
    variant?: 'sidebar' | 'floating';
    collapsible?: 'icon' | 'offcanvas' | 'none';
    tone?: 'default' | 'dark' | 'brand';
    itemVariant?: 'raised' | 'subtle' | 'bar' | 'solid';
    header?: ReactNode | SidebarBrand;
    search?: ReactNode | SidebarSearch;
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
