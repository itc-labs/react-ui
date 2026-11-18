// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Badge } from '../../components/badge';
import { IconButton } from '../../components/icon-button';
import { BellIcon } from '../../components/icon/outline/bell';
import { TopLoaderProvider, useTopLoader } from '../../components/top-loader';
import { DashboardShell } from './index';

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

/**
 * Shell interactions and widgets with local state must not re-render the page. These cases
 * guard against state being lifted into the shell (or a context the page reads).
 */
it('keeps the page from re-rendering on shell, notification and progress updates', async () => {
  let pageRenders = 0;

  let bump = () => {};

  let progress: ReturnType<typeof useTopLoader> | undefined;

  function Page() {
    pageRenders += 1;

    return <p>Page</p>;
  }

  function Bell() {
    const [count, setCount] = useState(0);
    bump = () => setCount((value) => value + 1);

    return (
      <Badge count={count} label={`${count} unread`}>
        <IconButton icon={BellIcon} label="Notifications" />
      </Badge>
    );
  }

  function ProgressHandle() {
    progress = useTopLoader();

    return null;
  }

  await act(async () =>
    root.render(
      <TopLoaderProvider client={null} delay={0} trickle={false}>
        <ProgressHandle />
        <DashboardShell
          sidebar={{ items: [{ id: 'home', label: 'Home', href: '/' }] }}
          header="Overview"
          headerActions={<Bell />}
          account={{ name: 'Olivia Martin', items: [] }}
        >
          <Page />
        </DashboardShell>
      </TopLoaderProvider>,
    ),
  );
  const initial = pageRenders;

  // Desktop collapse and expand.
  const toggle = host.querySelector<HTMLButtonElement>('[data-sidebar-toggle]')!;
  await act(async () => toggle.click());
  await act(async () => toggle.click());
  // Mobile drawer from the header menu button.
  await act(async () =>
    host
      .querySelector<HTMLButtonElement>('header button[aria-haspopup="dialog"]')!
      .click(),
  );
  // A new notification increments the bell badge.
  await act(async () => bump());
  await act(async () => bump());
  expect(host.textContent).toContain('2');
  // Top progress updates.
  await act(async () => progress!.start());
  await act(async () => progress!.set(0.6));
  await act(async () => progress!.done());

  expect(pageRenders).toBe(initial);
});
