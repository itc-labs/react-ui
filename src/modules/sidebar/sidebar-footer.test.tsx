// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Sidebar, SidebarMobileTrigger, SidebarProvider } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.unstubAllGlobals();
});

const byId = (id: string) =>
  host.querySelector<HTMLElement>(`[data-testid="side${id ? `-${id}` : ''}"]`);

it('pins footer items in a secondary nav and keeps a single current page', async () => {
  await act(async () =>
    root.render(
      <Sidebar
        data-testid="side"
        currentPath="/settings"
        items={[{ id: 'home', label: 'Home', href: '/' }]}
        footerItems={[
          { id: 'settings', label: 'Settings', href: '/settings' },
          { id: 'hidden', label: 'Hidden', href: '/hidden', access: 'admin' },
        ]}
        canAccess={(access) => access !== 'admin'}
      />,
    ),
  );
  const footerNav = byId('footerNav')!;
  expect(footerNav.tagName).toBe('NAV');
  expect(footerNav.getAttribute('aria-label')).toBe('Điều hướng phụ');
  expect(footerNav.textContent).toContain('Settings');
  expect(footerNav.textContent).not.toContain('Hidden');
  const current = host.querySelectorAll('aside [aria-current="page"]');
  expect(current).toHaveLength(1);
  expect(current[0]!.textContent).toBe('Settings');
});

it('renders the account menu and hides its details in the collapsed rail', async () => {
  const account = { name: 'Lorem Ipsum', description: 'lorem@example.com', items: [] };
  await act(async () =>
    root.render(
      <Sidebar data-testid="side" items={[]} account={account} tone="dark" />,
    ),
  );
  const trigger = host
    .querySelector('[data-testid="side-account-details"]')!
    .closest('button')!;
  expect(host.querySelector('aside')!.textContent).toContain('Lorem Ipsum');
  expect(trigger.className).toContain('text-[var(--sidebar-fg)]');
  expect(
    host.querySelector('[data-testid="side-account-details"]')!.className,
  ).not.toContain('sr-only');
  await act(async () =>
    root.render(<Sidebar data-testid="side" items={[]} account={account} collapsed />),
  );
  expect(
    host.querySelector('[data-testid="side-account-details"]')!.className,
  ).toContain('sr-only');
  expect(
    host.querySelector('[data-testid="side-account-chevron"]')!.getAttribute('class'),
  ).toContain('hidden');
});

it('lets a header SidebarMobileTrigger open the drawer when the built-in trigger is off', async () => {
  await act(async () =>
    root.render(
      <SidebarProvider>
        <SidebarMobileTrigger data-testid="header-menu" />
        <Sidebar
          data-testid="side"
          mobileTrigger={false}
          items={[{ id: 'home', label: 'Home', href: '/' }]}
        />
      </SidebarProvider>,
    ),
  );
  expect(host.querySelector('.p-3.lg\\:hidden')).toBeNull();
  const trigger = host.querySelector<HTMLButtonElement>('[data-testid="header-menu"]')!;
  expect(trigger.className).toContain('lg:hidden');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  await act(async () => trigger.click());
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
});

it('disables SidebarMobileTrigger outside a provider', async () => {
  await act(async () => root.render(<SidebarMobileTrigger data-testid="lonely" />));
  expect(
    host.querySelector<HTMLButtonElement>('[data-testid="lonely"]')!.disabled,
  ).toBe(true);
});
