// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { OptionGroup } from './index';
import { Form, FormField, useAppForm } from '../../modules/form';
import { UILocaleProvider } from '../../i18n/provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const options = [
  { value: 'a', label: 'Alpha', color: '#ff0000' },
  { value: 'b', label: 'Beta', disabled: true, color: '#00ff00' },
  { value: 'c', label: 'Gamma', color: '#0000ff' },
  { value: 'd', label: 'Delta' },
  { value: 'e', label: 'Epsilon' },
];

const radios = () =>
  Array.from(host.querySelectorAll<HTMLButtonElement>('[role="radio"]'));

function press(button: HTMLButtonElement, key: string) {
  act(() => {
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
  });
}

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

it('selects uncontrolled values and submits the value through native forms', () => {
  const changed = vi.fn();

  act(() =>
    root.render(
      <form>
        <OptionGroup
          label="Fit"
          options={options}
          name="fit"
          defaultValue="a"
          onValueChange={changed}
        />
      </form>,
    ),
  );

  expect(radios()[0]!.getAttribute('aria-checked')).toBe('true');

  act(() => radios()[2]!.click());

  expect(radios()[2]!.getAttribute('aria-checked')).toBe('true');
  expect(changed).toHaveBeenCalledExactlyOnceWith('c');

  act(() => radios()[2]!.click());

  expect(changed).toHaveBeenCalledTimes(1);
  expect(new FormData(host.querySelector('form')!).get('fit')).toBe('c');
});

it('keeps controlled selection owned by the caller, including external changes beyond the limit', () => {
  const changed = vi.fn();

  act(() =>
    root.render(
      <OptionGroup
        label="Fit"
        options={options}
        value="a"
        onValueChange={changed}
        maxVisible={2}
      />,
    ),
  );

  act(() => radios()[0]!.click());

  expect(changed).not.toHaveBeenCalled();

  act(() =>
    root.render(
      <OptionGroup
        label="Fit"
        options={options}
        value="e"
        onValueChange={changed}
        maxVisible={2}
      />,
    ),
  );

  expect(radios().map((radio) => radio.getAttribute('aria-label'))).toEqual([
    'Alpha',
    'Beta',
    'Epsilon',
  ]);

  act(() => radios()[0]!.click());

  expect(changed).toHaveBeenCalledWith('a');
  expect(radios()[2]!.getAttribute('aria-checked')).toBe('true');
});

it.each(['chip', 'swatch'] as const)(
  'supports roving focus, arrows, Home, End, Space and Enter for %s',
  (variant) => {
    act(() =>
      root.render(<OptionGroup label="Fit" options={options} variant={variant} />),
    );

    expect(radios().filter((radio) => radio.tabIndex === 0)).toEqual([radios()[0]]);

    act(() => radios()[0]!.focus());

    press(radios()[0]!, 'ArrowRight');
    expect(document.activeElement).toBe(radios()[2]);
    expect(radios()[2]!.getAttribute('aria-checked')).toBe('true');
    press(radios()[2]!, 'ArrowDown');
    expect(document.activeElement).toBe(radios()[3]);
    press(radios()[3]!, 'ArrowUp');
    expect(document.activeElement).toBe(radios()[2]);
    press(radios()[2]!, 'Home');
    expect(document.activeElement).toBe(radios()[0]);
    press(radios()[0]!, 'ArrowLeft');
    expect(document.activeElement).toBe(radios()[4]);
    press(radios()[4]!, 'Home');
    press(radios()[0]!, 'End');
    expect(document.activeElement).toBe(radios()[4]);
    press(radios()[2]!, ' ');
    expect(radios()[2]!.getAttribute('aria-checked')).toBe('true');
    press(radios()[0]!, 'Enter');
    expect(radios()[0]!.getAttribute('aria-checked')).toBe('true');
    expect(radios().filter((radio) => radio.tabIndex === 0)).toEqual([radios()[0]]);
    expect(radios()[0]!.className).toContain('focus-visible:outline-focus');
  },
);

it('keeps unavailable options unselectable and disables focus and form submission for a disabled group', () => {
  const changed = vi.fn();

  act(() => root.render(<OptionGroup options={options} onValueChange={changed} />));

  act(() => radios()[1]!.click());

  press(radios()[1]!, 'Enter');
  expect(changed).not.toHaveBeenCalled();
  expect(radios()[1]!.textContent).toBe('Beta');
  expect(radios()[1]!.querySelector('span')?.className).toContain('line-through');

  act(() =>
    root.render(
      <form>
        <OptionGroup
          options={options}
          disabled
          name="fit"
          defaultValue="a"
          onValueChange={changed}
        />
      </form>,
    ),
  );

  expect(radios().every((radio) => radio.disabled && radio.tabIndex === -1)).toBe(true);
  press(radios()[0]!, 'End');
  expect(changed).not.toHaveBeenCalled();
  expect(new FormData(host.querySelector('form')!).has('fit')).toBe(false);
  expect(host.querySelector('[role="radiogroup"]')?.getAttribute('aria-disabled')).toBe(
    'true',
  );
});

