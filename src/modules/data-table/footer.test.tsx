// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent, within } from 'storybook/test';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { DataTable, type DataTableProps, type DataTableState } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
type Row = { id: string };
const rows = [{ id: 'one' }];
const columns = [{ accessorKey: 'id', header: 'ID' }];
const state: DataTableState = {
  sorting: [],
  pagination: { pageIndex: 2, pageSize: 10 },
  globalFilter: 'lorem',
};

const baseProps = {
  caption: 'Lorem ipsum',
  rows,
  columns,
  rowId: (row: Row) => row.id,
  'data-testid': 'table',
};

const render = (
  props: DataTableProps<Row> = { ...baseProps, pagination: true },
  locale = 'en-US',
) =>
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <DataTable {...props} />
      </UILocaleProvider>,
    ),
  );

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
});

it('selects page sizes by keyboard, resets the page and preserves controlled state', async () => {
  const onStateChange = vi.fn();
  render({
    ...baseProps,
    mode: 'server',
    rowCount: 100,
    state,
    onStateChange,
    classNames: { pageSize: 'custom-size' },
  });
  const trigger = within(host).getByRole('button', { name: 'Rows per page' });
  expect(trigger.dataset.testid).toBe('table-pageSize');
  expect(trigger.classList.contains('custom-size')).toBe(true);
  expect(trigger.textContent).toContain('10 rows');
  await act(async () => {
    trigger.focus();
    await userEvent.setup({ document }).keyboard('{ArrowDown}');
  });
  const menu = within(document.body).getByRole('menu', { name: 'Rows per page' });
  expect(within(menu).getAllByRole('menuitemradio')).toHaveLength(3);
  expect(
    within(menu)
      .getByRole('menuitemradio', { name: '10 rows' })
      .getAttribute('aria-checked'),
  ).toBe('true');
  await act(async () => {
    await userEvent.setup({ document }).keyboard('{End}{Enter}');
  });
  expect(onStateChange).toHaveBeenCalledExactlyOnceWith({
    ...state,
    pagination: { pageIndex: 0, pageSize: 50 },
  });
  expect(trigger.textContent).toContain('10 rows');
  expect(document.activeElement).toBe(trigger);
  render({
    ...baseProps,
    mode: 'server',
    rowCount: 100,
    state: onStateChange.mock.lastCall![0],
    onStateChange,
  });
  expect(trigger.textContent).toContain('50 rows');
});

it('localizes the trigger and options, updates uncontrolled sizes and disables while loading', async () => {
  render({ ...baseProps, pagination: true }, 'vi-VN');
  const trigger = within(host).getByRole('button', { name: 'Số dòng' });
  await act(async () => {
    trigger.focus();
    await userEvent.setup({ document }).keyboard('{Enter}');
  });
  await act(async () => {
    await userEvent
      .setup({ document })
      .click(within(document.body).getByRole('menuitemradio', { name: '20 dòng' }));
  });
  expect(trigger.textContent).toContain('20 dòng');
  render({ ...baseProps, pagination: true, loading: true }, 'vi-VN');
  expect((trigger as HTMLButtonElement).disabled).toBe(true);
});
