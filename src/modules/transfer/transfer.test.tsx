// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Transfer, type TransferProps, type TransferItem } from './index';
import { UILocaleProvider } from '../../i18n/provider';
import { Form, FormField, useAppForm } from '../form';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
const items: TransferItem[] = [
  { id: 'a', label: 'Áo' },
  { id: 'b', label: 'Đồ' },
  { id: 'c', label: 'Lorem', disabled: true },
  { id: 'd', label: 'Ipsum' },
];

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
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
    return this.hasAttribute('data-index') ? 56 : 280;
  });

  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 300,
    height: 56,
    top: 0,
    left: 0,
    right: 300,
    bottom: 56,
    x: 0,
    y: 0,
    toJSON() {},
  });
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function render(props: Partial<TransferProps> = {}) {
  await act(async () =>
    root.render(
      <UILocaleProvider locale="en-US">
        <Transfer items={items} data-testid="transfer" {...props} />
      </UILocaleProvider>,
    ),
  );
}

const part = (name = '') =>
  host.querySelector<HTMLElement>(`[data-testid="transfer${name ? `-${name}` : ''}"]`)!;

const ids = () =>
  Array.from(host.querySelectorAll<HTMLInputElement>('input[type="hidden"]')).map(
    (input) => input.value,
  );

const click = async (element: HTMLElement) => {
  expect(element).toBeTruthy();
  await act(async () => element.click());
};

const key = async (
  element: HTMLElement,
  value: string,
  options: KeyboardEventInit = {},
) => {
  await act(async () =>
    element.dispatchEvent(
      new KeyboardEvent('keydown', { key: value, bubbles: true, ...options }),
    ),
  );
};

