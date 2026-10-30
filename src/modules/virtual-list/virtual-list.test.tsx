// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { VirtualList, VirtualGrid, type VirtualGridProps } from './index';
import { UILocaleProvider } from '../../i18n/provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let width: number;
let observers: Set<() => void>;
const items = Array.from({ length: 1000 }, (_, i) => `item/${i}`);
const base = {
  items,
  getItemKey: (item: string) => item,
  renderItem: (item: string) => item,
  estimateSize: 40,
  height: 240,
  overscan: 1,
  'data-testid': 'collection',
};

beforeEach(() => {
  width = 800;
  observers = new Set();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  sessionStorage.clear();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      callback: (entries: ResizeObserverEntry[]) => void;
      constructor(callback: (entries: ResizeObserverEntry[]) => void) {
        this.callback = callback;
      }
      notify = () => this.callback([]);
      observe() {
        observers.add(this.notify);
      }
      unobserve() {}
      disconnect() {
        observers.delete(this.notify);
      }
    },
  );

  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.hasAttribute('data-index') ? 40 : 240;
  });

  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => width);

  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    width,
    height: 240,
    top: 0,
    left: 0,
    right: width,
    bottom: 240,
    x: 0,
    y: 0,
    toJSON() {},
  }));

  Element.prototype.scrollTo = vi.fn(function (
    this: HTMLElement,
    options?: ScrollToOptions | number,
    y?: number,
  ) {
    this.scrollTop = typeof options === 'number' ? (y ?? 0) : (options?.top ?? 0);
  });

  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function render(props: Partial<VirtualGridProps<string>> = {}, grid = false) {
  await act(async () =>
    root.render(
      <UILocaleProvider locale="en-US">
        {grid ? (
          <VirtualGrid {...base} {...props} />
        ) : (
          <VirtualList {...base} {...props} />
        )}
      </UILocaleProvider>,
    ),
  );
}

function viewport() {
  return host.querySelector<HTMLElement>('[data-testid="collection"]')!;
}

function rows() {
  return host.querySelectorAll<HTMLElement>('[data-index]');
}

it('renders a measured window with list semantics, keyed selectors, classes and a React 19 ref', async () => {
  const ref = createRef<HTMLDivElement>();
  await render({
    ref,
    className: 'bg-canvas',
    classNames: {
      root: 'bg-surface',
      viewport: 'p-2',
      list: 'custom-list',
      item: 'custom-item',
      row: 'custom-row',
    },
  });
  expect(ref.current).toBe(viewport());
  expect(viewport().className).toContain('bg-canvas');
  expect(viewport().className).not.toContain('bg-surface');
  expect(viewport().className).toContain('p-2');
  expect(viewport().getAttribute('role')).toBe('list');
  const rendered = host.querySelectorAll('[role="listitem"]');
  expect(rendered.length).toBeGreaterThan(0);
  expect(rendered.length).toBeLessThan(30);
  const first = host.querySelector('[data-testid="collection-item-item%2F0"]')!;
  expect(first.className).toContain('custom-item');
  expect(first.getAttribute('aria-setsize')).toBe('1000');
  expect(first.getAttribute('aria-posinset')).toBe('1');
  expect(rows()[0]!.className).toContain('custom-row');
});

it('moves the rendered window after scrolling', async () => {
  await render();
  await act(async () => {
    viewport().scrollTop = 4000;
    viewport().dispatchEvent(new Event('scroll'));
  });
  expect(host.textContent).toContain('item/100');
  expect(host.querySelector('[data-testid="collection-item-item%2F0"]')).toBeNull();
});

