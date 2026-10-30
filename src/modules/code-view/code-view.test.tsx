// @vitest-environment jsdom
import { act, createRef, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { userEvent } from 'storybook/test';
import { CodeView, type CodeViewLanguage } from './index';
import { UILocaleProvider } from '../../i18n/provider';
import { codeTheme } from './prism';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  if (clipboardDescriptor)
    Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else Reflect.deleteProperty(navigator, 'clipboard');
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function render(
  props: Partial<ComponentProps<typeof CodeView>> = {},
  locale = 'en-US',
) {
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <CodeView
          code={'const title = "Lorem ipsum";\n\nexport { title };\n'}
          {...props}
        />
      </UILocaleProvider>,
    ),
  );
}

const pre = () => host.querySelector('pre')!;

const button = () => host.querySelector('button')!;

const status = () => host.querySelector('[role="status"]')!;

it('renders semantic source, whitespace, blank lines and a keyboard-focusable scroll region', () => {
  const code = 'const title = "Lorem ipsum";\n\nexport { title };\n';
  render({ code });
  expect(pre().getAttribute('role')).toBe('region');
  expect(pre().getAttribute('aria-label')).toBe('Code sample');
  expect(pre().tabIndex).toBe(0);
  expect(pre().querySelector('code')?.textContent).toBe(code);
  expect(host.querySelector('.token.keyword')?.textContent).toBe('const');
  expect(button().type).toBe('button');
  expect(button().textContent).toBe('Copy');
  expect(button().className).toContain('focus-visible:');

  act(() => button().focus());

  expect(document.activeElement).toBe(button());

  act(() => pre().focus());

  expect(document.activeElement).toBe(pre());
  expect(status().getAttribute('aria-live')).toBe('polite');
  expect(status().textContent).toBe('');
});

it.each<[CodeViewLanguage, string, string]>([
  ['tsx', 'const value = <p>Lorem ipsum</p>', 'keyword'],
  ['ts', 'const value: number = 3', 'keyword'],
  ['typescript', 'const value: number = 3', 'keyword'],
  ['jsx', 'const value = <p>Lorem ipsum</p>', 'tag'],
  ['js', 'const value = true', 'keyword'],
  ['javascript', 'const value = true', 'keyword'],
  ['json', '{ "title": "Lorem ipsum" }', 'property'],
  ['css', '.example { display: flex; }', 'selector'],
  ['bash', 'echo "$TITLE"', 'builtin'],
  ['markdown', '**Lorem ipsum**', 'bold'],
  ['html', '<p>Lorem ipsum</p>', 'tag'],
  ['markup', '<p>Lorem ipsum</p>', 'tag'],
])('highlights %s with a grammar and CSS variable colors', (language, code, token) => {
  render({ language, code });
  expect(pre().textContent).toBe(code);
  expect(host.querySelector(`.token.${token}`)).not.toBeNull();
  expect(
    codeTheme.styles.every(
      ({ style }) => !style.color || style.color.startsWith('var(--color-code-'),
    ),
  ).toBe(true);
});

it('handles one-based highlights, inclusive ranges, malformed entries and prop updates', () => {
  render({
    code: 'a\nb\nc\nd\ne',
    showLineNumbers: true,
    highlightLines: [1, '3-4', '5', '4-2', 'no', 0, -1, NaN, '1-999oops'],
    'data-testid': 'source',
  });
  expect(
    Array.from(host.querySelectorAll('[data-highlighted]')).map((line) =>
      line.getAttribute('data-testid'),
    ),
  ).toEqual(['source-line-1', 'source-line-3', 'source-line-4', 'source-line-5']);
  const numbers = Array.from(host.querySelectorAll('[aria-hidden="true"]')).filter(
    (item) => item.tagName === 'SPAN',
  );
  expect(numbers.map((item) => item.textContent)).toEqual(['1', '2', '3', '4', '5']);
  render({ code: 'let next = 0;', copyable: false });
  expect(pre().textContent).toBe('let next = 0;');
  expect(host.querySelector('[data-highlighted]')).toBeNull();
  expect(button()).toBeNull();
  expect(host.querySelector('[data-testid]')).toBeNull();
  render({ code: '', copyable: false });
  expect(pre().textContent).toBe('');
});

