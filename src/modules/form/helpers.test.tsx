// @vitest-environment jsdom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { AnyFormApi } from '@tanstack/react-form';
import {
  Form,
  FormField,
  useAppForm,
  setErrors,
  clearErrors,
  useLinkedField,
} from './index';
import { Input } from '../../components/input';
import { slugify } from '../../format';

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

function type(input: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      value,
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('shows API errors immediately for element, useControl and render fields; clears only the edited field', async () => {
  let form!: AnyFormApi;

  function Demo() {
    const api = useAppForm({ defaultValues: { name: '', slug: '', note: '' } });
    form = api;

    return (
      <Form form={api}>
        <FormField name="name" label="Name">
          <Input />
        </FormField>
        <api.AppField name="slug">
          {(field) => <field.TextField label="Slug" />}
        </api.AppField>
        <FormField name="note">
          {(field) => (
            <Input
              name="note"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          )}
        </FormField>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));

  act(() => {
    form.setFieldMeta('name', (meta) => ({
      ...meta,
      errorMap: { onBlur: 'Keep validation' },
    }));

    expect(
      setErrors(form, {
        name: ['Name taken', 'Try another'],
        slug: 'Slug taken',
        note: 'Note rejected',
        missing: 'General failure',
        toString: 'Unknown field',
      }),
    ).toEqual({ unmatched: ['missing', 'toString'] });
  });

  expect(host.textContent).toContain('Name taken Try another');
  expect(host.textContent).toContain('Slug taken');
  expect(host.textContent).toContain('Note rejected');
  const inputs = host.querySelectorAll('input');
  expect(document.activeElement).toBe(inputs[0]);
  type(inputs[0]!, 'New name');
  expect(host.textContent).not.toContain('Name taken');
  expect(form.getFieldMeta('name')!.errorMap.onBlur).toBe('Keep validation');
  expect(host.textContent).toContain('Slug taken');
  type(inputs[1]!, 'new-slug');
  expect(host.textContent).not.toContain('Slug taken');
  expect(host.textContent).toContain('Note rejected');
  type(inputs[2]!, 'New note');
  expect(host.textContent).not.toContain('Note rejected');

  act(() =>
    setErrors(form, { name: 'Second response', slug: 'Second slug' }, { focus: false }),
  );

  type(inputs[1]!, 'again');
  expect(host.textContent).toContain('Second response');
  expect(host.textContent).not.toContain('Second slug');

  act(() => clearErrors(form, ['name', 'unknown', 'toString']));

  expect(form.getFieldMeta('name')!.errorMap.onServer).toBeUndefined();
  expect(form.getFieldMeta('name')!.errorMap.onBlur).toBe('Keep validation');

  act(() => {
    setErrors(form, { name: 'Third', slug: 'Third slug' });
    clearErrors(form);
  });

  expect(host.textContent).not.toContain('Third');
});

it('scopes focus to the owning form and supports nested keys, undefined and empty messages', async () => {
  const forms: AnyFormApi[] = [];

  function Demo({ index }: { index: number }) {
    const form = useAppForm({ defaultValues: { person: { name: '' } } });
    forms[index] = form;

    return (
      <Form form={form}>
        <FormField name="person.name" label="Name">
          <Input />
        </FormField>
      </Form>
    );
  }

  await act(async () =>
    root.render(
      <>
        <Demo index={0} />
        <Demo index={1} />
      </>,
    ),
  );

  act(() => setErrors(forms[1]!, { 'person.name': 'Nested error' }));

  expect(document.activeElement).toBe(host.querySelectorAll('input')[1]);
  type(host.querySelectorAll('input')[0]!, 'Other');
  expect(host.textContent).toContain('Nested error');
  type(host.querySelectorAll('input')[1]!, 'Changed');
  expect(host.textContent).not.toContain('Nested error');

  act(() => setErrors(forms[1]!, { 'person.name': [' ', 'Good message', ''] }));

  expect(host.textContent).toContain('Good message');

  act(() => setErrors(forms[1]!, { 'person.name': undefined }));

  expect(host.textContent).not.toContain('Good message');
});

async function linkedDemo(
  initial = { name: '', slug: '' },
  initiallyLinked?: boolean,
  enabled = true,
) {
  let form!: AnyFormApi;
  let link!: ReturnType<typeof useLinkedField>;
  const transform = vi.fn(slugify);

  function Demo() {
    const api = useAppForm({ defaultValues: initial });
    form = api;
    link = useLinkedField(api, {
      source: 'name',
      target: 'slug',
      transform,
      ...(initiallyLinked === undefined ? {} : { initiallyLinked }),
      enabled,
    });

    return (
      <Form form={api}>
        <FormField name="name" label="Name">
          <Input />
        </FormField>
        <FormField name="slug" label="Slug">
          <Input />
        </FormField>
      </Form>
    );
  }

  await act(async () =>
    root.render(
      <StrictMode>
        <Demo />
      </StrictMode>,
    ),
  );

  return {
    get form() {
      return form;
    },
    get link() {
      return link;
    },
    transform,
    inputs: host.querySelectorAll('input'),
  };
}

it('follows source, unlinks manual target changes, relinks immediately and relinks on empty', async () => {
  const demo = await linkedDemo();
  expect(demo.link.linked).toBe(true);
  type(demo.inputs[0]!, 'Áo thun Đỏ  mới!');
  expect(demo.inputs[1]!.value).toBe('ao-thun-do-moi');
  expect(demo.link.linked).toBe(true);
  type(demo.inputs[1]!, 'custom');
  expect(demo.link.linked).toBe(false);
  type(demo.inputs[0]!, 'New name');
  expect(demo.inputs[1]!.value).toBe('custom');

  act(() => demo.link.relink());

  expect(demo.inputs[1]!.value).toBe('new-name');
  expect(demo.link.linked).toBe(true);
  type(demo.inputs[1]!, 'manual-again');
  type(demo.inputs[1]!, '');
  expect(demo.link.linked).toBe(true);
  expect(demo.inputs[1]!.value).toBe('new-name');

  act(() => setErrors(demo.form, { slug: 'Rejected' }));

  type(demo.inputs[0]!, 'Next');
  expect(host.textContent).not.toContain('Rejected');
});

it('preserves an edit-form custom slug until relink', async () => {
  const demo = await linkedDemo({ name: 'Old name', slug: 'custom' });
  expect(demo.link.linked).toBe(false);
  type(demo.inputs[0]!, 'New name');
  expect(demo.inputs[1]!.value).toBe('custom');

  act(() => demo.link.relink());

  expect(demo.inputs[1]!.value).toBe('new-name');
});

it('starts linked for matching edit values and respects initiallyLinked overrides', async () => {
  const demo = await linkedDemo({ name: 'Old name', slug: 'old-name' }, false);
  expect(demo.link.linked).toBe(false);
  type(demo.inputs[0]!, 'Next');
  expect(demo.inputs[1]!.value).toBe('old-name');
});

it('starts linked for matching edit values by default', async () => {
  const demo = await linkedDemo({ name: 'Old name', slug: 'old-name' });
  expect(demo.link.linked).toBe(true);
  type(demo.inputs[0]!, 'Next');
  expect(demo.inputs[1]!.value).toBe('next');
});

it('can force a custom initial slug to stay linked', async () => {
  const demo = await linkedDemo({ name: 'Old name', slug: 'custom' }, true);
  type(demo.inputs[0]!, 'Next');
  expect(demo.inputs[1]!.value).toBe('next');
});

it('suspends automatic synchronization when disabled; explicit relink still recomputes', async () => {
  const demo = await linkedDemo({ name: '', slug: '' }, undefined, false);
  type(demo.inputs[0]!, 'Next');
  expect(demo.inputs[1]!.value).toBe('');

  act(() => demo.link.relink());

  expect(demo.inputs[1]!.value).toBe('next');
});

it('links typed nested values through render-function and useControl fields', async () => {
  function Demo() {
    const form = useAppForm({
      defaultValues: { product: { quantity: 2, label: '2' } },
    });
    const { linked } = useLinkedField(form, {
      source: 'product.quantity',
      target: 'product.label',
      transform: (quantity) => quantity.toFixed(0),
    });

    return (
      <Form form={form}>
        <FormField name="product.quantity">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(event) => field.handleChange(Number(event.target.value))}
            />
          )}
        </FormField>
        <form.AppField name="product.label">
          {(field) => <field.TextField label="Label" />}
        </form.AppField>
        <output>{String(linked)}</output>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  const inputs = host.querySelectorAll('input');
  type(inputs[0]!, '3');
  expect(inputs[1]!.value).toBe('3');
  expect(host.querySelector('output')!.textContent).toBe('true');
  type(inputs[1]!, 'custom');
  type(inputs[0]!, '4');
  expect(inputs[1]!.value).toBe('custom');
  expect(host.querySelector('output')!.textContent).toBe('false');
});

it('focuses visible composite controls and preserves consumer form refs', async () => {
  let form!: AnyFormApi;
  const reference = vi.fn();

  function Demo() {
    const api = useAppForm({
      defaultValues: { amount: null as number | null, other: null as number | null },
    });
    form = api;

    return (
      <Form form={api} ref={reference}>
        <api.AppField name="amount">
          {(field) => <field.NumberField label="Amount" />}
        </api.AppField>
        <api.AppField name="other">
          {(field) => (
            <FormField field={field} label="Other">
              <field.NumberField />
            </FormField>
          )}
        </api.AppField>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  expect(reference).toHaveBeenCalledWith(host.querySelector('form'));

  act(() => setErrors(form, { other: 'Other invalid' }));

  expect(document.activeElement).toBe(host.querySelectorAll('[role="spinbutton"]')[1]);

  act(() => setErrors(form, { amount: 'Amount invalid' }));

  expect(document.activeElement).toBe(host.querySelector('[role="spinbutton"]'));
});
