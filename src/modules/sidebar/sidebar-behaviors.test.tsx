// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Sidebar, type SidebarSection } from './index';
import { HomeIcon } from '../../components/icon/outline/home';
import { UILocaleProvider } from '../../i18n/provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const sections: SidebarSection[] = [
  {
    id: 'home',
    label: 'Home',
    icon: HomeIcon,
    items: [{ id: 'home', label: 'Overview', href: '/' }],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: HomeIcon,
    badge: 2,
    items: [
      {
        id: 'group',
        type: 'group',
        label: 'Workspace',
        items: [
          {
            id: 'team',
            type: 'submenu',
            label: 'Team',
            items: [{ id: 'members', label: 'Members', href: '/settings/team' }],
          },
        ],
      },
    ],
  },
];

const get = (id = '') =>
  document.querySelector<HTMLElement>(`[data-testid="side${id ? `-${id}` : ''}"]`)!;

const render = (props: React.ComponentProps<typeof Sidebar> = {}) =>
  act(() =>
    root.render(
      <UILocaleProvider locale="en-US">
        <Sidebar data-testid="side" {...props} />
      </UILocaleProvider>,
    ),
  );

const pointer = (type: string, pointerType = 'mouse') =>
  act(() => {
    const event = new MouseEvent(type, { bubbles: true });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    get().dispatchEvent(event);
  });

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('previews after the open delay, closes after the leave delay and preserves collapsed layout and callbacks', () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  render({
    defaultCollapsed: true,
    expandOnHover: true,
    items: sections[0]!.items,
    onCollapsedChange: changed,
  });
  pointer('pointerover');
  advance(149);
  expect(get().dataset.hoverExpanded).toBe('false');
  advance(1);
  expect(get().dataset.hoverExpanded).toBe('true');
  expect(get().dataset.collapsed).toBe('true');
  expect(get().classList.contains('w-sidebar-collapsed')).toBe(true);
  expect(get('overlay').classList.contains('absolute')).toBe(true);
  expect(get('overlay').classList.contains('w-sidebar')).toBe(true);
  pointer('pointerout');
  advance(249);
  expect(get().dataset.hoverExpanded).toBe('true');
  advance(1);
  expect(get().dataset.hoverExpanded).toBe('false');
  expect(changed).not.toHaveBeenCalled();
  pointer('pointerover');
  advance(100);
  pointer('pointerout');
  advance(300);
  expect(get().dataset.hoverExpanded).toBe('false');
});

it('opens on focus, retains focus when rows change, stays open on pointer leave and closes with Escape', () => {
  vi.useFakeTimers();
  render({ defaultCollapsed: true, expandOnHover: true, items: sections[0]!.items });

  act(() => get('item-home').focus());

  expect(get().dataset.hoverExpanded).toBe('true');
  expect(document.activeElement).toBe(get('item-home'));
  pointer('pointerout');
  advance(300);
  expect(get().dataset.hoverExpanded).toBe('true');

  act(() =>
    get('item-home').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    ),
  );

  expect(get().dataset.hoverExpanded).toBe('false');
  expect(document.activeElement).toBe(get('toggle'));

  act(() => get('toggle').blur());

  act(() => get('toggle').focus());

  expect(get().dataset.hoverExpanded).toBe('true');

  act(() => get('toggle').blur());

  advance(250);
  expect(get().dataset.hoverExpanded).toBe('false');
});

it.each(['coarse', 'touch', 'offcanvas', 'none'] as const)(
  'does not preview for %s',
  (mode) => {
    vi.useFakeTimers();
    if (mode === 'coarse')
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      );
    render({
      defaultCollapsed: true,
      expandOnHover: true,
      ...(mode === 'offcanvas' || mode === 'none' ? { collapsible: mode } : {}),
    });
    pointer('pointerover', mode === 'touch' ? 'touch' : 'mouse');
    advance(500);
    expect(get().dataset.hoverExpanded).toBe('false');
  },
);

it('derives the deepest section from nested routes, allows local selection and derives again on route changes', () => {
  render({ sections, currentPath: '/settings/team' });
  expect(get('section-settings').getAttribute('aria-pressed')).toBe('true');
  expect(get('sectionTitle').textContent).toBe('Settings');
  expect(
    get('group-group-submenu-team-item-members').getAttribute('aria-current'),
  ).toBe('page');

  act(() => get('section-home').click());

  expect(get('sectionTitle').textContent).toBe('Home');
  render({ sections, currentPath: '/settings/team/details' });
  expect(get('sectionTitle').textContent).toBe('Settings');
});

it('supports default and controlled sections and keyboard navigation without overriding the controlled value', () => {
  const changed = vi.fn();
  render({ sections, defaultSection: 'settings', onSectionChange: changed });
  expect(get('sectionTitle').textContent).toBe('Settings');

  act(() => get('section-home').click());

  expect(changed).toHaveBeenLastCalledWith('home');
  expect(get('sectionTitle').textContent).toBe('Home');
  render({
    sections,
    section: 'home',
    currentPath: '/settings/team',
    onSectionChange: changed,
  });

  act(() => get('section-settings').click());

  expect(changed).toHaveBeenLastCalledWith('settings');
  expect(get('sectionTitle').textContent).toBe('Home');

  act(() => {
    get('section-home').focus();
    get('section-home').dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
  });

  expect(document.activeElement).toBe(get('section-settings'));

  act(() =>
    get('section-settings').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }),
    ),
  );

  expect(document.activeElement).toBe(get('section-home'));
});

