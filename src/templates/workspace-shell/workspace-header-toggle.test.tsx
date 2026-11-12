// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent } from 'storybook/test';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Sidebar, SidebarProvider, SidebarTrigger } from '../../modules/sidebar';
import { UIProvider } from '../../theme/provider';
import { WorkspaceHeader, WorkspaceShell } from './index';

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

const items = [{ id: 'home', label: 'Home', href: '/' }];

function headerTrigger() {
  return host.querySelector<HTMLButtonElement>('header button[aria-controls]')!;
}

it('moves the desktop collapse toggle beside the breadcrumb and collapses the sidebar', async () => {
  await act(async () =>
    root.render(
      <UIProvider locale="en-US">
        <SidebarProvider>
          <WorkspaceShell
            sidebar={
              <Sidebar
                items={items}
                collapseToggle="none"
                toggleShortcut="mod+b"
                data-testid="nav"
              />
            }
            sidebarToggle
            header={<nav aria-label="Breadcrumb">Workspace / Current</nav>}
            content="Lorem ipsum"
          />
        </SidebarProvider>
      </UIProvider>,
    ),
  );

  const aside = host.querySelector('aside')!;
  const trigger = headerTrigger();
  expect(host.querySelector('[data-testid="nav-toggle"]')).toBeNull();
  expect(aside.querySelector('[data-sidebar-toggle]')).toBeNull();
  expect(trigger).toBeTruthy();
  expect(trigger.nextElementSibling?.textContent).toContain('Workspace / Current');
  expect(trigger.classList.contains('lg:inline-flex')).toBe(true);
  expect(trigger.classList.contains('hidden')).toBe(true);
  expect(trigger.getAttribute('aria-controls')).toBe(aside.id);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(trigger.getAttribute('aria-label')).toBe('Collapse sidebar');

  await act(async () => trigger.click());

  expect(aside.dataset.collapsed).toBe('true');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(trigger.getAttribute('aria-label')).toBe('Expand sidebar');

  // The Sidebar still owns the shortcut when its toggle lives in the header.
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true }),
    ),
  );

  expect(aside.dataset.collapsed).toBe('false');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');

  // Keyboard activation works like any button.
  trigger.focus();
  await act(async () => userEvent.keyboard('{Enter}'));

  expect(aside.dataset.collapsed).toBe('true');
  // Only one mobile drawer trigger remains.
  expect(host.querySelectorAll('.lg\\:hidden button')).toHaveLength(1);
});

it('keeps the in-sidebar toggle by default and accepts a custom header trigger', async () => {
  await act(async () =>
    root.render(
      <UIProvider locale="en-US">
        <SidebarProvider>
          <Sidebar items={items} data-testid="nav" />
          <WorkspaceHeader
            breadcrumb={<span>Current</span>}
            sidebarToggle={<SidebarTrigger tooltip="Toggle navigation" />}
          />
        </SidebarProvider>
      </UIProvider>,
    ),
  );

  const aside = host.querySelector('aside')!;
  expect(host.querySelector('[data-testid="nav-toggle"]')).toBeTruthy();
  const trigger = headerTrigger();
  expect(trigger.classList.contains('hidden')).toBe(false);

  await act(async () => trigger.click());

  expect(aside.dataset.collapsed).toBe('true');
  expect(
    host.querySelector('[data-testid="nav-toggle"]')!.getAttribute('aria-expanded'),
  ).toBe('false');
});

it('renders no toggle when sidebarToggle is omitted', async () => {
  await act(async () =>
    root.render(<WorkspaceHeader breadcrumb={<span>Current</span>} />),
  );

  expect(host.querySelector('header button')).toBeNull();
  expect(host.querySelector('header')!.firstElementChild?.tagName).toBe('SPAN');
});
