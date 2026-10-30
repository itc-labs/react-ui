// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent } from 'storybook/test';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  Lightbox,
  MediaGallery,
  type MediaGalleryProps,
  type MediaItem,
} from './index';
import { UILocaleProvider } from '../../i18n/provider';
import { AdapterProvider } from '../../components/link-image-provider/context';
import { UiImage, type UiImageProps } from '../../components/link-image-provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

let reduced = false;
const mediaListeners = new Set<() => void>();

beforeEach(() => {
  reduced = false;

  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    'MutationObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes('prefers-reduced-motion') && reduced;
    },
    media: query,
    addEventListener: (_: string, fn: () => void) => mediaListeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => mediaListeners.delete(fn),
  }));

  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(100);

  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.getAttribute('aria-roledescription') === 'slide'
      ? Array.from(this.parentElement!.children).indexOf(this) * 200
      : 0;
  });

  const originalComputedStyle = window.getComputedStyle;

  vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
    const computed = originalComputedStyle(element);

    return new Proxy(computed, {
      get: (target, key) =>
        key === 'getPropertyValue'
          ? (name: string) =>
              target.getPropertyValue(name) || (name.startsWith('margin-') ? '0px' : '')
          : Reflect.get(target, key),
    });
  });

  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  mediaListeners.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const items: MediaItem[] = [
  {
    id: 'a',
    src: 'a.svg',
    alt: 'First image',
    width: 640,
    height: 480,
    thumbnail: 'a-small.svg',
  },
  { id: 'b', type: 'video', src: 'b.mp4', alt: 'Second video', poster: 'b.svg' },
  { id: 'c', src: 'c.svg', alt: 'Third image' },
];

function render(props: Partial<MediaGalleryProps> = {}, locale = 'en-US') {
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <MediaGallery items={items} data-testid="gallery" {...props} />
      </UILocaleProvider>,
    ),
  );
}

function part(name: string) {
  return host.querySelector<HTMLElement>(`[data-testid="gallery-${name}"]`)!;
}

function click(name: string) {
  act(() => part(name).click());
}

function key(value: string, target = host.firstElementChild!) {
  act(() =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
    ),
  );
}

it('supports uncontrolled thumbnails, arrow buttons, keyboard edges and scrolls the active thumbnail into view', () => {
  const change = vi.fn();
  render({ defaultIndex: 1, onIndexChange: change });
  expect(part('thumbnail-b').getAttribute('aria-current')).toBe('true');
  expect(part('thumbnail-b').scrollIntoView).toHaveBeenCalledWith({
    block: 'nearest',
    inline: 'nearest',
    behavior: 'instant',
  });
  click('main-next');
  expect(part('thumbnail-c').getAttribute('aria-current')).toBe('true');
  expect(change).toHaveBeenLastCalledWith(2);
  key('ArrowRight');
  expect(change).toHaveBeenCalledTimes(1);
  key('ArrowLeft', part('thumbnail-c'));
  expect(part('thumbnail-b').getAttribute('aria-current')).toBe('true');
  click('thumbnail-a');
  expect(part('thumbnail-a').getAttribute('aria-current')).toBe('true');
  expect(part('main-prev').hasAttribute('disabled')).toBe(true);
});

it('keeps controlled selection host-owned and does not echo prop updates', () => {
  const change = vi.fn();
  render({ index: 0, onIndexChange: change });
  click('thumbnail-b');
  expect(change).toHaveBeenCalledExactlyOnceWith(1);
  expect(part('thumbnail-a').getAttribute('aria-current')).toBe('true');
  change.mockClear();
  click('main-next');
  expect(change).toHaveBeenCalledExactlyOnceWith(1);
  expect(part('thumbnail-a').getAttribute('aria-current')).toBe('true');
  change.mockClear();
  render({ index: 2, onIndexChange: change });
  expect(part('thumbnail-c').getAttribute('aria-current')).toBe('true');
  expect(change).not.toHaveBeenCalled();
});

