// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ColorPicker } from './index';
import { UIProvider } from '../../theme/provider';
import { Form, FormField, useAppForm } from '../../modules/form';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.unstubAllGlobals();
});

function trigger() {
  return host.querySelector('button')!;
}

async function open() {
  await act(async () => trigger().click());
}

function hex() {
  return document.querySelector<HTMLInputElement>('[data-testid="color-hex"]')!;
}

function edit(text: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      hex(),
      text,
    );
    hex().dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function enter() {
  act(() =>
    hex().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    ),
  );
}

it('normalizes valid drafts on Enter and blur, rejects invalid drafts and selects presets', async () => {
  const changed = vi.fn();

  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <form>
          <ColorPicker
            name="color"
            data-testid="color"
            presets={['#ABC', 'invalid']}
            onValueChange={changed}
          />
        </form>
      </UIProvider>,
    ),
  );

  await open();
  expect(document.querySelector('[role="dialog"]')!.getAttribute('aria-label')).toBe(
    'Color',
  );
  expect(document.querySelectorAll('[role="slider"]')).toHaveLength(2);
  for (const text of ['#ABC', '#123456']) {
    edit(text);
    enter();
    expect(changed).toHaveBeenLastCalledWith(text === '#ABC' ? '#aabbcc' : text);
  }
  for (const text of ['red', '#abcd', '#12345678', '#ggg', '']) {
    changed.mockClear();
    edit(text);
    enter();
    expect(changed).not.toHaveBeenCalled();
    expect(hex().getAttribute('aria-invalid')).toBe('true');
  }
  edit('#DEF');

  act(() => hex().dispatchEvent(new FocusEvent('focusout', { bubbles: true })));

  expect(changed).toHaveBeenLastCalledWith('#ddeeff');

  act(() =>
    (
      document.querySelector('[data-testid="color-preset-aabbcc"]') as HTMLButtonElement
    ).click(),
  );

  expect(new FormData(host.querySelector('form')!).get('color')).toBe('#aabbcc');
  expect(
    document
      .querySelector('[data-testid="color-preset-aabbcc"]')!
      .getAttribute('aria-pressed'),
  ).toBe('true');
});

it('keeps controlled values host-owned and follows updates while editing', async () => {
  const changed = vi.fn();

  act(() =>
    root.render(
      <ColorPicker data-testid="color" value="#123456" onValueChange={changed} />,
    ),
  );

  await open();
  edit('#abc');
  enter();
  expect(changed).toHaveBeenLastCalledWith('#aabbcc');
  expect(trigger().textContent).toContain('#123456');
  edit('invalid');

  act(() =>
    root.render(
      <ColorPicker data-testid="color" value="#abcdef" onValueChange={changed} />,
    ),
  );

  expect(hex().value).toBe('#abcdef');
});

it('supports alpha normalization and keyboard slider changes, traps focus and returns it on Escape', async () => {
  const changed = vi.fn();

  act(() =>
    root.render(
      <ColorPicker
        data-testid="color"
        alpha
        defaultValue="#FF0000"
        onValueChange={changed}
      />,
    ),
  );

  await open();
  const sliders = document.querySelectorAll<HTMLElement>('[role="slider"]');
  expect(sliders).toHaveLength(3);
  expect(document.activeElement).toBe(sliders[0]);

  act(() =>
    sliders[1]!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        keyCode: 39,
        bubbles: true,
        cancelable: true,
      }),
    ),
  );

  expect(changed).toHaveBeenCalled();
  edit('#ABC');
  enter();
  expect(changed).toHaveBeenLastCalledWith('#aabbccff');
  edit('#12345678');
  enter();
  expect(changed).toHaveBeenLastCalledWith('#12345678');
  const last = hex();

  act(() => last.focus());

  act(() =>
    last.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    ),
  );

  expect(document.activeElement).toBe(sliders[0]);
  await act(async () =>
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    ),
  );
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(document.activeElement).toBe(trigger());
});

