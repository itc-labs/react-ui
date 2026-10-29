// @vitest-environment jsdom
import { act, createRef, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  createTopLoaderClient,
  TopLoaderProvider,
  useTopLoader,
  type TopLoaderProviderProps,
} from './index';
import { isTopLoaderNavigation } from './links';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let client: ReturnType<typeof createTopLoaderClient>;

function mount(props: TopLoaderProviderProps = {}) {
  act(() =>
    root.render(<TopLoaderProvider data-testid="loader" client={client} {...props} />),
  );
}

function advance(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}

function bar() {
  return host.querySelector<HTMLElement>('[data-testid="loader"]')!;
}

beforeEach(() => {
  vi.useFakeTimers();
  client = createTopLoaderClient();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('skips instant work and delays visible work without restarting repeated starts', () => {
  mount();

  act(() => client.start());

  advance(99);
  expect(bar().hidden).toBe(true);

  act(() => client.done());

  advance(1000);
  expect(bar().hidden).toBe(true);

  act(() => client.start());

  advance(50);

  act(() => client.start());

  advance(50);
  expect(bar().hidden).toBe(false);
});

it('trickles without completing, clamps set/inc and ignores invalid numbers', () => {
  mount({ trickleInterval: 200 });

  act(() => client.set(0.5));

  advance(200);
  expect(Number(bar().getAttribute('aria-valuenow'))).toBeGreaterThan(50);

  act(() => {
    client.set(NaN);
    client.inc(Infinity);
  });

  expect(Number(bar().getAttribute('aria-valuenow'))).toBeLessThan(100);

  act(() => client.inc(100));

  expect(bar().getAttribute('aria-valuenow')).toBe('99');
  advance(10000);
  expect(bar().dataset.state).toBe('loading');

  act(() => client.set(-3));

  expect(bar().getAttribute('aria-valuenow')).toBe('8');
});

it('completes with minimum visible time then fades and hides; repeated done is idempotent', () => {
  mount();

  act(() => client.start());

  advance(100);

  act(() => client.set(1));

  expect(bar().getAttribute('aria-valuenow')).toBe('100');
  advance(299);

  act(() => client.done());

  expect(bar().dataset.state).toBe('loading');
  advance(1);
  expect(bar().dataset.state).toBe('fading');
  advance(179);
  expect(bar().hidden).toBe(false);
  advance(1);
  expect(bar().hidden).toBe(true);
});

it('cancels old completion timers when restarted during fade', () => {
  mount({ delay: 0, minimumDuration: 0 });

  act(() => client.start());

  advance(0);

  act(() => client.done());

  advance(0);
  expect(bar().dataset.state).toBe('fading');

  act(() => client.start());

  advance(180);
  expect(bar().dataset.state).toBe('loading');
});

it('completes only on a changed host path, including query keys', () => {
  mount({ currentPath: '/first' });

  act(() => client.start());

  advance(100);
  mount({ currentPath: '/first' });
  expect(bar().getAttribute('aria-valuenow')).not.toBe('100');
  mount({ currentPath: '/first?q=1' });
  expect(bar().getAttribute('aria-valuenow')).toBe('100');
  advance(480);
  expect(bar().hidden).toBe(true);
});

it.each([
  ['https://example.invalid/other', {}, false],
  ['/other', {}, true],
  ['?q=1', {}, true],
  ['#section', {}, false],
  [window.location.href, {}, false],
  ['/other', { button: 1 }, false],
  ['/other', { ctrlKey: true }, false],
  ['/other', { metaKey: true }, false],
  ['/other', { altKey: true }, false],
  ['/other', { shiftKey: true }, false],
])('observes link %s with %o: %s', (href, init, expected) => {
  mount({ trackLinks: true });
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.innerHTML = '<span>Navigate</span>';
  host.append(anchor);

  anchor.addEventListener('click', (event) => event.preventDefault());

  act(() =>
    anchor.firstElementChild!.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, ...init }),
    ),
  );

  advance(100);
  expect(!bar().hidden).toBe(expected);
});

