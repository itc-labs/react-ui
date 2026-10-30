// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent } from 'storybook/test';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Sidebar, type SidebarEntry } from './index';
import { UILocaleProvider } from '../../i18n/provider';
import { HomeIcon } from '../../components/icon/outline/home';
import { IconButton } from '../../components/icon-button';
import { WorkspaceShell } from '../../templates/workspace-shell';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const items: SidebarEntry<string>[] = [
  { id: 'home', label: 'Home', href: '#home', icon: HomeIcon, badge: 12 },
  { id: 'zero', label: 'Empty', href: '#empty', badge: 0 },
  { id: 'shown', label: 'Shown', badge: { count: 0, showZero: true } },
  { id: 'hidden', label: 'Hidden', badge: { count: 3, invisible: true } },
  {
    id: 'settings',
    label: 'Settings',
    type: 'submenu',
    href: '/settings',
    items: [
      { id: 'profile', label: 'Profile', href: '/settings/profile' },
      { id: 'private', label: 'Private', href: '/settings/private', access: 'private' },
    ],
  },
];

function byId(id: string) {
  return document.querySelector<HTMLElement>(
    `[data-testid="side${id ? `-${id}` : ''}"]`,
  )!;
}

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.unstubAllGlobals();
});

it('renders standalone counts, respects Badge visibility and replaces counts with icon dots in the rail', async () => {
  const render = (collapsed: boolean) =>
    root.render(
      <Sidebar
        items={items}
        collapsed={collapsed}
        data-testid="side"
        currentPath="#home"
        classNames={{ badge: 'custom-badge', icon: 'custom-icon' }}
      />,
    );

  await act(async () => render(false));
  // Plain numbers render as a quiet count; Badge objects keep their tone.
  expect(byId('item-home-badge').textContent).toBe('12');
  expect(byId('item-home-badge').classList.contains('custom-badge')).toBe(true);
  expect(byId('item-zero-badge')).toBeNull();
  expect(byId('item-shown-badge-indicator').textContent).toBe('0');
  expect(byId('item-hidden-badge-indicator')).toBeNull();
  await act(async () => render(true));
  expect(byId('').dataset.collapsed).toBe('true');
  expect(byId('item-home-badge-indicator').textContent).toBe('');
  expect(byId('item-home-badge').classList.contains('custom-badge')).toBe(true);
  expect(byId('item-home-icon').classList.contains('custom-icon')).toBe(true);
  expect(byId('item-zero-badge-indicator')).toBeNull();
  expect(byId('item-shown-badge-indicator').textContent).toBe('');
  expect(byId('item-hidden-badge-indicator')).toBeNull();
  expect(byId('item-home').querySelector('.sr-only')?.textContent).toBeTruthy();
});

it('shows the item label in a tooltip on focus and keeps the winning active link', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        collapsed
        items={items}
        currentPath="#home"
        isActive={(item) => item.id === 'home'}
        data-testid="side"
      />,
    ),
  );
  await act(async () => byId('item-home').focus());
  await vi.waitFor(() =>
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe('Home'),
  );
  expect(byId('item-home').getAttribute('aria-current')).toBe('page');
  expect(host.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
});

it('opens a collapsed submenu from the keyboard, focuses its links and returns focus on Escape', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        collapsed
        items={items}
        currentPath="/settings/profile"
        canAccess={() => false}
        data-testid="side"
      />,
    ),
  );
  const trigger = byId('submenu-settings');
  expect(trigger.dataset.active).toBe('true');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  await act(async () => {
    trigger.focus();
    await userEvent.keyboard('{ArrowRight}');
  });
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  const flyout = byId('submenu-settings-content');
  expect(flyout.getAttribute('role')).toBe('dialog');
  expect(document.activeElement).toBe(byId('submenu-settings-link'));
  expect(flyout.textContent).not.toContain('Private');
  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(byId('submenu-settings-item-profile'));
  expect(document.activeElement?.getAttribute('aria-current')).toBe('page');
  await act(async () => userEvent.keyboard('{Escape}'));
  expect(byId('submenu-settings-content')).toBeNull();
  await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
});

it('keeps controlled submenu open authoritative and reports flyout changes', async () => {
  const changed = vi.fn();
  await act(async () =>
    root.render(
      <Sidebar
        collapsed
        data-testid="side"
        items={[
          {
            id: 'branch',
            type: 'submenu',
            label: 'Branch',
            open: false,
            onOpenChange: changed,
            items: [{ id: 'child', label: 'Child', href: '#child' }],
          },
        ]}
      />,
    ),
  );
  await act(async () => byId('submenu-branch').click());
  expect(changed).toHaveBeenCalledWith(true);
  expect(byId('submenu-branch').getAttribute('aria-expanded')).toBe('false');
});

