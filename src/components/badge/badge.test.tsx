import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Badge } from './index';

it.each(['info', 'success', 'warning', 'danger'] as const)(
  'uses the %s status palette',
  (tone) => {
    const html = renderToStaticMarkup(<Badge tone={tone}>{tone}</Badge>);

    expect(html).toContain(`bg-${tone}-50 text-${tone}-700`);
  },
);

it('keeps neutral and brand appearances and caller overrides for info', () => {
  expect(renderToStaticMarkup(<Badge>Notice</Badge>)).toContain('bg-canvas text-muted');
  expect(renderToStaticMarkup(<Badge tone="brand">Brand</Badge>)).toContain(
    'bg-brand-100 text-brand-800',
  );
  const html = renderToStaticMarkup(
    <Badge tone="info" data-testid="status" className="bg-canvas text-ink">
      Info
    </Badge>,
  );

  expect(html).toContain('bg-canvas text-ink');
  expect(html).not.toContain('bg-info-50');
  expect(html).not.toContain('text-info-700');
  expect(html).toContain('data-testid="status"');
});
