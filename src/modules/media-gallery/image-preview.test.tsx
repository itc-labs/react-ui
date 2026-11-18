// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { ImagePreview, type ImagePreviewProps, type MediaItem } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  for (const name of ['ResizeObserver', 'IntersectionObserver', 'MutationObserver'])
    vi.stubGlobal(
      name,
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );

  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const items: MediaItem[] = [
  { id: 'a', src: 'a.svg', alt: 'Front', thumbnail: 'a-small.svg' },
  { id: 'b', src: 'b.svg', alt: 'Back' },
  { id: 'c', type: 'video', src: 'c.mp4', alt: 'Clip', poster: 'c.svg' },
  { id: 'd', src: 'd.svg', alt: 'Detail' },
];

function render(props: Partial<ImagePreviewProps> = {}, locale = 'en-US') {
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <ImagePreview items={items} data-testid="preview" {...props} />
      </UILocaleProvider>,
    ),
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-testid="preview-${name}"]`);

it('renders a labelled group of thumbnail buttons using thumbnail, poster and source', () => {
  render();
  const group = part('item-a')!.parentElement!;
  expect(group.getAttribute('role')).toBe('group');
  expect(group.getAttribute('aria-label')).toBe('Images (4)');
  expect(part('item-a')!.tagName).toBe('BUTTON');
  expect(part('item-a')!.getAttribute('aria-label')).toBe('View image 1 of 4: Front');
  expect(part('image-a')!.getAttribute('src')).toBe('a-small.svg');
  expect(part('image-b')!.getAttribute('src')).toBe('b.svg');
  expect(part('image-c')!.getAttribute('src')).toBe('c.svg');
  expect(part('image-a')!.getAttribute('alt')).toBe('');
  expect(part('more')).toBeNull();
});

it('limits visible thumbnails and opens the remaining items from a localized +N tile', () => {
  const onOpen = vi.fn();
  render({ maxVisible: 2, onOpen }, 'vi-VN');
  expect(part('item-c')).toBeNull();
  expect(part('more')!.textContent).toBe('+2');
  expect(part('more')!.getAttribute('aria-label')).toBe('Xem thêm 2 ảnh');

  act(() => part('more')!.click());

  expect(onOpen).toHaveBeenCalledWith(2);
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
});

it('opens the lightbox at the clicked image', () => {
  const onOpen = vi.fn();
  render({ onOpen });
  expect(document.querySelector('[role="dialog"]')).toBeNull();

  act(() => part('item-b')!.click());

  expect(onOpen).toHaveBeenCalledWith(1);
  const dialog = document.querySelector('[role="dialog"]');
  expect(dialog).not.toBeNull();
  expect(dialog!.textContent).toContain('2 / 4');
});

it('lets the host handle opening when the built-in lightbox is disabled', () => {
  const onOpen = vi.fn();
  render({ lightbox: false, onOpen });

  act(() => part('item-d')!.click());

  expect(onOpen).toHaveBeenCalledWith(3);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it('renders static images without interaction when neither lightbox nor onOpen is set', () => {
  render({ lightbox: false });
  expect(part('item-a')!.tagName).toBe('SPAN');
  expect(part('item-a')!.getAttribute('role')).toBe('img');
  expect(part('item-a')!.getAttribute('aria-label')).toBe('Front');
});

it('shows a localized placeholder or a custom fallback when there are no items', () => {
  render({ items: [] }, 'vi-VN');
  expect(part('empty')!.getAttribute('aria-label')).toBe('Chưa có ảnh');
  render({ items: [], emptyFallback: 'Lorem' });
  expect(part('empty')).toBeNull();
  expect(host.textContent).toBe('Lorem');
});

it('applies size, shape and slot classes after defaults', () => {
  render({
    size: 'xl',
    shape: 'circle',
    maxVisible: 1,
    className: 'gap-4',
    classNames: { item: 'ring-1', more: 'font-bold', image: 'object-contain' },
  });
  const item = part('item-a')!;
  expect(item.className).toContain('size-24');
  expect(item.className).toContain('rounded-full');
  expect(item.className.endsWith('ring-1')).toBe(true);
  expect(part('more')!.className.endsWith('font-bold')).toBe(true);
  expect(part('image-a')!.className).toContain('object-contain');
  expect(item.parentElement!.className.endsWith('gap-4')).toBe(true);
});
