import type { ComponentProps, ReactNode } from 'react';
import type { SlotClasses, TestIdProps } from '../../components/common';
import type { IconName } from '../../components/icon';

type EntryBase<TAccess> = {
  id: string;
  label: ReactNode;
  icon?: IconName;
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
  items: readonly NavbarLink<TAccess>[];
};
export type NavbarItem<TAccess = unknown> =
  | NavbarLink<TAccess>
  | (EntryBase<TAccess> & {
      type: 'dropdown';
      children: readonly NavbarLink<TAccess>[];
    })
  | (EntryBase<TAccess> & {
      type: 'mega';
      sections: readonly NavbarSection<TAccess>[];
    });
export type NavbarClassNames = SlotClasses<
  | 'root'
  | 'inner'
  | 'brand'
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
>;
export type NavbarProps<TAccess = unknown> = Omit<
  ComponentProps<'header'>,
  'children'
> &
  TestIdProps & {
    brand?: ReactNode;
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
