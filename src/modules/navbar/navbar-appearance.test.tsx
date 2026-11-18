// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  navbarAppearances,
  navbarIndicatorClass,
  navbarItemClasses,
  resolveNavbarAppearance,
} from './appearance';
import { Navbar } from './index';
import type { NavbarProps } from './types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

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

it('resolves every preset and allows independent explicit overrides', () => {
  expect(resolveNavbarAppearance({})).toEqual({
    tone: 'default',
    itemVariant: 'underline',
    density: 'default',
    floating: false,
  });
  expect(resolveNavbarAppearance({ appearance: 'floating' })).toEqual({
    tone: 'default',
    itemVariant: 'pill',
    density: 'compact',
    floating: true,
  });
  for (const appearance of Object.keys(navbarAppearances) as Array<
    keyof typeof navbarAppearances
  >) {
    expect(resolveNavbarAppearance({ appearance })).toEqual(
      navbarAppearances[appearance],
    );
    expect(
      resolveNavbarAppearance({
        appearance,
        tone: 'brand',
        itemVariant: 'underline',
        density: 'comfortable',
      }),
    ).toEqual({
      tone: 'brand',
      itemVariant: 'underline',
      density: 'comfortable',
      floating: appearance === 'floating',
    });
  }
});

it('keeps activeIndicator as an alias with itemVariant taking precedence', () => {
  expect(resolveNavbarAppearance({ activeIndicator: 'pill' }).itemVariant).toBe('pill');
  expect(
    resolveNavbarAppearance({ appearance: 'floating', activeIndicator: 'underline' })
      .itemVariant,
  ).toBe('underline');
  expect(
    resolveNavbarAppearance({ itemVariant: 'ghost', activeIndicator: 'pill' })
      .itemVariant,
  ).toBe('ghost');
});

it('uses tone variables for active pills and reserves the indicator for underline', () => {
  const pill = navbarItemClasses('pill', 'compact', true);
  expect(pill).toContain('rounded-full');
  expect(pill).toContain('bg-[var(--navbar-active-bg)]');
  expect(pill).toContain('text-[var(--navbar-active-fg)]');
  expect(navbarItemClasses('pill', 'default', false)).toContain(
    'hover:bg-[var(--navbar-hover)]',
  );
  expect(navbarItemClasses('underline', 'comfortable', true)).toContain(
    'text-[var(--navbar-accent',
  );
  expect(navbarIndicatorClass('underline')).toContain('--navbar-accent');
  for (const variant of ['pill', 'solid', 'ghost'] as const)
    expect(navbarIndicatorClass(variant)).toBeNull();
});

it.each(['start', 'center', 'split'] as const)(
  'marks the %s layout while preserving navigation, actions and mobile trigger',
  async (align) => {
    await act(async () =>
      root.render(
        <Navbar
          items={[{ id: 'home', label: 'Home', href: '/' }]}
          brand="Nodus"
          actions={<button>Workspace</button>}
          align={align}
          appearance="floating"
          tone="dark"
          data-testid="navbar"
        />,
      ),
    );
    const header = host.querySelector('header')!;
    expect(header.dataset.navbarAlign).toBe(align);
    expect(header.dataset.navbarTone).toBe('dark');
    expect(header.dataset.navbarDensity).toBe('compact');
    expect(header.dataset.itemVariant).toBe('pill');
    expect(header.dataset.navbarFloating).toBe('true');
    expect(host.querySelector('[data-testid="navbar-nav"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="navbar-mobileTrigger"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="navbar-actions"]')?.textContent).toBe(
      'Workspace',
    );
    expect(header.hasAttribute('appearance')).toBe(false);
    expect(header.hasAttribute('align')).toBe(false);
  },
);

it('renders the topbar before the main bar and keeps the secondary slot below it', async () => {
  const render = (props: Partial<NavbarProps>) =>
    root.render(<Navbar items={[]} data-testid="navbar" {...props} />);

  await act(async () =>
    render({
      topbar: <span>Delivery in 24h | Free delivery from $500</span>,
      secondary: <button>Choose the category</button>,
      classNames: { topbar: 'custom-topbar' },
    }),
  );
  const header = host.querySelector('header')!;
  expect(
    Array.from(header.children, (element) => element.getAttribute('data-testid')),
  ).toEqual(['navbar-topbar', 'navbar-inner', 'navbar-secondary']);
  expect(header.firstElementChild?.textContent).toContain('Delivery in 24h');
  expect(header.firstElementChild?.classList.contains('custom-topbar')).toBe(true);
  await act(async () => render({}));
  expect(host.querySelector('[data-testid="navbar-topbar"]')).toBeNull();
  expect(header.dataset.navbarTone).toBe('default');
});
