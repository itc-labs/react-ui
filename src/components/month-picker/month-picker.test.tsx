// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as v from 'valibot';
import { enUS, viVN } from '../../i18n';
import { UILocaleProvider } from '../../i18n/provider';
import { Form, FormField, useAppForm } from '../../modules/form';
import { MonthPicker } from './index';

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
  return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

function month(value: string) {
  return byId(`period-months-month-${value}`) as HTMLButtonElement;
}

function press(key: string) {
  act(() => {
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
  });
}

function Controlled({
  initial = null,
  onChange,
  ...props
}: {
  initial?: string | null;
  onChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  clearable?: boolean;
}) {
  const [value, setValue] = useState(initial);

  return (
    <MonthPicker
      data-testid="period"
      label="Billing period"
      name="period"
      currentMonth="2026-11"
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...props}
    />
  );
}

it('formats the trigger by UI locale and submits the raw YYYY-MM value', () => {
  const viHtml = renderToStaticMarkup(
    <UILocaleProvider locale={viVN}>
      <MonthPicker name="period" defaultValue="2026-11" />
      <MonthPicker />
    </UILocaleProvider>,
  );
  expect(viHtml).toContain('11/2026');
  expect(viHtml).toContain('Chọn tháng');
  expect(viHtml).toContain('name="period" value="2026-11"');

  const en = renderToStaticMarkup(
    <UILocaleProvider locale={enUS}>
      <MonthPicker name="period" defaultValue="2026-03" />
      <MonthPicker />
    </UILocaleProvider>,
  );
  expect(en).toContain('Mar 2026');
  expect(en).toContain('Select month');
  expect(en).toContain('name="period" value="2026-03"');
});

it('reports invalid and out-of-range values and rejects invalid bounds', () => {
  const html = renderToStaticMarkup(
    <UILocaleProvider locale={enUS}>
      <MonthPicker defaultValue="2026-13" />
      <MonthPicker defaultValue="2025-01" min="2026-01" />
    </UILocaleProvider>,
  );
  expect(html).toContain('Invalid month.');
  expect(html).toContain('2026-13');
  expect(html).toContain('Month is outside the allowed range.');
  expect(() =>
    renderToStaticMarkup(<MonthPicker min="2027-01" max="2026-01" />),
  ).toThrow(RangeError);
});

it('selects a month, closes the popover and returns focus to the trigger', async () => {
  const changed = vi.fn();
  await act(async () =>
    root.render(
      <UILocaleProvider locale={enUS}>
        <Controlled initial="2026-11" onChange={changed} />
      </UILocaleProvider>,
    ),
  );
  const trigger = byId('period')!;

  act(() => trigger.click());

  expect(byId('period-popover')?.getAttribute('role')).toBe('dialog');
  expect(byId('period-months-grid')?.getAttribute('role')).toBe('grid');
  expect(month('2026-11').getAttribute('aria-label')).toBe(
    'This month, November 2026, selected',
  );
  expect(month('2026-11').getAttribute('aria-current')).toBe('date');
  expect(month('2026-11').parentElement?.getAttribute('aria-selected')).toBe('true');
  expect(month('2026-03').textContent).toBe('Mar');
  await vi.waitFor(() => expect(document.activeElement).toBe(month('2026-11')));
  expect(month('2026-11').tabIndex).toBe(0);
  expect(month('2026-03').tabIndex).toBe(-1);

  act(() => month('2026-03').click());

  expect(changed).toHaveBeenLastCalledWith('2026-03');
  expect(trigger.textContent).toContain('Mar 2026');
  expect(byId('period-popover')).toBeNull();
  await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(host.querySelector<HTMLInputElement>('input[name="period"]')?.value).toBe(
    '2026-03',
  );
});

it('disables months and year navigation outside min/max', async () => {
  await act(async () =>
    root.render(<Controlled initial="2026-05" min="2026-03" max="2027-02" />),
  );

  act(() => byId('period')!.click());

  expect(month('2026-02').disabled).toBe(true);
  expect(month('2026-03').disabled).toBe(false);
  expect(byId('period-months-previous')).toHaveProperty('disabled', true);
  expect(byId('period-months-next')).toHaveProperty('disabled', false);

  act(() => byId('period-months-next')!.click());

  expect(byId('period-months-caption')?.textContent).toBe('2027');
  expect(month('2027-02').disabled).toBe(false);
  expect(month('2027-03').disabled).toBe(true);
  expect(byId('period-months-next')).toHaveProperty('disabled', true);
  expect(byId('period-months-previous')).toHaveProperty('disabled', false);
});

