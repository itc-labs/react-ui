// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it } from 'vitest';
import { fr } from 'date-fns/locale/fr';
import { UIProvider } from '../theme/provider';
import { useFormatters } from './use-formatters';
import { DateFormat } from '../format';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
});

function Example() {
  const { formatNumber, formatCurrency, formatDate } = useFormatters();
  const [draft] = useState('retained');

  return (
    <>
      <output data-testid="number">{formatNumber(1234.5)}</output>
      <output data-testid="money">{formatCurrency(1234.5, 'USD')}</output>
      <output data-testid="date">{formatDate('2026-11-06', 'MMMM')}</output>
      <output data-testid="override">
        {formatDate('2026-11-06', 'MMMM', { locale: 'en-US' })}
      </output>
      <input value={draft} readOnly />
    </>
  );
}

it('tracks UIProvider locale changes without remounting children or changing currency denomination', () => {
  act(() =>
    root.render(
      <UIProvider locale="vi-VN">
        <Example />
      </UIProvider>,
    ),
  );

  const input = host.querySelector('input');
  expect(host.querySelector('[data-testid=number]')?.textContent).toBe('1.234,5');
  expect(host.querySelector('[data-testid=date]')?.textContent).toBe('tháng 11');
  expect(host.querySelector('[data-testid=override]')?.textContent).toBe('November');

  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <Example />
      </UIProvider>,
    ),
  );

  expect(host.querySelector('[data-testid=number]')?.textContent).toBe('1,234.5');
  expect(host.querySelector('[data-testid=money]')?.textContent).toBe('$1,234.50');
  expect(host.querySelector('[data-testid=date]')?.textContent).toBe('November');
  expect(host.querySelector('input')).toBe(input);
});

it('keeps sibling scopes independent and permits hook defaults plus per-call overrides', () => {
  function Overrides() {
    const { formatDate, formatNumber } = useFormatters({
      locale: 'en-US',
      timeZone: 'Asia/Ho_Chi_Minh',
      fallback: 'Missing',
      dateLocale: fr,
    });

    return (
      <output>
        {[
          formatNumber(1234.5),
          formatNumber(null),
          formatNumber(1234.5, { locale: 'vi-VN' }),
          formatDate('2026-11-06T08:30:00Z', DateFormat.DMY_TIME),
          formatDate('2026-11-06', 'MMMM'),
          formatDate('2026-11-06', 'MMMM', { locale: 'en-US' }),
          formatDate('2026-11-06', { locale: 'en-US', year: 'numeric' }),
        ].join('|')}
      </output>
    );
  }

  act(() =>
    root.render(
      <>
        <UIProvider locale="vi-VN">
          <Example />
        </UIProvider>
        <UIProvider locale="en-US">
          <Overrides />
        </UIProvider>
      </>,
    ),
  );

  expect(host.textContent).toContain('1.234,5');
  expect(host.textContent).toContain(
    '1,234.5|Missing|1.234,5|06/11/2026 15:30|novembre|November|2026',
  );
});