it('forwards refs, attributes, classes, selectors and associated feedback', async () => {
  const ref = createRef<HTMLButtonElement>();

  act(() =>
    root.render(
      <ColorPicker
        ref={ref}
        id="choice"
        data-testid="color"
        label="Color"
        hint="Hint"
        aria-describedby="external"
        className="border-brand-700"
        classNames={{
          root: 'custom-root',
          control: 'border-danger-700',
          popover: 'custom-popover',
          picker: 'custom-picker',
          swatch: 'custom-swatch',
        }}
      />,
    ),
  );

  expect(ref.current).toBe(trigger());
  expect(host.querySelector('label')!.htmlFor).toBe('choice');
  expect(trigger().getAttribute('aria-describedby')).toBe('external choice-hint');
  expect(trigger().className).toContain('border-brand-700');
  expect(trigger().className.split(' ')).not.toContain('border-danger-700');
  expect(trigger().className).toContain('focus-visible:outline-focus');
  expect(host.querySelector('[data-testid="color-root"]')!.className).toContain(
    'custom-root',
  );
  expect(host.querySelector('[data-testid="color-swatch"]')!.className).toContain(
    'custom-swatch',
  );
  await open();
  expect(document.querySelector('[data-testid="color-popover"]')!.className).toContain(
    'custom-popover',
  );
  expect(document.querySelector('[data-testid="color-picker"]')!.className).toContain(
    'custom-picker',
  );
  expect(document.querySelector('[classNames]')).toBeNull();

  act(() => root.render(<ColorPicker id="choice" error="Error" hint="Hint" />));

  expect(trigger().getAttribute('aria-invalid')).toBe('true');
  expect(trigger().getAttribute('aria-describedby')).toBe('choice-error');
});

it('prevents opening disabled and read-only controls and excludes disabled values from submission', async () => {
  for (const disabled of [true, false]) {
    act(() =>
      root.render(
        <form>
          <ColorPicker
            name="color"
            defaultValue="#abc"
            disabled={disabled}
            readOnly={!disabled}
          />
        </form>,
      ),
    );

    await open();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(new FormData(host.querySelector('form')!).get('color')).toBe(
      disabled ? null : '#aabbcc',
    );
  }
});

it('only offers supported screen sampling, handles cancellation and normalizes its result', async () => {
  let resolve!: (value: { sRGBHex: string }) => void;
  const sample = vi.fn(
    () =>
      new Promise<{ sRGBHex: string }>((done) => {
        resolve = done;
      }),
  );

  act(() => root.render(<ColorPicker data-testid="color" />));

  await open();
  expect(document.querySelector('[data-testid="color-eyeDropper"]')).toBeNull();

  act(() => root.unmount());

  root = createRoot(host);
  vi.stubGlobal(
    'EyeDropper',
    class {
      open = sample;
    },
  );
  const changed = vi.fn();

  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <ColorPicker data-testid="color" onValueChange={changed} />
      </UIProvider>,
    ),
  );

  await open();
  await act(async () =>
    (
      document.querySelector('[data-testid="color-eyeDropper"]') as HTMLButtonElement
    ).click(),
  );
  await act(async () => resolve({ sRGBHex: '#AABBCC' }));
  expect(changed).toHaveBeenLastCalledWith('#aabbcc');
  sample.mockRejectedValueOnce(new DOMException('Cancelled', 'AbortError'));
  await act(async () =>
    (
      document.querySelector('[data-testid="color-eyeDropper"]') as HTMLButtonElement
    ).click(),
  );
  expect(changed).toHaveBeenCalledOnce();
});

it('localizes slider names and value descriptions and honors eyeDropper opt-out', async () => {
  vi.stubGlobal(
    'EyeDropper',
    class {
      open = vi.fn();
    },
  );

  act(() =>
    root.render(
      <UIProvider locale="vi-VN">
        <ColorPicker data-testid="color" eyeDropper={false} />
      </UIProvider>,
    ),
  );

  await open();
  const slider = document.querySelector<HTMLElement>('[role="slider"]')!;
  const labelId = slider.getAttribute('aria-labelledby');
  expect(labelId).toBeTruthy();
  expect(document.getElementById(labelId!)!.textContent).toBe('Độ bão hòa và độ sáng');
  expect(slider.getAttribute('aria-valuetext')).toContain('Độ bão hòa');
  expect(slider.className).toContain('focus-visible:outline-focus');
  expect(document.querySelector('[data-testid="color-eyeDropper"]')).toBeNull();
});

it('auto-binds FormField and submits its hex value', async () => {
  const saved = vi.fn();

  function Demo() {
    const form = useAppForm({
      defaultValues: { color: '#123456' },
      onSubmit: async ({ value }) => {
        saved(value);
      },
    });

    return (
      <Form form={form}>
        <FormField name="color" label="Color">
          <ColorPicker data-testid="color" />
        </FormField>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  expect(host.querySelector('label')!.htmlFor).toBe(trigger().id);
  await open();
  edit('#abc');
  enter();
  await act(async () =>
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
  expect(saved).toHaveBeenCalledWith({ color: '#aabbcc' });
});
