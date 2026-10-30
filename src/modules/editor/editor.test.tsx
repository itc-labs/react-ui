// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { userEvent } from 'storybook/test';
import { Editor, type EditorProps } from './index';
import { UILocaleProvider } from '../../i18n/provider';
import { isValueControl } from '../../components/common/form-control';
import { isEditorUrl } from './link-url';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  // ProseMirror measures the selection when restoring focus.
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => new DOMRect();
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
});

async function render(props: EditorProps = {}, locale = 'en-US') {
  await act(async () =>
    root.render(
      <UILocaleProvider locale={locale}>
        <Editor label="Content" {...props} />
      </UILocaleProvider>,
    ),
  );
}

const input = () => host.querySelector('[role="textbox"]') as HTMLDivElement;

function button(label: string): HTMLButtonElement {
  return Array.from(document.querySelectorAll('button')).find(
    (node) => node.getAttribute('aria-label') === label || node.textContent === label,
  )!;
}

async function click(label: string) {
  await act(async () => button(label).click());
}

it('renders default HTML, controlled updates, form value, ARIA and class/testid parts', async () => {
  await render({
    defaultValue: '<p>Lorem</p>',
    name: 'body',
    required: true,
    hint: 'Hint',
    'data-testid': 'editor',
    className: 'gap-4',
    classNames: { root: 'gap-2', content: 'px-6', toolbarButton: 'rounded-full' },
  });
  expect(isValueControl(Editor)).toBe(true);
  expect(input().textContent).toBe('Lorem');
  expect(input().getAttribute('aria-multiline')).toBe('true');
  expect(input().getAttribute('aria-required')).toBe('true');
  expect(input().getAttribute('aria-describedby')).toBe(
    host.querySelector('p[id]')?.id,
  );
  expect(input().getAttribute('data-testid')).toBe('editor-input');
  expect(input().className).toContain('px-6');
  expect(host.firstElementChild?.className).toContain('gap-4');
  expect(host.firstElementChild?.className).not.toContain('gap-2');
  expect(button('Bold').className).toContain('rounded-full');
  expect(button('Bold').className).toContain('focus-visible:');
  expect(host.querySelector('input[type="hidden"]')?.getAttribute('value')).toBe(
    '<p>Lorem</p>',
  );
  await render({ value: '<h3>Next</h3>', error: 'Invalid' });
  expect(input().querySelector('h3')?.textContent).toBe('Next');
  expect(input().getAttribute('aria-invalid')).toBe('true');
  await render({ disabled: true });
  expect(input().getAttribute('contenteditable')).toBe('false');
  expect(button('Link').disabled).toBe(true);
  await render({ readOnly: true });
  expect(input().getAttribute('aria-readonly')).toBe('true');
  expect(host.querySelector('button')).toBeNull();
});

it('toggles code blocks, inserts horizontal rules and emits uncontrolled HTML', async () => {
  const onValueChange = vi.fn();
  await render({ defaultValue: '<p>Lorem ipsum</p>', onValueChange });
  await click('Code block');
  expect(input().querySelector('pre code')?.textContent).toBe('Lorem ipsum');
  expect(button('Code block').getAttribute('aria-pressed')).toBe('true');
  expect(onValueChange).toHaveBeenCalledWith(expect.stringContaining('<pre><code>'));
  await click('Code block');
  expect(input().querySelector('pre')).toBeNull();
  await click('Horizontal rule');
  expect(input().querySelector('hr')).not.toBeNull();
});

it('validates links, applies with Enter, removes links, and closes with Escape restoring editor focus', async () => {
  const user = userEvent.setup({ document });
  await render({ defaultValue: '<p>Lorem ipsum</p>', 'data-testid': 'editor' });

  act(() => {
    input().focus();
    const range = document.createRange();
    range.selectNodeContents(input().querySelector('p')!);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });

  await click('Link');

  const url = () =>
    document.querySelector('input:not([type="hidden"])') as HTMLInputElement;

  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  await act(async () => user.type(url(), 'javascript:alert(1)'));
  await act(async () => user.keyboard('{Enter}'));
  expect(document.body.textContent).toContain(
    'Enter a valid http, https, or mailto URL.',
  );
  expect(url().getAttribute('aria-invalid')).toBe('true');
  await act(async () => {
    await user.clear(url());
    await user.type(url(), 'https://example.com');
    await user.keyboard('{Enter}');
  });
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  await act(async () => new Promise((resolve) => setTimeout(resolve, 30)));
  expect(input().querySelector('a')?.getAttribute('href')).toBe('https://example.com');
  await click('Link');
  expect(url().value).toBe('https://example.com');
  await click('Remove');
  await act(async () => new Promise((resolve) => setTimeout(resolve, 30)));
  expect(input().querySelector('a')).toBeNull();
  await click('Link');
  expect(url().value).toBe('');
  await act(async () => user.keyboard('{Escape}'));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 30)));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(input());
});

it('preserves safe link attributes and rejects unsupported protocols in stored editor HTML', async () => {
  await render({
    value:
      '<p><a href="https://example.com">Lorem</a><a href="javascript:alert(1)">Ipsum</a><a href="ftp://example.com">Dolor</a></p>',
  });
  const link = input().querySelector('a')!;
  expect(input().querySelectorAll('a')).toHaveLength(1);
  expect(link.getAttribute('rel')).toBe('noopener noreferrer nofollow');
  expect(link.getAttribute('target')).toBe('_blank');
  await render({}, 'vi-VN');
  expect(button('Liên kết')).toBeDefined();
});

it.each(['https://example.com', 'http://example.com', 'mailto:hello@example.com'])(
  'accepts %s',
  (url) => expect(isEditorUrl(url)).toBe(true),
);

it.each([
  'javascript:alert(1)',
  'data:text/html,test',
  'ftp://example.com',
  '/relative',
  'invalid',
  'https://',
  'mailto:',
])('rejects %s', (url) => expect(isEditorUrl(url)).toBe(false));

it('supports keyboard activation of toolbar controls and tabbing into the link popover', async () => {
  const user = userEvent.setup({ document });
  await render({ defaultValue: '<p>Lorem</p>' });

  act(() => button('Code block').focus());

  await act(async () => user.keyboard('{Enter}'));
  expect(button('Code block').getAttribute('aria-pressed')).toBe('true');
  await act(async () => new Promise((resolve) => setTimeout(resolve, 30)));

  act(() => button('Link').focus());

  await act(async () => user.keyboard(' '));
  expect(document.activeElement?.tagName).toBe('INPUT');
  await act(async () => user.tab());
  expect(document.activeElement).toBe(button('Apply'));
  await act(async () => user.tab());
  expect(document.activeElement).toBe(button('Remove'));
});