it('supports uncontrolled and controlled toggles with localized labels, ref and shell state', async () => {
  const changed = vi.fn();
  const ref = createRef<HTMLElement>();
  await act(async () =>
    root.render(
      <WorkspaceShell
        sidebar={
          <UILocaleProvider locale="en-US">
            <Sidebar
              ref={ref}
              defaultCollapsed
              onCollapsedChange={changed}
              data-testid="side"
              items={[]}
            />
          </UILocaleProvider>
        }
        content="Lorem ipsum"
      />,
    ),
  );
  expect(ref.current).toBe(byId(''));
  expect(byId('toggle').getAttribute('aria-label')).toBe('Expand sidebar');
  await act(async () => byId('toggle').click());
  expect(changed).toHaveBeenLastCalledWith(false);
  expect(byId('').dataset.collapsed).toBe('false');
  expect(byId('toggle').getAttribute('aria-expanded')).toBe('true');
  await act(async () =>
    root.render(
      <Sidebar
        collapsed={false}
        onCollapsedChange={changed}
        data-testid="side"
        items={[]}
      />,
    ),
  );
  expect(byId('toggle').getAttribute('aria-label')).toBe('Thu gọn thanh bên');
  await act(async () => byId('toggle').click());
  expect(changed).toHaveBeenLastCalledWith(true);
  expect(byId('').dataset.collapsed).toBe('false');
});

it('opts into a shortcut, ignores editable fields, and removes its listener', async () => {
  const render = (shortcut?: string) =>
    root.render(
      <Sidebar
        {...(shortcut ? { toggleShortcut: shortcut } : {})}
        data-testid="side"
        items={[]}
      />,
    );

  const shortcut = () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

  await act(async () => render());
  await act(async () => {
    shortcut();
  });
  expect(byId('').dataset.collapsed).toBe('false');
  await act(async () => render('mod+b'));
  await act(async () => {
    shortcut();
  });
  expect(byId('').dataset.collapsed).toBe('true');
  const input = document.createElement('input');
  host.append(input);
  await act(async () => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', metaKey: true, bubbles: true }),
    );
  });
  expect(byId('').dataset.collapsed).toBe('true');
  input.remove();
  await act(async () => render());
  await act(async () => {
    shortcut();
  });
  expect(byId('').dataset.collapsed).toBe('true');
});

it('uses a mobile trigger slot, the same filtered active tree, closes on selection and restores focus', async () => {
  const render = (currentPath: string) =>
    root.render(
      <UILocaleProvider locale="en-US">
        <Sidebar
          data-testid="side"
          collapsed
          items={items}
          canAccess={() => false}
          currentPath={currentPath}
          header={{ title: 'Lorem ipsum', logo: <HomeIcon /> }}
          footer={<span>Dolor sit amet</span>}
          mobileTrigger={<IconButton icon={HomeIcon} label="Open navigation" />}
        />
      </UILocaleProvider>,
    );

  await act(async () => render('/settings/profile'));
  const trigger = byId('drawer-trigger');
  await act(async () => {
    trigger.focus();
    trigger.click();
  });
  const drawer = byId('drawer');
  expect(drawer.getAttribute('role')).toBe('dialog');
  const selectors = Array.from(document.querySelectorAll('[data-testid]')).map((node) =>
    node.getAttribute('data-testid'),
  );
  expect(new Set(selectors).size).toBe(selectors.length);
  expect(drawer.textContent).toContain('Lorem ipsum');
  expect(drawer.textContent).toContain('Dolor sit amet');
  expect(drawer.textContent).not.toContain('Private');
  expect(drawer.querySelector('[aria-current="page"]')?.textContent).toBe('Profile');
  expect(byId('drawer-item-home-badge').textContent).toBe('12');
  await act(async () => {
    byId('drawer-submenu-settings-item-profile').addEventListener('click', (event) =>
      event.preventDefault(),
    );

    byId('drawer-submenu-settings-item-profile').click();
  });
  expect(byId('drawer')).toBeNull();
  await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  await act(async () => trigger.click());
  await act(async () => render('/settings'));
  expect(byId('drawer')).toBeNull();
  await act(async () => trigger.click());
  await act(async () => userEvent.keyboard('{Escape}'));
  expect(byId('drawer')).toBeNull();
});

it.each(['dark', 'brand'] as const)(
  'keeps %s rail flyouts on normal portalled surfaces',
  async (tone) => {
    await act(async () =>
      root.render(
        <Sidebar
          tone={tone}
          itemVariant="solid"
          collapsed
          items={items}
          data-testid="side"
          currentPath="/settings/profile"
        />,
      ),
    );
    await act(async () => byId('submenu-settings').click());
    const flyout = byId('submenu-settings-content');
    expect(flyout.classList.contains('bg-surface')).toBe(true);
    expect(flyout.closest('aside')).toBeNull();
    expect(flyout.style.getPropertyValue('--sidebar-bg')).toBe('');
    expect(byId('').style.getPropertyValue('--sidebar-bg')).not.toBe('');
    const current = flyout.querySelector('[aria-current="page"]')!;
    expect(current.className).toContain(
      'var(--sidebar-solid-fg,var(--color-on-brand))',
    );
    await act(async () => userEvent.keyboard('{Escape}'));
    expect(byId('submenu-settings-content')).toBeNull();
  },
);
