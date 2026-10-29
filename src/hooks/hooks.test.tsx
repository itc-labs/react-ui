// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, useRef, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';
import {
  useClickOutside,
  useDebounce,
  useDebouncedCallback,
  type DebouncedCallback,
} from './index';
import { Select } from '../components/select';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, container: HTMLDivElement;

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  act(() => root.unmount());

  container.remove();
  vi.useRealTimers();
});

function render(node: ReactNode) {
  act(() => root.render(node));
}

function advance(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}

function type(value: string) {
  const input = container.querySelector('input[role="combobox"]')! as HTMLInputElement;

  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      value,
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  return input;
}

it('debounces only the latest callback, uses its latest implementation and supports cancel/flush/unmount', () => {
  const first = vi.fn((value: string) => value),
    second = vi.fn((value: string) => `new:${value}`);
  let callback: DebouncedCallback<[string], string>;

  function Harness({
    fn,
    delay = 300,
  }: {
    fn: (value: string) => string;
    delay?: number;
  }) {
    callback = useDebouncedCallback(fn, delay);

    return null;
  }

  render(<Harness fn={first} />);

  act(() => {
    callback('a');
    callback('ab');
  });

  advance(299);
  expect(first).not.toHaveBeenCalled();
  render(<Harness fn={second} />);
  advance(1);
  expect(second).toHaveBeenCalledExactlyOnceWith('ab');

  act(() => callback('c'));

  expect(callback!.isPending()).toBe(true);
  expect(callback!.flush()).toBe('new:c');
  advance(300);
  expect(second).toHaveBeenCalledTimes(2);

  act(() => {
    callback('cancel');
    callback.cancel();
  });

  advance(300);
  expect(second).toHaveBeenCalledTimes(2);

  act(() => callback('delay'));

  render(<Harness fn={second} delay={100} />);
  advance(300);
  expect(second).toHaveBeenCalledTimes(2);

  act(() => callback('unmount'));

  render(null);
  advance(300);
  expect(second).toHaveBeenCalledTimes(2);
});

it('debounces values without delaying their raw source and accepts zero delay', () => {
  function Harness({ value, delay = 300 }: { value: string; delay?: number }) {
    return <output>{useDebounce(value, delay)}</output>;
  }

  render(<Harness value="a" />);
  render(<Harness value="ab" />);
  advance(299);
  expect(container.textContent).toBe('a');
  advance(1);
  expect(container.textContent).toBe('ab');
  render(<Harness value="now" delay={0} />);
  expect(container.textContent).toBe('now');
});

it('click outside includes portal regions, shadow composed paths, latest callbacks, disabled state and cleanup', () => {
  const first = vi.fn(),
    second = vi.fn();

  function Harness({ fn, enabled = true }: { fn: () => void; enabled?: boolean }) {
    const panel = useRef<HTMLDivElement>(null),
      portal = useRef<HTMLDivElement>(null);
    useClickOutside([panel, portal], fn, enabled);

    return (
      <>
        <div ref={panel}>Inside</div>
        {createPortal(
          <div ref={portal} data-portal="true">
            Portal
          </div>,
          document.body,
        )}
      </>
    );
  }

  render(<Harness fn={first} />);

  const pointer = (target: Element) =>
    act(() =>
      target.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true })),
    );

  pointer(container.firstElementChild!);
  pointer(document.querySelector('[data-portal]')!);
  expect(first).not.toHaveBeenCalled();
  const shadow = container.firstElementChild!.attachShadow({ mode: 'open' }),
    child = document.createElement('button');
  shadow.append(child);
  pointer(child);
  expect(first).not.toHaveBeenCalled();
  render(<Harness fn={second} />);
  pointer(document.body);
  expect(second).toHaveBeenCalledTimes(1);
  expect(first).not.toHaveBeenCalled();
  render(<Harness fn={second} enabled={false} />);
  pointer(document.body);
  expect(second).toHaveBeenCalledTimes(1);
  render(null);
  pointer(document.body);
  expect(second).toHaveBeenCalledTimes(1);
});

