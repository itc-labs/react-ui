import type { NavItem } from '../navigation';
import type {
  NavbarCategory,
  NavbarDropdown,
  NavbarItem,
  NavbarLink,
  NavbarSection,
} from './types';

/** Where a node sits in a mega panel, so the renderer can place it. */
export type HeaderNodeRole = 'featured' | 'more' | 'footer' | 'action';

export type HeaderNode<TAccess> = Omit<NavItem<TAccess>, 'items' | 'children'> & {
  source?: NavbarItem<TAccess> | NavbarDropdown<TAccess>;
  section?: NavbarSection<TAccess>;
  category?: NavbarCategory<TAccess>;
  role?: HeaderNodeRole;
  items?: readonly HeaderNode<TAccess>[];
};

function base<TAccess>(
  item: Pick<NavbarLink<TAccess>, 'id' | 'access' | 'active' | 'exact' | 'end'> & {
    href?: string;
  },
) {
  return {
    id: item.id,
    ...(item.access === undefined ? {} : { access: item.access }),
    ...(item.active === undefined ? {} : { active: item.active }),
    ...(item.exact === undefined ? {} : { exact: item.exact }),
    ...(item.end === undefined ? {} : { end: item.end }),
    ...(item.href === undefined ? {} : { href: item.href }),
  };
}

function linkNode<TAccess>(
  link: NavbarLink<TAccess>,
  role?: HeaderNodeRole,
): HeaderNode<TAccess> {
  return { ...base(link), source: link, ...(role ? { role } : {}) };
}

function sectionNode<TAccess>(
  section: NavbarSection<TAccess>,
  role?: HeaderNodeRole,
): HeaderNode<TAccess> {
  return {
    id: section.id,
    ...(section.href === undefined ? {} : { href: section.href }),
    section,
    ...(role ? { role } : {}),
    items: [
      ...section.items.map((link) => linkNode(link)),
      ...(section.more ? [linkNode(section.more, 'more')] : []),
    ],
  };
}

/**
 * Normalizes every menu shape into one tree. Active matching and permission filtering run
 * over it, so a nested link, a "Show all" link or a footer link can mark its branch active.
 */
export function headerNodes<TAccess>(
  items: readonly (NavbarItem<TAccess> | NavbarDropdown<TAccess>)[],
): HeaderNode<TAccess>[] {
  return items.map((item) => {
    if (item.type === 'dropdown')
      return { ...base(item), source: item, items: headerNodes(item.children) };

    if (item.type === 'mega') {
      const footer = item.footer?.length
        ? [
            {
              id: `${item.id}-footer`,
              role: 'footer' as const,
              items: item.footer.map((link) => linkNode(link, 'footer')),
            },
          ]
        : [];
      const content =
        item.layout === 'categories'
          ? (item.categories ?? []).map((category): HeaderNode<TAccess> => ({
              ...base(category),
              category,
              items: [
                ...category.sections.map((section) => sectionNode(section)),
                ...(category.action ? [linkNode(category.action, 'action')] : []),
              ],
            }))
          : [
              ...(item.featured ? [sectionNode(item.featured, 'featured')] : []),
              ...(item.sections ?? []).map((section) => sectionNode(section)),
            ];

      return { ...base(item), source: item, items: [...content, ...footer] };
    }

    return linkNode(item);
  });
}
