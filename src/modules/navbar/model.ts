import type { NavItem } from '../navigation';
import type { NavbarItem, NavbarSection } from './types';

export type HeaderNode<TAccess> = Omit<NavItem<TAccess>, 'items' | 'children'> & {
  source?: NavbarItem<TAccess>;
  section?: NavbarSection<TAccess>;
  items?: readonly HeaderNode<TAccess>[];
};

export function headerNodes<TAccess>(
  items: readonly NavbarItem<TAccess>[],
): HeaderNode<TAccess>[] {
  return items.map((item) => ({
    id: item.id,
    ...(item.access === undefined ? {} : { access: item.access }),
    ...(item.active === undefined ? {} : { active: item.active }),
    ...(item.exact === undefined ? {} : { exact: item.exact }),
    ...(item.end === undefined ? {} : { end: item.end }),
    source: item,
    ...('href' in item ? { href: item.href } : {}),
    ...(item.type === 'dropdown' ? { items: headerNodes(item.children) } : {}),
    ...(item.type === 'mega'
      ? {
          items: item.sections.map((section) => ({
            id: section.id,
            section,
            items: headerNodes(section.items),
          })),
        }
      : {}),
  }));
}
