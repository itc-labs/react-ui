// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent } from 'storybook/test';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Sidebar, SidebarProvider, SidebarTrigger, type SidebarEntry } from './index';

import { WorkspaceShell } from '../../templates/workspace-shell';

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

it('keeps defaults and forwards floating appearance, refs and custom slots', async () => {
  await act(async () => root.render(<Sidebar items={items} />));
  const aside = host.querySelector('aside')!;
  expect(aside.dataset.variant).toBe('sidebar');
  expect(aside.dataset.tone).toBe('default');
  expect(aside.dataset.collapsible).toBe('icon');
  expect(aside.dataset.itemVariant).toBe('raised');
  const ref = createRef<HTMLElement>();
  await act(async () =>
    root.render(
      <Sidebar
        ref={ref}
        variant="floating"
        className="rounded-none"
        classNames={{ root: 'custom-root', footer: 'custom-footer' }}
        footer="Lorem ipsum"
        data-testid="appearance"
        items={items}
      />,
    ),
  );
  expect(ref.current).toBe(aside);
  expect(aside.dataset.testid).toBe('appearance');
  expect(aside.classList.contains('m-2')).toBe(true);
  expect(aside.classList.contains('h-[calc(100dvh-1rem)]')).toBe(true);
  expect(aside.classList.contains('rounded-none')).toBe(true);
  expect(aside.classList.contains('rounded-panel')).toBe(false);
  expect(aside.classList.contains('custom-root')).toBe(true);
  expect(
    host
      .querySelector('[data-testid="appearance-footer"]')
      ?.classList.contains('custom-footer'),
  ).toBe(true);
});

it.each(['default', 'dark', 'brand'] as const)(
  'scopes %s tone variables to the aside',
  async (tone) => {
    await act(async () => root.render(<Sidebar tone={tone} items={items} />));
    const aside = host.querySelector('aside')!;
    expect(aside.dataset.tone).toBe(tone);
    expect(aside.style.getPropertyValue('--sidebar-bg')).toBe(
      `var(--color-${tone === 'dark' ? 'ink' : tone === 'brand' ? 'accent' : 'sidebar'})`,
    );
    for (const name of ['fg', 'muted', 'hover', 'active-bg', 'active-fg', 'border'])
      expect(aside.style.getPropertyValue(`--sidebar-${name}`)).not.toBe('');
    expect(host.style.getPropertyValue('--sidebar-fg')).toBe('');
  },
);

it.each(['raised', 'subtle', 'bar', 'solid'] as const)(
  'applies %s styles to links, submenu triggers and collapsed rail',
  async (itemVariant) => {
    const entries: SidebarEntry[] = [
      { id: 'page', label: 'Page', href: '/', active: true },
      {
        id: 'branch',
        type: 'submenu',
        label: 'Branch',
        items: [{ id: 'child', label: 'Child', href: '/child' }],
      },
    ];

    const render = (collapsed: boolean) =>
      root.render(
        <Sidebar
          items={entries}
          itemVariant={itemVariant}
          collapsed={collapsed}
          data-testid="styles"
        />,
      );

    await act(async () => render(false));
    const expanded = host.querySelector('[aria-current="page"]')!;
    expect(host.querySelector('aside')?.dataset.itemVariant).toBe(itemVariant);
    expect(expanded.classList.contains('shadow-panel')).toBe(itemVariant === 'raised');
    expect(expanded.classList.contains('before:w-[3px]')).toBe(itemVariant === 'bar');
    expect(
      expanded.classList.contains('bg-[var(--sidebar-solid-bg,var(--color-accent))]'),
    ).toBe(itemVariant === 'solid');
    expect(
      host.querySelector('[data-testid="styles-submenu-branch"] button')?.className,
    ).toContain('focus-visible:');
    await act(async () => render(true));
    const rail = host.querySelector('[aria-current="page"]')!;
    expect(rail.classList.contains('shadow-panel')).toBe(itemVariant === 'raised');
    expect(rail.classList.contains('before:w-[3px]')).toBe(itemVariant === 'bar');
  },
);

it('ignores collapse state and shortcuts when collapsible is none', async () => {
  const onCollapsedChange = vi.fn();
  await act(async () =>
    root.render(
      <Sidebar
        items={items}
        collapsible="none"
        collapsed
        toggleShortcut="mod+b"
        onCollapsedChange={onCollapsedChange}
        data-testid="fixed"
      />,
    ),
  );
  expect(host.querySelector('aside')?.dataset.collapsed).toBe('false');
  expect(host.querySelector('[data-testid="fixed-toggle"]')).toBeNull();
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true }),
    ),
  );
  expect(onCollapsedChange).not.toHaveBeenCalled();
});

it('shares offcanvas state with a reachable header trigger and restores focus on keyboard collapse', async () => {
  await act(async () =>
    root.render(
      <SidebarProvider>
        <WorkspaceShell
          variant="floating"
          data-testid="shell"
          sidebar={
            <Sidebar
              variant="floating"
              collapsible="offcanvas"
              toggleShortcut="mod+b"
              items={items}
              data-testid="offcanvas"
            />
          }
          header={<SidebarTrigger data-testid="external" />}
          content="Lorem ipsum"
        />
      </SidebarProvider>,
    ),
  );
  const aside = host.querySelector('aside')!;
  const trigger = host.querySelector<HTMLButtonElement>('[data-testid="external"]')!;
  expect(trigger.getAttribute('aria-controls')).toBe(aside.id);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(
    host.querySelector('[data-testid="shell"]')?.getAttribute('data-variant'),
  ).toBe('floating');
  host.querySelector<HTMLAnchorElement>('aside a')!.focus();
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true }),
    ),
  );
  expect(aside.dataset.collapsed).toBe('true');
  expect(aside.hasAttribute('inert')).toBe(true);
  expect(aside.getAttribute('aria-hidden')).toBe('true');
  expect(aside.classList.contains('w-0')).toBe(true);
  expect(aside.classList.contains('m-0')).toBe(true);
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(trigger.getAttribute('aria-label')).toBe('Mở rộng thanh bên');
  await act(async () => userEvent.keyboard('{Enter}'));
  expect(aside.dataset.collapsed).toBe('false');
  expect(aside.hasAttribute('inert')).toBe(false);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
});

it('supports controlled header triggers, preserves refs and allows click cancellation', async () => {
  const onCollapsedChange = vi.fn();
  const ref = createRef<HTMLButtonElement>();

  const render = (collapsed: boolean, cancel = false) =>
    root.render(
      <>
        <Sidebar
          id="controlled-sidebar"
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          collapsible="offcanvas"
        />
        <SidebarTrigger
          ref={ref}
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          aria-controls="controlled-sidebar"
          className="custom-trigger"
          data-testid="controlled-trigger"
          onClick={(event) => {
            if (cancel) event.preventDefault();
          }}
        />
      </>,
    );

  await act(async () => render(true));
  await act(async () => ref.current!.click());
  expect(onCollapsedChange).toHaveBeenCalledWith(false);
  expect(host.querySelector('aside')?.dataset.collapsed).toBe('true');
  expect(ref.current?.dataset.testid).toBe('controlled-trigger');
  expect(ref.current?.classList.contains('custom-trigger')).toBe(true);
  expect(ref.current?.className).toContain('focus-visible:');
  await act(async () => render(false, true));
  onCollapsedChange.mockClear();
  await act(async () => ref.current!.click());
  expect(onCollapsedChange).not.toHaveBeenCalled();
});