it('reveals only the remaining count and focuses the first newly available option', async () => {
  act(() =>
    root.render(
      <UILocaleProvider locale="en-US">
        <OptionGroup
          label="Size"
          options={options}
          defaultValue="e"
          maxVisible={2}
          data-testid="sizes"
        />
      </UILocaleProvider>,
    ),
  );

  expect(radios()).toHaveLength(3);
  const expand = host.querySelector<HTMLButtonElement>('[data-testid="sizes-expand"]')!;
  expect(expand.textContent).toBe('+2');
  expect(expand.getAttribute('aria-label')).toBe('Show 2 more options');

  act(() => expand.click());

  const menu = document.querySelector<HTMLElement>('[data-testid="sizes-menu"]')!;
  expect(menu.getAttribute('role')).toBe('listbox');
  const items = Array.from(menu.querySelectorAll<HTMLElement>('[role="option"]'));
  expect(items.map((item) => item.textContent)).toEqual(['Gamma', 'Delta']);
  expect(document.activeElement).toBe(items[0]);
  press(items[0] as HTMLButtonElement, 'ArrowDown');
  expect(document.activeElement).toBe(items[1]);

  act(() => items[1]!.click());

  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
  expect(document.querySelector('[data-testid="sizes-menu"]')).toBeNull();
  expect(radios().map((radio) => radio.textContent)).toEqual([
    'Alpha',
    'Beta',
    'Delta',
  ]);
  expect(radios()[2]!.getAttribute('aria-checked')).toBe('true');
  expect(document.activeElement).toBe(radios()[2]);
  expect(expand.textContent).toBe('+2');
});

it('forwards refs, attributes, test IDs and class slots, and associates labels, descriptions and feedback', () => {
  const ref = createRef<HTMLDivElement>();

  act(() =>
    root.render(
      <UILocaleProvider locale="en-US">
        <OptionGroup
          ref={ref}
          id="fit"
          data-testid="fit"
          label="Fit"
          labelHint="Lorem ipsum"
          showSelectedLabel
          required
          defaultValue="a"
          options={[{ ...options[0]!, description: <span>Lorem ipsum</span> }]}
          hint="Choose a fit"
          aria-describedby="external"
          className="gap-4"
          classNames={{
            group: 'gap-3',
            root: 'p-4',
            label: 'font-bold',
            option: 'rounded-control',
            selectedOption: 'bg-brand-800',
            description: 'font-medium',
          }}
        />
      </UILocaleProvider>,
    ),
  );

  const group = host.querySelector('[role="radiogroup"]')!;
  expect(ref.current).toBe(group);
  expect(group.id).toBe('fit');
  expect(group.className).toContain('gap-4');
  expect(group.className).not.toContain('gap-3');
  expect(group.getAttribute('data-testid')).toBe('fit');
  expect(group.getAttribute('aria-required')).toBe('true');
  expect(host.querySelector('[data-testid="fit-label"]')?.textContent).toBe(
    'Fit: Alpha*',
  );
  expect(group.getAttribute('aria-labelledby')).toBe(
    host.querySelector('[data-testid="fit-label"]')?.id,
  );
  expect(group.getAttribute('aria-describedby')?.split(' ')).toEqual([
    'external',
    host.querySelector('[data-testid="fit-hint"]')?.id,
  ]);
  expect(radios()[0]!.getAttribute('aria-describedby')).toBe(
    host.querySelector('[data-testid="fit-description-a"]')?.id,
  );
  expect(radios()[0]!.className).toContain('rounded-control');
  expect(radios()[0]!.className).toContain('bg-brand-800');
  expect(host.querySelector('[data-testid="fit-root"]')?.className).toContain('p-4');
  expect(
    host.querySelector('[aria-label="More information about Fit"]'),
  ).not.toBeNull();
  expect(host.innerHTML).not.toContain('classNames=');

  act(() =>
    root.render(
      <OptionGroup
        label="Fit"
        options={options}
        error="Choose a fit"
        hint="Hidden hint"
      />,
    ),
  );

  const invalid = host.querySelector('[role="radiogroup"]')!;
  expect(invalid.getAttribute('aria-invalid')).toBe('true');
  expect(
    document.getElementById(invalid.getAttribute('aria-describedby')!)?.textContent,
  ).toBe('Choose a fit');
  expect(host.textContent).not.toContain('Hidden hint');
  expect(host.querySelector('[data-testid]')).toBeNull();
});

it('renders color and image swatches with accessible names and unavailable marks', () => {
  act(() =>
    root.render(
      <OptionGroup
        label="Color"
        data-testid="color"
        variant="swatch"
        options={[options[0]!, { ...options[1]!, image: '/sample.png' }]}
      />,
    ),
  );

  expect(radios()[0]!.getAttribute('aria-label')).toBe('Alpha');
  expect(
    host.querySelector<HTMLElement>('[data-testid="color-swatch-a"]')?.style
      .backgroundColor,
  ).toBe('rgb(255, 0, 0)');
  expect(host.querySelector('img')?.getAttribute('src')).toBe('/sample.png');
  expect(host.querySelector('img')?.getAttribute('alt')).toBe('');
  expect(host.querySelector('[data-testid="color-unavailable-b"]')).not.toBeNull();
  expect(radios()[1]!.disabled).toBe(true);
});

it('automatically binds FormField values, validation and submission', async () => {
  const saved = vi.fn();

  function Demo() {
    const form = useAppForm({
      defaultValues: { fit: '' },
      onSubmit: ({ value }) => {
        saved(value);
      },
    });

    return (
      <Form form={form}>
        <FormField
          name="fit"
          label="Fit"
          validators={{
            onChange: ({ value }: { value: unknown }) =>
              value === 'a' ? 'Choose another fit' : undefined,
          }}
        >
          <OptionGroup options={options} />
        </FormField>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  await act(async () => radios()[0]!.click());
  await act(async () =>
    radios()[0]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true })),
  );
  expect(host.textContent).toContain('Choose another fit');
  await act(async () => radios()[2]!.click());
  expect(radios()[2]!.getAttribute('aria-checked')).toBe('true');
  expect(host.querySelector<HTMLInputElement>('input[name="fit"]')?.value).toBe('c');
  await act(async () => {
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  expect(saved).toHaveBeenCalledWith({ fit: 'c' });
  expect(host.textContent).not.toContain('Choose another fit');
});
