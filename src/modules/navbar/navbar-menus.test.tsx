// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { userEvent } from 'storybook/test';
import { Navbar, type NavbarItem } from './index';

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

const byId = (id: string) =>
  document.querySelector<HTMLElement>(`[data-testid="navbar-${id}"]`);

const items: NavbarItem[] = [
  {
    id: 'products',
    type: 'dropdown',
    label: 'Products',
    children: [
      { id: 'overview', label: 'Overview', href: '/products' },
      {
        id: 'tools',
        type: 'dropdown',
        label: 'Tools',
        children: [
          { id: 'drills', label: 'Drills', href: '/products/tools/drills' },
          {
            id: 'garden',
            type: 'dropdown',
            label: 'Garden',
            children: [{ id: 'mowers', label: 'Mowers', href: '/garden/mowers' }],
          },
        ],
      },
    ],
  },
  {
    id: 'men',
    type: 'mega',
    label: 'Men',
    featured: {
      id: 'trending',
      title: 'New & Trending',
      items: [{ id: 'arrivals', label: 'New Arrivals', href: '/men/new' }],
    },
    sections: [
      {
        id: 'shoes',
        title: 'Shoes',
        items: [{ id: 'running', label: 'Running', href: '/men/shoes/running' }],
        more: { id: 'all-shoes', label: 'Show all', href: '/men/shoes' },
      },
      {
        id: 'clothing',
        title: 'Clothing',
        items: [{ id: 'hoodies', label: 'Hoodies', href: '/men/hoodies' }],
      },
    ],
    footer: [{ id: 'all-men', label: "All Men's", href: '/men' }],
  },
  {
    id: 'shop',
    type: 'mega',
    layout: 'categories',
    label: 'Choose the category',
    categories: [
      {
        id: 'construction',
        label: 'Construction',
        action: { id: 'all-construction', label: 'Show all products', href: '/c' },
        sections: [
          {
            id: 'paving',
            title: 'Paving tools',
            items: [{ id: 'grabs', label: 'Grabs', href: '/c/grabs' }],
          },
        ],
      },
      {
        id: 'power',
        label: 'Power Tools',
        sections: [
          {
            id: 'drills-section',
            title: 'Drills',
            items: [{ id: 'cordless', label: 'Cordless', href: '/p/cordless' }],
          },
        ],
      },
    ],
  },
];

const render = (currentPath = '/') =>
  act(async () =>
    root.render(
      <Navbar items={items} currentPath={currentPath} data-testid="navbar" />,
    ),
  );

const openTrigger = (id: string) =>
  act(async () => {
    byId(`${id}-trigger`)!.focus();
    await userEvent.setup({ document }).keyboard('{Enter}');
  });

it('opens nested dropdowns to the side with the keyboard and closes one level at a time', async () => {
  await render();
  await openTrigger('item-products');

  const tools = byId('item-products-item-tools-trigger')!;

  await act(async () => {
    tools.focus();
    await userEvent.setup({ document }).keyboard('{ArrowRight}');
  });

  expect(tools.getAttribute('aria-expanded')).toBe('true');
  expect(byId('item-products-item-tools-item-garden-trigger')).not.toBeNull();
  // Focus moves into the side panel on the next frame.
  await act(async () => new Promise((resolve) => setTimeout(resolve, 50)));

  await act(async () => {
    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
  });
  expect(tools.getAttribute('aria-expanded')).toBe('false');
  // Only the side panel closed; the top-level dropdown stays open.
  expect(byId('item-products-content')).not.toBeNull();
  expect(document.activeElement).toBe(tools);
});

it('marks a deeply nested page active on its top-level item', async () => {
  await render('/garden/mowers');

  expect(byId('item-products-trigger')!.dataset.active).toBe('true');
});

it('lays out a mega panel with a featured column, sections, show-all and footer links', async () => {
  await render('/men');
  await openTrigger('item-men');

  expect(byId('item-men-trigger')!.dataset.active).toBe('true');
  expect(byId('item-men-section-trending')).not.toBeNull();
  expect(byId('item-men-section-shoes-item-all-shoes-link')!.getAttribute('href')).toBe(
    '/men/shoes',
  );
  expect(byId('item-men-footer-item-all-men-link')!.getAttribute('aria-current')).toBe(
    'page',
  );
});

it('switches the category panel on focus and shows the category action', async () => {
  await render();
  await openTrigger('item-shop');

  expect(byId('item-shop-panel-construction')).not.toBeNull();
  expect(byId('item-shop-action-all-construction')!.textContent).toContain(
    'Show all products',
  );

  await act(async () => byId('item-shop-category-power')!.focus());

  expect(byId('item-shop-panel-power')).not.toBeNull();
  expect(document.body.textContent).toContain('Cordless');
});

it('drills into levels in the mobile drawer and goes back', async () => {
  await render();
  await act(async () => byId('mobileTrigger')!.click());
  await act(async () => byId('drawer-item-products-trigger')!.click());
  await act(async () => byId('drawer-item-products-item-tools-trigger')!.click());

  expect(byId('drawer-item-products-item-tools-item-drills-link')).not.toBeNull();
  expect(byId('drawer-back')!.textContent).toContain('Products');

  await act(async () => byId('drawer-back')!.click());

  expect(byId('drawer-item-products-item-tools-trigger')).not.toBeNull();
});

it('opens the mobile drawer on the current page branch', async () => {
  await render('/p/cordless');
  await act(async () => byId('mobileTrigger')!.click());

  expect(
    byId(
      'drawer-item-shop-item-power-section-drills-section-item-cordless-link',
    )!.getAttribute('aria-current'),
  ).toBe('page');
});
