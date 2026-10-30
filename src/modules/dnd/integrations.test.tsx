// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createRowReorder, createTransferDnd } from './index';
import { Transfer, type TransferProps } from '../transfer';
import { DataTable, type DataTableProps } from '../data-table';
import { UILocaleProvider } from '../../i18n/provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const items = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma', disabled: true },
  { id: 'd', label: 'Delta' },
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
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(56);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const part = (id: string) => host.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

const key = async (target: EventTarget, value: string) => {
  await act(async () => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
    );
  });
};

async function drag(handle: HTMLElement, ...keys: string[]) {
  act(() => handle.focus());

  await key(handle, ' ');
  for (const value of keys) await key(document, value);
}

const transferPlugin = createTransferDnd();

async function transfer(props: Partial<TransferProps> = {}) {
  await act(async () =>
    root.render(
      <UILocaleProvider locale="en-US">
        <Transfer
          items={items}
          dnd={transferPlugin}
          name="items"
          data-testid="transfer"
          {...props}
        />
      </UILocaleProvider>,
    ),
  );
}

const values = () =>
  Array.from(host.querySelectorAll<HTMLInputElement>('input[type="hidden"]')).map(
    (node) => node.value,
  );

it('moves checked rows across panels, retains classes/selectors and restores handle focus', async () => {
  const onValueChange = vi.fn();
  await transfer({
    onValueChange,
    className: 'transfer-root',
    classNames: { dragHandle: 'custom-grip', item: 'custom-row' },
  });

  act(() => {
    part('transfer-source-item-a').click();
    part('transfer-source-item-b').click();
  });

  const handle = part('transfer-source-dragHandle-a');
  expect(handle.className).toContain('custom-grip');
  expect(handle.getAttribute('aria-describedby')).toBeTruthy();
  expect(handle.getAttribute('aria-label')).toBe('Drag to reorder Alpha');
  await drag(handle, 'ArrowRight', 'Enter');
  expect(onValueChange).toHaveBeenCalledWith(['a', 'b']);
  expect(values()).toEqual(['a', 'b']);
  expect(document.activeElement).toBe(part('transfer-target-dragHandle-a'));
  expect(part('transfer').className).toContain('transfer-root');
  expect(part('transfer-target-item-a').className).toContain('custom-row');
  expect(part('transfer-source-item-c').getAttribute('aria-disabled')).toBe('true');
});

it('reorders the target in selection order even when order is source, and cancels without mutation', async () => {
  const onValueChange = vi.fn();
  await transfer({ defaultValue: ['a', 'b', 'd'], order: 'source', onValueChange });
  await drag(part('transfer-target-dragHandle-a'), 'ArrowDown', ' ');
  expect(values()).toEqual(['b', 'a', 'd']);
  expect(onValueChange).toHaveBeenLastCalledWith(['b', 'a', 'd']);
  await drag(part('transfer-target-dragHandle-a'), 'ArrowDown', 'Escape');
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(part('transfer-target-dragHandle-a'));
});

it.each(['disabled', 'capacity', 'oneWay', 'item'] as const)(
  'rejects %s moves without a callback',
  async (constraint) => {
    const onValueChange = vi.fn();
    await transfer({
      onValueChange,
      disabled: constraint === 'disabled',
      maxSelected: constraint === 'capacity' ? 0 : 10,
      oneWay: constraint === 'oneWay',
      defaultValue: constraint === 'oneWay' ? ['a'] : [],
    });
    const side = constraint === 'oneWay' ? 'target' : 'source';
    const id = constraint === 'item' ? 'c' : 'a';
    await drag(
      part(`transfer-${side}-dragHandle-${id}`),
      side === 'source' ? 'ArrowRight' : 'ArrowLeft',
      'Enter',
    );
    expect(onValueChange).not.toHaveBeenCalled();
  },
);

it('rejects the entire checked group when it exceeds capacity', async () => {
  const onValueChange = vi.fn();
  await transfer({ maxSelected: 1, onValueChange });

  act(() => {
    part('transfer-source-item-a').click();
    part('transfer-source-item-b').click();
  });

  await drag(part('transfer-source-dragHandle-a'), 'ArrowRight', 'Enter');
  expect(onValueChange).not.toHaveBeenCalled();
  expect(values()).toEqual([]);
});

