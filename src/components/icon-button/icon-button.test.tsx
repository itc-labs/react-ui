import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { IconButton } from './index';

it('replaces its glyph with one spinner while preserving label and click guard', () => {
  const idle = renderToStaticMarkup(<IconButton label="Tìm" icon="search" size="sm" />);
  const busy = renderToStaticMarkup(
    <IconButton label="Tìm" icon="search" size="sm" loading />,
  );
  expect(idle.match(/<svg\b/g)).toHaveLength(1);
  expect(busy.match(/<svg\b/g)).toHaveLength(1);
  expect(busy).toContain('aria-label="Tìm"');
  expect(busy).toContain('aria-busy="true"');
  expect(busy).toContain('disabled=""');
  expect(idle).toContain('size-control-sm');
  expect(busy).toContain('size-control-sm');
});

it('anchors a badge to the glyph and announces it in the accessible name', () => {
  const html = renderToStaticMarkup(
    <IconButton icon="search" label="Notifications" badge={5} data-testid="bell" />,
  );
  const hidden = renderToStaticMarkup(
    <IconButton icon="search" label="Notifications" badge={0} />,
  );

  expect(html).toMatch(/aria-label="Notifications, [^"]*5[^"]*"/);
  expect(html).toContain('>5</span>');
  expect(hidden).toContain('aria-label="Notifications"');
  expect(hidden).not.toContain('data-overlap');
});
