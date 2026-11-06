// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { userEvent, within } from 'storybook/test';
import { ThemeToggle, type ThemeMode } from './index';
import { UIProvider } from '../../theme/provider';

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

it('keeps button and switch in sync through host state without mutating document theme', async () => {
  const original = document.documentElement.getAttribute('data-theme');

  function Example() {
    const [value, setValue] = useState<ThemeMode>('light');

    return (
      <UIProvider locale="en-US">
        <ThemeToggle value={value} onValueChange={setValue} />
        <ThemeToggle appearance="switch" value={value} onValueChange={setValue} />
      </UIProvider>
    );
  }

  act(() => root.render(<Example />));

  await act(async () => {
    await userEvent.click(
      within(host).getByRole('button', { name: 'Switch to dark mode' }),
    );
  });
  expect(within(host).getByRole('switch').getAttribute('aria-checked')).toBe('true');
  expect(within(host).getByRole('button').getAttribute('aria-pressed')).toBe('true');
  await act(async () => {
    within(host).getByRole('switch').focus();
    await userEvent.keyboard(' ');
  });
  expect(within(host).getByRole('switch').getAttribute('aria-checked')).toBe('false');
  expect(document.documentElement.getAttribute('data-theme')).toBe(original);
});

it('supports explicit labels and prevents disabled changes', async () => {
  const change = vi.fn();

  act(() =>
    root.render(
      <ThemeToggle
        value="dark"
        appearance="button"
        onValueChange={change}
        label="Appearance"
        disabled
      />,
    ),
  );

  await act(async () => {
    await userEvent.click(within(host).getByRole('button', { name: 'Appearance' }));
  });
  expect(change).not.toHaveBeenCalled();
});

it('renders sun and moon switch artwork with a stateful thumb and an optional clickable label', async () => {
  function Example() {
    const [value, setValue] = useState<ThemeMode>('light');

    return (
      <ThemeToggle
        value={value}
        onValueChange={setValue}
        appearance="switch"
        label="Appearance"
        data-testid="theme"
      />
    );
  }

  act(() => root.render(<Example />));

  const control = within(host).getByRole('switch', { name: 'Appearance' });
  const thumb = within(host).getByTestId('theme-thumb');
  expect(control.querySelectorAll('svg')).toHaveLength(3);
  expect(thumb.getAttribute('data-state')).toBe('unchecked');
  expect(control.getAttribute('aria-checked')).toBe('false');
  await act(async () => {
    within(host).getByText('Appearance').click();
  });
  expect(control.getAttribute('aria-checked')).toBe('true');
  expect(thumb.getAttribute('data-state')).toBe('checked');
});