it.each(['target', 'download', 'base', 'cancelled', 'disabled'])(
  'ignores %s links',
  (kind) => {
    mount({ trackLinks: kind !== 'disabled' });
    const anchor = document.createElement('a');
    anchor.href = '/other';
    host.append(anchor);
    if (kind === 'target') anchor.target = '_blank';
    if (kind === 'download') anchor.setAttribute('download', '');
    const base = document.createElement('base');
    if (kind === 'base') {
      base.target = '_blank';
      document.head.append(base);
    }
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    if (kind === 'cancelled') event.preventDefault();

    anchor.addEventListener('click', (click) => click.preventDefault());

    try {
      act(() => anchor.dispatchEvent(event));

      advance(100);
      expect(bar().hidden).toBe(true);
    } finally {
      base.remove();
    }
  },
);

it('ignores non-anchor targets', () => {
  const event = new MouseEvent('click');
  expect(isTopLoaderNavigation(event)).toBe(false);
});

it('forwards React 19 refs, native props, class overrides and derived selectors without text', () => {
  const ref = createRef<HTMLDivElement>();
  mount({
    ref,
    title: 'Details',
    classNames: { root: 'h-2', bar: 'rounded-full', peg: 'w-12' },
    className: 'h-3',
  });
  expect(ref.current).toBe(bar());
  expect(bar().title).toBe('Details');
  expect(bar().className).toContain('h-3');
  expect(bar().className).not.toContain('h-2');
  expect(host.querySelector('[data-testid="loader-bar"]')?.className).toContain(
    'rounded-full',
  );
  expect(host.querySelector('[data-testid="loader-peg"]')?.className).toContain('w-12');
  expect(bar().getAttribute('aria-hidden')).toBe('true');
  expect(bar().textContent).toBe('');
  expect(bar().outerHTML).not.toContain('classNames');
});

it('has no SSR work, no default selectors and no facade binding before mount or after unmount', () => {
  expect(() => client.start()).toThrow('Mount TopLoaderProvider');
  const html = renderToString(<TopLoaderProvider client={client} />);
  expect(html).not.toContain('data-testid');
  expect(vi.getTimerCount()).toBe(0);
  expect(() => client.start()).toThrow();
  mount();

  act(() => client.start());

  act(() => root.render(null));

  expect(vi.getTimerCount()).toBe(0);
  expect(() => client.done()).toThrow();
});

it('survives StrictMode setup/cleanup and leaves stale controllers inert', () => {
  let stale: ReturnType<typeof useTopLoader> | undefined;

  function Capture() {
    stale = useTopLoader();

    return null;
  }

  act(() =>
    root.render(
      <StrictMode>
        <TopLoaderProvider client={client}>
          <Capture />
        </TopLoaderProvider>
      </StrictMode>,
    ),
  );

  act(() => client.start());

  advance(100);
  expect(host.querySelector('[data-state="loading"]')).not.toBeNull();

  act(() => root.render(null));

  stale!.start();
  expect(vi.getTimerCount()).toBe(0);
});

it('does not trickle for reduced motion and marks visual transitions motion-safe', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));

  mount({ delay: 0 });

  act(() => client.start());

  advance(4000);
  expect(bar().getAttribute('aria-valuenow')).toBe('8');
  expect(bar().className).toContain('motion-safe:transition-opacity');
  expect(host.querySelector('[data-testid="loader-bar"]')?.className).toContain(
    'motion-reduce:transform-none!',
  );
});

it('rejects duplicate client ownership without replacing its existing provider', () => {
  mount();
  const second = createRoot(document.createElement('div'));
  expect(() => act(() => second.render(<TopLoaderProvider client={client} />))).toThrow(
    'only one provider',
  );

  act(() => client.start());

  advance(100);
  expect(bar().hidden).toBe(false);

  act(() => second.unmount());
});
