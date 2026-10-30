// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { JsonView } from './index';
import { UILocaleProvider } from '../../i18n/provider';
import { copyJson } from './model';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  if (clipboardDescriptor)
    Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else Reflect.deleteProperty(navigator, 'clipboard');
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const rows = () =>
  Array.from(host.querySelectorAll<HTMLDivElement>('[role="treeitem"]'));

function press(item: HTMLElement, key: string) {
  act(() => {
    item.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
  });
}

function render(
  data: unknown,
  props: Partial<React.ComponentProps<typeof JsonView>> = {},
) {
  act(() =>
    root.render(
      <UILocaleProvider locale="en-US">
        <JsonView data={data} {...props} />
      </UILocaleProvider>,
    ),
  );
}

it('renders types, quoted keys, counts, sorting and initial expansion', () => {
  render(
    { z: null, a: ['Lorem', 2, true], b: {} },
    { sortKeys: true, rootName: 'data' },
  );
  expect(rows()).toHaveLength(4);
  expect(rows()[0]?.textContent).toContain('"data": {3}');
  expect(rows()[1]?.textContent).toContain('"a": [3]');
  expect(rows()[1]?.getAttribute('aria-expanded')).toBe('false');
  expect(rows()[2]?.getAttribute('aria-expanded')).toBeNull();
  press(rows()[1]!, 'ArrowRight');
  expect(rows()[2]?.textContent).toContain('"0": "Lorem"');
  expect(rows()[3]?.textContent).toContain('2');
  expect(rows()[4]?.textContent).toContain('true');
  expect(rows()[2]?.getAttribute('aria-level')).toBe('3');
  expect(rows()[3]?.getAttribute('aria-posinset')).toBe('2');
  expect(rows()[3]?.getAttribute('aria-setsize')).toBe('3');
});

it('supports roving focus, arrows, Home/End, Enter, Space and pointer expansion', () => {
  render({ a: { b: 1 }, c: 2 });

  act(() => rows()[0]!.focus());

  press(rows()[0]!, 'ArrowDown');
  expect(document.activeElement).toBe(rows()[1]);
  press(rows()[1]!, 'ArrowRight');
  press(rows()[1]!, 'ArrowRight');
  expect(document.activeElement).toBe(rows()[2]);
  press(rows()[2]!, 'ArrowLeft');
  expect(document.activeElement).toBe(rows()[1]);
  press(rows()[1]!, 'ArrowLeft');
  expect(rows()[1]?.getAttribute('aria-expanded')).toBe('false');
  press(rows()[1]!, 'ArrowLeft');
  expect(document.activeElement).toBe(rows()[0]);
  press(rows()[0]!, 'End');
  expect(document.activeElement).toBe(rows().at(-1));
  press(rows().at(-1)!, 'ArrowUp');
  expect(document.activeElement).toBe(rows()[1]);
  press(rows()[1]!, 'Home');
  expect(document.activeElement).toBe(rows()[0]);
  press(rows()[0]!, ' ');
  expect(rows()).toHaveLength(1);
  press(rows()[0]!, 'Enter');
  expect(rows()).toHaveLength(3);

  act(() => rows()[1]!.querySelector('button')!.click());

  expect(rows()).toHaveLength(4);
  expect(document.activeElement).toBe(rows()[1]);
  expect(rows().filter((row) => row.tabIndex === 0)).toEqual([rows()[1]]);
});

it('truncates strings and allows pointer and keyboard expansion', () => {
  render('Lorem ipsum', { collapseStringsAfter: 5 });
  expect(rows()[0]?.textContent).toBe('"Lorem…"');
  press(rows()[0]!, 'ArrowRight');
  expect(rows()[0]?.textContent).toBe('"Lorem ipsum"');
  press(rows()[0]!, 'ArrowLeft');
  expect(rows()[0]?.textContent).toBe('"Lorem…"');

  act(() => rows()[0]!.querySelector('button')!.click());

  expect(rows()[0]?.getAttribute('aria-expanded')).toBe('true');
});

