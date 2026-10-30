// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent } from 'storybook/test';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Carousel, type CarouselApi, type CarouselProps } from './index';
import { UILocaleProvider } from '../../i18n/provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let api: CarouselApi | undefined;
let reduced = false;
const mediaListeners = new Set<() => void>();

const setApi = (value: CarouselApi | undefined) => {
  api = value;
};

beforeEach(() => {
  reduced = false;
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

function render(props: Partial<CarouselProps<string>> = {}, locale = 'en-US') {
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <Carousel
          items={['a', 'b', 'c']}
          getItemKey={(item) => item}
          renderItem={(item) => <span>{item}</span>}
          data-testid="carousel"
          setApi={setApi}
          {...props}
        />
      </UILocaleProvider>,
    ),
  );
}

function part(name: string) {
  return host.querySelector<HTMLElement>(`[data-testid="carousel-${name}"]`)!;
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

it('forwards native attributes, React 19 ref, class slots and stable part IDs with localized ARIA', () => {
  const ref = createRef<HTMLDivElement>();
  render({
    ref,
    id: 'gallery',
    dots: true,
    className: 'rounded-none',
    classNames: {
      root: 'rounded-full',
      viewport: 'viewport-class',
      container: 'container-class',
      slide: 'slide-class',
      controls: 'controls-class',
      prev: 'prev-class',
      next: 'next-class',
      dots: 'dots-class',
      dot: 'dot-class',
    },
  });
  expect(ref.current).toBe(host.querySelector('#gallery'));
  expect(ref.current?.getAttribute('role')).toBe('region');
  expect(ref.current?.getAttribute('aria-label')).toBe('Carousel');
  expect(ref.current?.getAttribute('aria-roledescription')).toBe('carousel');
  expect(ref.current?.className).toContain('rounded-none');
  expect(ref.current?.className).not.toContain('rounded-full');
  expect(part('slide-c').getAttribute('role')).toBe('group');
  expect(part('slide-c').getAttribute('aria-label')).toBe('3 of 3');
  expect(part('slide-c').getAttribute('aria-roledescription')).toBe('slide');
  for (const name of ['viewport', 'container', 'controls', 'prev', 'next', 'dots'])
    expect(part(name).className).toContain(`${name}-class`);
  expect(part('slide-a').className).toContain('slide-class');
  expect(part('dot-0').className).toContain('dot-class');
  expect(host.innerHTML).not.toContain('classNames=');
  render({ dots: true }, 'vi-VN');
  expect(part('next').getAttribute('aria-label')).toBe('Trang sau');
  expect(part('dot-1').getAttribute('aria-label')).toBe('Đến trang 2');
});

it('supports arrows, dots, default index, keyboard and disabled non-looping edges', () => {
  const change = vi.fn();
  render({ dots: true, defaultIndex: 1, onSlideChange: change });
  expect(api?.selectedScrollSnap()).toBe(1);
  click('next');
  expect(change).toHaveBeenLastCalledWith(2);
  expect(part('next').hasAttribute('disabled')).toBe(true);
  expect(part('dot-2').getAttribute('aria-current')).toBe('true');
  key('ArrowLeft');
  expect(api?.selectedScrollSnap()).toBe(1);
  click('dot-0');
  expect(part('prev').hasAttribute('disabled')).toBe(true);
  key('ArrowRight');
  expect(api?.selectedScrollSnap()).toBe(1);
});

it('keeps controlled selection until the caller accepts a requested change', () => {
  const change = vi.fn();
  render({ index: 0, onSlideChange: change });
  click('next');
  expect(change).toHaveBeenCalledExactlyOnceWith(1);
  expect(api?.selectedScrollSnap()).toBe(0);
  render({ index: 2, onSlideChange: change });
  expect(api?.selectedScrollSnap()).toBe(2);
});

it('preserves caller keyboard prevention and leaves text editing keys alone', () => {
  render({ onKeyDown: (event) => event.preventDefault() });
  key('ArrowRight');
  expect(api?.selectedScrollSnap()).toBe(0);
  render({ renderItem: () => <input aria-label="Item title" /> });
  key('ArrowRight', host.querySelector('input')!);
  expect(api?.selectedScrollSnap()).toBe(0);
});

it('groups rows without losing item indices or keys and handles an empty collection', () => {
  const renderItem = vi.fn((item: string, index: number) => (
    <span>
      {item}:{index}
    </span>
  ));
  render({ rows: 2, perView: { base: 1, sm: 2, lg: 3 }, renderItem });
  expect(host.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(2);
  expect(part('slide-a').textContent).toBe('a:0b:1');
  expect(part('slide-c').textContent).toBe('c:2');
  expect(
    (host.firstElementChild as HTMLElement).style.getPropertyValue('--carousel-lg'),
  ).toBe('3');
  render({ items: [], dots: true });
  expect(host.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(0);
  expect(part('next').hasAttribute('disabled')).toBe(true);
});

it('exposes the Embla API with dragFree and loop options and clears it on unmount', () => {
  render({ loop: true, dragFree: true, align: 'center' });
  expect(api?.internalEngine().options.dragFree).toBe(true);
  expect(api?.internalEngine().options.loop).toBe(true);
  expect(part('prev').hasAttribute('disabled')).toBe(false);
  key('ArrowLeft');
  expect(api?.selectedScrollSnap()).toBe(2);

  act(() => root.render(null));

  expect(api).toBeUndefined();
});

it('provides pause/play, stops on focus and respects interaction options', async () => {
  render({ autoplay: true });
  expect(part('autoplay').textContent).toBe('Pause autoplay');
  expect(part('container').getAttribute('aria-live')).toBe('off');
  click('autoplay');
  expect(api?.plugins().autoplay?.isPlaying()).toBe(false);
  expect(part('autoplay').textContent).toBe('Play autoplay');
  click('autoplay');
  expect(api?.plugins().autoplay?.isPlaying()).toBe(true);
  click('next');
  expect(api?.plugins().autoplay?.isPlaying()).toBe(false);
  click('autoplay');

  act(() => part('prev').focus());

  expect(api?.plugins().autoplay?.isPlaying()).toBe(false);
  render({ autoplay: { stopOnInteraction: false, stopOnFocusIn: false } });
  click('autoplay');
  click('next');
  expect(api?.plugins().autoplay?.isPlaying()).toBe(true);
  // A plugin restart after mouse leave cannot override a deliberate pause.
  click('autoplay');
  await act(async () => {
    api?.plugins().autoplay?.play();
    await Promise.resolve();
  });
  expect(api?.plugins().autoplay?.isPlaying()).toBe(false);
});

it('disables autoplay for reduced motion, reacts to preference changes and permits an explicit force', () => {
  reduced = true;
  render({ autoplay: true });
  expect(api?.plugins().autoplay?.isPlaying()).toBe(false);
  expect(part('autoplay').hasAttribute('disabled')).toBe(true);
  render({ autoplay: { force: true } });
  expect(api?.plugins().autoplay?.isPlaying()).toBe(true);
  expect(api?.internalEngine().options.duration).toBe(0);
  render({ autoplay: true });

  act(() => {
    reduced = false;

    mediaListeners.forEach((listener) => listener());
  });

  expect(api?.plugins().autoplay?.isPlaying()).toBe(true);

  act(() => {
    reduced = true;

    mediaListeners.forEach((listener) => listener());
  });

  expect(api?.plugins().autoplay?.isPlaying()).toBe(false);
});

it('keeps autoplay safe for empty and single-slide collections', () => {
  render({ items: [], autoplay: true });
  expect(part('autoplay').hasAttribute('disabled')).toBe(true);
  render({ items: ['a'], autoplay: true });
  expect(api?.plugins().autoplay?.isPlaying()).toBe(false);
});

it('supports Tab, Enter and Space on native controls', async () => {
  const user = userEvent.setup({ document });
  render({ dots: true });
  await act(async () => {
    await user.tab();
  });
  expect(document.activeElement).toBe(host.firstElementChild);
  await act(async () => {
    await user.tab();
  });
  expect(document.activeElement).toBe(part('next'));
  await act(async () => {
    await user.keyboard('{Enter}');
  });
  expect(api?.selectedScrollSnap()).toBe(1);
  await act(async () => {
    await user.keyboard(' ');
  });
  expect(api?.selectedScrollSnap()).toBe(2);
});

it('advances on the configured autoplay timer and pauses on hover', () => {
  vi.useFakeTimers();
  const change = vi.fn();
  render({ autoplay: { delay: 1000 }, onSlideChange: change });

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(change).toHaveBeenCalledWith(1);

  act(() => host.firstElementChild!.dispatchEvent(new MouseEvent('mouseenter')));

  expect(api?.plugins().autoplay?.isPlaying()).toBe(false);
  expect(part('autoplay').textContent).toBe('Play autoplay');
  change.mockClear();

  act(() => {
    vi.advanceTimersByTime(3000);
  });

  expect(change).not.toHaveBeenCalled();
});
