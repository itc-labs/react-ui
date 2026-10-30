// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Slider } from './index';
import { UILocaleProvider } from '../../i18n/provider';
import { Form, FormField, useAppForm } from '../../modules/form';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

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

const thumbs = () => Array.from(host.querySelectorAll<HTMLElement>('[role="slider"]'));

function press(index: number, key: string) {
  act(() => {
    thumbs()[index]!.focus();
    thumbs()[index]!.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
  });
}

it('supports uncontrolled numeric keyboard changes, commits, bounds and steps', () => {
  const change = vi.fn(),
    commit = vi.fn();

  act(() =>
    root.render(
      <form>
        <Slider
          name="volume"
          defaultValue={20}
          step={5}
          onValueChange={change}
          onValueCommit={commit}
        />
      </form>,
    ),
  );

  press(0, 'ArrowRight');
  expect(change).toHaveBeenLastCalledWith(25);
  expect(commit).toHaveBeenLastCalledWith(25);
  expect(new FormData(host.querySelector('form')!).get('volume')).toBe('25');
  press(0, 'PageUp');
  expect(thumbs()[0]!.getAttribute('aria-valuenow')).toBe('75');
  press(0, 'PageDown');
  expect(thumbs()[0]!.getAttribute('aria-valuenow')).toBe('25');
  press(0, 'End');
  expect(change).toHaveBeenLastCalledWith(100);
  press(0, 'Home');
  expect(change).toHaveBeenLastCalledWith(0);
  press(0, 'ArrowLeft');
  expect(thumbs()[0]!.getAttribute('aria-valuenow')).toBe('0');
});

it('keeps controlled single and range values owned by the caller', () => {
  const change = vi.fn();

  act(() => root.render(<Slider value={20} onValueChange={change} />));

  press(0, 'ArrowRight');
  expect(change).toHaveBeenLastCalledWith(21);
  expect(thumbs()[0]!.getAttribute('aria-valuenow')).toBe('20');

  act(() => root.render(<Slider range value={[10, 50]} onValueChange={change} />));

  press(1, 'ArrowRight');
  expect(change).toHaveBeenLastCalledWith([10, 51]);
  expect(thumbs()[1]!.getAttribute('aria-valuenow')).toBe('50');

  act(() => root.render(<Slider range value={[10, 51]} />));

  expect(thumbs()[1]!.getAttribute('aria-valuenow')).toBe('51');
});

it('enforces range separation and submits two configurable names', () => {
  act(() =>
    root.render(
      <form>
        <Slider
          range
          name="price"
          defaultValue={[20, 40]}
          step={10}
          minStepsBetweenThumbs={2}
        />
      </form>,
    ),
  );

  press(0, 'ArrowRight');
  expect(thumbs()[0]!.getAttribute('aria-valuenow')).toBe('20');
  press(1, 'ArrowRight');
  expect(new FormData(host.querySelector('form')!).get('price[1]')).toBe('50');
  expect(new FormData(host.querySelector('form')!).get('price[0]')).toBe('20');

  act(() =>
    root.render(
      <form>
        <Slider range value={[10, 60]} names={['low', 'high']} />
      </form>,
    ),
  );

  expect(new FormData(host.querySelector('form')!).get('low')).toBe('10');
  expect(new FormData(host.querySelector('form')!).get('high')).toBe('60');
});

it('selects the nearest range thumb with mark labels, snapping to steps and committing', () => {
  const change = vi.fn(),
    commit = vi.fn();

  act(() =>
    root.render(
      <Slider
        range
        defaultValue={[20, 80]}
        step={10}
        minStepsBetweenThumbs={2}
        marks={[
          { value: 53, label: 'Middle' },
          { value: 100, label: 'End' },
        ]}
        onValueChange={change}
        onValueCommit={commit}
      />,
    ),
  );

  act(() => host.querySelectorAll('button')[0]!.click());

  expect(change).toHaveBeenLastCalledWith([20, 50]);
  expect(commit).toHaveBeenLastCalledWith([20, 50]);

  act(() => host.querySelectorAll('button')[1]!.click());

  expect(change).toHaveBeenLastCalledWith([20, 100]);
});

it.each([true, false])(
  'blocks disabled/read-only interaction and preserves submission semantics (disabled=%s)',
  (disabled) => {
    const change = vi.fn(),
      commit = vi.fn();

    act(() =>
      root.render(
        <form>
          <Slider
            name="level"
            defaultValue={30}
            disabled={disabled}
            readOnly={!disabled}
            marks={[{ value: 80, label: 'High' }]}
            onValueChange={change}
            onValueCommit={commit}
          />
        </form>,
      ),
    );

    press(0, 'End');

    act(() => host.querySelector('button')!.click());

    expect(change).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
    expect(thumbs()[0]!.tabIndex).toBe(disabled ? -1 : 0);
    expect(new FormData(host.querySelector('form')!).get('level')).toBe(
      disabled ? null : '30',
    );
    if (!disabled) expect(thumbs()[0]!.getAttribute('aria-readonly')).toBe('true');
  },
);