it('keeps controlled Transfer values host-owned', async () => {
  const onValueChange = vi.fn();
  await transfer({ value: ['a', 'b'], onValueChange });
  await drag(part('transfer-target-dragHandle-a'), 'ArrowDown', 'Enter');
  expect(onValueChange).toHaveBeenCalledWith(['b', 'a']);
  expect(values()).toEqual(['a', 'b']);
});

it('reaches virtualized handles and drops into a virtualized target', async () => {
  await transfer({
    items: Array.from({ length: 250 }, (_, index) => ({
      id: String(index),
      label: `Lorem ${index}`,
    })),
    defaultValue: Array.from({ length: 120 }, (_, index) => String(index + 130)),
  });
  const handle = part('transfer-source-dragHandle-0');
  await drag(handle, 'End', 'ArrowRight', 'End', 'Enter');
  expect(values()).toContain('0');
  expect(values().at(-1)).toBe('0');
  expect(document.activeElement).toBe(part('transfer-target-dragHandle-0'));
  expect(host.querySelectorAll('[role="option"]').length).toBeLessThan(100);
});

type Row = { key: string; label: string };
const rows: Row[] = [
  { key: 'stable-a', label: 'Alpha' },
  { key: 'stable-b', label: 'Beta' },
  { key: 'stable-c', label: 'Gamma' },
];
const columns = [{ accessorKey: 'label', header: 'Name' }];
const tablePlugin = createRowReorder();
const defaults = {
  rows,
  columns,
  rowId: (row: Row) => row.key,
  caption: 'Rows',
  'data-testid': 'table',
};

async function table(props: Partial<DataTableProps<Row>> = {}, reorder = {}) {
  const onReorder = vi.fn();
  await act(async () =>
    root.render(
      <UILocaleProvider locale="en-US">
        <DataTable
          {...defaults}
          rowReorder={{ plugin: tablePlugin, onReorder, ...reorder }}
          {...(props as DataTableProps<Row>)}
        />
      </UILocaleProvider>,
    ),
  );

  return onReorder;
}

it('emits stable full row IDs and move positions without changing controlled table rows', async () => {
  const onReorder = await table({
    classNames: { dragHandle: 'grip-slot', reorderCell: 'cell-slot' },
  });
  const handle = part('table-dragHandle-stable-a');
  expect(handle.className).toContain('grip-slot');
  expect(part('table-reorderCell-stable-a').className).toContain('cell-slot');
  await drag(handle, 'ArrowDown', 'Enter');
  expect(onReorder).toHaveBeenCalledWith(['stable-b', 'stable-a', 'stable-c'], {
    id: 'stable-a',
    from: 0,
    to: 1,
  });
  expect(
    Array.from(host.querySelectorAll('[data-row-id]')).map((node) =>
      node.getAttribute('data-row-id'),
    ),
  ).toEqual(rows.map((row) => row.key));
  expect(document.activeElement).toBe(handle);
});

it('accepts host updates and supports whole-row keyboard reorder without a handle column', async () => {
  function Example() {
    const [value, setValue] = useState(rows);

    return (
      <DataTable
        {...defaults}
        rows={value}
        rowReorder={{
          plugin: tablePlugin,
          handle: false,
          onReorder: (ids) =>
            setValue(ids.map((id) => value.find((row) => row.key === id)!)),
        }}
      />
    );
  }

  act(() => root.render(<Example />));

  expect(host.querySelector('[data-testid^="table-dragHandle"]')).toBeNull();
  await drag(part('table-row-stable-a'), 'ArrowDown', ' ');
  expect(host.querySelector('[data-row-id]')?.getAttribute('data-row-id')).toBe(
    'stable-b',
  );
  expect(document.activeElement).toBe(part('table-row-stable-a'));
});

it('disables reorder while sorted and exposes the translated reason on a focusable handle', async () => {
  const onReorder = await table();

  act(() => part('table-sortButton-label').click());

  const handle = part('table-dragHandle-stable-a');
  expect(handle.getAttribute('aria-disabled')).toBe('true');
  expect(handle.title).toBe('Clear sorting to reorder rows.');
  expect(handle.tabIndex).toBe(0);
  await drag(handle, 'ArrowDown', 'Enter');
  expect(onReorder).not.toHaveBeenCalled();
});

