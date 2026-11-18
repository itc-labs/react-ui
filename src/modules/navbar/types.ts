import type { ComponentProps, ReactNode } from 'react';
import type { SlotClasses, TestIdProps } from '../../components/common';
import type { IconName, IconGlyph } from '../../components/icon';

type EntryBase<TAccess> = {
  id: string;
  label: ReactNode;
  icon?: IconName | IconGlyph;
  className?: string;
  access?: TAccess;
  active?: boolean;
  exact?: boolean;
  end?: boolean;
};
export type NavbarLink<TAccess = unknown> = EntryBase<TAccess> & {
  type?: 'link';
  href: string;
  description?: ReactNode;
};
export type NavbarSection<TAccess = unknown> = {
  id: string;
  title: ReactNode;
  /** Makes the section title a link. */
  href?: string;
  items: readonly NavbarLink<TAccess>[];
  /** A trailing link such as "Show all". */
  more?: NavbarLink<TAccess>;
};
/** A left-hand category in a `layout="categories"` mega menu; its sections fill the panel. */
export type NavbarCategory<TAccess = unknown> = EntryBase<TAccess> & {
  href?: string;
  description?: ReactNode;
  sections: readonly NavbarSection<TAccess>[];
  /** A header action for the panel, such as "Show all products". */
  action?: NavbarLink<TAccess>;
};
export type NavbarDropdown<TAccess = unknown> = EntryBase<TAccess> & {
  type: 'dropdown';
  /** Nested dropdowns open to the side; any depth is allowed. */
  children: readonly (NavbarLink<TAccess> | NavbarDropdown<TAccess>)[];
};
export type NavbarMega<TAccess = unknown> = EntryBase<TAccess> & {
  type: 'mega';
  /** `columns` (default) lays sections out in a grid; `categories` lists categories on the left. */
  layout?: 'columns' | 'categories';
  sections?: readonly NavbarSection<TAccess>[];
  categories?: readonly NavbarCategory<TAccess>[];
  /** Section columns at full width; defaults to the number of sections, up to 5. */
  columns?: number;
  /** A highlighted column before the sections, such as "New & Trending". */
  featured?: NavbarSection<TAccess>;
  /** Links in a row along the bottom of the panel, such as "All Men's Shoes". */
  footer?: readonly NavbarLink<TAccess>[];
  /** `container` (default) spans the navbar width; `content` fits its content. */
  width?: 'container' | 'content';
};
export type NavbarItem<TAccess = unknown> =
  NavbarLink<TAccess> | NavbarDropdown<TAccess> | NavbarMega<TAccess>;
export type NavbarAppearance =
  'default' | 'floating' | 'dark' | 'brand' | 'transparent';
export type NavbarTone = 'default' | 'dark' | 'brand' | 'transparent';
export type NavbarItemVariant = 'underline' | 'pill' | 'solid' | 'ghost';
export type NavbarDensity = 'compact' | 'default' | 'comfortable';
export type NavbarAlign = 'start' | 'center' | 'split';
export type NavbarClassNames = SlotClasses<
  | 'root'
  | 'inner'
  | 'brand'
  | 'brandLogo'
  | 'brandTitle'
  | 'brandSubtitle'
  | 'switcher'
  | 'icon'
  | 'activeIndicator'
  | 'nav'
  | 'item'
  | 'trigger'
  | 'content'
  | 'section'
  | 'link'
  | 'actions'
  | 'mobileTrigger'
  | 'drawer'
  | 'secondary'
  | 'topbar'
  | 'panel'
  | 'category'
  | 'featured'
  | 'footer'
  | 'more'
  | 'back'
>;
export type NavbarBrand = {
  logo?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  href?: string;
};

export type NavbarProps<TAccess = unknown> = Omit<
  ComponentProps<'header'>,
  'children'
> &
  TestIdProps & {
    brand?: ReactNode | NavbarBrand;
    switcher?: ReactNode;
    /** Preset for tone, item style, density and shape; start here. */
    appearance?: NavbarAppearance;
    tone?: NavbarTone;
    itemVariant?: NavbarItemVariant;
    density?: NavbarDensity;
    /** `center` centres the menu; `split` centres the brand and puts the menu on a second row. */
    align?: NavbarAlign;
    /** A slim row above the bar, for delivery notes, contacts or a language switch. */
    topbar?: ReactNode;
    /** @deprecated Use `itemVariant`. `underline` and `pill` map to the same variants. */
    activeIndicator?: 'underline' | 'pill';
    brandHref?: string;
    items: readonly NavbarItem<TAccess>[];
    actions?: ReactNode;
    secondary?: ReactNode;
    currentPath?: string;
    isActive?: (item: NavbarItem<TAccess>, currentPath: string) => boolean;
    canAccess?: (access: TAccess, item: NavbarItem<TAccess>) => boolean;
    navigationLabel?: string;
    mobileTriggerLabel?: string;
    drawerTitle?: string;
    /** Sticky at the top of the window by default. */
    sticky?: boolean;
    elevateOnScroll?: boolean;
    classNames?: NavbarClassNames;
  };