it('keeps the rail, logo and footer when collapsed, forwards classes/ref and previews the panel', () => {
  const ref = createRef<HTMLElement>();
  render({
    ref,
    sections,
    defaultCollapsed: true,
    expandOnHover: true,
    tone: 'brand',
    itemVariant: 'solid',
    variant: 'floating',
    header: { title: 'Lorem ipsum', logo: <HomeIcon /> },
    footer: <button>Account</button>,
    className: 'custom-root',
    classNames: {
      sectionRail: 'custom-rail',
      sectionPanel: 'custom-panel',
      sectionTitle: 'custom-title',
      section: 'custom-section',
    },
  });
  expect(ref.current).toBe(get());
  expect(get().classList.contains('custom-root')).toBe(true);
  expect(get('sectionRail').classList.contains('custom-rail')).toBe(true);
  expect(get('sectionPanel').hidden).toBe(true);
  expect(get('brandLogo')).not.toBeNull();
  expect(get('footer').textContent).toBe('Account');
  expect(get('section-home').classList.contains('custom-section')).toBe(true);
  expect(get('section-home').getAttribute('aria-controls')).toBe(
    get('sectionPanel').id,
  );

  act(() => get('section-home').focus());

  expect(get('sectionPanel').hidden).toBe(false);
  expect(get('sectionPanel').classList.contains('custom-panel')).toBe(true);

  act(() => get('toggle').click());

  expect(get().dataset.collapsed).toBe('false');
});

it('shows mobile section buttons and items, switches sections, and dismisses on navigation', async () => {
  render({ sections, defaultCollapsed: true, currentPath: '/settings/team' });
  await act(async () => get('drawer-trigger').click());
  expect(get('drawer').getAttribute('role')).toBe('dialog');
  expect(get('drawer-section-settings').getAttribute('aria-pressed')).toBe('true');
  expect(get('drawer-section-settings').textContent).toContain('Settings');
  expect(get('drawer').querySelector('[aria-current="page"]')?.textContent).toBe(
    'Members',
  );

  act(() => get('drawer-section-home').click());

  expect(get('drawer-sectionTitle').textContent).toBe('Home');
  expect(get('drawer')).not.toBeNull();
  const ids = Array.from(document.querySelectorAll('[data-testid]')).map((node) =>
    node.getAttribute('data-testid'),
  );
  expect(new Set(ids).size).toBe(ids.length);
  await act(async () => {
    get('drawer-item-home').addEventListener('click', (event) =>
      event.preventDefault(),
    );

    get('drawer-item-home').click();
  });
  expect(get('drawer')).toBeNull();
});

it('preserves keyboard focus during preview without a consumer test ID', () => {
  act(() =>
    root.render(<Sidebar defaultCollapsed expandOnHover items={sections[0]!.items} />),
  );

  const link = host.querySelector<HTMLElement>('aside a[href="/"]')!;

  act(() => link.focus());

  expect(host.querySelector('aside')?.getAttribute('data-hover-expanded')).toBe('true');
  expect(document.activeElement).toBe(host.querySelector('aside a[href="/"]'));
});

it('filters section items before deriving the active section and prefers the deepest route', () => {
  const navigation = [
    {
      id: 'parent',
      label: 'Parent',
      icon: HomeIcon,
      items: [{ id: 'parent', label: 'Parent page', href: '/settings' }],
    },
    ...sections,
    {
      id: 'private',
      label: 'Private',
      icon: HomeIcon,
      items: [
        {
          id: 'private',
          label: 'Private page',
          href: '/settings/team/private',
          access: 'private',
        },
      ],
    },
  ];
  render({
    sections: navigation,
    currentPath: '/settings/team/private',
    canAccess: () => false,
    defaultSection: 'home',
  });
  expect(get('section-settings').getAttribute('aria-pressed')).toBe('true');
  expect(host.textContent).not.toContain('Private page');
});

it('cancels pending previews when disabled or unmounted', () => {
  vi.useFakeTimers();
  render({ defaultCollapsed: true, expandOnHover: true });
  pointer('pointerover');
  render({ defaultCollapsed: true, expandOnHover: false });
  advance(300);
  expect(get().dataset.hoverExpanded).toBe('false');
  render({ defaultCollapsed: true, expandOnHover: true });
  pointer('pointerover');

  act(() => root.render(null));

  expect(vi.getTimerCount()).toBe(0);
});

it('dismisses a pointer preview with Escape while keeping outside focus', () => {
  vi.useFakeTimers();
  render({ defaultCollapsed: true, expandOnHover: true });
  const outside = document.createElement('button');
  host.append(outside);
  outside.focus();
  pointer('pointerover');
  advance(150);
  expect(get().dataset.hoverExpanded).toBe('true');

  act(() =>
    outside.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    ),
  );

  expect(get().dataset.hoverExpanded).toBe('false');
  expect(document.activeElement).toBe(outside);
});

it('cancels closing when the pointer returns and honors caller event cancellation', () => {
  vi.useFakeTimers();
  render({ defaultCollapsed: true, expandOnHover: true });
  pointer('pointerover');
  advance(150);
  pointer('pointerout');
  advance(200);
  pointer('pointerover');
  advance(250);
  expect(get().dataset.hoverExpanded).toBe('true');
  render({
    defaultCollapsed: true,
    expandOnHover: true,
    onKeyDown: (event) => event.preventDefault(),
  });

  act(() =>
    get().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    ),
  );

  expect(get().dataset.hoverExpanded).toBe('true');
});

it('keeps section focus in the rail when the panel collapses', () => {
  render({ sections, currentPath: '/settings/team' });

  act(() => get('group-group-submenu-team-item-members').focus());

  render({ sections, currentPath: '/settings/team', collapsed: true });
  expect(get('sectionPanel').hidden).toBe(true);
  expect(document.activeElement).toBe(get('toggle'));
});

it('uses custom route matching for section derivation', () => {
  render({ sections, isActive: (item) => item.id === 'members' });
  expect(get('sectionTitle').textContent).toBe('Settings');
});
