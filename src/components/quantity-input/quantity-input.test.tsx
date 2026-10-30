// @vitest-environment jsdom
import { act, createRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { QuantityInput } from './index';
import { UIProvider } from '../../theme/provider';

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
});

function input() {
  return host.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
}

function buttons() {
  return Array.from(host.querySelectorAll('button'));
}

function change(text: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input(),
      text,
    );
    input().dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function blur() {
  act(() => input().dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
}

function key(key: string) {
  act(() =>
    input().dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    ),
  );
}

it('defaults to min, steps without submitting, exposes bounds and submits a raw hidden value', () => {
  const submit = vi.fn(),
    changed = vi.fn();

  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <form onSubmit={submit}>
          <QuantityInput
            name="quantity"
            min={2}
            max={6}
            step={2}
            onValueChange={changed}
          />
        </form>
      </UIProvider>,
    ),
  );

  expect(input().value).toBe('2');
  expect(input().inputMode).toBe('numeric');
  expect(input().getAttribute('aria-label')).toBe('Quantity');
  expect(input().getAttribute('aria-valuemin')).toBe('2');
  expect(input().getAttribute('aria-valuemax')).toBe('6');
  expect(buttons()[0]!.getAttribute('aria-label')).toBe('Decrease quantity');
  expect(buttons()[1]!.getAttribute('aria-label')).toBe('Increase quantity');
  expect(buttons()[0]!.disabled).toBe(true);

  act(() => buttons()[1]!.click());

  expect(changed).toHaveBeenLastCalledWith(4);
  expect(input().getAttribute('aria-valuenow')).toBe('4');
  expect(new FormData(host.querySelector('form')!).get('quantity')).toBe('4');

  act(() => buttons()[1]!.click());

  expect(buttons()[1]!.disabled).toBe(true);
  expect(submit).not.toHaveBeenCalled();

  act(() => buttons()[0]!.click());

  expect(input().value).toBe('4');
});

it('supports arrow and page keys, clamps and ignores prevented keyboard events', () => {
  act(() => root.render(<QuantityInput min={1} max={25} step={2} />));

  key('ArrowUp');
  expect(input().value).toBe('3');
  key('PageUp');
  expect(input().value).toBe('23');
  key('PageUp');
  expect(input().value).toBe('25');
  key('ArrowDown');
  expect(input().value).toBe('23');
  key('PageDown');
  expect(input().value).toBe('3');
  key('PageDown');
  expect(input().value).toBe('1');

  act(() =>
    root.render(<QuantityInput onKeyDown={(event) => event.preventDefault()} />),
  );

  key('ArrowUp');
  expect(input().value).toBe('1');
});

it('accepts digits, restores empty or invalid edits, and normalizes bounds and the min-based step grid on blur', () => {
  const changed = vi.fn();

  act(() =>
    root.render(
      <QuantityInput
        min={2}
        max={9}
        step={2}
        defaultValue={4}
        onValueChange={changed}
      />,
    ),
  );

  change('6');
  expect(changed).toHaveBeenLastCalledWith(6);
  change('');
  expect(input().value).toBe('');
  blur();
  expect(input().value).toBe('6');
  for (const invalid of ['abc', '-1', '2.5', '1e3']) {
    change(invalid);
    expect(input().value).toBe('6');
  }
  change('99');
  expect(input().value).toBe('99');
  expect(input().getAttribute('aria-valuenow')).toBe('6');
  blur();
  expect(input().value).toBe('8');
  expect(buttons()[1]!.disabled).toBe(true);
  change('1');
  blur();
  expect(input().value).toBe('2');
  change('5');
  blur();
  expect(input().value).toBe('6');
  change('9'.repeat(400));
  blur();
  expect(input().value).toBe('6');
});

