/** Router-independent navigation data. Hosts may extend this shape with labels and metadata. */
export interface NavItem<TAccess = unknown> {
  id: string;
  href?: string;
  exact?: boolean;
  end?: boolean;
  active?: boolean;
  access?: TAccess;
  items?: readonly NavItem<TAccess>[];
  children?: readonly NavItem<TAccess>[];
}

export interface MatchPathOptions {
  /** Takes precedence over end when both are supplied. `/` is exact unless this is explicitly false. */
  exact?: boolean;
  /** Alias for exact. Prefix matching is the default. */
  end?: boolean;
}

function pathname(value: string): string | undefined {
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;
  const path = value.split(/[?#]/, 1)[0]!;

  return path.replace(/\/+$/, '') || '/';
}

/** Match absolute local paths, ignoring search/hash and trailing slashes. */
export function matchPath(
  href: string,
  currentPath: string,
  { exact, end }: MatchPathOptions = {},
): boolean {
  const target = pathname(href);
  const current = pathname(currentPath);
  if (!target || !current) return false;

  if (current === target) return true;
  // The root only matches itself unless prefix matching is requested explicitly.
  if (target === '/') return (exact ?? end) === false;

  return !(exact ?? end) && current.startsWith(`${target}/`);
}

/** Explicit active wins; otherwise longest normalized href wins, then deepest, then first. */
export function resolveActiveNav<T extends NavItem>(
  items: readonly T[],
  currentPath: string,
  isActive?: (item: T, currentPath: string) => boolean,
): string[] {
  let best: { path: string[]; priority: number; length: number } | undefined;

  function visit(entries: readonly T[], ancestors: string[]) {
    for (const item of entries) {
      const path = [...ancestors, item.id];
      const active =
        item.active ??
        (isActive
          ? isActive(item, currentPath)
          : Boolean(item.href && matchPath(item.href, currentPath, item)));
      if (active) {
        const priority = item.active === true ? 1 : 0;
        const length = item.href ? (pathname(item.href)?.length ?? 0) : 0;
        if (
          !best ||
          priority > best.priority ||
          (priority === best.priority &&
            (length > best.length ||
              (length === best.length && path.length > best.path.length)))
        ) {
          best = { path, priority, length };
        }
      }
      if (item.items) visit(item.items as readonly T[], path);
      if (item.children) visit(item.children as readonly T[], path);
    }
  }

  visit(items, []);

  return best?.path ?? [];
}

/** Filter before resolving active state. Missing access is public; denied branches are removed. */
export function filterNavByAccess<T extends NavItem>(
  items: readonly T[],
  canAccess: (access: Exclude<T['access'], undefined>, item: T) => boolean,
): T[] {
  return items.flatMap((item) => {
    if (
      item.access !== undefined &&
      !canAccess(item.access as Exclude<T['access'], undefined>, item)
    )
      return [];
    const nestedItems = item.items
      ? filterNavByAccess(item.items as readonly T[], canAccess)
      : undefined;
    const children = item.children
      ? filterNavByAccess(item.children as readonly T[], canAccess)
      : undefined;
    if ((item.items || item.children) && !nestedItems?.length && !children?.length)
      return [];

    return [
      {
        ...item,
        ...(nestedItems ? { items: nestedItems } : {}),
        ...(children ? { children } : {}),
      },
    ];
  });
}