it('forwards refs, root classes, slots, part selectors and accessible feedback', () => {
  const ref = createRef<HTMLDivElement>();

  act(() =>
    root.render(
      <UILocaleProvider locale="en-US">
        <Slider
          ref={ref}
          range
          defaultValue={[10, 80]}
          label="Price"
          required
          hint="Use arrows"
          error="Invalid price"
          aria-describedby="external"
          data-testid="price"
          className="gap-6"
          classNames={{
            root: 'gap-4',
            thumb: 'size-7',
            value: 'font-bold',
            label: 'font-semibold',
            track: 'bg-brand-100',
            range: 'bg-brand-700',
            hint: 'font-medium',
            error: 'font-bold',
          }}
          formatValue={(value) => `$${value}`}
          showValue="always"
        />
      </UILocaleProvider>,
    ),
  );

  expect(ref.current).toBe(host.querySelector('[data-testid="price"]'));
  expect(ref.current!.className).toContain('gap-6');
  expect(ref.current!.className).not.toContain('gap-4');
  for (const [index, suffix] of ['Minimum', 'Maximum'].entries()) {
    const thumb = thumbs()[index]!;
    const label = thumb
      .getAttribute('aria-labelledby')!
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent)
      .join(' ');
    expect(label).toBe(`Price* ${suffix}`);
    expect(thumb.getAttribute('aria-invalid')).toBe('true');
    expect(thumb.getAttribute('aria-required')).toBe('true');
    expect(thumb.getAttribute('aria-describedby')).toContain('external');
    const descriptions = thumb
      .getAttribute('aria-describedby')!
      .split(' ')
      .slice(1)
      .map((id) => document.getElementById(id)?.textContent);
    // Like other fields, the error replaces the hint.
    expect(descriptions).toEqual(['Invalid price']);
    expect(thumb.className).toContain('border-danger-700');
    expect(thumb.className).toContain('size-7');
    expect(thumb.className).toContain('focus-visible:outline-focus');
  }
  expect(thumbs()[0]!.getAttribute('aria-valuetext')).toBe('$10');
  expect(host.querySelector('[data-testid="price-value-0"]')?.textContent).toBe('$10');
  expect(host.innerHTML).not.toContain('classNames=');

  act(() => root.render(<Slider showValue="never" />));

  expect(host.querySelector('[data-testid]')).toBeNull();
  expect(host.querySelector('[aria-hidden="true"]')).toBeNull();
});

it('localizes fallback names and supports vertical/inverted keyboard direction', () => {
  act(() =>
    root.render(
      <UILocaleProvider locale="en-US">
        <Slider range orientation="vertical" inverted defaultValue={[20, 80]} />
      </UILocaleProvider>,
    ),
  );

  expect(thumbs()[0]!.getAttribute('aria-label')).toBe('Value Minimum');
  expect(thumbs()[1]!.getAttribute('aria-label')).toBe('Value Maximum');
  expect(thumbs()[0]!.getAttribute('aria-orientation')).toBe('vertical');
  press(0, 'ArrowDown');
  expect(thumbs()[0]!.getAttribute('aria-valuenow')).toBe('21');

  act(() => root.render(<Slider range defaultValue={[20, 80]} />));

  expect(thumbs()[0]!.getAttribute('aria-label')).toBe('Giá trị Tối thiểu');
});

it('automatically binds FormField numbers and tuples, validation, blur and submission', async () => {
  const saved = vi.fn();

  function Demo() {
    const form = useAppForm({
      defaultValues: { volume: 0, interval: [20, 80] as [number, number] },
      onSubmit: ({ value }) => {
        saved(value);
      },
    });

    return (
      <Form form={form}>
        <FormField
          name="volume"
          label="Volume"
          validators={{
            onChange: ({ value }: { value: unknown }) =>
              Number(value) < 2 ? 'Choose at least two' : undefined,
          }}
        >
          <Slider />
        </FormField>
        <FormField name="interval" label="Interval">
          <Slider range />
        </FormField>
      </Form>
    );
  }

  await act(async () => root.render(<Demo />));
  press(0, 'ArrowRight');
  await act(async () =>
    thumbs()[0]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true })),
  );
  expect(host.textContent).toContain('Choose at least two');
  press(0, 'ArrowRight');
  press(2, 'ArrowLeft');
  await act(async () =>
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
  expect(saved).toHaveBeenCalledWith({ volume: 2, interval: [20, 79] });
  expect(host.textContent).not.toContain('Choose at least two');
});

it('changes during pointer dragging and commits only on release', () => {
  const change = vi.fn(),
    commit = vi.fn();

  act(() =>
    root.render(
      <Slider
        defaultValue={20}
        data-testid="drag"
        onValueChange={change}
        onValueCommit={commit}
      />,
    ),
  );

  const control = host.querySelector<HTMLElement>('[data-testid="drag-control"]')!;
  let captured = false;
  control.setPointerCapture = () => {
    captured = true;
  };
  control.hasPointerCapture = () => captured;
  control.releasePointerCapture = () => {
    captured = false;
  };
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 100,
    height: 24,
    right: 100,
    bottom: 24,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

  function pointer(type: string, x: number) {
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: 12,
    });
    Object.defineProperty(event, 'pointerId', { value: 1 });

    act(() => control.dispatchEvent(event));
  }

  pointer('pointerdown', 40);
  expect(change).toHaveBeenLastCalledWith(40);
  expect(commit).not.toHaveBeenCalled();
  pointer('pointermove', 60);
  expect(change).toHaveBeenLastCalledWith(60);
  expect(commit).not.toHaveBeenCalled();
  pointer('pointerup', 60);
  expect(commit).toHaveBeenCalledExactlyOnceWith(60);
  const bubble = host.querySelector('[data-testid="drag-value-0"]')!;
  expect(bubble.className).toContain('group-focus:opacity-100');
  expect(bubble.className).toContain('group-hover:opacity-100');
  expect(bubble.className).toContain('motion-reduce:transition-none');
});

it('allows Tab navigation on a read-only slider', () => {
  act(() => root.render(<Slider readOnly />));

  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
  });

  act(() => thumbs()[0]!.dispatchEvent(event));

  expect(event.defaultPrevented).toBe(false);
});
