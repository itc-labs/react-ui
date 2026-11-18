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

it('puts a full-width topbar above the sidebar and page, offsetting the sticky sidebar', async () => {
  await act(async () =>
    root.render(
      <WorkspaceShell
        topbar={<span data-testid="topbar-content">Lorem</span>}
        sidebar={<Sidebar items={items} />}
        content="Ipsum"
        classNames={{ topbar: 'custom-topbar', frame: 'custom-frame' }}
      />,
    ),
  );
  const shell = host.firstElementChild as HTMLElement;
  expect(shell.dataset.topbar).toBe('true');
  expect(shell.className).toContain('[--workspace-topbar-height:4rem]');
  const bar = shell.firstElementChild as HTMLElement;
  expect(bar.className).toContain('custom-topbar');
  expect(bar.querySelector('[data-testid="topbar-content"]')).not.toBeNull();
  const frame = bar.nextElementSibling as HTMLElement;
  expect(frame.className).toContain('custom-frame');
  expect(frame.className).toContain('lg:grid');
  expect(frame.querySelector(':scope > aside')).not.toBeNull();
  expect(host.querySelector('aside')!.className).toContain(
    'top-[var(--workspace-topbar-height,0px)]',
  );
});

it('keeps the original single-grid markup without a topbar', async () => {
  await act(async () =>
    root.render(<WorkspaceShell sidebar={<Sidebar items={items} />} content="Ipsum" />),
  );
  const shell = host.firstElementChild as HTMLElement;
  expect(shell.className).toContain('lg:grid');
  expect(shell.querySelector(':scope > aside')).not.toBeNull();
  expect(shell.className).not.toContain('max-w-workspace');
});

it('renders an aside column beside the page from xl', async () => {
  await act(async () =>
    root.render(
      <WorkspaceShell
        sidebar={<Sidebar items={items} />}
        content="Ipsum"
        aside={<p>Details</p>}
        classNames={{ aside: 'custom-aside' }}
      />,
    ),
  );
  const panel = host.querySelector<HTMLElement>('[data-workspace-aside]')!;
  expect(panel.tagName).toBe('ASIDE');
  expect(panel.textContent).toBe('Details');
  expect(panel.className).toContain('xl:block');
  expect(panel.className).toContain('w-[var(--container-aside)]');
  expect(panel.className).toContain('custom-aside');
  expect(panel.previousElementSibling!.tagName).toBe('MAIN');
});

it('lets a direct Sidebar follow the shell variant unless its props differ', async () => {
  const render = (variant: 'floating' | 'soft', props = {}) =>
    root.render(
      <WorkspaceShell
        variant={variant}
        sidebar={<Sidebar items={items} {...props} />}
        content="x"
      />,
    );

  await act(async () => render('floating'));
  expect(host.querySelector('aside')!.dataset.variant).toBe('floating');
  await act(async () => render('soft'));
  expect(host.querySelector('aside')!.dataset.appearance).toBe('soft');
  await act(async () => render('soft', { appearance: 'dark', variant: 'floating' }));
  expect(host.querySelector('aside')!.dataset.appearance).toBe('dark');
  expect(host.querySelector('aside')!.dataset.variant).toBe('floating');
});

it('dashboard header opens the drawer on mobile and places the account where asked', async () => {
  const account = { name: 'Lorem Ipsum', items: [] };
  await act(async () =>
    root.render(
      <DashboardShell sidebar={{ items }} account={account} header="Overview">
        Ipsum
      </DashboardShell>,
    ),
  );
  const header = host.querySelector('header')!;
  const trigger = header.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="dialog"]',
  )!;
  expect(trigger.className).toContain('lg:hidden');
  expect(trigger.disabled).toBe(false);
  expect(host.querySelector('.p-3.lg\\:hidden')).toBeNull();
  expect(header.textContent).toContain('Lorem Ipsum');

  await act(async () =>
    root.render(
      <DashboardShell sidebar={{ items }} account={account} accountPlacement="sidebar">
        Ipsum
      </DashboardShell>,
    ),
  );
  expect(host.querySelector('header')!.textContent).not.toContain('Lorem Ipsum');
  expect(host.querySelector('aside')!.textContent).toContain('Lorem Ipsum');

  await act(async () =>
    root.render(<DashboardShell sidebar={{ items }}>Ipsum</DashboardShell>),
  );
  expect(host.textContent).not.toContain('Lorem Ipsum');
});