it('auto loads once per item count, suppresses requests while loading or in error, and announces appended items', async () => {
  const onLoadMore = vi.fn();
  const props = { items: items.slice(0, 5), hasMore: true, onLoadMore };
  await render({ ...props, loading: true });
  expect(onLoadMore).not.toHaveBeenCalled();
  await render(props);
  expect(onLoadMore).toHaveBeenCalledTimes(1);
  await render(props);
  expect(onLoadMore).toHaveBeenCalledTimes(1);
  await render({ ...props, items: items.slice(0, 8), loading: true });
  expect(host.querySelector('[aria-live]')!.textContent).toBe('Loaded 3 more items');
  await render({ ...props, items: items.slice(0, 8), error: 'Failed' });
  expect(onLoadMore).toHaveBeenCalledTimes(1);
  await render({ ...props, items: items.slice(0, 8) });
  expect(onLoadMore).toHaveBeenCalledTimes(2);
});

it('uses a button for explicit loading and exposes busy and spinner states', async () => {
  const onLoadMore = vi.fn();
  await render({
    items: items.slice(0, 3),
    loadMore: 'button',
    hasMore: true,
    onLoadMore,
  });
  expect(onLoadMore).not.toHaveBeenCalled();
  const button = host.querySelector<HTMLButtonElement>('button')!;
  expect(button.textContent).toBe('Load more');
  await act(async () => button.click());
  expect(onLoadMore).toHaveBeenCalledTimes(1);
  await render({ loadMore: 'button', hasMore: true, onLoadMore, loading: true });
  expect(viewport().getAttribute('aria-busy')).toBe('true');
  expect(host.querySelector('button')!.disabled).toBe(true);
  expect(host.querySelector('[role="status"]')).not.toBeNull();
});

it('renders retry, initial skeletons, custom skeletons and empty content separately', async () => {
  const onRetry = vi.fn();
  await render({ items: [], error: 'Failed', onRetry });
  expect(host.querySelector('[role="alert"]')!.textContent).toBe('Failed');
  await act(async () => host.querySelector('button')!.click());
  expect(onRetry).toHaveBeenCalledOnce();
  await render({ items: [], loading: true, skeletonCount: 4 });
  expect(host.querySelectorAll('[data-testid^="collection-skeleton-"]')).toHaveLength(
    4,
  );
  expect(host.querySelector('[data-testid="collection-empty"]')).toBeNull();
  await render({
    items: [],
    loading: true,
    skeletonCount: 2,
    renderSkeleton: (i) => `Placeholder ${i}`,
  });
  expect(host.textContent).toContain('Placeholder 1');
  await render({ items: [] });
  expect(host.textContent).toContain('No items found');
  await render({ items: [], emptyContent: 'Custom empty' });
  expect(host.textContent).toContain('Custom empty');
});

it('supports keyboard navigation beyond the mounted range and preserves nested focus on append', async () => {
  const key = async (value: string) =>
    act(async () =>
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: value, bubbles: true }),
      ),
    );

  await render();
  await act(async () => viewport().focus());
  await key('End');
  expect((document.activeElement as HTMLElement).dataset.virtualKey).toBe('item/999');
  await key('Home');
  expect((document.activeElement as HTMLElement).dataset.virtualKey).toBe('item/0');
  await key('ArrowDown');
  expect((document.activeElement as HTMLElement).dataset.virtualKey).toBe('item/1');
  await render({
    items: items.slice(0, 5),
    renderItem: (item) => <button>{item}</button>,
  });
  const nested = host.querySelector('button')!;
  await act(async () => nested.focus());
  await render({
    items: items.slice(0, 10),
    renderItem: (item) => <button>{item}</button>,
  });
  expect(document.activeElement).toBe(nested);
  await key('ArrowDown');
  expect(document.activeElement).toBe(nested);
});

it('computes grid columns at viewport breakpoints and from measured minItemWidth', async () => {
  vi.stubGlobal('innerWidth', 800);
  await render({ columns: { base: 1, sm: 2, md: 3, lg: 4 }, gap: 20 }, true);
  expect(rows()[0]!.children).toHaveLength(3);
  expect(rows()[0]!.style.gap).toBe('20px');
  vi.stubGlobal('innerWidth', 1200);
  await act(async () => window.dispatchEvent(new Event('resize')));
  expect(rows()[0]!.children).toHaveLength(4);
  await render({ columns: 8, minItemWidth: 250, gap: 20, aspectRatio: 2 }, true);
  expect(rows()[0]!.children).toHaveLength(3);
  width = 500;
  await act(async () => {
    observers.forEach((callback) => callback());
  });
  expect(rows()[0]!.children).toHaveLength(1);
  expect((rows()[0]!.children[0] as HTMLElement).style.aspectRatio).toBe('2');
});

