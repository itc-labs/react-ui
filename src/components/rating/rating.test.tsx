// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Rating } from './index';
import { Form, FormField, useAppForm } from '../../modules/form';
import { UILocaleProvider } from '../../i18n/provider';
import { HeartIcon } from '../icon/bold/heart';

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

const radios = () =>
  Array.from(host.querySelectorAll<HTMLButtonElement>('[role="radio"]'));

function press(button: HTMLButtonElement, key: string) {
  act(() => {
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
  });
}

it('selects whole and half scores, clears repeated selection, and submits the numeric value', () => {
  const changed = vi.fn();

  act(() =>
    root.render(
      <form>
        <Rating name="score" allowHalf allowClear showValue onValueChange={changed} />
      </form>,
    ),
  );

  expect(radios()).toHaveLength(10);
  expect(radios().filter((radio) => radio.tabIndex === 0)).toEqual([radios()[0]]);

  act(() => radios()[6]!.click());

  expect(changed).toHaveBeenLastCalledWith(3.5);
  expect(radios()[6]!.getAttribute('aria-checked')).toBe('true');
  expect(new FormData(host.querySelector('form')!).get('score')).toBe('3.5');

  act(() => radios()[6]!.click());

  expect(changed).toHaveBeenLastCalledWith(0);
  expect(
    radios().every((radio) => radio.getAttribute('aria-checked') === 'false'),
  ).toBe(true);

  act(() => root.render(<Rating defaultValue={2} onValueChange={changed} />));

  act(() => radios()[1]!.click());

  expect(radios()[1]!.getAttribute('aria-checked')).toBe('true');
  expect(changed).toHaveBeenCalledTimes(2);
});

it('keeps controlled values owned by the caller and updates when rerendered', () => {
  const changed = vi.fn();

  act(() => root.render(<Rating value={2} onValueChange={changed} />));

  act(() => radios()[3]!.click());

  expect(changed).toHaveBeenCalledWith(4);
  expect(radios()[1]!.getAttribute('aria-checked')).toBe('true');

  act(() => root.render(<Rating value={4} onValueChange={changed} />));

  expect(radios()[3]!.getAttribute('aria-checked')).toBe('true');
  expect(radios().filter((radio) => radio.tabIndex === 0)).toEqual([radios()[3]]);
});

it.each([false, true])(
  'supports arrows, Home, End and roving focus (allowHalf=%s)',
  (allowHalf) => {
    act(() => root.render(<Rating allowHalf={allowHalf} />));

    act(() => radios()[0]!.focus());

    press(radios()[0]!, 'ArrowRight');
    expect(document.activeElement).toBe(radios()[1]);
    expect(radios()[1]!.getAttribute('aria-checked')).toBe('true');
    press(radios()[1]!, 'ArrowUp');
    expect(document.activeElement).toBe(radios()[2]);
    press(radios()[2]!, 'ArrowDown');
    expect(document.activeElement).toBe(radios()[1]);
    press(radios()[1]!, 'End');
    expect(document.activeElement).toBe(radios().at(-1));
    press(radios().at(-1)!, 'Home');
    expect(document.activeElement).toBe(radios()[0]);
    press(radios()[0]!, 'ArrowLeft');
    expect(document.activeElement).toBe(radios().at(-1));
    expect(radios().filter((radio) => radio.tabIndex === 0)).toHaveLength(1);
    expect(radios()[0]!.className).toContain('focus-visible:outline-focus');
  },
);

it('previews half scores on hover without committing and restores the value on leave', () => {
  const changed = vi.fn();

  act(() =>
    root.render(
      <Rating
        defaultValue={1}
        allowHalf
        showValue
        data-testid="score"
        onValueChange={changed}
      />,
    ),
  );

  act(() => radios()[4]!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));

  expect(
    host.querySelector('[data-testid="score-fill-3"]')?.getAttribute('style'),
  ).toContain('50%');
  expect(host.querySelector('[data-testid="score-value"]')?.textContent).toBe('2,5/5');
  expect(changed).not.toHaveBeenCalled();

  act(() =>
    radios()[4]!.dispatchEvent(
      new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }),
    ),
  );

  expect(
    host.querySelector('[data-testid="score-fill-3"]')?.getAttribute('style'),
  ).toContain('0%');
  expect(radios()[1]!.getAttribute('aria-checked')).toBe('true');
});

it('renders a nonfocusable localized display image with a fractional score', () => {
  act(() =>
    root.render(
      <UILocaleProvider locale="en-US">
        <Rating value={4.5} readOnly showValue />
      </UILocaleProvider>,
    ),
  );

  expect(host.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
    '4.5 out of 5',
  );
  expect(host.textContent).toBe('4.5/5');
  expect(host.querySelectorAll('button, [tabindex]')).toHaveLength(0);

  act(() => root.render(<Rating readOnly value={3} aria-label="Score: three" />));

  expect(host.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
    'Score: three',
  );
});

