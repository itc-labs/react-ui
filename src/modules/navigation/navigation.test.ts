import { describe, expect, it, vi } from 'vitest';
import { filterNavByAccess, matchPath, resolveActiveNav, type NavItem } from './index';

describe('matchPath', () => {
  it.each([
    ['/admin', '/admin', true],
    ['/admin///?tab=one#top', '/admin/#content', true],
    ['/admin', '/admin/users?sort=name', true],
    ['/admin', '/administrator', false],
    ['/admin', '/Admin', false],
    ['/', '/admin', false],
    ['/', '/', true],
    ['#', '/admin', false],
    ['#section', '/admin', false],
    ['https://example.com/admin', '/admin', false],
    ['//example.com/admin', '/admin', false],
    ['mailto:hello@example.com', '/admin', false],
    ['admin', '/admin', false],
    ['', '/', false],
    ['/admin', 'https://example.com/admin', false],
    ['/admin', '', false],
    ['/admin', '/admin%2Fusers', false],
  ])('%s against %s is %s', (href, path, expected) => {
    expect(matchPath(href, path)).toBe(expected);
  });

  it('supports exact and end, with exact taking precedence', () => {
    expect(matchPath('/admin/', '/admin?x=1', { exact: true })).toBe(true);
    expect(matchPath('/admin', '/admin/users', { exact: true })).toBe(false);
    expect(matchPath('/admin', '/admin/users', { end: true })).toBe(false);
    expect(matchPath('/', '/admin', { end: true })).toBe(false);
    expect(matchPath('/', '/admin', { exact: false })).toBe(true);
    expect(matchPath('/admin', '/admin/users', { exact: false, end: true })).toBe(true);
  });
});

describe('resolveActiveNav', () => {
  const items: NavItem[] = [
    { id: 'settings', href: '/settings' },
    {
      id: 'section',
      children: [
        {
          id: 'group',
          items: [
            { id: 'team', href: '/settings/team/?q=1' },
            { id: 'members', href: '/settings/team/members', exact: true },
          ],
        },
      ],
    },
  ];

  it('chooses the longest normalized href across sections, groups and submenus', () => {
    expect(resolveActiveNav(items, '/settings/team/members')).toEqual([
      'section',
      'group',
      'members',
    ]);
    expect(resolveActiveNav(items, '/settings/team/members/first')).toEqual([
      'section',
      'group',
      'team',
    ]);
    expect(resolveActiveNav(items, '/missing')).toEqual([]);
    expect(resolveActiveNav([], '/')).toEqual([]);
  });

  it('lets explicit true outrank routes and explicit false veto a match', () => {
    expect(
      resolveActiveNav([{ id: 'override', active: true }, ...items], '/settings/team'),
    ).toEqual(['override']);
    expect(
      resolveActiveNav(
        [{ id: 'off', href: '/settings/team', active: false }, ...items],
        '/settings/team',
      ),
    ).toEqual(['section', 'group', 'team']);
    expect(resolveActiveNav([{ id: 'empty', href: '#' }], '/')).toEqual([]);
  });

  it('uses a host predicate in place of default matching, below explicit flags', () => {
    const predicate = vi.fn(
      (item: NavItem, path: string) => item.id === 'custom' && path === '/alias',
    );
    expect(resolveActiveNav([{ id: 'custom' }], '/alias', predicate)).toEqual([
      'custom',
    ]);
    expect(
      resolveActiveNav([{ id: 'custom', active: false }], '/alias', predicate),
    ).toEqual([]);
    expect(
      resolveActiveNav([{ id: 'explicit', active: true }], '/alias', () => false),
    ).toEqual(['explicit']);
    expect(
      resolveActiveNav([{ id: 'route', href: '/alias' }], '/alias', () => false),
    ).toEqual([]);
  });

  it('breaks equal href ties by depth, then source order, including root matching', () => {
    expect(
      resolveActiveNav(
        [
          { id: 'first', href: '/' },
          { id: 'second', href: '/' },
        ],
        '/',
      ),
    ).toEqual(['first']);
    expect(
      resolveActiveNav(
        [{ id: 'parent', href: '/same', items: [{ id: 'child', href: '/same/' }] }],
        '/same',
      ),
    ).toEqual(['parent', 'child']);
  });
});

describe('filterNavByAccess', () => {
  it('filters host metadata, prunes empty containers and never changes frozen input', () => {
    type Access = { permission: string };
    const deniedChild = Object.freeze({
      id: 'denied',
      access: { permission: 'admin' },
    });
    const items: readonly (NavItem<Access> & { label?: string })[] = Object.freeze([
      Object.freeze({ id: 'public', label: 'Public' }),
      Object.freeze({ id: 'group', items: Object.freeze([deniedChild]) }),
      Object.freeze({
        id: 'section',
        children: Object.freeze([{ id: 'allowed', access: { permission: 'read' } }]),
      }),
      Object.freeze({ id: 'submenu', href: '/parent', items: Object.freeze([]) }),
      Object.freeze({
        id: 'parent-denied',
        access: { permission: 'admin' },
        items: Object.freeze([{ id: 'public-child' }]),
      }),
    ]);
    const check = vi.fn((access: Access) => access.permission === 'read');
    const result = filterNavByAccess(items, check);
    expect(result.map((item) => item.id)).toEqual(['public', 'section']);
    expect(result[1]?.children?.map((item) => item.id)).toEqual(['allowed']);
    expect(result[0]).toEqual({ id: 'public', label: 'Public' });
    expect(result[0]).not.toBe(items[0]);
    expect(items[1]?.items).toEqual([deniedChild]);
    expect(check).toHaveBeenCalledTimes(3);
  });

  it('checks falsy access values and retains a container with either child collection', () => {
    expect(
      filterNavByAccess(
        [
          { id: 'zero', access: 0 },
          { id: 'one', access: 1 },
        ],
        (access) => access === 0,
      ).map((item) => item.id),
    ).toEqual(['zero']);
    expect(
      filterNavByAccess(
        [{ id: 'both', items: [], children: [{ id: 'public' }] }],
        () => false,
      ),
    ).toHaveLength(1);
    expect(filterNavByAccess([], () => true)).toEqual([]);
  });
});
