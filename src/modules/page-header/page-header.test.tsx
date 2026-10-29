// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Breadcrumb } from '../../components/breadcrumb';
import { PageHeader } from './index';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('renders breadcrumb navigation above the eyebrow and single h1 while preserving slots', () => {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <PageHeader
      data-testid="page"
      breadcrumb={
        <Breadcrumb
          items={[
            { key: 'home', title: 'Home', href: '/' },
            { key: 'current', title: 'Current' },
          ]}
        />
      }
      eyebrow="Example"
      title="Lorem ipsum"
      description="Dolor sit amet"
      action={<button type="button">Add</button>}
    />,
  );
  const content = host.querySelector('[data-testid="page-content"]')!;
  expect(
    Array.from(content.children).map((child) => child.getAttribute('data-testid')),
  ).toEqual(['page-breadcrumb', 'page-eyebrow', 'page-title', 'page-description']);
  expect(host.querySelectorAll('h1')).toHaveLength(1);
  expect(host.querySelector('h1')?.textContent).toBe('Lorem ipsum');
  expect(host.querySelector('nav a')?.getAttribute('href')).toBe('/');
  expect(host.querySelector('[aria-current="page"]')?.textContent).toBe('Current');
  expect(host.querySelector('[data-testid="page-actions"] button')?.textContent).toBe(
    'Add',
  );
});

it('forwards native props and ref and merges breadcrumb and root classes', () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  const ref = createRef<HTMLDivElement>();
  try {
    act(() =>
      root.render(
        <PageHeader
          ref={ref}
          id="page"
          data-testid="page"
          title="Lorem ipsum"
          breadcrumb={<span>Home</span>}
          className="mb-2"
          classNames={{
            root: 'mb-4',
            breadcrumb: 'mb-3 text-muted',
            title: 'text-heading',
          }}
        />,
      ),
    );

    expect(ref.current).toBe(host.firstChild);
    expect(ref.current?.id).toBe('page');
    expect(ref.current?.className).toContain('mb-2');
    expect(ref.current?.className).not.toContain('mb-4');
    expect(host.querySelector('[data-testid="page-breadcrumb"]')?.className).toBe(
      'mb-3 text-muted',
    );
    expect(host.querySelector('h1')?.className).toContain('text-heading');
    expect(host.innerHTML).not.toMatch(/classNames=|breadcrumb=/);
  } finally {
    act(() => root.unmount());
  }
});

it('omits absent optional slots and emits no selectors without a base', () => {
  const html = renderToStaticMarkup(<PageHeader title="Lorem ipsum" />);
  expect(html).not.toContain('data-testid');
  expect(html).not.toContain('mb-5');
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <PageHeader data-testid="page" title="Lorem ipsum" breadcrumb={null} />,
  );
  expect(host.querySelector('[data-testid="page-breadcrumb"]')).toBeNull();
});