it('forwards ref, native props, test IDs and classes with caller precedence, wrapping and scroll height', () => {
  const ref = createRef<HTMLDivElement>();
  render({
    ref,
    id: 'source',
    'aria-label': 'Source preview',
    filename: 'example.ts',
    title: 'Example',
    'data-testid': 'source',
    wrap: true,
    maxHeight: 120,
    showLineNumbers: true,
    highlightLines: [1],
    className: 'rounded-none',
    classNames: {
      root: 'rounded-full',
      header: 'font-bold',
      title: 'italic',
      copyButton: 'rounded-full',
      status: 'status-class',
      pre: 'p-6',
      code: 'text-ui-sm',
      line: 'line-class',
      lineNumber: 'number-class',
      highlightedLine: 'highlight-class',
      token: 'token-class',
    },
  });
  expect(ref.current).toBe(host.querySelector('#source'));
  expect(ref.current?.className).toContain('rounded-none');
  expect(ref.current?.className).not.toContain('rounded-full');
  expect(host.querySelector('[data-testid="source-title"]')?.textContent).toBe(
    'Example',
  );
  expect(pre().getAttribute('aria-label')).toBe('Source preview');
  expect(pre().style.maxHeight).toBe('120px');
  expect(pre().className).toContain('whitespace-pre-wrap');
  for (const [part, className] of Object.entries({
    header: 'font-bold',
    title: 'italic',
    copy: 'rounded-full',
    status: 'status-class',
    pre: 'p-6',
    code: 'text-ui-sm',
    'line-1': 'highlight-class',
    'lineNumber-1': 'number-class',
  })) {
    expect(host.querySelector(`[data-testid="source-${part}"]`)?.className).toContain(
      className,
    );
  }
  expect(host.querySelector('.token-class')).not.toBeNull();
  expect(host.innerHTML).not.toContain('classNames=');
  render({ filename: 'example.ts', copyable: false });
  expect(pre().getAttribute('aria-label')).toBe('example.ts');
  expect(pre().className).toContain('whitespace-pre');
  expect(button()).toBeNull();
});

it('copies the exact unmodified source, announces localized success and resets feedback', async () => {
  vi.useFakeTimers();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  const code = 'const title = "Lorem ipsum";\r\n\t\n';
  render({ code, showLineNumbers: true, highlightLines: [1] });
  await act(async () => button().click());
  expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  expect(status().textContent).toBe('Copied');
  expect(button().textContent).toBe('Copied');

  act(() => vi.advanceTimersByTime(2000));

  expect(status().textContent).toBe('');
  expect(button().textContent).toBe('Copy');
  render({ code }, 'vi-VN');
  expect(pre().getAttribute('aria-label')).toBe('Mẫu mã nguồn');
  expect(button().textContent).toBe('Sao chép');
  await act(async () => button().click());
  expect(status().textContent).toBe('Đã sao chép');
});

it('does not announce success when clipboard access is unavailable or rejected', async () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: undefined,
  });
  render();
  await act(async () => button().click());
  expect(status().textContent).toBe('');
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
  });
  await act(async () => button().click());
  expect(status().textContent).toBe('');
});

it('supports Tab, Shift+Tab, Enter and Space through native keyboard controls', async () => {
  const user = userEvent.setup({ document });
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  render({ code: 'const value = 0;' });
  await act(async () => user.tab());
  expect(document.activeElement).toBe(button());
  await act(async () => user.keyboard('{Enter}'));
  expect(writeText).toHaveBeenCalledExactlyOnceWith('const value = 0;');
  expect(status().textContent).toBe('Copied');
  await act(async () => user.keyboard(' '));
  expect(writeText).toHaveBeenCalledTimes(2);
  await act(async () => user.tab());
  expect(document.activeElement).toBe(pre());
  await act(async () => user.tab({ shift: true }));
  expect(document.activeElement).toBe(button());
});
