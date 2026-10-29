// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UIProvider } from '../../theme/provider';
import { InfoIcon } from '../icon/outline/info';
import { Tag } from './index';

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

it.each([
  ['vi-VN', 'Xóa Alpha'],
  ['en-US', 'Remove Alpha'],
])('localizes removal in %s', (locale, label) => {
  act(() =>
    root.render(
      <UIProvider locale={locale}>
        <Tag onRemove={() => {}}>Alpha</Tag>
      </UIProvider>,
    ),
  );

  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe(label);
});

it('uses sibling buttons and isolates removal from selection', () => {
  const onClick = vi.fn();
  const onRemove = vi.fn();
  const ref = createRef<HTMLSpanElement>();

  act(() =>
    root.render(
      <Tag
        ref={ref}
        data-testid="tag"
        selected
        onClick={onClick}
        onRemove={onRemove}
        removeLabel="Remove item"
      >
        Alpha
      </Tag>,
    ),
  );

  const action = host.querySelector<HTMLButtonElement>('[data-testid="tag-action"]')!;
  const remove = host.querySelector<HTMLButtonElement>('[data-testid="tag-remove"]')!;
  expect(action.getAttribute('aria-pressed')).toBe('true');
  expect(remove.getAttribute('aria-label')).toBe('Remove item');
  expect(action.contains(remove)).toBe(false);
  expect(ref.current).toBe(host.firstElementChild);

  act(() => remove.click());

  expect(onRemove).toHaveBeenCalledTimes(1);
  expect(onClick).not.toHaveBeenCalled();

  act(() => action.click());

  expect(onClick).toHaveBeenCalledTimes(1);

  act(() =>
    action.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }),
    ),
  );

  expect(onRemove).toHaveBeenCalledTimes(2);
});

it.each(['Backspace', 'Delete'])('removes a focused tag with %s', (key) => {
  const onRemove = vi.fn();

  act(() => root.render(<Tag onRemove={onRemove}>Alpha</Tag>));

  const tag = host.firstElementChild as HTMLElement;
  tag.focus();
  expect(document.activeElement).toBe(tag);

  act(() =>
    tag.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    ),
  );

  expect(onRemove).toHaveBeenCalledTimes(1);
});

it('disables selection and removal by pointer and keyboard', () => {
  const handler = vi.fn();

  act(() =>
    root.render(
      <Tag disabled selected onClick={handler} onRemove={handler}>
        Alpha
      </Tag>,
    ),
  );

  for (const button of Array.from(host.querySelectorAll('button'))) {
    expect(button.disabled).toBe(true);

    act(() => {
      button.click();
      button.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
      );
    });
  }
  expect(handler).not.toHaveBeenCalled();
});

it('forwards refs to native buttons and merges typed slots with icons and derived selectors', () => {
  const ref = createRef<HTMLSpanElement>();

  act(() =>
    root.render(
      <Tag
        ref={ref}
        data-testid="tag"
        onClick={() => {}}
        icon="info"
        iconRight={InfoIcon}
        classNames={{ root: 'bg-danger-50', icon: 'text-ink', label: 'font-bold' }}
        className="bg-canvas"
      >
        Alpha
      </Tag>,
    ),
  );

  expect(ref.current?.tagName).toBe('BUTTON');
  expect(ref.current?.className).toContain('bg-canvas');
  expect(ref.current?.className).not.toContain('bg-danger-50');
  expect(host.querySelector('[data-testid="tag-icon"]')).not.toBeNull();
  expect(host.querySelector('[data-testid="tag-iconRight"]')).not.toBeNull();
  expect(host.querySelector('[data-testid="tag-label"]')?.className).toBe('font-bold');
});

it('allows caller keyboard handlers to cancel removal', () => {
  const onRemove = vi.fn();

  act(() =>
    root.render(
      <Tag
        onClick={() => {}}
        onRemove={onRemove}
        onKeyDown={(event) => event.preventDefault()}
      >
        Alpha
      </Tag>,
    ),
  );

  act(() =>
    host.querySelector('button')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Delete',
        bubbles: true,
        cancelable: true,
      }),
    ),
  );

  expect(onRemove).not.toHaveBeenCalled();
});
