// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
} from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const items = [
  { value: 'a/b', trigger: 'First', content: 'First content' },
  {
    value: 'disabled',
    trigger: 'Disabled',
    content: 'Disabled content',
    disabled: true,
  },
  { value: 'last', trigger: 'Last', content: 'Last content' },
];
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

function button(label: string) {
  return Array.from(host.querySelectorAll('button')).find(
    (node) => node.textContent === label,
  )!;
}

it('supports single, collapsible and multiple behavior without changing heading/region associations', async () => {
  await act(async () =>
    root.render(
      <Accordion type="single" collapsible items={items} data-testid="sections" />,
    ),
  );

  act(() => button('First').click());

  expect(button('First').getAttribute('aria-expanded')).toBe('true');
  expect(
    host.querySelector('[data-testid="sections-content-a%2Fb"]')?.getAttribute('id'),
  ).toBe(button('First').getAttribute('aria-controls'));
  expect(
    host
      .querySelector('[data-testid="sections-content-a%2Fb"]')
      ?.getAttribute('aria-labelledby'),
  ).toBe(button('First').id);

  act(() => button('Last').click());

  expect(button('First').getAttribute('aria-expanded')).toBe('false');
  expect(button('Last').getAttribute('aria-expanded')).toBe('true');

  act(() => button('Last').click());

  expect(button('Last').getAttribute('aria-expanded')).toBe('false');
  await act(async () =>
    root.render(<Accordion key="multiple" type="multiple" items={items} />),
  );

  act(() => {
    button('First').click();
    button('Last').click();
  });

  expect(button('First').getAttribute('aria-expanded')).toBe('true');
  expect(button('Last').getAttribute('aria-expanded')).toBe('true');
  expect(button('Disabled').disabled).toBe(true);
});

it('keeps controlled value host-owned and navigates past disabled triggers with arrow keys', async () => {
  const changed = vi.fn();
  await act(async () =>
    root.render(
      <Accordion type="single" value="a/b" onValueChange={changed} items={items} />,
    ),
  );

  act(() => button('Last').click());

  expect(changed).toHaveBeenCalledWith('last');
  expect(button('First').getAttribute('aria-expanded')).toBe('true');
  expect(button('Last').getAttribute('aria-expanded')).toBe('false');
  button('First').focus();
  await act(async () => {
    button('First').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(document.activeElement).toBe(button('Last'));
});

it('forwards refs/native attributes and merges classes for root and compound parts without default test IDs', async () => {
  let trigger: HTMLButtonElement | null = null;
  await act(async () =>
    root.render(
      <Accordion
        type="single"
        defaultValue="one"
        variant="separated"
        className="flex"
        classNames={{
          item: 'border-brand-700',
          header: 'bg-brand-50',
          trigger: 'text-brand-700',
          body: 'pb-8',
        }}
        data-owner="local"
      >
        <AccordionItem value="one" className="rounded-none">
          <AccordionTrigger
            ref={(node) => {
              trigger = node;
            }}
            headingLevel={2}
            className="text-danger-700"
          >
            First
          </AccordionTrigger>
          <AccordionContent className="text-ink" classNames={{ body: 'pb-6' }}>
            First content
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    ),
  );
  expect(trigger).toBe(button('First'));
  expect(host.querySelector('h2')).not.toBeNull();
  expect(button('First').classList.contains('text-danger-700')).toBe(true);
  expect(button('First').classList.contains('text-brand-700')).toBe(false);
  expect(host.querySelector('[data-owner="local"]')?.classList.contains('flex')).toBe(
    true,
  );
  expect(host.querySelector('[data-owner="local"]')?.classList.contains('grid')).toBe(
    false,
  );
  expect(host.querySelector('[role="region"] > div')?.classList.contains('pb-6')).toBe(
    true,
  );
  expect(host.querySelector('[classnames]')).toBeNull();
  expect(host.querySelector('[data-testid]')).toBeNull();
});

it('retains open state by value across reordering and honors explicit selector overrides', async () => {
  function Example() {
    const [reversed, setReversed] = useState(false);

    return (
      <>
        <button onClick={() => setReversed(true)}>Reorder</button>
        <Accordion
          type="multiple"
          defaultValue={['a/b']}
          data-testid="sections"
          items={reversed ? [...items].reverse() : items}
        />
      </>
    );
  }

  await act(async () => root.render(<Example />));

  act(() => button('Reorder').click());

  expect(button('First').getAttribute('aria-expanded')).toBe('true');
  expect(host.querySelector('[data-testid="sections-trigger-a%2Fb"]')).toBe(
    button('First'),
  );
  const ids = Array.from(host.querySelectorAll('[data-testid]')).map((node) =>
    node.getAttribute('data-testid'),
  );
  expect(new Set(ids).size).toBe(ids.length);
  await act(async () =>
    root.render(
      <Accordion type="single" data-testid="sections">
        <AccordionItem value="one">
          <AccordionTrigger data-testid="custom-trigger">First</AccordionTrigger>
          <AccordionContent>First content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    ),
  );
  expect(host.querySelector('[data-testid="custom-trigger"]')).toBe(button('First'));
  expect(host.querySelector('[data-testid="sections-trigger-one"]')).toBeNull();
});

// @ts-expect-error Single mode accepts a string, never an array.
const invalid: AccordionProps = {
  type: 'single',
  value: ['first'],
};
void invalid;
