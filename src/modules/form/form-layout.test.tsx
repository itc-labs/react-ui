// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Input } from '../../components/input';
import {
  Form,
  FormActions,
  FormField,
  FormGrid,
  FormGridItem,
  FormLayout,
  FormSection,
  useAppForm,
} from './index';

function html(node: ReactNode) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(node);

  return host;
}

const byTestId = (host: Element, id: string) =>
  host.querySelector(`[data-testid="${id}"]`);

it('labels a section by its heading and describes it by its description', () => {
  const host = html(
    <FormSection data-testid="room" title="Room" description="Pick a room.">
      <input aria-label="Room" />
    </FormSection>,
  );
  const section = host.querySelector('section')!;
  const heading = host.querySelector('h2')!;
  expect(heading.textContent).toBe('Room');
  expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
  expect(section.getAttribute('aria-describedby')).toBe(
    byTestId(host, 'room-description')!.id,
  );
  expect(byTestId(host, 'room-body')!.querySelector('input')).not.toBeNull();
  expect(section.dataset.variant).toBe('plain');
});

it('renders a titled heading level and omits labelling without a title', () => {
  expect(
    html(<FormSection titleAs="h3" title="Nested" />).querySelector('h3'),
  ).not.toBe(null);
  const untitled = html(
    <FormSection aria-label="Lorem">x</FormSection>,
  ).firstElementChild!;
  expect(untitled.hasAttribute('aria-labelledby')).toBe(false);
  expect(untitled.getAttribute('aria-label')).toBe('Lorem');
});

it('renders a fieldset named by a direct legend and forwards native fieldset props', () => {
  const host = html(
    <FormSection asFieldset disabled title="Deposit" action={<button>Reset</button>}>
      <input aria-label="Amount" />
    </FormSection>,
  );
  const fieldset = host.querySelector('fieldset')!;
  expect(host.querySelector('section')).toBeNull();
  expect(fieldset.firstElementChild?.tagName).toBe('LEGEND');
  expect(fieldset.firstElementChild?.textContent).toBe('Deposit');
  expect(fieldset.disabled).toBe(true);
  expect(fieldset.hasAttribute('aria-labelledby')).toBe(false);
  expect(fieldset.className).toContain('gap-x-4');
});

it('applies card chrome and merges caller classes after defaults', () => {
  const host = html(
    <FormSection
      data-testid="s"
      variant="card"
      title="T"
      className="p-2"
      classNames={{ title: 'text-brand-700', body: 'gap-3' }}
    />,
  );
  const root = host.firstElementChild!;
  expect(root.className).toContain('rounded-panel');
  expect(root.className).toContain('bg-surface');
  expect(root.className).toContain('p-2');
  expect(root.className).not.toMatch(/(^| )p-4( |$)/);
  expect(byTestId(host, 's-title')!.className).toContain('text-brand-700');
  expect(byTestId(host, 's-body')!.className).toContain('gap-3');
  expect(byTestId(host, 's-body')!.className).not.toContain('gap-5');
});

it('uses container-query columns and clamps item spans to the available columns', () => {
  const host = html(
    <FormGrid data-testid="grid" columns={3}>
      <FormGridItem>a</FormGridItem>
      <FormGridItem span={2}>b</FormGridItem>
      <FormGridItem span={4}>c</FormGridItem>
      <FormGridItem span="full">d</FormGridItem>
    </FormGrid>,
  );
  expect(host.firstElementChild!.className).toContain('@container');
  const grid = byTestId(host, 'grid-grid')!;
  expect(grid.getAttribute('data-columns')).toBe('3');
  expect(grid.className).toContain('grid-cols-1');
  expect(grid.className).toContain('@lg:grid-cols-2');
  expect(grid.className).toContain('@3xl:grid-cols-3');
  expect(grid.className).toContain('items-start');
  const [one, two, four, full] = Array.from(grid.children);
  expect(one!.className).not.toContain('col-span');
  expect(two!.className.split(' ')).toEqual(
    expect.arrayContaining(['@lg:col-span-2', '@3xl:col-span-2']),
  );
  // span 4 in a three-column grid never exceeds the grid's columns.
  expect(four!.className.split(' ')).toEqual(
    expect.arrayContaining(['@lg:col-span-2', '@3xl:col-span-3']),
  );
  expect(four!.className).not.toContain('col-span-4');
  expect(full!.className).toContain('col-span-full');
  expect(full!.getAttribute('data-span')).toBe('full');
});

