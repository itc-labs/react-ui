import { readFileSync } from 'node:fs';
import { compile } from 'tailwindcss';
import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Sidebar } from './index';
import { sidebarItemClasses } from './appearance';

it('draws raised active contours inside rounded links, submenu triggers and icon rails', async () => {
  const theme = readFileSync(
    new URL('../../theme/tokens.css', import.meta.url),
    'utf8',
  );
  const compiler = await compile(
    `${theme.slice(theme.indexOf('@theme static'))}\n@tailwind utilities;`,
  );
  const css = compiler.build(sidebarItemClasses('raised', true).split(' '));
  expect(css).toContain('inset 0 0 0 1px');
  expect(css).toContain('--sidebar-border');

  for (const collapsed of [false, true]) {
    for (const tone of ['default', 'dark', 'brand'] as const) {
      const html = renderToStaticMarkup(
        <Sidebar
          collapsed={collapsed}
          tone={tone}
          items={[
            {
              id: 'main',
              type: 'group',
              label: 'Main',
              items: [{ id: 'overview', href: '/', label: 'Overview', active: true }],
            },
            {
              id: 'settings',
              type: 'submenu',
              label: 'Settings',
              active: true,
              items: [{ id: 'profile', href: '/profile', label: 'Profile' }],
            },
          ]}
        />,
      );
      const activeClasses = Array.from(
        html.matchAll(/class="([^"]*inset-ring-1[^"]*)"/g),
        (match) => match[1]!,
      );
      expect(activeClasses.length).toBeGreaterThan(0);
      for (const classes of activeClasses) {
        expect(classes).toContain('rounded-control');
        expect(classes.split(' ')).not.toContain('ring-1');
      }
    }
  }
});
