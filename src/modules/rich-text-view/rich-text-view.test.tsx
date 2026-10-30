// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { RichTextView, type RichTextViewProps } from './index';

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

function render(props: RichTextViewProps) {
  act(() => root.render(<RichTextView {...props} />));
}

it('preserves Editor tags and strips scripts, event handlers, extra attributes and unsafe URLs', () => {
  render({
    html: '<h2 id="bad">Lorem</h2><h3>Ipsum</h3><p style="color:red" onclick="alert(1)"><strong>Bold</strong><em>Italic</em><s>Strike</s><br></p><ul><li>List</li></ul><ol><li>Ordered</li></ol><blockquote>Quote</blockquote><pre><code>Code</code></pre><hr><script>alert(1)</script><img src=x onerror=alert(1)><iframe src="https://example.com"></iframe><svg onload="alert(1)"></svg><a href="javascript:alert(1)" target="_blank" rel="opener">Unsafe</a><a href="https://example.com" target="_BLANK" rel="opener" data-x="bad">Safe</a><p href="https://example.com">Text</p>',
  });
  for (const tag of [
    'h2',
    'h3',
    'p',
    'strong',
    'em',
    's',
    'br',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
    'hr',
  ])
    expect(host.querySelector(tag)).not.toBeNull();
  expect(
    host.querySelector(
      'script,img,iframe,svg,[onclick],[style],[onload],[onerror],[data-x],h2[id],p[href]',
    ),
  ).toBeNull();
  const links = host.querySelectorAll('a');
  expect(links[0]?.hasAttribute('href')).toBe(false);
  expect(links[1]?.getAttribute('href')).toBe('https://example.com');
  expect(links[1]?.getAttribute('rel')).toBe('noopener noreferrer nofollow');
});

it('updates HTML, uses the fallback for empty or stripped content and explicitly bypasses sanitization', () => {
  render({ html: '<p>First</p>' });
  expect(host.textContent).toBe('First');
  render({ html: '<p>Next</p>' });
  expect(host.textContent).toBe('Next');
  render({ html: '<script>alert(1)</script>', emptyFallback: <span>Empty</span> });
  expect(host.textContent).toBe('Empty');
  render({ html: '', emptyFallback: 'Empty' });
  expect(host.textContent).toBe('Empty');
  render({ html: '<section data-trusted="true">Trusted</section>', sanitize: false });
  expect(host.querySelector('[data-trusted]')?.textContent).toBe('Trusted');
});

it('forwards semantic element, ref, native props, classes and test IDs', () => {
  const ref = createRef<HTMLDivElement>();
  render({
    html: '<p>Lorem</p>',
    as: 'article',
    ref,
    id: 'preview',
    'aria-label': 'Preview',
    'data-testid': 'view',
    classNames: { root: 'text-body p-3' },
    className: 'p-6',
  });
  expect(ref.current).toBe(host.querySelector('article'));
  expect(ref.current?.getAttribute('data-testid')).toBe('view');
  expect(ref.current?.getAttribute('aria-label')).toBe('Preview');
  expect(ref.current?.id).toBe('preview');
  expect(ref.current?.className).toContain('pod-rich-text');
  expect(ref.current?.className).toContain('p-6');
  expect(ref.current?.className).not.toContain('p-3');
  expect(host.innerHTML).not.toContain('classNames');
});

it('renders a stable SSR fallback and hydrates before showing sanitized HTML', async () => {
  act(() => root.unmount());

  const props = {
    html: '<p>Lorem</p><script>alert(1)</script>',
    emptyFallback: 'Empty',
  };
  host.innerHTML = renderToString(<RichTextView {...props} />);
  expect(host.textContent).toBe('Empty');
  const onRecoverableError = vi.fn();
  await act(async () => {
    root = hydrateRoot(host, <RichTextView {...props} />, { onRecoverableError });
  });
  expect(onRecoverableError).not.toHaveBeenCalled();
  expect(host.textContent).toBe('Lorem');
  expect(host.querySelector('script')).toBeNull();
  expect(
    renderToString(<RichTextView html="<p>Trusted</p>" sanitize={false} />),
  ).toContain('<p>Trusted</p>');
});