it('keeps controlled values host-owned and follows external updates including pending drafts', () => {
  const changed = vi.fn();

  act(() => root.render(<QuantityInput value={3} onValueChange={changed} />));

  act(() => buttons()[1]!.click());

  expect(changed).toHaveBeenLastCalledWith(4);
  expect(input().value).toBe('3');
  change('');

  act(() => root.render(<QuantityInput value={7} onValueChange={changed} />));

  expect(input().value).toBe('7');

  function Controlled() {
    const [value, setValue] = useState(2);

    return <QuantityInput value={value} onValueChange={setValue} />;
  }

  act(() => root.render(<Controlled />));

  key('ArrowUp');
  expect(input().value).toBe('3');
  change('12');
  expect(input().value).toBe('12');
});

it('blocks all changes for disabled and read-only controls and omits disabled form values', () => {
  const changed = vi.fn();
  for (const disabled of [true, false]) {
    act(() =>
      root.render(
        <form>
          <QuantityInput
            disabled={disabled}
            readOnly={!disabled}
            value={3}
            name="quantity"
            onValueChange={changed}
          />
        </form>,
      ),
    );

    expect(buttons().every((button) => button.disabled)).toBe(true);
    key('ArrowUp');
    key('PageDown');
    change('8');
    blur();
    expect(changed).not.toHaveBeenCalled();
    expect(input().value).toBe('3');
    expect(new FormData(host.querySelector('form')!).get('quantity')).toBe(
      disabled ? null : '3',
    );
  }
});

it('forwards refs, input attributes, feedback, test IDs and classes with caller precedence', () => {
  const ref = createRef<HTMLInputElement>(),
    blurred = vi.fn();

  act(() =>
    root.render(
      <QuantityInput
        ref={ref}
        id="quantity"
        label="Quantity"
        aria-label="Item count"
        aria-describedby="external"
        required
        hint="Choose a quantity"
        data-testid="qty"
        className="border-brand-700"
        classNames={{
          root: 'border-danger-700',
          input: 'w-20',
          decrement: 'minus-custom',
          increment: 'plus-custom',
        }}
        onBlur={blurred}
      />,
    ),
  );

  expect(ref.current).toBe(input());
  expect(host.querySelector('label')!.htmlFor).toBe('quantity');
  expect(input().required).toBe(true);
  expect(input().getAttribute('aria-label')).toBe('Item count');
  expect(input().getAttribute('aria-describedby')).toBe('external quantity-hint');
  expect(host.querySelector('[data-testid="qty"]')!.className).toContain(
    'border-brand-700',
  );
  expect(host.querySelector('[data-testid="qty"]')!.className).not.toContain(
    'border-danger-700',
  );
  expect(input().dataset.testid).toBe('qty-input');
  expect(input().className).toContain('w-20');
  expect(buttons()[0]!.dataset.testid).toBe('qty-decrement');
  expect(buttons()[1]!.dataset.testid).toBe('qty-increment');
  expect(buttons()[0]!.className).toContain('minus-custom');
  expect(buttons()[1]!.className).toContain('plus-custom');
  expect(input().className).toContain('focus-visible:outline-focus');
  expect(host.querySelector('[classNames]')).toBeNull();
  blur();
  expect(blurred).toHaveBeenCalledOnce();

  act(() =>
    root.render(
      <QuantityInput
        id="quantity"
        hint="Hint"
        error="Invalid quantity"
        data-testid="qty"
      />,
    ),
  );

  expect(input().getAttribute('aria-invalid')).toBe('true');
  expect(input().getAttribute('aria-describedby')).toBe('quantity-error');
  expect(host.querySelector('[data-testid="qty-error"]')!.textContent).toBe(
    'Invalid quantity',
  );
  expect(host.querySelector('[data-testid="qty-hint"]')).toBeNull();
});

it('localizes built-in input and button labels', () => {
  act(() =>
    root.render(
      <UIProvider locale="vi-VN">
        <QuantityInput />
      </UIProvider>,
    ),
  );

  expect(input().getAttribute('aria-label')).toBe('Số lượng');
  expect(buttons()[0]!.getAttribute('aria-label')).toBe('Giảm số lượng');
  expect(buttons()[1]!.getAttribute('aria-label')).toBe('Tăng số lượng');
});
