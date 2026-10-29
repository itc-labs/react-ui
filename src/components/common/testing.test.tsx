// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Input } from '../input';
import { Textarea } from '../textarea';
import { InputOTP } from '../input-otp';
import { InputPassword } from '../input-password';
import { NumberInput } from '../number-input';
import { Checkbox } from '../checkbox';
import { Switch } from '../switch';
import { RadioGroup } from '../radio-group';
import { Avatar } from '../avatar';
import { UploadField } from '../upload-field';
import { Select } from '../select';
import { Calendar } from '../calendar';
import { DatePicker } from '../date-picker';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../dialog';
import { DataTable, type DataTableState } from '../../modules/data-table';
import { Tree } from '../../modules/tree';
import { partTestId } from './testing';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.unstubAllGlobals();
});

function byId(id: string) {
  return document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
}

function unique() {
  const ids = Array.from(document.querySelectorAll('[data-testid]')).map((node) =>
    node.getAttribute('data-testid'),
  );
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
}

it('does not emit implicit test IDs and encodes stable keys without locale labels', async () => {
  expect(partTestId(undefined, 'row', 'a/b')).toBeUndefined();
  expect(partTestId('orders', 'row', 'a/b')).toBe('orders-row-a%2Fb');
  await act(async () =>
    root.render(
      <>
        <Input />
        <Avatar alt="Example" />
        <Select options={[]} />
        <Checkbox />
        <Calendar today="2026-10-28" />
      </>,
    ),
  );
  expect(document.querySelectorAll('[data-testid]')).toHaveLength(0);
});

it('targets actual controls and unique compound parts rather than dropping native attributes', async () => {
  await act(async () =>
    root.render(
      <>
        <Input data-testid="name" label="Name" error="Required" />
        <Textarea data-testid="body" />
        <InputOTP data-testid="otp" />
        <InputPassword data-testid="password" />
        <NumberInput data-testid="quantity" />
        <Checkbox data-testid="agree" />
        <Switch data-testid="enabled" label="Enabled" />
        <RadioGroup
          data-testid="mode"
          label="Mode"
          options={[
            { value: 'a/b', label: 'First' },
            { value: 'b', label: 'Second' },
          ]}
        />
        <Avatar data-testid="person" alt="Example" />
        <UploadField data-testid="files" />
        <Tree
          data-testid="tree"
          label="Tree"
          nodes={[
            {
              id: 'folder',
              label: 'Folder',
              children: [{ id: 'child', label: 'Child' }],
            },
          ]}
        />
      </>,
    ),
  );
  expect(byId('name').tagName).toBe('INPUT');
  expect(byId('body').tagName).toBe('TEXTAREA');
  expect(byId('otp').tagName).toBe('INPUT');
  expect(byId('otp-slot-5')).not.toBeNull();
  expect(byId('agree').getAttribute('role')).toBe('checkbox');
  expect(byId('mode-optionControl-a%2Fb').getAttribute('role')).toBe('radio');
  expect(byId('files-input').getAttribute('type')).toBe('file');
  expect(byId('name-error').textContent).toBe('Required');

  act(() => byId('password-toggle').click());

  expect(byId('password').getAttribute('type')).toBe('text');

  act(() => byId('quantity-increase').click());

  expect((byId('quantity') as HTMLInputElement).value).toBe('1');
  unique();
});

it('preserves option selectors across reordered remote search results and portal menus', async () => {
  const selected = vi.fn();

  const render = (reversed = false) => (
    <Select
      data-testid="category"
      searchable
      clearable
      value="a/b"
      options={
        reversed
          ? [
              { value: 'b', label: 'Second' },
              { value: 'a/b', label: 'Changed label' },
            ]
          : [
              { value: 'a/b', label: 'First' },
              { value: 'b', label: 'Second' },
            ]
      }
      onValueChange={selected}
    />
  );

  await act(async () => root.render(render()));
  const input = host.querySelector<HTMLInputElement>('[role="combobox"]')!;
  await act(async () => {
    input.focus();
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
  });
  expect(byId('category-menu')).not.toBeNull();
  expect(host.contains(byId('category-menu'))).toBe(false);
  expect(byId('category-option-a%2Fb').textContent).toBe('First');
  await act(async () => root.render(render(true)));
  expect(byId('category-option-a%2Fb').textContent).toBe('Changed label');

  act(() => byId('category-option-b').click());

  expect(selected).toHaveBeenCalledWith('b');
  unique();
});

it('keeps stable table row/cell/select IDs across pages, with numbered pagination buttons', async () => {
  function Demo() {
    const [state, onStateChange] = useState<DataTableState>({
      sorting: [],
      pagination: { pageIndex: 0, pageSize: 1 },
    });

    return (
      <DataTable
        data-testid="orders"
        caption="Orders"
        rows={[
          { id: 'a/b', name: 'First' },
          { id: 'two', name: 'Second' },
        ]}
        columns={[{ accessorKey: 'name', header: 'Name' }]}
        rowId={(row) => row.id}
        state={state}
        onStateChange={onStateChange}
        pagination
        selectable
        filterable
        hideableColumns
      />
    );
  }

  await act(async () => root.render(<Demo />));
  expect(byId('orders-row-a%2Fb')).not.toBeNull();
  expect(byId('orders-cell-a%2Fb-name').textContent).toBe('First');

  act(() => byId('orders-checkbox-a%2Fb').click());

  await act(async () => byId('orders-pagination-page-2').click());
  expect(byId('orders-row-two')).not.toBeNull();
  await act(async () => byId('orders-pagination-page-1').click());
  expect(byId('orders-checkbox-a%2Fb').getAttribute('data-state')).toBe('checked');
  unique();
});

it('exposes date trigger, clear action, calendar day and portal dismissal selectors', async () => {
  await act(async () =>
    root.render(<DatePicker data-testid="date" defaultValue="2026-10-17" />),
  );

  act(() => byId('date').click());

  expect(byId('date-popover').getAttribute('role')).toBe('dialog');
  expect(byId('date-calendar-day-2026-10-17')).not.toBeNull();
  expect(byId('date-calendar-next')).not.toBeNull();
  unique();
  await act(async () =>
    root.render(
      <Dialog open>
        <DialogContent data-testid="confirm">
          <DialogTitle>Confirm</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    ),
  );
  expect(byId('confirm').getAttribute('role')).toBe('dialog');
  expect(byId('confirm-overlay')).not.toBeNull();
  expect(byId('confirm-close').tagName).toBe('BUTTON');
  unique();
});