it('pauses video after leaving its slide and keeps inactive media inert', () => {
  render({ defaultIndex: 1 });
  const video = part('video-b') as HTMLVideoElement;
  expect(video.controls).toBe(true);
  expect(video.playsInline).toBe(true);
  expect(video.getAttribute('poster')).toBe('b.svg');
  expect(video.getAttribute('aria-label')).toBe('Second video');
  expect(part('slide-a').hasAttribute('inert')).toBe(true);
  expect(part('slide-b').hasAttribute('inert')).toBe(false);
  vi.mocked(video.pause).mockClear();
  click('thumbnail-c');
  expect(video.pause).toHaveBeenCalledOnce();
  expect(part('slide-b').getAttribute('aria-hidden')).toBe('true');
});

it('activates main media by click and Enter and supports thumbnail Enter/Space', async () => {
  const open = vi.fn();
  const user = userEvent.setup({ document });
  render({ onOpen: open, lightbox: false });
  const button = part('media-a').closest('button')!;

  act(() => button.click());

  expect(open).toHaveBeenLastCalledWith(0);

  act(() => button.focus());

  await act(async () => {
    await user.keyboard('{Enter}');
  });
  expect(open).toHaveBeenCalledTimes(2);

  act(() => part('thumbnail-c').focus());

  await act(async () => {
    await user.keyboard(' ');
  });
  expect(part('thumbnail-c').getAttribute('aria-current')).toBe('true');

  act(() => part('thumbnail-b').focus());

  await act(async () => {
    await user.keyboard('{Enter}');
  });
  expect(part('thumbnail-b').getAttribute('aria-current')).toBe('true');
});

it('forwards ref, native attributes, classes, stable selectors, localized names and aspect ratio', () => {
  const ref = createRef<HTMLDivElement>();
  render({
    ref,
    id: 'media',
    aspectRatio: '3 / 4',
    className: 'gap-6',
    classNames: {
      root: 'gap-1',
      main: 'main-class',
      slide: 'slide-class',
      media: 'media-class',
      thumbnails: 'thumbnails-class',
      thumbnail: 'thumbnail-class',
      video: 'video-class',
    },
  });
  expect(ref.current).toBe(host.firstElementChild);
  expect(ref.current?.id).toBe('media');
  expect(ref.current?.getAttribute('aria-label')).toBe('Media gallery');
  expect(ref.current?.className).toContain('gap-6');
  expect(ref.current?.className).not.toContain('gap-1');
  expect(ref.current?.hasAttribute('classNames')).toBe(false);
  for (const slot of [
    'main',
    'thumbnails',
    'slide-a',
    'media-a',
    'thumbnail-a',
    'video-b',
  ]) {
    expect(part(slot).className).toContain(`${slot.split('-')[0]}-class`);
  }
  expect(part('slide-a').style.aspectRatio).toBe('3 / 4');
  expect(part('thumbnail-b').getAttribute('aria-label')).toBe('Show media 2 of 3');
  expect(part('thumbnail-b').querySelector('svg')).not.toBeNull();
  render({}, 'vi-VN');
  expect(part('thumbnail-b').getAttribute('aria-label')).toBe('Hiển thị mục 2 trên 3');
});

it('uses scoped image adapters for main images and thumbnails with dimensions and alt', () => {
  const image = vi.fn((props: UiImageProps) => <UiImage {...props} />);

  // The adapter records props and supplies no native image itself.
  image.mockImplementation((props) => <span data-image-src={props.src} />);

  act(() =>
    root.render(
      <AdapterProvider Image={image}>
        <MediaGallery items={items} />
      </AdapterProvider>,
    ),
  );

  expect(
    image.mock.calls.some(
      ([props]) =>
        props.src === 'a.svg' && props.alt === 'First image' && props.width === 640,
    ),
  ).toBe(true);
  expect(
    image.mock.calls.some(
      ([props]) =>
        props.src === 'a-small.svg' && props.alt === '' && props.width === 64,
    ),
  ).toBe(true);
  expect(image.mock.calls.some(([props]) => props.src === 'b.svg')).toBe(true);
});

it('handles empty, single, shrinking collections, hidden thumbnails and invalid indices', () => {
  render({ items: [], index: 99, thumbnails: 'none' });
  expect(part('thumbnails')).toBeNull();
  expect(part('main-next').hasAttribute('disabled')).toBe(true);
  render({ index: 2 });
  expect(part('thumbnail-c').getAttribute('aria-current')).toBe('true');
  render({ items: [items[0]!], index: 2 });
  expect(part('thumbnail-a').getAttribute('aria-current')).toBe('true');
  render({ index: NaN });
  expect(part('thumbnail-a').getAttribute('aria-current')).toBe('true');
});

