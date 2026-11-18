// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

it.each(['default', 'dark', 'brand', 'soft'] as const)(
  'marks the aside and drawer with the %s tone instead of inline colours',
  async (tone) => {
    await act(async () => root.render(<Sidebar tone={tone} items={items} />));
    const aside = host.querySelector('aside')!;
    expect(aside.dataset.tone).toBe(tone);
    expect(aside.dataset.sidebarTone).toBe(tone);
    expect(aside.getAttribute('style')).toBeNull();
  },
);

it('defines every tone variable in the sidebar stylesheet', () => {
  const css = readFileSync(resolve(__dirname, 'sidebar.css'), 'utf8');
  const start = css.indexOf('[data-sidebar-tone] {');
  const base = css.slice(start, css.indexOf('}', start));
  for (const name of [
    'bg',
    'fg',
    'muted',
    'hover',
    'active-bg',
    'active-fg',
    'border',
    'badge-ring',
    'accent',
    'tint',
    'solid-bg',
    'solid-fg',
  ])
    expect(base).toContain(`--sidebar-${name}:`);
  for (const tone of ['dark', 'brand', 'soft'])
    expect(css).toContain(`[data-sidebar-tone='${tone}']`);
  expect(css).toContain('--sidebar-bg: var(--color-sidebar-soft);');
  expect(css).toContain('--sidebar-tint: var(--color-sidebar-soft-active);');
});

it.each(['raised', 'subtle', 'bar', 'indicator', 'solid'] as const)(
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
    expect(expanded.classList.contains('before:w-1')).toBe(itemVariant === 'bar');
    expect(expanded.classList.contains('before:w-0.5')).toBe(
      itemVariant === 'indicator',
    );
    expect(
      expanded.classList.contains('bg-[var(--sidebar-solid-bg,var(--color-accent))]'),
    ).toBe(itemVariant === 'solid');
    expect(
      host.querySelector('[data-testid="styles-submenu-branch"] button')?.className,
    ).toContain('focus-visible:');
    expect(
      host
        .querySelector('[data-testid="styles-submenu-branch"] button')
        ?.classList.contains('before:w-0.5'),
    ).toBe(false);
    await act(async () => render(true));
    const rail = host.querySelector('[aria-current="page"]')!;
    expect(rail.classList.contains('shadow-panel')).toBe(itemVariant === 'raised');
    expect(rail.classList.contains('before:w-1')).toBe(itemVariant === 'bar');
    expect(rail.classList.contains('before:w-0.5')).toBe(itemVariant === 'indicator');
  },
);

it.each([
  ['default', 'default', 'raised', 'default'],
  ['soft', 'soft', 'pill', 'comfortable'],
  ['dark', 'dark', 'raised', 'default'],
  ['brand', 'brand', 'raised', 'default'],
] as const)(
  'resolves the %s appearance preset',
  async (appearance, tone, itemVariant, density) => {
    await act(async () =>
      root.render(<Sidebar appearance={appearance} items={items} />),
    );
    const aside = host.querySelector('aside')!;
    expect(aside.dataset.appearance).toBe(appearance);
    expect(aside.dataset.sidebarTone).toBe(tone);
    expect(aside.dataset.itemVariant).toBe(itemVariant);
    expect(aside.dataset.sidebarDensity).toBe(density);
  },
);

it('lets explicit tone, item variant and density override a preset', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        appearance="soft"
        tone="dark"
        itemVariant="indicator"
        density="compact"
        items={items}
      />,
    ),
  );
  const aside = host.querySelector('aside')!;
  expect(aside.dataset.sidebarTone).toBe('dark');
  expect(aside.dataset.itemVariant).toBe('indicator');
  expect(aside.dataset.sidebarDensity).toBe('compact');
  const css = readFileSync(resolve(__dirname, 'sidebar.css'), 'utf8');
  expect(css).toContain("[data-sidebar-density='compact']");
  expect(css).toContain("[data-sidebar-density='comfortable']");
  expect(host.querySelector('a')!.className).toContain(
    'min-h-[var(--sidebar-row,2.25rem)]',
  );
});

it('pill marks only the current page and drops nested guide rules', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        itemVariant="pill"
        data-testid="pill"
        items={[
          {
            id: 'branch',
            type: 'submenu',
            label: 'Branch',
            defaultOpen: true,
            items: [
              { id: 'child', label: 'Child', href: '/child', active: true },
              { id: 'other', label: 'Other', href: '/other' },
            ],
          },
        ]}
      />,
    ),
  );
  const current = host.querySelector('[aria-current="page"]')!;
  expect(current.textContent).toBe('Child');
  expect(current.className).toContain('font-semibold');
  expect(current.className).toContain('bg-[var(--sidebar-tint');
  const trigger = host.querySelector('[data-testid="pill-submenu-branch"] button')!;
  expect(trigger.className).not.toContain('font-semibold');
  expect(trigger.className).not.toContain('bg-[var(--sidebar-tint');
  const other = Array.from(host.querySelectorAll('a')).find(
    (a) => a.textContent === 'Other',
  )!;
  expect(other.className).toContain('text-[var(--sidebar-fg');
  const body = host.querySelector('[data-testid="pill-submenu-branch-content"] > div')!;
  expect(body.className).toContain('[--sidebar-indent:2.25rem]');
  expect(current.className).toContain('ps-[calc(0.75rem+var(--sidebar-indent,0rem))]');
  expect(current.className).toContain('after:-end-3');
  expect(trigger.className).not.toContain('after:-end-3');
  expect(host.querySelector('[data-testid="pill-content"]')!.className).toContain(
    '-me-3',
  );
  expect(body.className).not.toContain('border-l');
});

