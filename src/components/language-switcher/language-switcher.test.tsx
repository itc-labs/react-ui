// @vitest-environment jsdom
import { act, createRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { userEvent, within } from 'storybook/test';
import { UIProvider } from '../../theme/provider';
import { LanguageSwitcher } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const options = [
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
  { value: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'ja-JP', label: '日本語', flag: '🇯🇵', disabled: true },
];

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
});

it('toggles two languages with host-owned locale and forwards the trigger ref', async () => {
  const ref = createRef<HTMLButtonElement>();

  function Example() {
    const [value, setValue] = useState('en-US');

    return (
      <UIProvider locale={value}>
        <LanguageSwitcher
          mode="toggle"
          ref={ref}
          value={value}
          options={options.slice(0, 2)}
          onValueChange={setValue}
          data-testid="locale"
        />
      </UIProvider>
    );
  }

  act(() => root.render(<Example />));

  expect(ref.current).toBe(
    within(host).getByRole('button', { name: 'Switch to Tiếng Việt' }),
  );
  await act(async () => {
    await userEvent.click(ref.current!);
  });
  expect(ref.current?.textContent).toContain('Tiếng Việt');
  expect(ref.current?.getAttribute('aria-label')).toBe('Chuyển sang English');
  await act(async () => {
    await userEvent.click(ref.current!);
  });
  expect(ref.current?.textContent).toContain('English');
});

it('uses a keyboard radio menu for multiple languages, skips disabled items and restores focus', async () => {
  const change = vi.fn();

  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <LanguageSwitcher
          options={options}
          value="en-US"
          onValueChange={change}
          data-testid="locale"
        />
      </UIProvider>,
    ),
  );

  const trigger = within(host).getByRole('button', { name: 'Language' });
  await act(async () => {
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
  });
  const english = within(document.body).getByRole('menuitemradio', { name: 'English' });
  expect(english.getAttribute('aria-checked')).toBe('true');
  expect(
    within(document.body)
      .getByRole('menuitemradio', { name: '日本語' })
      .getAttribute('data-disabled'),
  ).not.toBeNull();
  await act(async () => {
    await userEvent.keyboard('{End}{Enter}');
  });
  expect(change).toHaveBeenCalledExactlyOnceWith('vi-VN');
  expect(document.activeElement).toBe(trigger);
});

it('disables a direct toggle when no different enabled option exists', () => {
  const change = vi.fn();

  act(() =>
    root.render(
      <LanguageSwitcher
        mode="toggle"
        options={[options[0]!, { ...options[1]!, disabled: true }]}
        value="en-US"
        onValueChange={change}
      />,
    ),
  );

  expect(within(host).getByRole<HTMLButtonElement>('button').disabled).toBe(true);
  expect(change).not.toHaveBeenCalled();
});

it('shows two languages as a segmented choice by default, supports arrow navigation and prevents disabled selection', async () => {
  function Example() {
    const [value, setValue] = useState('en-US');

    return (
      <UIProvider locale={value}>
        <LanguageSwitcher
          options={options.slice(0, 2)}
          value={value}
          onValueChange={setValue}
          data-testid="languages"
        />
      </UIProvider>
    );
  }

  act(() => root.render(<Example />));

  const english = within(host).getByRole('radio', { name: 'English' });
  const vietnamese = within(host).getByRole('radio', { name: 'Tiếng Việt' });
  expect(english.getAttribute('aria-checked')).toBe('true');
  expect(english.textContent).toBe('en');
  expect(vietnamese.textContent).toBe('vi');
  expect(host.textContent).not.toContain('🇻🇳');
  await act(async () => {
    english.focus();
  });
  await act(async () => {
    await userEvent.keyboard('{ArrowRight>}');
    // Keep the key held until Radix has moved focus.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  await act(async () => {
    await userEvent.keyboard('{/ArrowRight}');
  });
  expect(vietnamese.getAttribute('aria-checked')).toBe('true');
  expect(document.activeElement).toBe(vietnamese);
  await act(async () => {
    await userEvent.click(english);
  });
  expect(english.getAttribute('aria-checked')).toBe('true');
  const change = vi.fn();

  act(() =>
    root.render(
      <LanguageSwitcher
        options={[options[0]!, { ...options[1]!, disabled: true }]}
        value="en-US"
        onValueChange={change}
      />,
    ),
  );

  await act(async () => {
    await userEvent.click(within(host).getByRole('radio', { name: 'Tiếng Việt' }));
  });
  expect(change).not.toHaveBeenCalled();
});