it('moves focus with arrows across years, Home/End and PageUp/PageDown within bounds', async () => {
  await act(async () =>
    root.render(<Controlled initial="2026-11" min="2025-06" max="2027-12" />),
  );

  act(() => byId('period')!.click());

  await vi.waitFor(() => expect(document.activeElement).toBe(month('2026-11')));

  const expectFocus = (value: string) => {
    expect(document.activeElement).toBe(month(value));
    expect(month(value).tabIndex).toBe(0);
  };

  press('ArrowRight');
  expectFocus('2026-12');
  press('ArrowRight');
  expectFocus('2027-01');
  expect(byId('period-months-caption')?.textContent).toBe('2027');
  press('ArrowDown');
  expectFocus('2027-04');
  press('ArrowUp');
  press('ArrowLeft');
  expectFocus('2026-12');
  press('Home');
  expectFocus('2026-01');
  press('End');
  expectFocus('2026-12');
  press('PageUp');
  expectFocus('2025-12');
  press('Home');
  expectFocus('2025-06');
  press('PageDown');
  press('PageDown');
  press('PageDown');
  expectFocus('2027-12');
  expect(byId('period-months-caption')?.textContent).toBe('2027');

  act(() => {
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
  });

  expect(byId('period-popover')).toBeNull();
  await vi.waitFor(() => expect(document.activeElement).toBe(byId('period')));
});

it('clears from the field and the panel, and selects the current month', async () => {
  const changed = vi.fn();
  await act(async () =>
    root.render(
      <UILocaleProvider locale={enUS}>
        <Controlled initial="2026-03" onChange={changed} />
      </UILocaleProvider>,
    ),
  );
  expect(byId('period-clear')?.getAttribute('aria-label')).toBe(
    'Clear month selection',
  );

  act(() => byId('period-clear')!.click());

  expect(changed).toHaveBeenLastCalledWith(null);
  expect(byId('period')!.textContent).toContain('Select month');
  expect(byId('period-clear')).toBeNull();

  act(() => byId('period')!.click());

  expect(byId('period-months-clearSelection')).toBeNull();

  act(() => byId('period-months-currentMonth')!.click());

  expect(changed).toHaveBeenLastCalledWith('2026-11');

  act(() => byId('period')!.click());

  act(() => byId('period-months-clearSelection')!.click());

  expect(changed).toHaveBeenLastCalledWith(null);
});

it('hides clear actions when not clearable and disables an out-of-range current month', async () => {
  await act(async () =>
    root.render(<Controlled initial="2027-03" min="2027-01" clearable={false} />),
  );
  expect(byId('period-clear')).toBeNull();

  act(() => byId('period')!.click());

  expect(byId('period-months-clearSelection')).toBeNull();
  expect(byId('period-months-currentMonth')).toHaveProperty('disabled', true);
});

it('binds through FormField with schema validation like other value controls', async () => {
  const saved = vi.fn();

  function Demo() {
    const form = useAppForm({
      defaultValues: { period: null as string | null },
      onSubmit: async ({ value }) => {
        saved(value);
      },
    });

    return (
      <UILocaleProvider locale={enUS}>
        <Form form={form} schema={{ period: v.string('Choose a billing period') }}>
          <FormField name="period" label="Billing period" required data-testid="period">
            <MonthPicker currentMonth="2026-11" />
          </FormField>
        </Form>
      </UILocaleProvider>
    );
  }

  await act(async () => root.render(<Demo />));

  const submit = async () =>
    act(async () => {
      host
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

  await submit();
  expect(saved).not.toHaveBeenCalled();
  expect(host.textContent).toContain('Choose a billing period');
  expect(byId('period')?.getAttribute('aria-invalid')).toBe('true');

  act(() => byId('period')!.click());

  act(() => month('2026-07').click());

  await submit();
  expect(saved).toHaveBeenCalledWith({ period: '2026-07' });
  expect(host.textContent).not.toContain('Choose a billing period');
});

it('provides MonthField to useAppForm', async () => {
  function Demo() {
    const form = useAppForm({ defaultValues: { period: '' } });

    return (
      <Form form={form}>
        <form.AppField name="period">
          {(field) => (
            <field.MonthField
              data-testid="period"
              label="Billing period"
              currentMonth="2026-11"
            />
          )}
        </form.AppField>
        <form.Subscribe selector={(state) => state.values.period}>
          {(period) => <output>{period}</output>}
        </form.Subscribe>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));

  act(() => byId('period')!.click());

  act(() => month('2026-09').click());

  expect(host.querySelector('output')?.textContent).toBe('2026-09');
  expect(host.querySelector<HTMLInputElement>('input[name="period"]')?.value).toBe(
    '2026-09',
  );
});