it('keeps the pill edge bar at the rail edge when collapsed', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        itemVariant="pill"
        collapsed
        data-testid="rail"
        items={[
          { id: 'home', label: 'Home', href: '/', active: true },
          { id: 'files', label: 'Files', href: '/files' },
        ]}
      />,
    ),
  );
  const other = host.querySelector('[data-testid="rail-item-files"]')!;
  expect(other.className).not.toContain('after:');
  const current = host.querySelector('[aria-current="page"]')!;
  expect(current.className).toContain(
    'after:-end-[calc((var(--container-sidebar-collapsed)-2.25rem)/2)]',
  );
  expect(current.className).not.toContain('after:-end-3');
  expect(current.className).toContain('px-2');
  expect(host.querySelector('[data-testid="rail-content"]')!.className).toContain(
    '-me-2',
  );
});

it('shows item descriptions in a tooltip and renders trailing marks outside the rail', async () => {
  const entries: SidebarEntry[] = [
    {
      id: 'tickets',
      label: 'Tickets',
      href: '/tickets',
      description: 'Lorem ipsum dolor',
      trailing: <span data-mark="premium">P</span>,
    },
    { id: 'plain', label: 'Plain', href: '/plain' },
  ];
  await act(async () =>
    root.render(<Sidebar items={entries} data-testid="described" />),
  );
  const link = host.querySelector('[data-testid="described-item-tickets"]')!;
  expect(link.getAttribute('data-state')).toBe('closed');
  expect(
    host
      .querySelector('[data-testid="described-item-plain"]')!
      .hasAttribute('data-state'),
  ).toBe(false);
  expect(
    host.querySelector('[data-testid="described-item-tickets-trailing"] [data-mark]'),
  ).not.toBeNull();
  await act(async () =>
    root.render(<Sidebar items={entries} collapsed data-testid="described" />),
  );
  expect(host.querySelector('[data-mark]')).toBeNull();
});

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

it('keeps flat items as tight as group items and spaces only group boundaries', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        data-testid="spacing"
        currentPath="/"
        items={[
          { id: 'home', label: 'Home', href: '/', exact: true },
          { id: 'rooms', label: 'Rooms', href: '/rooms' },
          {
            id: 'monthly',
            type: 'group',
            label: 'Monthly',
            items: [{ id: 'bills', label: 'Bills', href: '/bills' }],
          },
          {
            id: 'more',
            type: 'group',
            label: 'More',
            collapsible: true,
            items: [{ id: 'reports', label: 'Reports', href: '/reports' }],
          },
        ]}
      />,
    ),
  );

  const nav = host.querySelector('[data-testid="spacing-nav"]');
  const classes = nav?.className.split(' ') ?? [];

  // Flat items use the in-group gap (gap-0.5), not the old gap-5 between every entry.
  expect(classes).toContain('gap-0.5');
  expect(classes).not.toContain('gap-5');
  expect(classes).toContain('[&>[data-sidebar-group]+*]:mt-4.5');
  expect(classes).toContain('[&>[data-sidebar-group]:not(:first-child)]:mt-4.5');
  // Plain and collapsible groups both mark their root so the nav can space them.
  expect(
    host
      .querySelector('[data-testid="spacing-group-monthly"]')
      ?.hasAttribute('data-sidebar-group'),
  ).toBe(true);
  expect(
    host
      .querySelector('[data-testid="spacing-group-more"]')
      ?.hasAttribute('data-sidebar-group'),
  ).toBe(true);
  expect(
    nav?.querySelector(':scope > [data-testid="spacing-item-home"]'),
  ).not.toBeNull();
});

it('styles group labels as caps headings, divides groups and accents the indicator icon', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        data-testid="caps"
        currentPath="/bills"
        itemVariant="indicator"
        groupLabel="caps"
        groupDividers
        items={[
          { id: 'home', label: 'Home', href: '/', exact: true },
          {
            id: 'monthly',
            type: 'group',
            label: 'Monthly',
            items: [{ id: 'bills', label: 'Bills', href: '/bills' }],
          },
          {
            id: 'more',
            type: 'group',
            label: 'More',
            collapsible: true,
            items: [{ id: 'reports', label: 'Reports', href: '/reports' }],
          },
        ]}
      />,
    ),
  );

  const nav = host.querySelector('[data-testid="caps-nav"]');
  const classes = nav?.className ?? '';

  expect(classes).toContain('[&_[data-sidebar-group-label]]:uppercase');
  expect(classes).toContain('[&>[data-sidebar-group]:not(:first-child)]:border-t');
  // Plain and collapsible group labels are both targeted.
  expect(nav?.querySelectorAll('[data-sidebar-group-label]').length).toBe(2);
  expect(host.querySelector('[aria-current="page"]')?.className).toContain(
    '[&_svg]:text-[var(--sidebar-accent,var(--color-accent))]',
  );
});

it('keeps the default group label style when no option is set', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        data-testid="plain"
        currentPath="/"
        items={[
          {
            id: 'g',
            type: 'group',
            label: 'G',
            items: [{ id: 'a', label: 'A', href: '/' }],
          },
        ]}
      />,
    ),
  );

  const classes = host.querySelector('[data-testid="plain-nav"]')?.className ?? '';

  expect(classes).not.toContain('uppercase');
  expect(classes).not.toContain('border-t');
});