async function search(side: string, query: string) {
  const input = part(`${side}-search`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      query,
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('moves checked rows both ways, emits source order, clears checks, and announces moves', async () => {
  const changed = vi.fn();
  await render({ name: 'items', onValueChange: changed });
  await click(part('source-item-d'));
  await click(part('source-item-a'));
  await click(part('source-move'));
  expect(changed).toHaveBeenLastCalledWith(['a', 'd']);
  expect(ids()).toEqual(['a', 'd']);
  expect(part('target-item-a').getAttribute('aria-selected')).toBe('false');
  expect(host.querySelector('[aria-live]')?.textContent).toBe(
    'Moved 2 items to selected',
  );
  await click(part('target-item-a'));
  await click(part('target-move'));
  expect(ids()).toEqual(['d']);
});

it('uses selection order and retains controlled state until the parent updates', async () => {
  const changed = vi.fn();
  await render({ value: [], order: 'selection', onValueChange: changed });
  await click(part('source-item-d'));
  await click(part('source-item-b'));
  await click(part('source-move'));
  expect(changed).toHaveBeenLastCalledWith(['d', 'b']);
  expect(part('source-item-d')).toBeTruthy();
  await render({ value: ['d', 'b'], order: 'selection', name: 'items' });
  expect(ids()).toEqual(['d', 'b']);
});

it('supports filtered select-all, indeterminate headers and disabled items', async () => {
  await render({ searchable: true, showMoveAll: true, name: 'items' });
  await click(part('source-item-a'));
  expect(part('source-selectAll').getAttribute('aria-checked')).toBe('mixed');
  await click(part('source-selectAll'));
  expect(part('source-selectAll').getAttribute('aria-checked')).toBe('true');
  expect(part('source-item-c').getAttribute('aria-selected')).toBe('false');
  await click(part('source-selectAll'));
  await search('source', 'DO');
  expect(part('source-item-a')).toBeNull();
  expect(part('source-item-b')).toBeTruthy();
  await click(part('source-selectAll'));
  await click(part('source-move'));
  expect(ids()).toEqual(['b']);
  await search('source', 'ao');
  expect(part('source-item-a')).toBeTruthy();
  await click(part('source-moveAll'));
  expect(ids()).toEqual(['a', 'b', 'd']);
  await click(part('target-moveAll'));
  expect(ids()).toEqual([]);
});

it('respects custom filters and empty content on each side', async () => {
  const filterItem = vi.fn((item: TransferItem, query: string) => item.id === query);
  await render({ searchable: [true, false], filterItem, emptyContent: 'Empty result' });
  await search('source', 'unknown');
  expect(part('source-empty').textContent).toBe('Empty result');
  expect(part('target-search')).toBeNull();
  expect(filterItem).toHaveBeenCalledWith(items[0], 'unknown');
});

it('supports one-way removal, disabled target rows, and keyboard focus after removal', async () => {
  await render({
    oneWay: true,
    showMoveAll: true,
    defaultValue: ['a', 'c', 'd'],
    name: 'items',
  });
  expect(part('target-move')).toBeNull();
  expect(part('target-moveAll')).toBeNull();
  expect(part('target-remove-c').hasAttribute('disabled')).toBe(true);
  await act(async () => part('target-remove-a').focus());
  await click(part('target-remove-a'));
  expect(ids()).toEqual(['c', 'd']);
  expect(document.activeElement).toBe(part('target-item-d'));
});

it('blocks over-limit moves and allows removal to restore capacity', async () => {
  await render({
    maxSelected: 1,
    defaultValue: ['a'],
    name: 'items',
    showMoveAll: true,
  });
  expect(part('limit').textContent).toBe('Select up to 1 item');
  await click(part('source-item-b'));
  expect(part('source-move').hasAttribute('disabled')).toBe(true);
  await key(part('source-item-b'), 'Enter');
  expect(ids()).toEqual(['a']);
  await key(part('target-item-a'), 'Enter');
  expect(ids()).toEqual([]);
  await click(part('source-move'));
  expect(ids()).toEqual(['b']);
});

it('supports roving focus, range checks, Space, select-all and Enter', async () => {
  await render({ name: 'items' });
  await act(async () => part('source-item-a').focus());
  await key(part('source-item-a'), 'ArrowDown', { shiftKey: true });
  expect(document.activeElement).toBe(part('source-item-b'));
  expect(part('source-item-a').getAttribute('aria-selected')).toBe('true');
  expect(part('source-item-b').getAttribute('aria-selected')).toBe('true');
  await key(part('source-item-b'), 'ArrowDown', { shiftKey: true });
  expect(document.activeElement).toBe(part('source-item-d'));
  expect(part('source-item-c').getAttribute('aria-selected')).toBe('false');
  await key(part('source-item-d'), 'Home');
  expect(document.activeElement).toBe(part('source-item-a'));
  await key(part('source-item-a'), ' ');
  expect(part('source-item-a').getAttribute('aria-selected')).toBe('false');
  await key(part('source-item-a'), 'a', { metaKey: true });
  expect(part('source-selectAll').getAttribute('aria-checked')).toBe('true');
  await key(part('source-item-a'), 'End');
  await key(part('source-item-d'), 'ArrowUp');
  expect(document.activeElement).toBe(part('source-item-b'));
  await key(part('source-item-b'), 'Enter');
  expect(ids()).toEqual(['b']);
  expect(document.activeElement).toBe(part('source-item-a'));
});

it('moves on double click and never moves disabled items', async () => {
  await render({ name: 'items' });
  await act(async () =>
    part('source-item-a').dispatchEvent(new MouseEvent('dblclick', { bubbles: true })),
  );
  expect(ids()).toEqual(['a']);
  await click(part('source-item-c'));
  await act(async () =>
    part('source-item-c').dispatchEvent(new MouseEvent('dblclick', { bubbles: true })),
  );
  expect(ids()).toEqual(['a']);
  await render({
    disabled: true,
    defaultValue: ['a'],
    name: 'items',
    searchable: true,
  });
  await key(part('source-item-b'), 'Enter');
  expect(ids()).toEqual(['a']);
  expect(part('source-selectAll').hasAttribute('disabled')).toBe(true);
  expect(part('source-search').hasAttribute('disabled')).toBe(true);
  expect(part('source-item-b').tabIndex).toBe(-1);
});

it('forwards refs, classes, field associations, part IDs and custom row state', async () => {
  const ref = createRef<HTMLDivElement>();
  const renderItem = vi.fn(
    (item: TransferItem, state: { side: string; checked: boolean }) => (
      <strong>
        {item.label} {state.side}
      </strong>
    ),
  );
  await render({
    ref,
    label: 'Items',
    required: true,
    hint: 'Hint',
    className: 'gap-6',
    classNames: {
      root: 'gap-4',
      item: 'p-5',
      itemChecked: 'bg-brand-100',
      panel: 'rounded-none',
      list: 'p-3',
      actions: 'gap-5',
      button: 'rounded-full',
      header: 'p-5',
      hint: 'font-bold',
    },
    renderItem,
  });
  expect(ref.current).toBe(part());
  expect(part().className).toContain('gap-6');
  expect(part().className).not.toContain('gap-4');
  expect(
    document.getElementById(part().getAttribute('aria-labelledby')!)?.textContent,
  ).toContain('Items');
  expect(
    document.getElementById(part().getAttribute('aria-describedby')!)?.textContent,
  ).toBe('Hint');
  expect(part('source-list').getAttribute('aria-multiselectable')).toBe('true');
  expect(part('source-list').getAttribute('aria-required')).toBe('true');
  expect(part('source').getAttribute('aria-labelledby')).toBeTruthy();
  await click(part('source-item-a'));
  expect(part('source-item-a').className).toContain('bg-brand-100');
  expect(renderItem).toHaveBeenCalledWith(items[0], { side: 'source', checked: true });
  await render({ error: 'Choose items', hint: 'Hint' });
  expect(part().getAttribute('aria-invalid')).toBe('true');
  expect(
    document.getElementById(part().getAttribute('aria-describedby')!)?.textContent,
  ).toBe('Choose items');
  expect(part('hint')).toBeNull();
});

it('virtualizes 2,000 rows and keeps keyboard destinations mounted', async () => {
  await render({
    items: Array.from({ length: 2000 }, (_, index) => ({
      id: `${index}`,
      label: `Lorem ${index}`,
    })),
    name: 'items',
  });
  expect(host.querySelectorAll('[role="option"]').length).toBeLessThan(30);
  await act(async () => part('source-item-0').focus());
  await key(part('source-item-0'), 'End');
  expect(document.activeElement).toBe(part('source-item-1999'));
  expect(part('source-item-1999').getAttribute('aria-posinset')).toBe('2000');
  await key(part('source-item-1999'), 'Enter');
  expect(ids()).toEqual(['1999']);
});

it('auto-binds array values and blur through FormField', async () => {
  const submit = vi.fn();

  function Demo() {
    const form = useAppForm({
      defaultValues: { chosen: [] as string[] },
      onSubmit: ({ value }) => {
        submit(value);
      },
    });

    return (
      <UILocaleProvider locale="en-US">
        <Form form={form}>
          <FormField name="chosen" label="Items">
            <Transfer items={items} data-testid="transfer" />
          </FormField>
          <button type="submit">Save</button>
        </Form>
      </UILocaleProvider>
    );
  }

  await act(async () => root.render(<Demo />));
  await click(part('source-item-b'));
  await click(part('source-move'));
  expect(ids()).toEqual(['b']);
  expect(host.querySelector<HTMLInputElement>('input[type="hidden"]')?.name).toBe(
    'chosen',
  );
  await act(async () =>
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
  expect(submit).toHaveBeenCalledWith({ chosen: ['b'] });
});

it('localizes default titles, counts, limits, empty states and move announcements', async () => {
  await act(async () =>
    root.render(
      <UILocaleProvider locale="vi-VN">
        <Transfer items={items} maxSelected={2} data-testid="transfer" />
      </UILocaleProvider>,
    ),
  );
  expect(part('source-header').textContent).toContain('Có sẵn');
  expect(part('source-header').textContent).toContain('Đã đánh dấu 0/4');
  expect(part('target-empty').textContent).toBe('Không tìm thấy mục');
  expect(part('limit').textContent).toBe('Chọn tối đa 2 mục');
  await key(part('source-item-a'), 'Enter');
  expect(host.querySelector('[aria-live]')?.textContent).toBe(
    'Đã chuyển 1 mục sang đã chọn',
  );
});

it('encodes item selectors and keeps selection order across successive moves', async () => {
  const unusual = 'a/b "quoted"';
  await render({
    items: [...items, { id: unusual, label: 'Dolor' }],
    name: 'items',
    order: 'selection',
    defaultValue: ['d'],
  });
  const option = host.querySelector<HTMLElement>(
    `[data-testid="transfer-source-item-${encodeURIComponent(unusual)}"]`,
  )!;
  await key(option, 'Enter');
  await key(part('source-item-b'), 'Enter');
  expect(ids()).toEqual(['d', unusual, 'b']);
  await key(part('target-item-d'), 'Enter');
  await key(part('source-item-d'), 'Enter');
  expect(ids()).toEqual([unusual, 'b', 'd']);
});

it('forwards blur when focus leaves the composite and associates the limit hint with both lists', async () => {
  const onBlur = vi.fn();
  await render({ onBlur, maxSelected: 2 });
  await act(async () => part('source-item-a').focus());
  await act(async () => part('source-item-b').focus());
  expect(onBlur).not.toHaveBeenCalled();
  await act(async () => part('source-item-b').blur());
  expect(onBlur).toHaveBeenCalledTimes(1);
  expect(part('source-list').getAttribute('aria-describedby')).toBe(part('limit').id);
  expect(part('target-list').getAttribute('aria-describedby')).toBe(part('limit').id);
});
