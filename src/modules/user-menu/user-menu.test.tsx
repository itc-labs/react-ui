// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent } from 'storybook/test';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { UserMenu } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
});

it('forwards the trigger ref and opens and selects an item by keyboard with a localized accessible name', async () => {
  const ref = createRef<HTMLButtonElement>();
  const onSelect = vi.fn();
  await act(async () =>
    root.render(
      <UILocaleProvider locale="en-US">
        <UserMenu
          name="Lorem Ipsum"
          ref={ref}
          items={[{ id: 'profile', label: 'Profile', onSelect }]}
          data-testid="account"
          header={<span>user@example.com</span>}
        />
      </UILocaleProvider>,
    ),
  );
  expect(ref.current).toBe(host.querySelector('button'));
  expect(ref.current?.getAttribute('aria-label')).toBe(
    'Open user menu for Lorem Ipsum',
  );
  await act(async () => {
    ref.current!.focus();
    await userEvent.setup({ document }).keyboard('{Enter}');
  });
  expect(ref.current?.getAttribute('aria-expanded')).toBe('true');
  expect(
    document.querySelector('[data-testid="account-header"]')?.textContent,
  ).toContain('user@example.com');
  const item = document.querySelector<HTMLElement>('[role="menuitem"]')!;
  await act(async () => {
    item.focus();
    await userEvent.setup({ document }).keyboard('{Enter}');
  });
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(ref.current?.getAttribute('aria-expanded')).toBe('false');
});

it('supports compact mode, caller classes and text overrides without implicit test IDs', async () => {
  await act(async () =>
    root.render(
      <UserMenu
        name="Lorem"
        description="Ipsum"
        compact
        label="Account"
        items={[]}
        className="border-accent"
        classNames={{ name: 'custom-name' }}
      />,
    ),
  );
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('Account');
  expect(host.querySelector('button')?.classList.contains('border-accent')).toBe(true);
  expect(
    host.querySelector('.custom-name')?.parentElement?.classList.contains('hidden'),
  ).toBe(true);
  expect(document.querySelector('[data-testid]')).toBeNull();
});