it('lets native handlers prevent navigation and handles a key event once', () => {
  const handler = vi.fn();
  render({ onKeyDown: handler });
  key('ArrowRight', part('main'));
  expect(handler).toHaveBeenCalledOnce();
  expect(part('thumbnail-b').getAttribute('aria-current')).toBe('true');
  render({ onKeyDown: (event) => event.preventDefault() });
  key('ArrowRight', part('main'));
  expect(part('thumbnail-b').getAttribute('aria-current')).toBe('true');
});

it('opens the current media, traps focus, closes on Escape and restores focus', async () => {
  const user = userEvent.setup({ document });
  render({ defaultIndex: 2 });
  const trigger = part('media-c').closest('button')!;

  act(() => trigger.focus());

  await act(async () => user.keyboard('{Enter}'));
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
  expect(dialog.getAttribute('aria-modal')).toBe('true');
  expect(dialog.textContent).toContain('3 / 3');
  expect(dialog.contains(document.activeElement)).toBe(true);
  await act(async () => user.keyboard('{Tab}{Shift>}{Tab}{/Shift}'));
  expect(dialog.contains(document.activeElement)).toBe(true);
  await act(async () => user.keyboard('{Escape}'));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('navigates the lightbox by buttons, keys and thumbnails, resets zoom, and plays video', () => {
  render();
  click('media-a');

  const lb = (name: string) =>
    document.querySelector<HTMLElement>(`[data-testid="gallery-lightbox-${name}"]`)!;

  expect(lb('counter').textContent).toBe('1 / 3');

  act(() => lb('zoomIn').click());

  expect(lb('zoomIn').getAttribute('aria-pressed')).toBe('true');
  expect(lb('media').style.transform).toContain('scale(2)');

  act(() => lb('zoomOut').click());

  expect(lb('media').style.transform).toContain('scale(1)');

  act(() =>
    lb('viewport').dispatchEvent(new MouseEvent('dblclick', { bubbles: true })),
  );

  expect(lb('zoomIn').getAttribute('aria-pressed')).toBe('true');

  act(() => lb('next').click());

  expect(lb('counter').textContent).toBe('2 / 3');
  expect((lb('video') as HTMLVideoElement).controls).toBe(true);
  expect(lb('zoomIn').hasAttribute('disabled')).toBe(true);
  key('ArrowRight', lb('video'));
  expect(lb('counter').textContent).toBe('3 / 3');
  expect(lb('zoomIn').getAttribute('aria-pressed')).toBe('false');
  key('ArrowLeft', lb('thumbnail-c'));
  expect(lb('counter').textContent).toBe('2 / 3');

  act(() => lb('thumbnail-a').click());

  expect(lb('counter').textContent).toBe('1 / 3');

  act(() => lb('close').click());

  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it('keeps controlled lightbox state host-owned and forwards classes, refs, selectors and native handlers', () => {
  const change = vi.fn();
  const openChange = vi.fn();
  const ref = createRef<HTMLDivElement>();

  const draw = (index: number) =>
    act(() =>
      root.render(
        <Lightbox
          items={items}
          open
          index={index}
          onIndexChange={change}
          onOpenChange={openChange}
          ref={ref}
          data-testid="viewer"
          className="gap-6"
          classNames={{
            root: 'gap-1',
            media: 'media-custom',
            overlay: 'overlay-custom',
            thumbnail: 'thumb-custom',
          }}
        />,
      ),
    );

  draw(0);
  expect(ref.current?.className).toContain('gap-6');
  expect(ref.current?.className).not.toContain('gap-1');
  expect(ref.current?.hasAttribute('classNames')).toBe(false);
  expect(document.querySelector('[data-testid="viewer-media"]')?.className).toContain(
    'media-custom',
  );
  expect(document.querySelector('[data-testid="viewer-overlay"]')?.className).toContain(
    'overlay-custom',
  );

  act(() =>
    document.querySelector<HTMLButtonElement>('[data-testid="viewer-next"]')!.click(),
  );

  expect(change).toHaveBeenCalledExactlyOnceWith(1);
  expect(document.querySelector('[data-testid="viewer-counter"]')?.textContent).toBe(
    '1 / 3',
  );
  draw(2);
  expect(document.querySelector('[data-testid="viewer-counter"]')?.textContent).toBe(
    '3 / 3',
  );
  expect(change).toHaveBeenCalledTimes(1);

  act(() =>
    document.querySelector<HTMLButtonElement>('[data-testid="viewer-close"]')!.click(),
  );

  expect(openChange).toHaveBeenCalledExactlyOnceWith(false);
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
});

it('supports uncontrolled standalone lightbox state and empty collections', () => {
  act(() =>
    root.render(
      <Lightbox items={items} defaultOpen defaultIndex={2} data-testid="viewer" />,
    ),
  );

  expect(document.querySelector('[data-testid="viewer-counter"]')?.textContent).toBe(
    '3 / 3',
  );
  key('ArrowLeft', document.querySelector('[role="dialog"]')!);
  expect(document.querySelector('[data-testid="viewer-counter"]')?.textContent).toBe(
    '2 / 3',
  );

  act(() => root.render(<Lightbox items={[]} defaultOpen data-testid="viewer" />));

  expect(document.querySelector('[data-testid="viewer-counter"]')?.textContent).toBe(
    '0 / 0',
  );
  expect(
    document.querySelector('[data-testid="viewer-next"]')?.hasAttribute('disabled'),
  ).toBe(true);
});

it('zooms under a fine mouse pointer and resets on leave, touch, reduced motion or disabled zoom', () => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : true,
    addEventListener() {},
    removeEventListener() {},
  }));

  render();
  const button = part('media-a').closest('button')!;
  vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
    left: 10,
    top: 20,
    width: 200,
    height: 100,
  } as DOMRect);

  const move = (pointerType: string) =>
    act(() => {
      const event = new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 60,
        clientY: 95,
      });
      Object.defineProperty(event, 'pointerType', { value: pointerType });
      button.dispatchEvent(event);
    });

  move('mouse');
  expect(part('media-a').style.transform).toBe('scale(2)');
  expect(part('media-a').style.transformOrigin).toBe('25% 75%');

  act(() => button.dispatchEvent(new MouseEvent('pointerout', { bubbles: true })));

  expect(part('media-a').style.transform).toBe('scale(1)');
  render({ zoomScale: 3 });
  move('mouse');
  expect(part('media-a').style.transform).toBe('scale(3)');
  move('touch');
  expect(part('media-a').style.transform).toBe('scale(1)');
  reduced = true;
  move('mouse');
  expect(part('media-a').style.transform).toBe('scale(1)');
  reduced = false;
  render({ zoom: false });
  move('mouse');
  expect(part('media-a').style.transform).toBe('scale(1)');
});

