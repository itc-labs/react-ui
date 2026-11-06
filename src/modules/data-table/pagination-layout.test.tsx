// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { within } from 'storybook/test';
import { UIProvider } from '../../theme/provider';
import { DataTable, DataTableRoot, DataTablePagination, useDataTable } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let resized: () => void;
let height = 540;
let width = 800;
const columns = [{ accessorKey: 'id', header: 'ID' }];
const rows = Array.from({ length: 23 }, (_, i) => ({ id: String(i + 1) }));
const props = {
  rows,
  columns,
  caption: 'Records',
  rowId: (row: { id: string }) => row.id,
  pagination: true,
  'data-testid': 'records',
};

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  height = 540;
  width = 800;

  vi.spyOn(HTMLTableElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ height, width }) as DOMRect,
  );

  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
      constructor(callback: () => void) {
        resized = callback;
      }
    },
  );
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('retains measured height on a 3/10 final page and synchronizes top/bottom controls without fake rows', () => {
  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <DataTable {...props} paginationPlacement="both" verticalAlign="middle" />
      </UIProvider>,
    ),
  );

  const footer = within(host).getByTestId('records-footer');
  const top = within(host).getByTestId('records-top-footer');
  const scroll = within(host).getByTestId('records-scrollArea');
  expect(scroll.style.minHeight).toBe('540px');

  act(() => within(footer).getByRole('button', { name: 'Last page' }).click());

  height = 180;

  act(() => resized());

  expect(host.querySelectorAll('tbody [data-row-id]')).toHaveLength(3);
  expect(scroll.style.minHeight).toBe('540px');
  expect(within(top).getByText('Page 3 / 3')).toBeDefined();
  expect(
    within(top).getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled,
  ).toBe(true);
  expect(
    Array.from(host.querySelectorAll('tbody td')).every((cell) =>
      cell.classList.contains('align-middle'),
    ),
  ).toBe(true);

  act(() => within(top).getByRole('button', { name: 'Previous page' }).click());

  expect(within(footer).getByText('Page 2 / 3')).toBeDefined();

  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <DataTable {...props} rows={rows.slice(0, 3)} />
      </UIProvider>,
    ),
  );

  expect(scroll.style.minHeight).toBe('180px');
});

it('shares one controller with a separate host footer and preserves server selection on navigation', () => {
  const change = vi.fn();

  function Example() {
    const { pagination: _pagination, ...base } = props;
    const controller = useDataTable({
      ...base,
      mode: 'server',
      rowCount: 23,
      state: {
        sorting: [],
        pagination: { pageIndex: 1, pageSize: 10 },
        rowSelection: { '2': true },
      },
      onStateChange: change,
      paginationPlacement: 'none',
    });

    return (
      <>
        <DataTableRoot controller={controller} />
        <footer data-testid="host-footer">
          <DataTablePagination
            controller={controller}
            data-testid="external"
            variant="compact"
          />
        </footer>
      </>
    );
  }

  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <Example />
      </UIProvider>,
    ),
  );

  expect(within(host).queryByTestId('records-footer')).toBeNull();

  act(() => within(host).getByRole('button', { name: 'Next page' }).click());

  expect(change).toHaveBeenCalledExactlyOnceWith({
    sorting: [],
    pagination: { pageIndex: 2, pageSize: 10 },
    rowSelection: { '2': true },
  });
});

it('allows natural page height and disables all pagination while loading', () => {
  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <DataTable
          {...props}
          preservePageHeight={false}
          loading
          paginationPlacement="both"
        />
      </UIProvider>,
    ),
  );

  expect(within(host).getByTestId('records-scrollArea').style.minHeight).toBe('');
  for (const nav of within(host).getAllByRole('navigation'))
    expect(
      Array.from(nav.querySelectorAll('button')).every((button) => button.disabled),
    ).toBe(true);
});

it('remeasures on width changes so wrapping from a narrow layout does not leave excess whitespace', () => {
  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <DataTable {...props} />
      </UIProvider>,
    ),
  );

  const scroll = within(host).getByTestId('records-scrollArea');
  width = 390;
  height = 800;

  act(() => resized());

  expect(scroll.style.minHeight).toBe('800px');
  width = 1200;
  height = 400;

  act(() => resized());

  expect(scroll.style.minHeight).toBe('400px');
  height = 160;

  act(() => resized());

  expect(scroll.style.minHeight).toBe('400px');
});

it('clamps a removed server page once data settles, while leaving loading and error states alone', () => {
  const change = vi.fn();
  const { pagination: _pagination, ...base } = props;
  const serverProps = {
    ...base,
    mode: 'server' as const,
    rowCount: 3,
    rows: rows.slice(0, 3),
    state: { sorting: [], pagination: { pageIndex: 2, pageSize: 10 } },
    onStateChange: change,
  };

  act(() => root.render(<DataTable {...serverProps} loading />));

  expect(change).not.toHaveBeenCalled();

  act(() => root.render(<DataTable {...serverProps} error="Request failed" />));

  expect(change).not.toHaveBeenCalled();

  act(() => root.render(<DataTable {...serverProps} />));

  expect(change).toHaveBeenCalledExactlyOnceWith({
    sorting: [],
    pagination: { pageIndex: 0, pageSize: 10 },
  });
});
