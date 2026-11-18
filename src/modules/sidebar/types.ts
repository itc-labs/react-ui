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
  /** Short help shown in a tooltip beside the expanded item. */
  description?: ReactNode;
  badge?: number | Omit<BadgeProps, 'children'>;
  /** Decorative content after the label and badge, e.g. a plan or premium mark. Hidden in the collapsed rail. */
  trailing?: ReactNode;
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
export type SidebarAppearance = 'default' | 'soft' | 'dark' | 'brand';
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
  | 'trailing'
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
    /**
     * Visual preset: `default` (raised rows), `soft` (tinted panel, pill rows, comfortable density),
     * `dark` and `brand` (contrast panels). `tone`, `itemVariant` and `density` override a preset.
     */
    appearance?: SidebarAppearance;
    /** Row height: `compact` 32px, `default` 36px, `comfortable` 40px. */
    density?: 'compact' | 'default' | 'comfortable';
    collapsible?: 'icon' | 'offcanvas' | 'none';
    /** `soft` tints the sidebar with the accent and keeps item text at full ink. */
    tone?: 'default' | 'dark' | 'brand' | 'soft';
    /** `pill`: rounded tinted active item with full-ink labels; pairs with `tone="soft"`. */
    itemVariant?: 'raised' | 'subtle' | 'bar' | 'indicator' | 'solid' | 'pill';
    /** `caps`: small uppercase group labels, so they read as headings rather than items. */
    groupLabel?: 'default' | 'caps';
    /** Draw a hairline between top-level groups. */
    groupDividers?: boolean;
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
    /**
     * Where the desktop collapse toggle lives. `sidebar` (default) renders it in the
     * sidebar header; `none` omits it so a SidebarTrigger elsewhere (for example
     * WorkspaceHeader's `sidebarToggle`) owns collapsing. State and shortcut remain.
     */
    collapseToggle?: 'sidebar' | 'none';
    collapseLabel?: string;
    expandLabel?: string;
    /** A native button or ref/props-forwarding control, e.g. IconButton. */
    mobileTrigger?: ReactNode;
    mobileTriggerLabel?: string;
    drawerTitle?: string;
    classNames?: SidebarClassNames;
  };
