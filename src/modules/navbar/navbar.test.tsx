// @vitest-environment jsdom
import { UIProvider } from '../../theme/provider';
import { userEvent } from 'storybook/test';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { type UiLinkProps } from '../../components/link-image-provider';
import { Icon } from '../../components/icon';
import { HomeIcon } from '../../components/icon/outline/home';
import { UILocaleProvider } from '../../i18n/provider';
import { Navbar, type NavbarItem } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const items: NavbarItem<string>[] = [
  { id: 'home', label: 'Home', href: '/', exact: true },
  {
    id: 'settings',
    type: 'dropdown',
    label: 'Settings',
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile' },
      { id: 'team', label: 'Team', href: '/settings/team', access: 'team' },
    ],
  },
  {
    id: 'resources',
    type: 'mega',
    label: 'Resources',
    sections: [
      {
        id: 'private',
        title: 'Private',
        items: [{ id: 'admin', label: 'Admin', href: '/admin', access: 'admin' }],
      },
      {
        id: 'public',
        title: 'Public',
        items: [{ id: 'help', label: 'Help', href: '/help' }],
      },
    ],
  },
];

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

function byId(id: string) {
  return document.querySelector<HTMLElement>(`[data-testid="navbar-${id}"]`)!;
}

async function openDrawer() {
  await act(async () => byId('mobileTrigger').click());
}