it('Select renders raw search immediately, debounces remote intent and keeps selected labels', () => {
  const search = vi.fn(),
    raw = vi.fn();
  render(
    <Select
      name="selection"
      searchable
      label="Search"
      options={[{ value: 'saved', label: 'Saved item' }]}
      defaultValue="saved"
      onSearchChange={search}
      onInputChange={raw}
    />,
  );
  const input = type('a');
  type('ab');
  expect(input.value).toBe('ab');
  expect(raw).toHaveBeenLastCalledWith('ab');
  expect(search).not.toHaveBeenCalled();
  advance(299);
  expect(search).not.toHaveBeenCalled();
  advance(1);
  expect(search).toHaveBeenCalledExactlyOnceWith('ab');
  expect(
    (container.querySelector('input[name="selection"]') as HTMLInputElement).value,
  ).toBe('saved');
  type('');
  expect(container.textContent).toContain('Saved item');
  expect(search).toHaveBeenLastCalledWith('');
  advance(300);
  expect(search).toHaveBeenCalledTimes(2);
});

it('Select cancels queued intent on external reset, disabled state and unmount', () => {
  const search = vi.fn();
  const options = [{ value: 'a', label: 'A' }];
  render(<Select searchable options={options} inputValue="" onSearchChange={search} />);
  type('pending');
  render(
    <Select searchable options={options} inputValue="reset" onSearchChange={search} />,
  );
  advance(300);
  expect(search).not.toHaveBeenCalled();
  type('disabled');
  render(
    <Select
      searchable
      disabled
      options={options}
      inputValue="reset"
      onSearchChange={search}
    />,
  );
  advance(300);
  expect(search).not.toHaveBeenCalled();
  render(<Select searchable options={options} onSearchChange={search} />);
  type('unmount');
  render(null);
  advance(300);
  expect(search).not.toHaveBeenCalled();
});

it('Select holds remote search until IME composition completes', () => {
  const search = vi.fn();
  render(<Select searchable options={[]} onSearchChange={search} />);
  const input = container.querySelector('input[role="combobox"]')!;

  act(() =>
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })),
  );

  type('に');
  advance(500);
  expect(search).not.toHaveBeenCalled();
  type('日本');

  act(() =>
    input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })),
  );

  advance(300);
  expect(search).toHaveBeenCalledExactlyOnceWith('日本');
});

it('Select blocks load-more for an unsettled query and cancels it on menu close', () => {
  const search = vi.fn(),
    more = vi.fn();
  render(
    <Select
      searchable
      options={[]}
      onSearchChange={search}
      hasMore
      onLoadMore={more}
    />,
  );
  const input = type('new');

  act(() =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', altKey: true, bubbles: true }),
    ),
  );

  expect(more).not.toHaveBeenCalled();

  act(() =>
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
  );

  advance(300);
  expect(search).not.toHaveBeenCalled();
});

it('useDebounce treats function values as data rather than invoking state initializer/updater functions', () => {
  const first = vi.fn(() => 1),
    second = vi.fn(() => 2);
  let result: (() => number) | undefined;

  function Harness({ value }: { value: () => number }) {
    result = useDebounce(value, 100);

    return null;
  }

  render(<Harness value={first} />);
  expect(result).toBe(first);
  expect(first).not.toHaveBeenCalled();
  render(<Harness value={second} />);
  advance(100);
  expect(result).toBe(second);
  expect(second).not.toHaveBeenCalled();
});

it('Select controlled raw input updates do not cancel debounce, and legacy controlled callbacks keep typing immediate', () => {
  const search = vi.fn();

  function Controlled({ legacy = false }: { legacy?: boolean }) {
    const [raw, setRaw] = useState('');

    return (
      <Select
        searchable
        options={[]}
        inputValue={raw}
        {...(!legacy ? { onInputChange: setRaw } : {})}
        onSearchChange={(query) => {
          search(query);
          if (legacy) setRaw(query);
        }}
      />
    );
  }

  render(<Controlled />);
  const input = type('controlled');
  expect(input.value).toBe('controlled');
  advance(299);
  expect(search).not.toHaveBeenCalled();
  advance(1);
  expect(search).toHaveBeenCalledExactlyOnceWith('controlled');
  search.mockClear();
  render(<Controlled key="legacy" legacy />);
  const legacy = type('legacy');
  expect(legacy.value).toBe('legacy');
  advance(300);
  expect(search).toHaveBeenCalledExactlyOnceWith('legacy');
  expect(legacy.value).toBe('legacy');
});
