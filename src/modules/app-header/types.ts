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
export type AppHeaderLink<TAccess = unknown> = EntryBase<TAccess> & {
  type?: 'link';
  href: string;
  description?: ReactNode;
};
export type AppHeaderSection<TAccess = unknown> = {
  id: string;
  title: ReactNode;
  items: readonly AppHeaderLink<TAccess>[];
};
export type AppHeaderItem<TAccess = unknown> =
  | AppHeaderLink<TAccess>
  | (EntryBase<TAccess> & {
      type: 'dropdown';
      children: readonly AppHeaderLink<TAccess>[];
    })
  | (EntryBase<TAccess> & {
      type: 'mega';
      sections: readonly AppHeaderSection<TAccess>[];
    });
export type AppHeaderClassNames = SlotClasses<
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
export type AppHeaderProps<TAccess = unknown> = Omit<
  ComponentProps<'header'>,
  'children'
> &
  TestIdProps & {
    brand?: ReactNode;
    brandHref?: string;
    items: readonly AppHeaderItem<TAccess>[];
    actions?: ReactNode;
    secondary?: ReactNode;
    currentPath?: string;
    isActive?: (item: AppHeaderItem<TAccess>, currentPath: string) => boolean;
    canAccess?: (access: TAccess, item: AppHeaderItem<TAccess>) => boolean;
    navigationLabel?: string;
    mobileTriggerLabel?: string;
    drawerTitle?: string;
    /** Sticky at the top of the window by default. */
    sticky?: boolean;
    elevateOnScroll?: boolean;
    classNames?: AppHeaderClassNames;
  };
