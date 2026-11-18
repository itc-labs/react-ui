// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Sidebar } from '../../modules/sidebar';
import { DashboardShell } from '../dashboard-shell';
import { WorkspaceShell } from './index';

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

it('soft shell keeps a flat page, a rounded sidebar edge and a borderless header', async () => {
  await act(async () =>
    root.render(
      <WorkspaceShell
        variant="soft"
        sidebar={<Sidebar items={items} />}
        header="Lorem"
        content="Ipsum"
      />,
    ),
  );
  const shell = host.firstElementChild!;
  expect(shell.getAttribute('data-variant')).toBe('soft');
  expect(shell.className).toContain('bg-surface');
  expect(shell.className).toContain('[&>aside]:border-e');
  expect(shell.className).toContain('lg:[&>aside]:rounded-e-2xl');
  expect(host.querySelector('header')!.className).toContain(
    'group-data-[variant=soft]/shell:border-b-0',
  );
});

it('floating headers sit on the page surface without a rule', async () => {
  await act(async () =>
    root.render(
      <DashboardShell
        variant="floating"
        sidebar={{ items }}
        account={{ name: 'Lorem Ipsum', items: [] }}
      >
        Ipsum
      </DashboardShell>,
    ),
  );
  const header = host.querySelector('header')!;
  expect(header.className).toContain('bg-canvas');
  expect(header.className).not.toContain('bg-surface');
  expect(header.className).toContain(
    'lg:group-data-[variant=floating]/shell:border-b-0',
  );
});

it('soft dashboard defaults the sidebar to soft tone and pill items, overridable per sidebar', async () => {
  const render = (sidebar: Parameters<typeof DashboardShell>[0]['sidebar']) =>
    root.render(
      <DashboardShell
        variant="soft"
        sidebar={sidebar}
        account={{ name: 'Lorem Ipsum', items: [] }}
      >
        Ipsum
      </DashboardShell>,
    );

  await act(async () => render({ items }));
  let aside = host.querySelector('aside')!;
  expect(aside.dataset.tone).toBe('soft');
  expect(aside.dataset.itemVariant).toBe('pill');
  expect(aside.dataset.variant).toBe('sidebar');
  expect(host.querySelector('header')!.className).toContain('bg-surface');

  await act(async () => render({ items, tone: 'dark', itemVariant: 'raised' }));
  aside = host.querySelector('aside')!;
  expect(aside.dataset.tone).toBe('dark');
  expect(aside.dataset.itemVariant).toBe('raised');
});
