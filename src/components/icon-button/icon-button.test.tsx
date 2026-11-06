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

it('supports semantic tones independently of the visual variant and preserves caller classes', () => {
  const html = renderToStaticMarkup(
    <IconButton
      icon="close"
      label="Delete"
      variant="ghost"
      tone="danger"
      className="rounded-full"
    />,
  );
  expect(html).toContain('text-danger-700');
  expect(html).toContain('hover:bg-danger-50');
  expect(html).toContain('rounded-full');
  expect(html).not.toContain('tone="');
});

it('keeps a dashed outline on semantic icon actions while disabling loading clicks', () => {
  const html = renderToStaticMarkup(
    <IconButton icon="plus" label="Add user" variant="dashed" tone="danger" loading />,
  );
  expect(html).toContain('border-dashed');
  expect(html).toContain('border-danger-700');
  expect(html).toContain('disabled=""');
  expect(html.match(/<svg\b/g)).toHaveLength(1);
});
