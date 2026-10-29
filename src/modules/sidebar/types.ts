import type { ReactNode } from 'react';
import type { IconName } from '../../components/icon';

type EntryBase = { id: string; label: ReactNode; className?: string };
type NavigationEntry = EntryBase & {
  icon?: IconName;
  active?: boolean;
  disabled?: boolean;
};
export type SidebarEntry =
  | (NavigationEntry & { type?: 'item'; href?: string; onSelect?: () => void })
  | (EntryBase & { type: 'group'; items: readonly SidebarEntry[] })
  | (NavigationEntry & {
      type: 'submenu';
      items: readonly SidebarEntry[];
      defaultOpen?: boolean;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
      toggleLabel?: string;
    } & ({ href: string; onSelect?: () => void } | { href?: never; onSelect?: never }));