it('pans a zoomed image with pointer capture and clears the pan when zooming out', () => {
  render();
  click('media-a');
  const viewport = document.querySelector<HTMLElement>(
    '[data-testid="gallery-lightbox-viewport"]',
  )!;
  const zoom = document.querySelector<HTMLButtonElement>(
    '[data-testid="gallery-lightbox-zoomIn"]',
  )!;
  const image = document.querySelector<HTMLElement>(
    '[data-testid="gallery-lightbox-media"]',
  )!;
  const capture = vi.fn();
  viewport.setPointerCapture = capture;
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({
    width: 200,
    height: 100,
  } as DOMRect);

  const pointer = (type: string, x: number, y: number) =>
    act(() => {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX: x,
        clientY: y,
      });
      Object.defineProperty(event, 'pointerId', { value: 1 });
      viewport.dispatchEvent(event);
    });

  act(() => zoom.click());

  pointer('pointerdown', 20, 30);
  expect(capture).toHaveBeenCalledWith(1);
  pointer('pointermove', 60, 50);
  expect(image.style.transform).toBe('translate(40px, 20px) scale(2)');
  pointer('pointermove', 500, 500);
  expect(image.style.transform).toBe('translate(100px, 50px) scale(2)');
  pointer('pointerup', 500, 500);
  pointer('pointermove', 0, 0);
  expect(image.style.transform).toBe('translate(100px, 50px) scale(2)');

  act(() =>
    document
      .querySelector<HTMLButtonElement>('[data-testid="gallery-lightbox-zoomOut"]')!
      .click(),
  );

  expect(image.style.transform).toBe('translate(0px, 0px) scale(1)');
});
