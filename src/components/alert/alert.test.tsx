import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Alert } from './index';

it.each(['info', 'success', 'warning', 'danger'] as const)(
  'uses the %s palette in panel and inline feedback',
  (tone) => {
    const panel = renderToStaticMarkup(<Alert tone={tone}>Feedback</Alert>);
    const inline = renderToStaticMarkup(
      <Alert tone={tone} variant="inline">
        Feedback
      </Alert>,
    );

    expect(panel).toContain(`border-${tone}-700/20 bg-${tone}-50 text-${tone}-700`);
    expect(inline).toContain(`text-${tone}-700`);
    expect(inline).not.toContain(`bg-${tone}-50`);
    for (const html of [panel, inline]) {
      expect(html).toContain(`role="${tone === 'danger' ? 'alert' : 'status'}"`);
    }
  },
);

it('defaults to info and retains the previous notice appearance through neutral', () => {
  expect(renderToStaticMarkup(<Alert>Feedback</Alert>)).toContain('bg-info-50');
  expect(renderToStaticMarkup(<Alert tone="neutral">Notice</Alert>)).toContain(
    'border-line bg-brand-50 text-ink',
  );
  expect(
    renderToStaticMarkup(
      <Alert tone="neutral" variant="inline">
        Notice
      </Alert>,
    ),
  ).toContain('text-muted');
});

it('keeps caller classes after info styles and forwards native props and selectors', () => {
  const html = renderToStaticMarkup(
    <Alert
      ref={createRef<HTMLDivElement>()}
      data-testid="notice"
      aria-label="Notice"
      classNames={{ root: 'bg-canvas text-muted', icon: 'size-6' }}
      className="text-ink"
    >
      Feedback
    </Alert>,
  );

  expect(html).toContain('bg-canvas text-ink');
  expect(html).not.toContain('bg-info-50');
  expect(html).not.toContain('text-info-700');
  expect(html).toContain('size-6');
  expect(html).toContain('data-testid="notice"');
  expect(html).toContain('aria-label="Notice"');
  expect(html).not.toMatch(/classNames=/i);
});
