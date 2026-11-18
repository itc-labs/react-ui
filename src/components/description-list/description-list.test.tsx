// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { DescriptionList, type DescriptionListProps } from './index';

function render(props: DescriptionListProps, locale = 'en-US') {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UILocaleProvider locale={locale}>
      <DescriptionList {...props} />
    </UILocaleProvider>,
  );

  return host;
}

const items = [
  { id: 'name', label: 'Name', value: 'Lorem' },
  { id: 'stock', label: 'Stock', value: 0 },
  { id: 'brand', label: 'Brand', value: '' },
  { id: 'note', label: 'Note', value: null, span: 'full' as const },
];

it('renders native dl/dt/dd pairs in item order', () => {
  const host = render({ items });
  const list = host.querySelector('dl');
  expect(list).not.toBeNull();
  expect(
    Array.from(host.querySelectorAll('dt')).map((node) => node.textContent),
  ).toEqual(['Name', 'Stock', 'Brand', 'Note']);
  expect(host.querySelectorAll('dl > div > dt + dd')).toHaveLength(4);
});

it('keeps zero as a value and renders a localized empty state for missing values', () => {
  const host = render({ items });
  const values = host.querySelectorAll('dd');
  expect(values[1]?.textContent).toBe('0');
  expect(values[1]?.hasAttribute('data-empty')).toBe(false);
  expect(values[2]?.getAttribute('data-empty')).toBe('true');
  expect(values[2]?.querySelector('[aria-hidden="true"]')?.textContent).toBe('—');
  expect(values[2]?.querySelector('.sr-only')?.textContent).toBe('Not set');
  expect(render({ items }, 'vi-VN').querySelector('.sr-only')?.textContent).toBe(
    'Chưa có',
  );
});

it('uses a caller empty value instead of the default', () => {
  const host = render({ items, emptyValue: 'N/A' });
  expect(host.querySelectorAll('dd')[2]?.textContent).toBe('N/A');
  expect(host.querySelector('.sr-only')).toBeNull();
});

it('applies columns, full-width items, inline layout and size', () => {
  const host = render({ items, columns: 2, layout: 'inline', size: 'sm' });
  const list = host.querySelector('dl')!;
  expect(list.className).toContain('sm:grid-cols-2');
  expect(list.className).toContain('text-ui-sm');
  expect(list.getAttribute('data-layout')).toBe('inline');
  const rows = host.querySelectorAll('dl > div');
  expect(rows[3]?.className).toContain('sm:col-span-2');
  expect(rows[0]?.className).not.toContain('col-span');
  expect(rows[0]?.className).toContain('sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]');
});

it('forwards native props, merges classes after defaults and derives part test IDs', () => {
  const host = render({
    items,
    id: 'details',
    'aria-label': 'Details',
    className: 'gap-y-8',
    classNames: { label: 'font-medium', value: 'font-mono' },
    'data-testid': 'details',
  });
  const list = host.querySelector('dl')!;
  expect(list.id).toBe('details');
  expect(list.getAttribute('aria-label')).toBe('Details');
  expect(list.className.endsWith('gap-y-8')).toBe(true);
  expect(host.querySelector('[data-testid="details-label-name"]')?.className).toContain(
    'font-medium',
  );
  expect(host.querySelector('[data-testid="details-value-name"]')?.className).toContain(
    'font-mono',
  );
  expect(host.querySelector('[data-testid="details-item-stock"]')).not.toBeNull();
  expect(render({ items }).innerHTML).not.toContain('data-testid');
});