it('defaults to two columns and keeps a single column grid', () => {
  const two = html(<FormGrid data-testid="g" />);
  expect(byTestId(two, 'g-grid')!.className).toContain('@lg:grid-cols-2');
  const one = html(
    <FormGrid data-testid="g" columns={1} classNames={{ grid: 'gap-y-3' }}>
      <FormGridItem span={2}>x</FormGridItem>
    </FormGrid>,
  );
  const grid = byTestId(one, 'g-grid')!;
  expect(grid.className).not.toContain('grid-cols-2');
  expect(grid.className).toContain('gap-y-3');
  expect(grid.className).not.toContain('gap-y-5');
  expect(grid.firstElementChild!.className).not.toContain('col-span');
});

it('orders actions with start first and the primary action last in the DOM', () => {
  const host = html(
    <FormActions data-testid="actions" start={<button>Back</button>}>
      <button>Draft</button>
      <button>Save</button>
    </FormActions>,
  );
  const root = host.firstElementChild!;
  expect(root.className).toContain('@container');
  expect(root.hasAttribute('data-sticky')).toBe(false);
  expect(root.className).not.toContain('sticky');
  expect(Array.from(root.querySelectorAll('button'), (b) => b.textContent)).toEqual([
    'Back',
    'Draft',
    'Save',
  ]);
  // Narrow containers stack the end group in reverse so the primary action is first.
  expect(byTestId(host, 'actions-end')!.className).toContain('flex-col-reverse');
  expect(byTestId(host, 'actions-end')!.className).toContain('@md:ml-auto');
  expect(byTestId(host, 'actions-start')!.textContent).toBe('Back');
});

it('omits the start slot and applies sticky or separator chrome', () => {
  const plain = html(
    <FormActions data-testid="a">
      <button>Save</button>
    </FormActions>,
  );
  expect(byTestId(plain, 'a-start')).toBeNull();
  const sticky = html(
    <FormActions sticky separator className="px-6">
      <button>Save</button>
    </FormActions>,
  ).firstElementChild!;
  expect(sticky.getAttribute('data-sticky')).toBe('true');
  expect(sticky.className).toContain('sticky');
  expect(sticky.className).toContain('bottom-0');
  expect(sticky.className).toContain('z-[var(--z-index-header)]');
  expect(sticky.className).toContain('bg-surface');
  expect(sticky.className).toContain('env(safe-area-inset-bottom)');
  expect(sticky.className).toContain('px-6');
  const separated = html(
    <FormActions separator>
      <button>Save</button>
    </FormActions>,
  ).firstElementChild!;
  expect(separated.className).toContain('border-t');
  expect(separated.className).toContain('pt-4');
});

it('constrains FormLayout to a readable width', () => {
  const host = html(
    <FormLayout size="sm" align="center" data-testid="layout">
      x
    </FormLayout>,
  );
  const root = host.firstElementChild!;
  expect(root.getAttribute('data-size')).toBe('sm');
  expect(root.className).toContain('max-w-xl');
  expect(root.className).toContain('mx-auto');
  expect(html(<FormLayout />).firstElementChild!.className).toContain('max-w-3xl');
});

it('lets FormField sit directly in a grid, aligned to the top of its row', () => {
  function Example() {
    const form = useAppForm({ defaultValues: { a: '', b: '' } });

    return (
      <Form form={form}>
        <FormGrid data-testid="grid">
          <FormField data-testid="a" name="a" label="A">
            <Input hint="Lorem ipsum dolor sit amet." />
          </FormField>
          <FormGridItem span="full">
            <FormField data-testid="b" name="b" label="B">
              <Input />
            </FormField>
          </FormGridItem>
        </FormGrid>
      </Form>
    );
  }

  const host = html(<Example />);
  const grid = byTestId(host, 'grid-grid')!;
  const field = byTestId(host, 'a-field')!;
  expect(field.parentElement).toBe(grid);
  expect(field.className).toContain('self-start');
  expect(field.className).toContain('min-w-0');
  expect(host.querySelector('label')?.textContent).toBe('A');
  expect(byTestId(host, 'b-field')!.parentElement!.className).toContain(
    'col-span-full',
  );
});
