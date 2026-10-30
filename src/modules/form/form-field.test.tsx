// @vitest-environment jsdom
import { UserIcon } from '@itclabs/react-ui/icons/outline/user';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as v from 'valibot';
import { Form, FormField, FormSubmit, useAppForm } from './index';
import { Input } from '../../components/input';
import { NumberInput } from '../../components/number-input';
import { Select } from '../../components/select';
import { InputPassword } from '../../components/input-password';
import { Checkbox } from '../../components/checkbox';
import { Button } from '../../components/button';
import { createValibotFieldValidators } from './validation';

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

function inputChange(input: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      value,
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('uses FormField/name and Form/schema to validate actual controls, focus invalid fields and submit typed values', async () => {
  const saved = vi.fn();

  function Demo() {
    const form = useAppForm({
      defaultValues: {
        name: '',
        quantity: null as number | null,
        password: '',
        agree: false,
      },
      onSubmit: async ({ value }) => {
        saved(value);
      },
    });

    return (
      <Form
        form={form}
        schema={{
          name: v.pipe(v.string(), v.minLength(1, 'Name required')),
          quantity: v.number('Quantity required'),
          password: v.pipe(v.string(), v.minLength(3, 'Password required')),
          agree: v.pipe(
            v.boolean(),
            v.check((value) => value, 'Agreement required'),
          ),
        }}
      >
        <FormField name="name" label="Name" required data-testid="form-name">
          <Input icon={UserIcon} />
        </FormField>
        <FormField name="quantity" label="Quantity" required>
          <NumberInput />
        </FormField>
        <FormField name="password" label="Password" required>
          <InputPassword />
        </FormField>
        <FormField name="agree">
          <Checkbox label="Agree" />
        </FormField>
        <FormSubmit>
          {(submitting) => (
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          )}
        </FormSubmit>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  await act(async () => {
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(host.querySelector('[data-testid="form-name"]')?.tagName).toBe('INPUT');
  expect(saved).not.toHaveBeenCalled();
  expect(host.textContent).toContain('Name required');
  expect(host.textContent).toContain('Quantity required');
  for (const message of [
    'Name required',
    'Quantity required',
    'Password required',
    'Agreement required',
  ])
    expect(host.textContent!.split(message)).toHaveLength(2);
  const fields = host.querySelectorAll<HTMLInputElement>('input:not([type="hidden"])');
  await vi.waitFor(() => expect(document.activeElement).toBe(fields[0]));
  inputChange(fields[0]!, 'Example');
  inputChange(fields[1]!, '0');
  inputChange(fields[2]!, 'secret');
  await act(async () => {
    (host.querySelector('[role="checkbox"]') as HTMLButtonElement).click();
  });
  await act(async () => {
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  expect(saved).toHaveBeenCalledWith({
    name: 'Example',
    quantity: 0,
    password: 'secret',
    agree: true,
  });
  expect(host.textContent).not.toContain('Name required');
});

it('preserves child handlers/classes, supports explicit field and mapping without mutating control contracts', async () => {
  const changed = vi.fn(),
    blurred = vi.fn();
  let current = '';

  function Demo() {
    const form = useAppForm({ defaultValues: { name: '' }, onSubmit: async () => {} });
    current = form.state.values.name;

    return (
      <Form form={form}>
        <form.AppField name="name">
          {(field) => (
            <FormField
              field={field}
              label="Mapped"
              mapOnChange={(value) => String(value).toUpperCase()}
              className="field-custom"
            >
              <Input className="rounded-full" onChange={changed} onBlur={blurred} />
            </FormField>
          )}
        </form.AppField>
        <form.Subscribe selector={(state) => state.values.name}>
          {(name) => <output>{name}</output>}
        </form.Subscribe>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  const input = host.querySelector('input')!;
  inputChange(input, 'test');

  act(() => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));

  expect(changed).toHaveBeenCalledOnce();
  expect(blurred).toHaveBeenCalledOnce();
  expect(host.querySelector('output')?.textContent).toBe('TEST');
  expect(input.className).toContain('rounded-full');
  expect(host.querySelector('.field-custom')).not.toBeNull();
  void current;
});

it('does not coerce field schemas or replace zero with an empty value', () => {
  const validators = createValibotFieldValidators({ quantity: v.number() });
  const rule = validators.quantity!.onChange as (args: { value: unknown }) => unknown;
  expect(rule({ value: 0 })).toBeUndefined();
  expect(rule({ value: null })).toBeTruthy();
  expect(rule({ value: '0' })).toBeTruthy();
});

it('binds a marked Select through onValueChange without a child handler', async () => {
  const saved = vi.fn();

  function Demo() {
    const form = useAppForm({
      defaultValues: { choice: null as string | null },
      onSubmit: async ({ value }) => {
        saved(value);
      },
    });

    return (
      <Form form={form}>
        <FormField name="choice" label="Choice">
          <Select options={[{ value: 'lorem', label: 'Lorem ipsum' }]} />
        </FormField>
        <form.Subscribe selector={(state) => state.values.choice}>
          {(choice) => <output>{choice}</output>}
        </form.Subscribe>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  const input = host.querySelector('[role="combobox"]')!;

  act(() => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
  });

  act(() => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });

  expect(host.querySelector('output')?.textContent).toBe('lorem');
  await act(async () => {
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  expect(saved).toHaveBeenCalledWith({ choice: 'lorem' });
});