it('handles cycles, shared references, extended values and controlled data updates', () => {
  const shared = { value: 1 };
  const data: Record<string, unknown> = {
    a: shared,
    b: shared,
    missing: undefined,
    fn: () => {},
    large: BigInt(12),
    date: new Date('2026-01-01Z'),
  };
  data.self = data;
  render(data, { defaultExpandDepth: true });
  expect(rows().filter((row) => row.textContent?.includes('"value": 1'))).toHaveLength(
    2,
  );
  expect(host.textContent).toContain('[Circular]');
  expect(host.textContent).toContain('[Function]');
  expect(host.textContent).toContain('undefined');
  expect(host.textContent).toContain('12');
  expect(host.textContent).toContain('2026-01-01T00:00:00.000Z');
  expect(() => copyJson(data)).not.toThrow();
  expect(JSON.parse(copyJson(data)).self).toBe('[Circular]');
  render({ next: false }, { defaultExpandDepth: true });
  expect(host.textContent).toContain('"next": false');
  expect(host.textContent).not.toContain('[Circular]');
});

it('forwards native props, ref, classes, maxHeight and optional test selectors', () => {
  const ref = createRef<HTMLDivElement>();
  render('Lorem', {
    ref,
    id: 'viewer',
    'aria-label': 'Response',
    'data-testid': 'json',
    maxHeight: 200,
    className: 'rounded-none p-4',
    classNames: {
      root: 'rounded-full',
      tree: 'p-6',
      item: 'pr-4',
      header: 'font-bold',
      key: 'font-semibold',
      value: 'text-ink',
      string: 'italic',
      toggle: 'size-8',
      copyButton: 'rounded-full',
      status: 'status-class',
    },
  });
  expect(ref.current).toBe(host.querySelector('#viewer'));
  expect(ref.current?.className).toContain('rounded-none');
  expect(ref.current?.className).not.toContain('rounded-full');
  const tree = host.querySelector<HTMLElement>('[role="tree"]')!;
  expect(tree.getAttribute('aria-label')).toBe('Response');
  expect(tree.style.maxHeight).toBe('200px');
  expect(tree.className).toContain('p-6');
  expect(host.querySelector('[data-testid="json-value-%24"]')?.className).toContain(
    'italic',
  );
  expect(host.innerHTML).not.toContain('classNames=');
  render(null, { copyable: false });
  expect(host.querySelector('button')).toBeNull();
  expect(host.querySelector('[data-testid]')).toBeNull();
});

it('copies exact JSON and announces transient success without toggling the tree', async () => {
  vi.useFakeTimers();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  const data = { b: 'Lorem', a: [1, null] };
  render(data, { sortKeys: true });
  await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
  expect(writeText).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
  expect(host.querySelector('[role="status"]')?.textContent).toBe('Copied');
  expect(rows()[0]?.getAttribute('aria-expanded')).toBe('true');

  act(() => vi.advanceTimersByTime(2000));

  expect(host.querySelector('[role="status"]')?.textContent).toBe('');
  writeText.mockRejectedValue(new Error('denied'));
  await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
  expect(host.querySelector('[role="status"]')?.textContent).toBe('');
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: undefined,
  });
  await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
  expect(host.querySelector('[role="status"]')?.textContent).toBe('');
});

it('supports fully collapsed defaults and localized built-in labels', () => {
  act(() =>
    root.render(
      <UILocaleProvider locale="vi-VN">
        <JsonView data={{ a: 1 }} defaultExpandDepth={0} />
      </UILocaleProvider>,
    ),
  );

  expect(rows()).toHaveLength(1);
  expect(host.querySelector('[role="tree"]')?.getAttribute('aria-label')).toBe(
    'Trình xem JSON',
  );
  expect(host.textContent).toContain('Sao chép');
  expect(rows()[0]?.querySelector('button')?.getAttribute('aria-label')).toContain(
    'Mở rộng',
  );
});
