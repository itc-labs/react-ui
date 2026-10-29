import type { ReactNode } from 'react';
import type { IconName } from '../../components/icon';

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
  icon?: IconName;
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