it('supports window scrolling and custom roles', async () => {
  await render({ scroll: 'window', role: 'feed', itemRole: 'article' });
  expect(viewport().getAttribute('role')).toBe('feed');
  expect(host.querySelectorAll('[role="article"]').length).toBeGreaterThan(0);
  expect(viewport().style.height).toBe('');
});

it('saves and restores the offset across remounts and tolerates blocked storage', async () => {
  sessionStorage.setItem('offset', '400');
  await render({ restoreKey: 'offset' });
  expect(viewport().scrollTop).toBe(400);
  await act(async () => {
    viewport().scrollTop = 800;
    viewport().dispatchEvent(new Event('scroll'));
  });
  expect(sessionStorage.getItem('offset')).toBe('800');
  await act(async () => root.render(null));
  await render({ restoreKey: 'offset' });
  expect(viewport().scrollTop).toBe(800);

  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Blocked');
  });

  await render({ restoreKey: 'blocked' });
  expect(viewport()).not.toBeNull();
});

it('retains measured variable row heights instead of resetting to estimates', async () => {
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.hasAttribute('data-index') ? 80 : 240;
  });

  await render();
  expect(
    parseFloat(
      host.querySelector<HTMLElement>('[data-testid="collection-list"]')!.style.height,
    ),
  ).toBeGreaterThan(40000);
  expect(rows()[1]!.style.transform).toBe('translateY(80px)');
});

it('respects a zero loading threshold and suppresses automatic loading without more items', async () => {
  const onLoadMore = vi.fn();
  await render({
    items: items.slice(0, 20),
    hasMore: true,
    loadMoreThreshold: 0,
    onLoadMore,
  });
  expect(onLoadMore).not.toHaveBeenCalled();
  await act(async () => {
    viewport().scrollTop = 800;
    viewport().dispatchEvent(new Event('scroll'));
  });
  expect(onLoadMore).toHaveBeenCalledOnce();
  await render({ items: items.slice(0, 21), hasMore: false, onLoadMore });
  expect(onLoadMore).toHaveBeenCalledOnce();
});

it('switches loading-more feedback between spinner, placeholders, bar and custom content', async () => {
  const loader = () =>
    host.querySelector<HTMLElement>('[data-testid="collection-loader"]')!;

  await render({ items: items.slice(0, 8), hasMore: true, loading: true });
  expect(loader().dataset.indicator).toBe('spinner');
  expect(loader().textContent).toContain('Loading more…');
  await render({
    items: items.slice(0, 8),
    hasMore: true,
    loading: true,
    loadingIndicator: 'skeleton',
  });
  expect(
    host.querySelectorAll('[data-testid^="collection-moreSkeleton-"]'),
  ).toHaveLength(3);
  await render(
    {
      items: items.slice(0, 8),
      hasMore: true,
      loading: true,
      loadingIndicator: 'skeleton',
      columns: 4,
    },
    true,
  );
  expect(
    host.querySelectorAll('[data-testid^="collection-moreSkeleton-"]'),
  ).toHaveLength(4);
  await render({
    items: items.slice(0, 8),
    hasMore: true,
    loading: true,
    loadingIndicator: 'bar',
  });
  expect(loader().className).toContain('sticky');
  expect(loader().querySelector('[role="progressbar"]')).not.toBeNull();
  await render({
    items: items.slice(0, 8),
    hasMore: true,
    loading: true,
    renderLoadingMore: () => 'Custom',
  });
  expect(loader().textContent).toBe('Custom');
});
