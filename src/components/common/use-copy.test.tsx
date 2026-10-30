// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useCopy } from './use-copy';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('ignores stale clipboard completions and pending completions after unmount', async () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  const pending: (() => void)[] = [];
  const writeText = vi.fn(() => new Promise<void>((resolve) => pending.push(resolve)));
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  let controller: ReturnType<typeof useCopy>;

  function Demo() {
    controller = useCopy();

    return <span>{String(controller.copied)}</span>;
  }

  try {
    act(() => root.render(<Demo />));

    let first: Promise<boolean>;
    let second: Promise<boolean>;

    act(() => {
      first = controller.copy('first');
      second = controller.copy('second');
    });

    await act(async () => pending[0]!());
    expect(await first!).toBe(false);
    expect(host.textContent).toBe('false');
    await act(async () => pending[1]!());
    expect(await second!).toBe(true);
    expect(host.textContent).toBe('true');
    let third: Promise<boolean>;

    act(() => {
      third = controller.copy('third');
    });

    act(() => root.unmount());

    await act(async () => pending[2]!());
    expect(await third!).toBe(false);
  } finally {
    if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
    else Reflect.deleteProperty(navigator, 'clipboard');
  }
});
