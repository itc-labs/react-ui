// @vitest-environment jsdom
import { MailIcon } from '@itclabs/react-ui/icons/outline/mail';
import { act, createRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Input } from './index';
import { InputPassword } from '../input-password';
import { NumberInput } from '../number-input';
import { InputOTP } from '../input-otp';
import { UIProvider } from '../../theme/provider';

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

function change(input: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      value,
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('renders icons as decorative content, forwards refs/field state and keeps caller input classes last', () => {
  const ref = createRef<HTMLInputElement>();

  act(() =>
    root.render(
      <Input
        ref={ref}
        label="Email"
        icon={MailIcon}
        iconRight="info"
        required
        error="Required"
        className="pl-12"
        classNames={{ icon: 'text-brand-700', field: 'field-custom' }}
      />,
    ),
  );

  expect(host.querySelectorAll('svg')).toHaveLength(2);
  expect(
    Array.from(host.querySelectorAll('svg')).every(
      (svg) => svg.getAttribute('aria-hidden') === 'true',
    ),
  ).toBe(true);
  expect(ref.current).toBe(host.querySelector('input'));
  expect(ref.current?.className).toContain('pl-12');
  expect(ref.current?.className).not.toContain('pl-9');
  expect(ref.current?.getAttribute('aria-invalid')).toBe('true');
  expect(host.querySelector('label')?.htmlFor).toBe(ref.current?.id);
  expect(host.querySelector('.field-custom')).not.toBeNull();
});

it('toggles password visibility without replacing the input, submitting the form or losing the value', () => {
  const submit = vi.fn();

  act(() =>
    root.render(
      <UIProvider locale="en-US">
        <form onSubmit={submit}>
          <InputPassword label="Password" defaultValue="example-value" />
        </form>
      </UIProvider>,
    ),
  );

  const input = host.querySelector('input')!;
  const button = host.querySelector('button')!;
  expect(input.type).toBe('password');
  expect(button.getAttribute('aria-label')).toBe('Show password');

  act(() => button.click());

  expect(host.querySelector('input')).toBe(input);
  expect(input.type).toBe('text');
  expect(input.value).toBe('example-value');
  expect(button.getAttribute('aria-label')).toBe('Hide password');
  expect(button.getAttribute('aria-pressed')).toBe('true');
  expect(submit).not.toHaveBeenCalled();

  act(() => root.render(<InputPassword disabled defaultValue="example-value" />));

  expect(host.querySelector('button')?.disabled).toBe(true);
});

it('preserves null versus zero, formatted decimal/negative values and accessible limits in controlled numbers', () => {
  const onChange = vi.fn();

  function Demo() {
    const [value, setValue] = useState<number | null>(null);

    return (
      <NumberInput
        label="Quantity"
        value={value}
        min={-10}
        max={10}
        step={0.5}
        onValueChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    );
  }

  act(() => root.render(<Demo />));

  const input = host.querySelector('input')!;
  change(input, '0');
  expect(onChange).toHaveBeenLastCalledWith(0);
  expect(input.value).toBe('0');
  change(input, '-1,5');
  expect(onChange).toHaveBeenLastCalledWith(-1.5);
  change(input, '');
  expect(onChange).toHaveBeenLastCalledWith(null);
  expect(input.value).toBe('');
  change(input, '11');
  expect(input.getAttribute('aria-valuenow')).toBe('11'); // Host schema enforces range.
  expect(input.getAttribute('aria-valuemin')).toBe('-10');
  expect(input.getAttribute('aria-valuemax')).toBe('10');
});

it('uses one OTP input with numeric filtering, string leading zeros, completion and native autofill metadata', async () => {
  const changes = vi.fn(),
    complete = vi.fn();
  await act(async () =>
    root.render(
      <InputOTP label="Code" onValueChange={changes} onComplete={complete} />,
    ),
  );
  const input = host.querySelector('input')!;
  expect(host.querySelectorAll('input')).toHaveLength(1);
  expect(input.autocomplete).toBe('one-time-code');
  expect(input.inputMode).toBe('numeric');
  change(input, '001234');
  expect(changes).toHaveBeenLastCalledWith('001234');
  expect(complete).toHaveBeenCalled();
  expect(input.value).toBe('001234');
  const count = changes.mock.calls.length;
  change(input, 'ABCDEF');
  expect(changes.mock.calls.length).toBe(count);

  act(() => {
    input.setSelectionRange(0, 6);
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => '98-76 54' },
    });
    input.dispatchEvent(paste);
  });

  expect(changes).toHaveBeenLastCalledWith('987654');
});

it('formats grouping while emitting numbers, steps with buttons/keyboard and submits the raw numeric value', () => {
  const values = vi.fn();

  act(() =>
    root.render(
      <form>
        <NumberInput
          name="quantity"
          label="Quantity"
          defaultValue={3233232}
          iconRight="info"
          onValueChange={values}
        />
      </form>,
    ),
  );

  const input = host.querySelector('input:not([type="hidden"])')! as HTMLInputElement;
  expect(input.value).toBe('3.233.232');
  change(input, '9.876.543');
  expect(values).toHaveBeenLastCalledWith(9876543);
  expect(new FormData(host.querySelector('form')!).get('quantity')).toBe('9876543');

  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Tăng giá trị"]')!.click(),
  );

  expect(input.value).toBe('9.876.544');

  act(() =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    ),
  );

  expect(input.value).toBe('9.876.543');
  expect(host.querySelectorAll('svg')).toHaveLength(3);
});

it('steps decimals without floating drift and blocks controls for disabled/read-only/bounds', () => {
  act(() =>
    root.render(<NumberInput defaultValue={0.2} step={0.1} min={0.1} max={0.3} />),
  );

  const input = host.querySelector('input')!;

  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Tăng giá trị"]')!.click(),
  );

  expect(input.value).toBe('0,3');
  expect(
    host.querySelector<HTMLButtonElement>('[aria-label="Tăng giá trị"]')!.disabled,
  ).toBe(true);

  act(() => root.render(<NumberInput readOnly value={1000} />));

  expect(
    Array.from(host.querySelectorAll('button')).every((button) => button.disabled),
  ).toBe(true);
});
