// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Divider, type DividerProps } from './index';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(props: DividerProps = {}) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<Divider {...props} />);

  return host;
}

it('defaults to a decorative horizontal line and exposes semantic orientation on request', () => {
  const decorative = render().firstElementChild!;
  expect(decorative.getAttribute('role')).toBe('none');
  expect(decorative.getAttribute('aria-hidden')).toBe('true');
  expect(decorative.hasAttribute('aria-orientation')).toBe(false);
  expect(decorative.hasAttribute('tabindex')).toBe(false);
  expect(decorative.querySelectorAll('span')).toHaveLength(1);
  expect(decorative.querySelector('[data-testid]')).toBeNull();
  for (const orientation of ['horizontal', 'vertical'] as const) {
    const separator = render({ orientation, decorative: false }).firstElementChild!;
    expect(separator.getAttribute('role')).toBe('separator');
    expect(separator.getAttribute('aria-orientation')).toBe(orientation);
    expect(separator.hasAttribute('aria-hidden')).toBe(false);
    if (orientation === 'vertical')
      expect(separator.className).toContain('self-stretch');
  }
});

it.each(['solid', 'dashed', 'dotted'] as const)(
  'renders %s borders on both sides of a label',
  (variant) => {
    const host = render({ variant, children: 'Lorem ipsum', 'data-testid': 'divider' });
    const lines = host.querySelectorAll(
      '[aria-hidden="true"] span[aria-hidden="true"]',
    );
    expect(lines).toHaveLength(2);
    for (const line of Array.from(lines))
      expect(line.className).toContain(`border-${variant}`);
    expect(host.querySelector('[data-testid="divider-label"]')?.textContent).toBe(
      'Lorem ipsum',
    );
  },
);

it.each(['start', 'end'] as const)('keeps a short %s line', (labelPosition) => {
  const host = render({ children: 0, labelPosition, 'data-testid': 'divider' });
  expect(
    host.querySelector(`[data-testid="divider-line-${labelPosition}"]`)?.className,
  ).toContain('basis-4');
  expect(host.querySelector('[data-testid="divider-label"]')?.textContent).toBe('0');
});

it('forwards refs and native props, merges slots after defaults, and updates props', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const ref = createRef<HTMLDivElement>();
  let pressed = '';
  try {
    act(() =>
      root.render(
        <Divider
          ref={ref}
          data-testid="divider"
          tabIndex={0}
          onKeyDown={(event) => {
            pressed = event.key;
          }}
          classNames={{ root: 'gap-6', line: 'border-brand-700', label: 'text-ink' }}
          className="gap-2"
        >
          Lorem
        </Divider>,
      ),
    );

    expect(ref.current).toBe(host.firstElementChild);
    expect(ref.current?.className).toContain('gap-2');
    expect(ref.current?.className).not.toContain('gap-6');
    expect(ref.current?.className).toContain('focus-visible:outline-focus');
    expect(
      host.querySelector('[data-testid="divider-line-start"]')?.className,
    ).toContain('border-brand-700');
    expect(
      host.querySelector('[data-testid="divider-label"]')?.className,
    ).not.toContain('text-muted');
    expect(host.innerHTML).not.toContain('classNames');

    act(() => {
      ref.current!.focus();
      ref.current!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
    });

    expect(document.activeElement).toBe(ref.current);
    expect(pressed).toBe('ArrowRight');

    act(() => root.render(<Divider decorative={false} orientation="vertical" />));

    expect(host.firstElementChild?.getAttribute('aria-orientation')).toBe('vertical');
    expect(host.querySelectorAll('span')).toHaveLength(1);
  } finally {
    act(() => root.unmount());

    host.remove();
  }
});