it('forwards the header ref and native props, highlights the winning branch and updates routes', async () => {
  const ref = createRef<HTMLElement>();

  const render = (currentPath: string) =>
    root.render(
      <Navbar
        ref={ref}
        items={items}
        currentPath={currentPath}
        data-testid="navbar"
        title="Navigation"
        classNames={{ trigger: 'custom-trigger' }}
      />,
    );

  await act(async () => render('/settings/profile?tab=one'));
  expect(ref.current).toBe(host.querySelector('header'));
  expect(byId('item-settings-trigger').dataset.active).toBe('true');
  expect(byId('item-settings-trigger').classList.contains('custom-trigger')).toBe(true);
  await openDrawer();
  expect(
    byId('drawer-item-settings-item-profile-link').getAttribute('aria-current'),
  ).toBe('page');
  expect(byId('drawer-item-settings').hasAttribute('open')).toBe(true);
  await act(async () => render('/'));
  expect(byId('item-home-link').getAttribute('aria-current')).toBe('page');
  expect(byId('item-settings-trigger').dataset.active).toBe('false');
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it('prunes denied links, empty sections and empty groups on permission changes', async () => {
  const render = (allowed: boolean) =>
    root.render(
      <Navbar
        items={items}
        canAccess={() => allowed}
        currentPath="/admin"
        data-testid="navbar"
      />,
    );

  await act(async () => render(false));
  await openDrawer();
  expect(document.body.textContent).not.toContain('Admin');
  expect(document.body.textContent).not.toContain('Private');
  expect(document.body.textContent).not.toContain('Team');
  expect(document.body.textContent).toContain('Help');
  await act(async () =>
    root.render(
      <Navbar
        items={[
          {
            id: 'denied',
            type: 'dropdown',
            label: 'Denied',
            children: [
              { id: 'secret', label: 'Secret', href: '/secret', access: 'secret' },
            ],
          },
          { id: 'empty', type: 'mega', label: 'Empty', sections: [] },
        ]}
        canAccess={() => false}
        data-testid="navbar"
      />,
    ),
  );
  expect(document.body.textContent).not.toContain('Denied');
  expect(document.body.textContent).not.toContain('Empty');
});

it('opens a desktop dropdown with Enter and closes with Escape', async () => {
  await act(async () => root.render(<Navbar items={items} data-testid="navbar" />));
  const trigger = byId('item-settings-trigger');
  await act(async () => {
    trigger.focus();
    await userEvent.setup({ document }).keyboard('{Enter}');
  });
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(byId('item-settings-content')).not.toBeNull();
  await act(async () => {
    byId('item-settings-content').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
  });
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
});

it('uses localized labels, toggles the drawer and closes after following an adapted link', async () => {
  function Link(props: UiLinkProps) {
    return (
      <a
        {...props}
        data-adapted="true"
        onClick={(event) => {
          event.preventDefault();
          props.onClick?.(event);
        }}
      />
    );
  }

  await act(async () =>
    root.render(
      <UILocaleProvider locale="en-US">
        <UIProvider link={Link}>
          <Navbar brand="Brand" brandHref="/" items={items} data-testid="navbar" />
        </UIProvider>
      </UILocaleProvider>,
    ),
  );
  expect(byId('mobileTrigger').getAttribute('aria-label')).toBe('Open navigation menu');
  expect(byId('brand').dataset.adapted).toBe('true');
  expect(byId('item-home-link').dataset.adapted).toBe('true');
  await openDrawer();
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  const link = byId('drawer-item-home-link');
  expect(link.dataset.adapted).toBe('true');
  await act(async () => link.click());
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  await openDrawer();
  await act(async () => byId('drawer-close').click());
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it('honors explicit active precedence and host matching', async () => {
  await act(async () =>
    root.render(
      <Navbar
        items={[
          { id: 'off', href: '/off', label: 'Off', active: false },
          { id: 'on', href: '/on', label: 'On' },
        ]}
        isActive={() => true}
        currentPath="/alias"
        data-testid="navbar"
      />,
    ),
  );
  expect(byId('item-on-link').getAttribute('aria-current')).toBe('page');
  expect(byId('item-off-link').hasAttribute('aria-current')).toBe(false);
});

it('adds scroll elevation without changing the header structure', async () => {
  await act(async () =>
    root.render(<Navbar items={[]} elevateOnScroll data-testid="navbar" />),
  );
  const header = host.querySelector('header')!;
  expect(header.classList.contains('sticky')).toBe(true);
  await act(async () => {
    vi.stubGlobal('scrollY', 24);
    window.dispatchEvent(new Event('scroll'));
  });
  expect(header.dataset.elevated).toBe('true');
  expect(header.classList.contains('shadow-panel')).toBe(true);
});

it('highlights mega descendants and preserves encoded section and link identities', async () => {
  await act(async () =>
    root.render(<Navbar items={items} currentPath="/help" data-testid="navbar" />),
  );
  expect(byId('item-resources-trigger').dataset.active).toBe('true');
  await openDrawer();
  expect(
    byId('drawer-item-resources-section-public-item-help-link').getAttribute(
      'aria-current',
    ),
  ).toBe('page');
  expect(document.querySelectorAll('[data-testid]')).toHaveLength(
    new Set(
      Array.from(document.querySelectorAll('[data-testid]'), (element) =>
        element.getAttribute('data-testid'),
      ),
    ).size,
  );
});

it('emits no implicit selectors and respects explicit text overrides', async () => {
  await act(async () =>
    root.render(
      <Navbar
        items={items}
        navigationLabel="Primary"
        mobileTriggerLabel="Open primary"
        drawerTitle="Pages"
      />,
    ),
  );
  expect(host.querySelector('[data-testid]')).toBeNull();
  expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Primary');
  const trigger = host.querySelector<HTMLButtonElement>(
    'button[aria-label="Open primary"]',
  )!;
  await act(async () => trigger.click());
  expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Pages');
  expect(document.querySelector('[data-testid]')).toBeNull();
});

it('renders a structured linked brand with slots and repeats brand and switcher in the drawer', async () => {
  await act(async () =>
    root.render(
      <Navbar
        items={items}
        brand={{
          logo: <Icon glyph={HomeIcon} />,
          title: 'Brand',
          subtitle: 'Subtitle',
          href: '/brand',
        }}
        switcher={<button>Switch context</button>}
        classNames={{ brandLogo: 'custom-logo', brandTitle: 'custom-title' }}
        data-testid="navbar"
      />,
    ),
  );
  expect(byId('brand').getAttribute('href')).toBe('/brand');
  expect(byId('brandTitle').textContent).toBe('Brand');
  expect(byId('brandSubtitle').textContent).toBe('Subtitle');
  expect(byId('brandLogo').classList.contains('custom-logo')).toBe(true);
  expect(byId('switcher').textContent).toBe('Switch context');
  await openDrawer();
  expect(byId('drawer-brandTitle').textContent).toBe('Brand');
  expect(byId('drawerSwitcher').textContent).toBe('Switch context');
});

it('renders named and direct glyph icons for links, dropdowns and mega items on desktop and mobile', async () => {
  const decorated = items.map((item) => ({
    ...item,
    icon: item.id === 'home' ? HomeIcon : ('settings' as const),
  }));
  await act(async () =>
    root.render(<Navbar items={decorated} currentPath="/help" data-testid="navbar" />),
  );
  for (const item of decorated)
    expect(byId(`item-${item.id}-icon`).tagName.toLowerCase()).toBe('svg');
  await openDrawer();
  for (const item of decorated)
    expect(byId(`drawer-item-${item.id}-icon`).tagName.toLowerCase()).toBe('svg');
});

it('shows exactly one underline for the active top-level branch and supports pill styling', async () => {
  const render = (currentPath: string, activeIndicator?: 'underline' | 'pill') =>
    root.render(
      <Navbar
        items={items}
        currentPath={currentPath}
        {...(activeIndicator ? { activeIndicator } : {})}
        data-testid="navbar"
      />,
    );

  await act(async () => render('/help'));
  expect(host.querySelectorAll('[data-testid$="-activeIndicator"]')).toHaveLength(1);
  expect(
    byId('item-resources-trigger').contains(byId('item-resources-activeIndicator')),
  ).toBe(true);
  await act(async () => render('/'));
  expect(byId('item-home-link').contains(byId('item-home-activeIndicator'))).toBe(true);
  expect(byId('item-resources-activeIndicator')).toBeNull();
  await act(async () => render('/', 'pill'));
  expect(host.querySelectorAll('[data-testid$="-activeIndicator"]')).toHaveLength(0);
  expect(byId('item-home-link').className).toContain('data-[active=true]:bg-selected');
  await act(async () => render('/unmatched'));
  expect(host.querySelectorAll('[data-testid$="-activeIndicator"]')).toHaveLength(0);
});
