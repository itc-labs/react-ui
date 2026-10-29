// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { Sidebar, type SidebarEntry } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
});

const items: SidebarEntry<string>[] = [
  { id: 'home', label: 'Home', href: '/', exact: true },
  {
    id: 'settings',
    type: 'submenu',
    label: 'Settings',
    href: '/settings',
    items: [
      {
        id: 'team',
        type: 'submenu',
        label: 'Team',
        items: [
          { id: 'members', label: 'Members', href: '/settings/team', access: 'read' },
        ],
      },
    ],
  },
  {
    id: 'admin',
    type: 'group',
    label: 'Admin',
    items: [{ id: 'secret', label: 'Secret', href: '/admin', access: 'admin' }],
  },
];

it('updates current route, reveals nested branches and sets aria-current only on the winning link', async () => {
  const ref = createRef<HTMLElement>();

  const render = (currentPath: string) =>
    root.render(
      <Sidebar
        ref={ref}
        items={items}
        currentPath={currentPath}
        data-testid="nav"
        classNames={{ item: 'custom-item' }}
      />,
    );

  await act(async () => render('/'));
  expect(host.querySelector('[aria-current]')?.textContent).toBe('Home');
  expect(
    host
      .querySelector('[data-testid="nav-submenu-settings"]')
      ?.getAttribute('data-state'),
  ).toBe('closed');
  await act(async () => render('/settings/team/?tab=one'));
  expect(host.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  const current = host.querySelector('[aria-current="page"]');
  expect(current?.textContent).toBe('Members');
  expect(current?.classList.contains('custom-item')).toBe(true);
  expect(current?.getAttribute('data-testid')).toBe(
    'nav-submenu-settings-submenu-team-item-members',
  );
  expect(
    host
      .querySelector('[data-testid="nav-submenu-settings"]')
      ?.getAttribute('data-state'),
  ).toBe('open');
  expect(
    host
      .querySelector('[data-testid="nav-submenu-settings-submenu-team"]')
      ?.getAttribute('data-state'),
  ).toBe('open');
  expect(ref.current).toBe(host.querySelector('aside'));
  expect(host.querySelector('aside')?.hasAttribute('currentPath')).toBe(false);
});

it('filters before matching, prunes denied branches and responds to permission changes', async () => {
  const render = (allowed: string) =>
    root.render(
      <Sidebar
        items={items}
        currentPath="/settings/team"
        canAccess={(access) => access === allowed}
      />,
    );

  await act(async () => render('read'));
  expect(host.textContent).not.toContain('Admin');
  expect(host.querySelector('[aria-current]')?.textContent).toBe('Members');
  await act(async () => render('admin'));
  expect(host.textContent).not.toContain('Settings');
  expect(host.textContent).toContain('Secret');
  expect(host.querySelector('[aria-current]')).toBeNull();
});

it('preserves explicit active and lets false override custom matching', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        items={[
          { id: 'off', label: 'Off', href: '/alias', active: false },
          { id: 'custom', label: 'Custom', href: '/custom' },
          { id: 'override', label: 'Override', href: '/override', active: true },
        ]}
        currentPath="/alias"
        isActive={(item, path) => item.id === 'custom' && path === '/alias'}
      />,
    ),
  );
  expect(host.querySelectorAll('[aria-current]')).toHaveLength(1);
  expect(host.querySelector('[aria-current]')?.textContent).toBe('Override');
  await act(async () =>
    root.render(
      <Sidebar
        items={[{ id: 'custom', label: 'Custom', href: '/custom' }]}
        currentPath="/alias"
        isActive={(item, path) => item.id === 'custom' && path === '/alias'}
      />,
    ),
  );
  expect(host.querySelector('[aria-current]')?.textContent).toBe('Custom');
});