it('disables selection, hover, keyboard focus and native form submission', () => {
  const changed = vi.fn();

  act(() =>
    root.render(
      <form>
        <Rating disabled name="score" defaultValue={2} onValueChange={changed} />
      </form>,
    ),
  );

  expect(radios().every((radio) => radio.disabled && radio.tabIndex === -1)).toBe(true);

  act(() => radios()[3]!.click());

  press(radios()[1]!, 'End');
  expect(changed).not.toHaveBeenCalled();
  expect(new FormData(host.querySelector('form')!).has('score')).toBe(false);
  expect(host.querySelector('[role="radiogroup"]')?.getAttribute('aria-disabled')).toBe(
    'true',
  );
});

it('forwards labels, native attributes, refs, class slots and part selectors', () => {
  const ref = createRef<HTMLDivElement>();

  act(() =>
    root.render(
      <Rating
        ref={ref}
        label="Score"
        required
        error="Choose a score"
        data-testid="score"
        id="rating"
        className="gap-4"
        classNames={{
          root: 'gap-3',
          label: 'font-bold',
          control: 'rounded-full',
          value: 'font-bold',
          fill: 'text-danger-700',
        }}
        showValue
        icon={HeartIcon}
      />,
    ),
  );

  expect(ref.current).toBe(host.querySelector('#rating'));
  expect(ref.current?.className).toContain('gap-4');
  expect(ref.current?.className).not.toContain('gap-3');
  expect(ref.current?.getAttribute('aria-required')).toBe('true');
  expect(ref.current?.getAttribute('aria-invalid')).toBe('true');
  expect(
    host.querySelector(`[id="${ref.current?.getAttribute('aria-labelledby')}"]`)
      ?.textContent,
  ).toBe('Score*');
  expect(
    host.querySelector(`[id="${ref.current?.getAttribute('aria-describedby')}"]`)
      ?.textContent,
  ).toBe('Choose a score');
  expect(host.querySelector('[data-testid="score-control-1"]')?.className).toContain(
    'rounded-full',
  );
  expect(host.querySelector('[data-testid="score-value"]')?.className).toContain(
    'font-bold',
  );
  expect(host.querySelector('[data-testid="score-fill-1"]')?.className).toContain(
    'text-danger-700',
  );
  expect(host.innerHTML).not.toContain('classNames=');

  act(() => root.render(<Rating aria-label="Explicit score" />));

  expect(host.querySelector('[role="radiogroup"]')?.getAttribute('aria-label')).toBe(
    'Explicit score',
  );
  expect(host.querySelector('[data-testid]')).toBeNull();
});

it('normalizes invalid values and max and supports a custom scale', () => {
  act(() => root.render(<Rating value={99} max={3} />));

  expect(radios()).toHaveLength(3);
  expect(radios()[2]!.getAttribute('aria-checked')).toBe('true');

  act(() => root.render(<Rating value={NaN} max={-1} />));

  expect(radios()).toHaveLength(5);
  expect(
    radios().every((radio) => radio.getAttribute('aria-checked') === 'false'),
  ).toBe(true);

  act(() => root.render(<Rating value={2.8} max={4} allowHalf />));

  expect(radios()[5]!.getAttribute('aria-checked')).toBe('true');
});

it('automatically binds FormField values, labels, validation and submission', async () => {
  const saved = vi.fn();

  function Demo() {
    const form = useAppForm({
      defaultValues: { score: 0 },
      onSubmit: ({ value }) => {
        saved(value);
      },
    });

    return (
      <Form form={form}>
        <FormField
          name="score"
          label="Score"
          validators={{
            onChange: ({ value }: { value: unknown }) =>
              Number(value) < 2 ? 'Choose at least two' : undefined,
          }}
        >
          <Rating allowHalf showValue />
        </FormField>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  await act(async () => radios()[0]!.click());
  await act(async () =>
    radios()[0]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true })),
  );
  expect(host.textContent).toContain('Choose at least two');
  await act(async () => radios()[6]!.click());
  expect(radios()[6]!.getAttribute('aria-checked')).toBe('true');
  expect(host.querySelector<HTMLInputElement>('input[name="score"]')?.value).toBe(
    '3.5',
  );
  await act(async () => {
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  expect(saved).toHaveBeenCalledWith({ score: 3.5 });
  expect(host.textContent).not.toContain('Choose at least two');
});
