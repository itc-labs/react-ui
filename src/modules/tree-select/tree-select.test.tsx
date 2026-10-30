// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { TreeSelect, type TreeSelectProps, type TreeSelectNode } from './index';
import { UILocaleProvider } from '../../i18n/provider';
import { Form, FormField, useAppForm } from '../form';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
const nodes: TreeSelectNode[] = [
  {
    id: 'a',
    label: 'Áo',
    children: [
      { id: 'b', label: 'Blue' },
      { id: 'c', label: 'Cream' },
    ],
  },
  { id: 'd', label: 'Đồ', children: [{ id: 'e', label: 'Ecru' }] },
  { id: 'f', label: 'Flax' },
];

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollTo = vi.fn();

  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.hasAttribute('data-index') ? 40 : 280;
  });

  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 300,
    height: 40,
    top: 0,
    left: 0,
    right: 300,
    bottom: 40,
    x: 0,
    y: 0,
    toJSON() {},
  });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function render(props: Partial<TreeSelectProps> = {}) {
  await act(async () =>
    root.render(
      <UILocaleProvider locale="en-US">
        <TreeSelect
          {...({
            nodes,
            label: 'Category',
            'data-testid': 'select',
            ...props,
          } as TreeSelectProps)}
        />
      </UILocaleProvider>,
    ),
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-testid="select-${name}"]`)!;

const tree = () => document.querySelector<HTMLElement>('[role="tree"]')!;

const trigger = () => host.querySelector<HTMLElement>('[role="combobox"]')!;

async function click(element: HTMLElement) {
  expect(element).toBeTruthy();
  await act(async () => element.click());
}

async function open() {
  await click(trigger());
}

async function key(key: string, target = tree()) {
  await act(async () =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    ),
  );
}

function active() {
  return document.getElementById(tree().getAttribute('aria-activedescendant') ?? '');
}

async function input(value: string) {
  const element = part('search') as HTMLInputElement;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      element,
      value,
    );
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('selects a single value, expands selected ancestors, hydrates a path, clears and forwards field slots/ref/ARIA', async () => {
  const changed = vi.fn();
  const ref = createRef<HTMLDivElement>();
  await render({
    defaultValue: 'b',
    showPath: true,
    clearable: true,
    name: 'category',
    hint: 'Hint',
    required: true,
    ref,
    onValueChange: changed,
    className: 'rounded-full',
    classNames: {
      control: 'border-brand-700',
      row: 'row-custom',
      rowSelected: 'selected-custom',
      tree: 'tree-custom',
    },
  });
  expect(ref.current).toBe(trigger());
  expect(trigger().textContent).toContain('Áo / Blue');
  expect(trigger().className).toContain('rounded-full');
  expect(trigger().getAttribute('aria-required')).toBe('true');
  expect(trigger().getAttribute('aria-describedby')).toContain('-hint');
  expect(host.querySelector('input')?.value).toBe('b');
  await open();
  expect(trigger().getAttribute('aria-haspopup')).toBe('tree');
  expect(part('row-b').className).toContain('selected-custom');
  expect(part('row-b').getAttribute('aria-level')).toBe('2');
  expect(part('row-b').getAttribute('aria-setsize')).toBe('2');
  expect(part('row-c').getAttribute('aria-posinset')).toBe('2');
  await click(part('row-c'));
  expect(changed).toHaveBeenLastCalledWith('c');
  expect(document.querySelector('[role="tree"]')).toBeNull();
  await click(part('clear'));
  expect(changed).toHaveBeenLastCalledWith(null);
  expect(host.querySelector('input')?.value).toBe('');
});

it('keeps controlled single selection and uses selectedOptions before nodes load', async () => {
  const changed = vi.fn();
  await render({
    nodes: [],
    value: 'unknown',
    selectedOptions: [{ id: 'unknown', label: 'Hydrated', path: ['Parent'] }],
    showPath: true,
    onValueChange: changed,
    clearable: true,
  });
  expect(trigger().textContent).toContain('Parent / Hydrated');
  await click(part('clear'));
  expect(changed).toHaveBeenCalledWith(null);
  expect(trigger().textContent).toContain('Hydrated');
  await render({ value: null });
  expect(trigger().textContent).toContain('Select an item');
});

it('supports independent multi-selection, collapsed tags, removal and hidden inputs', async () => {
  const changed = vi.fn();
  await render({
    multiple: true,
    defaultValue: ['b', 'c', 'e', 'f'],
    name: 'items',
    maxTagCount: 2,
    clearable: true,
    onValueChange: changed,
  });
  expect(host.querySelectorAll('[data-testid^="select-tag-"]')).toHaveLength(2);
  expect(trigger().textContent).toContain('+2');
  expect(host.querySelectorAll('input[type="hidden"]')).toHaveLength(4);
  await click(part('tagRemove-b'));
  expect(changed).toHaveBeenLastCalledWith(['c', 'e', 'f']);
  await open();
  await click(part('row-a'));
  expect(changed).toHaveBeenLastCalledWith(['c', 'e', 'f', 'a']);
  expect(tree()).toBeTruthy();
  expect(part('row-a').getAttribute('aria-checked')).toBe('true');
  await click(part('clear'));
  expect(changed).toHaveBeenLastCalledWith([]);
});

for (const strategy of ['parent', 'child', 'all'] as const) {
  it(`emits ${strategy} cascade values and derives mixed state when unchecking a descendant`, async () => {
    const changed = vi.fn();
    await render({
      multiple: true,
      cascade: true,
      checkedStrategy: strategy,
      onValueChange: changed,
    });
    await open();
    await click(part('toggle-a'));
    await click(part('row-a'));
    expect(new Set(changed.mock.lastCall![0])).toEqual(
      new Set(
        strategy === 'parent'
          ? ['a']
          : strategy === 'child'
            ? ['b', 'c']
            : ['a', 'b', 'c'],
      ),
    );
    expect(part('row-a').getAttribute('aria-checked')).toBe('true');
    expect(part('row-b').getAttribute('aria-checked')).toBe('true');
    await click(part('row-b'));
    expect(part('row-a').getAttribute('aria-checked')).toBe('mixed');
    expect(changed).toHaveBeenLastCalledWith(['c']);
    await click(part('row-b'));
    expect(part('row-a').getAttribute('aria-checked')).toBe('true');
  });
}

it('inherits a checked parent into newly loaded children, including child strategy', async () => {
  const changed = vi.fn();
  const initial: TreeSelectNode[] = [{ id: 'a', label: 'Parent', hasChildren: true }];
  await render({
    nodes: initial,
    multiple: true,
    cascade: true,
    checkedStrategy: 'child',
    onValueChange: changed,
  });
  await open();
  await click(part('row-a'));
  await render({
    nodes: [{ ...initial[0]!, children: [{ id: 'b', label: 'Blue' }] }],
    multiple: true,
    cascade: true,
    checkedStrategy: 'child',
    onValueChange: changed,
  });
  await click(part('toggle-a'));
  expect(part('row-b').getAttribute('aria-checked')).toBe('true');
});

it('respects disabled subtrees, disabled predicates, selectable=false and leaf-only selection', async () => {
  const changed = vi.fn();
  await render({
    defaultValue: 'b',
    disabledSubtreeIds: ['a'],
    isNodeDisabled: (node) => node.id === 'f',
    selectableLevels: 'leaf',
    onValueChange: changed,
  });
  await open();
  expect(part('row-a').getAttribute('aria-disabled')).toBe('true');
  expect(part('row-b').getAttribute('aria-disabled')).toBe('true');
  await click(part('row-b'));
  await click(part('row-f'));
  await click(part('row-d'));
  expect(changed).not.toHaveBeenCalled();
  expect(part('row-e')).toBeTruthy();
  await click(part('row-e'));
  expect(changed).toHaveBeenCalledWith('e');
});

it('loads lazy children once, shows a spinner, and retries rejected loads inline', async () => {
  let resolve!: () => void;
  const load = vi
    .fn()
    .mockRejectedValueOnce(new Error('Failure'))
    .mockImplementationOnce(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
  await render({
    nodes: [{ id: 'a', label: 'Parent', hasChildren: true }],
    loadChildren: load,
  });
  await open();
  await click(part('toggle-a'));
  expect(part('retry-a').textContent).toContain('Retry');
  await click(part('retry-a'));
  expect(part('row-a').getAttribute('aria-busy')).toBe('true');
  expect(load).toHaveBeenCalledTimes(2);
  await act(async () => resolve());
  expect(part('retry-a')).toBeNull();
  await render({
    nodes: [
      {
        id: 'a',
        label: 'Parent',
        hasChildren: true,
        children: [{ id: 'b', label: 'Blue' }],
      },
    ],
    loadChildren: load,
  });
  expect(part('row-b')).toBeTruthy();
});

it('pages root and child levels and forwards level loading state', async () => {
  const load = vi.fn();
  await render({ nodes: [nodes[0]!], hasMore: true, onLoadMore: load });
  await open();
  expect(load).toHaveBeenCalledWith(null);
  await render({
    nodes: [{ ...nodes[0]!, hasMore: true }],
    hasMore: true,
    onLoadMore: load,
    loadingIds: [null, 'a'],
  });
  await click(part('toggle-a'));
  expect((part('loadMore-a') as HTMLButtonElement).disabled).toBe(true);
  expect((part('loadMore-root') as HTMLButtonElement).disabled).toBe(true);
  await render({ nodes: [{ ...nodes[0]!, hasMore: true }], onLoadMore: load });
  await click(part('loadMore-a'));
  expect(load).toHaveBeenLastCalledWith('a');
});

it('filters without diacritics, retains ancestors, highlights original text, and clears search before closing', async () => {
  await render({ searchable: true });
  await open();
  const search = part('search');
  expect(document.activeElement).toBe(search);
  await input('blue');
  expect(part('row-a')).toBeTruthy();
  expect(part('row-b')).toBeTruthy();
  expect(part('row-c')).toBeNull();
  expect(part('row-b').querySelector('mark')?.textContent).toBe('Blue');
  await key('ArrowDown', search);
  expect(search.getAttribute('aria-activedescendant')).toBe(part('row-b').id);
  expect(document.activeElement).toBe(search);
  await input('ao');
  expect(part('row-a').querySelector('mark')?.textContent).toBe('Áo');
  await key('Escape', search);
  expect((search as HTMLInputElement).value).toBe('');
  expect(tree()).toBeTruthy();
  await key('Escape', search);
  expect(document.querySelector('[role="tree"]')).toBeNull();
});

it('debounces remote queries at 300ms, cancels stale input and exposes loading/empty state', async () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  await render({ searchable: true, onSearchChange: changed });
  await open();
  await input('a');
  await act(async () => vi.advanceTimersByTime(200));
  await input('blue');
  await act(async () => vi.advanceTimersByTime(299));
  expect(changed).not.toHaveBeenCalled();
  await act(async () => vi.advanceTimersByTime(1));
  expect(changed).toHaveBeenCalledExactlyOnceWith('blue');
  expect(part('row-f')).toBeTruthy();
  await render({
    searchable: true,
    onSearchChange: changed,
    nodes: [],
    searchLoading: true,
  });
  expect(tree().getAttribute('aria-busy')).toBe('true');
  await render({ searchable: true, onSearchChange: changed, nodes: [] });
  expect(part('empty').textContent).toBe('No items found');
});

it('navigates a tree with arrows, Home/End, type-ahead and Space/Enter selection', async () => {
  const changed = vi.fn();
  await render({ onValueChange: changed });
  await open();
  expect(document.activeElement).toBe(tree());
  expect(active()).toBe(part('row-a'));
  await key('ArrowRight');
  expect(part('row-a').getAttribute('aria-expanded')).toBe('true');
  await key('ArrowRight');
  expect(active()).toBe(part('row-b'));
  await key('ArrowDown');
  expect(active()).toBe(part('row-c'));
  await key('ArrowUp');
  expect(active()).toBe(part('row-b'));
  await key('ArrowLeft');
  expect(active()).toBe(part('row-a'));
  await key('ArrowLeft');
  expect(part('row-a').getAttribute('aria-expanded')).toBe('false');
  await key('End');
  expect(active()).toBe(part('row-f'));
  await key('Home');
  expect(active()).toBe(part('row-a'));
  await key('f');
  expect(active()).toBe(part('row-f'));
  await key(' ');
  expect(changed).toHaveBeenLastCalledWith('f');
});

it('virtualizes a large tree and retains a custom row renderer', async () => {
  await render({
    nodes: Array.from({ length: 5000 }, (_, index) => ({
      id: `${index}`,
      label: `Item ${index}`,
    })),
    renderNode: (node, state) => (
      <span>
        {node.label}
        {state.level}
      </span>
    ),
  });
  await open();
  expect(document.querySelectorAll('[role="treeitem"]').length).toBeLessThan(40);
  expect(part('row-0').textContent).toContain('Item 01');
});

it('auto-binds through FormField and submits the selected value', async () => {
  const submit = vi.fn();

  function Demo() {
    const form = useAppForm({
      defaultValues: { category: null as string | null },
      onSubmit: async ({ value }) => {
        submit(value);
      },
    });

    return (
      <Form form={form}>
        <FormField name="category" label="Category" required>
          <TreeSelect nodes={nodes} data-testid="select" />
        </FormField>
        <button type="submit">Save</button>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  expect(trigger().getAttribute('aria-required')).toBe('true');
  await open();
  await click(part('row-f'));
  await act(async () =>
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
  expect(submit).toHaveBeenCalledWith({ category: 'f' });
});

it('honors controlled cascade values until the host accepts the change', async () => {
  const changed = vi.fn();
  await render({ multiple: true, cascade: true, value: [], onValueChange: changed });
  await open();
  await click(part('row-a'));
  expect(changed).toHaveBeenCalledWith(['a']);
  expect(part('row-a').getAttribute('aria-checked')).toBe('false');
  await render({ multiple: true, cascade: true, value: ['a'], onValueChange: changed });
  expect(part('row-a').getAttribute('aria-checked')).toBe('true');
  await render({ multiple: true, cascade: true, value: [], onValueChange: changed });
  expect(part('row-a').getAttribute('aria-checked')).toBe('false');
});

it('inherits a parent checked through its children when another page arrives', async () => {
  const changed = vi.fn();
  await render({
    nodes: [{ ...nodes[0]!, hasMore: true }],
    multiple: true,
    cascade: true,
    checkedStrategy: 'child',
    onValueChange: changed,
  });
  await open();
  await click(part('toggle-a'));
  await click(part('row-b'));
  await click(part('row-c'));
  expect(part('row-a').getAttribute('aria-checked')).toBe('true');
  await render({
    nodes: [
      {
        ...nodes[0]!,
        hasMore: true,
        children: [...nodes[0]!.children!, { id: 'g', label: 'Gray' }],
      },
    ],
    multiple: true,
    cascade: true,
    checkedStrategy: 'child',
    onValueChange: changed,
  });
  expect(part('row-g').getAttribute('aria-checked')).toBe('true');
  expect(new Set(changed.mock.lastCall![0])).toEqual(new Set(['b', 'c', 'g']));
});

it('cancels pending remote search when cleared and resets an emitted query once on Escape', async () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  await render({ searchable: true, onSearchChange: changed });
  await open();
  await input('blue');
  await input('');
  await act(async () => vi.advanceTimersByTime(300));
  expect(changed).not.toHaveBeenCalled();
  await input('cream');
  await act(async () => vi.advanceTimersByTime(300));
  expect(changed).toHaveBeenCalledExactlyOnceWith('cream');
  await key('Escape', part('search'));
  expect(changed.mock.calls).toEqual([['cream'], ['']]);
  expect(tree()).toBeTruthy();
});

it('exposes root loading without a paging action and prevents nonselectable branch picks', async () => {
  const changed = vi.fn();
  await render({ nodes: [], loadingIds: [null] });
  await open();
  expect(tree().getAttribute('aria-busy')).toBe('true');
  expect(part('empty')).toBeNull();
  await render({
    nodes: [{ ...nodes[0]!, selectable: false }],
    onValueChange: changed,
  });
  await key('Enter');
  expect(changed).not.toHaveBeenCalled();
  expect(part('row-b')).toBeTruthy();
  await key('ArrowRight');
  await key('Enter');
  expect(changed).toHaveBeenCalledWith('b');
});

it('cascades through nonselectable branches and excludes nonselectable leaves from aggregation', async () => {
  const changed = vi.fn();
  await render({
    multiple: true,
    cascade: true,
    onValueChange: changed,
    nodes: [
      {
        id: 'a',
        label: 'Parent',
        children: [
          {
            id: 'b',
            label: 'Branch',
            selectable: false,
            children: [{ id: 'c', label: 'Child' }],
          },
          { id: 'd', label: 'Excluded', selectable: false },
          { id: 'e', label: 'Leaf' },
        ],
      },
    ],
  });
  await open();
  await click(part('toggle-a'));
  await click(part('row-e'));
  expect(part('row-a').getAttribute('aria-checked')).toBe('mixed');
  await click(part('toggle-b'));
  await click(part('row-c'));
  expect(part('row-a').getAttribute('aria-checked')).toBe('true');
  expect(changed).toHaveBeenLastCalledWith(['a']);
  await click(part('row-a'));
  expect(changed).toHaveBeenLastCalledWith([]);
});

it('reaches paging and retry actions with the keyboard while retaining search focus', async () => {
  const loadMore = vi.fn();
  const loadChildren = vi
    .fn()
    .mockRejectedValueOnce(new Error('Failure'))
    .mockResolvedValue(undefined);
  await render({
    searchable: true,
    nodes: [{ id: 'a', label: 'Parent', hasChildren: true, hasMore: true }],
    loadChildren,
    onLoadMore: loadMore,
  });
  await open();
  const search = part('search');
  await key('ArrowRight', search);
  expect(part('retry-a')).toBeTruthy();
  await key('ArrowDown', search);
  expect(search.getAttribute('aria-activedescendant')).toBe(
    part('loadMore-a').parentElement!.id,
  );
  await key('Enter', search);
  expect(loadMore).toHaveBeenCalledWith('a');
  await key('ArrowDown', search);
  await key('Enter', search);
  expect(loadChildren).toHaveBeenCalledTimes(2);
  expect(part('retry-a')).toBeNull();
  expect(document.activeElement).toBe(search);
});