it.each([false, true])(
  'requires an explicit server opt-in (allowed=%s)',
  async (allowed) => {
    const onReorder = await table(
      {
        mode: 'server',
        rowCount: 100,
        state: { sorting: [], pagination: { pageIndex: 0, pageSize: 10 } },
        onStateChange: vi.fn(),
      },
      { allowServerReorder: allowed },
    );
    await drag(part('table-dragHandle-stable-a'), 'ArrowDown', 'Enter');
    expect(onReorder).toHaveBeenCalledTimes(allowed ? 1 : 0);
  },
);

it('cancels table keyboard reorder and respects the disabled prop', async () => {
  const onReorder = await table();
  await drag(part('table-dragHandle-stable-a'), 'ArrowDown', 'Escape');
  expect(onReorder).not.toHaveBeenCalled();
  const disabledReorder = await table({}, { disabled: true });
  await drag(part('table-dragHandle-stable-a'), 'ArrowDown', 'Enter');
  expect(disabledReorder).not.toHaveBeenCalled();
});

it('moves a pointer-dragged row to an empty panel and keeps an inert overlay', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const list = this.closest<HTMLElement>('[data-testid$="-list"]');
    const left = list?.dataset.testid?.includes('target') ? 350 : 0;
    const row = this.closest<HTMLElement>('[data-dnd-item]');
    const top = row ? Array.from(row.parentElement!.children).indexOf(row) * 56 : 0;
    const height = row ? 56 : 280;

    return {
      x: left,
      y: top,
      left,
      top,
      width: 300,
      height,
      right: left + 300,
      bottom: top + height,
      toJSON() {},
    };
  });

  await transfer();

  const pointer = async (target: EventTarget, type: string, x: number) => {
    await act(async () => {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX: x,
        clientY: 20,
      });
      Object.defineProperties(event, {
        isPrimary: { value: true },
        pointerId: { value: 1 },
      });
      target.dispatchEvent(event);
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
  };

  await pointer(part('transfer-source-dragHandle-a'), 'pointerdown', 10);
  await pointer(document, 'pointermove', 20);
  const overlay = host.querySelector<HTMLElement>('[inert][aria-hidden="true"]');
  expect(overlay?.textContent).toBe('Alpha');
  await pointer(document, 'pointermove', 400);
  await pointer(document, 'pointerup', 400);
  expect(values()).toEqual(['a']);
});

it('localizes blocked handle tooltips and keeps table row semantics without handles', async () => {
  await act(async () =>
    root.render(
      <UILocaleProvider locale="vi-VN">
        <DataTable
          {...defaults}
          state={{
            sorting: [{ id: 'label', desc: false }],
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
          onStateChange={vi.fn()}
          rowReorder={{ plugin: tablePlugin, onReorder: vi.fn() }}
        />
      </UILocaleProvider>,
    ),
  );
  expect(part('table-dragHandle-stable-a').title).toBe(
    'Xóa sắp xếp để đổi thứ tự dòng.',
  );
  await act(async () => part('table-dragHandle-stable-a').focus());
  expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain(
    'Xóa sắp xếp để đổi thứ tự dòng.',
  );
  await table({}, { handle: false });
  expect(part('table-row-stable-a').getAttribute('role')).toBeNull();
});

it('retains all supplied IDs when reordering a filtered client view', async () => {
  const onReorder = await table({
    rows: rows.map((row) => ({
      ...row,
      label: row.key === 'stable-b' ? 'Hidden Beta' : `Keep ${row.label}`,
    })),
    state: {
      sorting: [],
      pagination: { pageIndex: 0, pageSize: 10 },
      globalFilter: 'Keep',
    },
    onStateChange: vi.fn(),
  });
  await drag(part('table-dragHandle-stable-a'), 'End', 'Enter');
  expect(onReorder).toHaveBeenCalledWith(['stable-b', 'stable-c', 'stable-a'], {
    id: 'stable-a',
    from: 0,
    to: 2,
  });
});

it('reorders checked target rows together and moves the checked target group back', async () => {
  await transfer({ defaultValue: ['a', 'b', 'd'] });

  act(() => {
    part('transfer-target-item-a').click();
    part('transfer-target-item-b').click();
  });

  await drag(part('transfer-target-dragHandle-a'), 'End', 'Enter');
  expect(values()).toEqual(['d', 'a', 'b']);
  await drag(part('transfer-target-dragHandle-a'), 'ArrowLeft', 'Enter');
  expect(values()).toEqual(['d']);
});
