// @vitest-environment jsdom
import { act, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { usePageHeight } from './use-page-height';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

let notify: () => void = () => {};

let bounds = { width: 800, height: 400 };

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  bounds = { width: 800, height: 400 };
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        notify = callback;
      }

      observe() {}
      disconnect() {}
    },
  );

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => bounds as DOMRect,
  );
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('does not re-render while only the width animates', async () => {
  const renders = vi.fn();
  let height = 0;

  function Table() {
    const ref = useRef<HTMLTableElement>(null);

    height = usePageHeight(ref, true, 'page-1');
    renders();

    return <table ref={ref} />;
  }

  await act(async () => root.render(<Table />));
  renders.mockClear();

  for (const width of [780, 760, 740]) {
    bounds = { width, height: 400 };
    await act(async () => notify());
  }

  expect(renders).not.toHaveBeenCalled();
  expect(height).toBe(400);

  bounds = { width: 740, height: 480 };
  await act(async () => notify());

  expect(height).toBe(480);
});
