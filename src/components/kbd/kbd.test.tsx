// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { Kbd, type KbdProps } from './index';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function example(props: KbdProps) {
  return (
    <UILocaleProvider locale="en-US">
      <Kbd {...props} />
    </UILocaleProvider>
  );
}

function render(props: KbdProps) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(example(props));

  return host;
}

it('renders a single native key cap with size and localized spoken symbol names', () => {
  const host = render({ children: '⌘', size: 'sm' });
  expect(host.firstElementChild?.tagName).toBe('KBD');
  expect(host.firstElementChild?.getAttribute('role')).toBe('img');
  expect(host.firstElementChild?.getAttribute('aria-label')).toBe('Command');
  expect(host.textContent).toBe('⌘');
  expect(host.querySelector('kbd kbd')).toBeNull();
  expect(host.innerHTML).toContain('min-h-5');
  expect(host.innerHTML).not.toContain('data-testid');
  expect(render({ children: 'K' }).innerHTML).toContain('min-h-6');
});

it('nests key caps and uses default or caller separators with one spoken combination', () => {
  const mac = render({ keys: ['⌘', 'K'] });
  expect(mac.querySelectorAll('kbd > kbd')).toHaveLength(2);
  expect(mac.firstElementChild?.getAttribute('aria-label')).toBe('Command K');
  expect(mac.textContent).toBe('⌘K');
  const pc = render({ keys: ['Ctrl', 'Shift', 'P'], 'data-testid': 'shortcut' });
  expect(pc.textContent).toBe('Ctrl+Shift+P');
  expect(pc.firstElementChild?.getAttribute('aria-label')).toBe('Control Shift P');
  expect(pc.querySelectorAll('kbd > kbd[aria-hidden="true"]')).toHaveLength(3);
  expect(pc.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(2);
  expect(render({ keys: ['A', 'B'], separator: '/' }).textContent).toBe('A/B');
  expect(render({ keys: ['A', 'B'], separator: null }).textContent).toBe('AB');
  expect(render({ keys: [], children: 'K' }).textContent).toBe('');
});

it.each(['MacIntel', 'iPhone', 'iPad', 'Win32', 'Linux x86_64'])(
  'hydrates with a Ctrl fallback before detecting %s',
  async (platform) => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue(platform);
    const props = { keys: ['mod', 'alt', 'shift', 'enter'], platformAware: true };
    const host = document.createElement('div');
    host.innerHTML = renderToString(example(props));
    expect(host.textContent).toBe('Ctrl+Alt+Shift+Enter');
    const recoverable = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(host, example(props), { onRecoverableError: recoverable });
      });
      const apple = /Mac|iPhone|iPad/.test(platform);
      expect(host.textContent).toBe(apple ? '⌘⌥⇧↵' : 'Ctrl+Alt+Shift+Enter');
      expect(host.firstElementChild?.getAttribute('aria-label')).toBe(
        apple ? 'Command Alt Shift Enter' : 'Control Alt Shift Enter',
      );
      expect(recoverable).not.toHaveBeenCalled();
    } finally {
      act(() => root?.unmount());

      vi.restoreAllMocks();
    }
  },
);

it('localizes accessible names, honors explicit names, and leaves unrecognized input intact', () => {
  const html = renderToStaticMarkup(
    <UILocaleProvider locale="vi-VN" messages={{ 'kbd.command': 'Phím Command' }}>
      <Kbd keys={['⌘', 'K']} />
    </UILocaleProvider>,
  );
  expect(html).toContain('aria-label="Phím Command K"');
  expect(render({ keys: ['⌘', 'K'], 'aria-label': 'Open search' }).innerHTML).toContain(
    'aria-label="Open search"',
  );
  expect(render({ keys: ['mod', 'alt'] }).textContent).toBe('mod+alt');
  expect(render({ keys: ['F12', 'Escape', 'constructor'] }).textContent).toBe(
    'F12+Escape+constructor',
  );
});

it('forwards native props and ref, supports caller keyboard events, merges slots and rerenders keys', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const ref = createRef<HTMLElement>();
  const onKeyDown = vi.fn();
  try {
    act(() =>
      root.render(
        example({
          ref,
          keys: ['Ctrl', 'K'],
          'data-testid': 'shortcut',
          tabIndex: 0,
          onKeyDown,
          className: 'gap-3',
          classNames: { root: 'gap-2', key: 'bg-brand-50', separator: 'text-ink' },
        }),
      ),
    );

    expect(ref.current).toBe(host.firstElementChild);
    expect(ref.current?.className).toContain('gap-3');
    expect(ref.current?.className).not.toContain('gap-2');
    expect(ref.current?.className).toContain('focus-visible:outline-focus');
    expect(host.querySelector('[data-testid="shortcut-key-0"]')?.className).toContain(
      'bg-brand-50',
    );
    expect(
      host.querySelector('[data-testid="shortcut-key-0"]')?.className,
    ).not.toContain('bg-surface');
    expect(
      host.querySelector('[data-testid="shortcut-separator-1"]')?.className,
    ).toContain('text-ink');
    expect(host.innerHTML).not.toMatch(/classNames=|platformAware=|keys=/);

    act(() => {
      ref.current!.focus();
      ref.current!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
    });

    expect(document.activeElement).toBe(ref.current);
    expect(onKeyDown).toHaveBeenCalledOnce();

    act(() => root.render(example({ keys: ['A', 'B'], size: 'sm' })));

    expect(host.textContent).toBe('A+B');
    expect(host.firstElementChild?.hasAttribute('tabindex')).toBe(false);
  } finally {
    act(() => root.unmount());

    host.remove();
  }
});
