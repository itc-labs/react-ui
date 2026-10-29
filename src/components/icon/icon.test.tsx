import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icon, defineIconPack, type IconGlyph } from './index';
import { outlineIcons } from './outline/pack';
import { boldIcons } from './bold/pack';
import { IconButton } from '../icon-button';
import { Button } from '../button';
import { defineTheme } from '../../theme';
import { UIProvider } from '../../theme/provider';

const Custom: IconGlyph = (props) => (
  <svg data-custom="true" {...props}>
    <path d="M0 0h12" />
  </svg>
);

it('changes shared controls via theme and preserves a single loading spinner', () => {
  const theme = defineTheme({
    icons: {
      variant: 'bold',
    },
  });
  const html = renderToStaticMarkup(
    <UIProvider theme={theme}>
      <IconButton icon="search" label="Search" />
      <IconButton icon="search" label="Busy" loading />
    </UIProvider>,
  );
  expect(html).toContain(renderToStaticMarkup(<Icon name="search" variant="bold" />));
  expect(html).not.toContain('lucide-search');
  expect(html.match(/<svg/g)).toHaveLength(2);
  expect(html.match(/role="status"/g)).toHaveLength(1);
});

it('resolves explicit glyph/pack before overrides and falls back only for missing semantic icons', () => {
  const pack = defineIconPack('custom', { search: Custom });
  const theme = defineTheme({
    icons: {
      defaultPack: 'custom',
      packs: { custom: pack },
      overrides: { search: Custom },
      size: 28,
      strokeWidth: 2.5,
    },
  });
  const html = renderToStaticMarkup(
    <UIProvider theme={theme}>
      <Icon name="search" className="custom-class" label="Search" />
      <Icon name="search" pack="outline" />
      <Icon name="quote" />
      <Icon glyph={Custom} size={32} strokeWidth={1} />
    </UIProvider>,
  );
  expect(html).toContain('width="28"');
  expect(html).toContain('height="32"');
  expect(html).toContain('stroke-width="2.5"');
  expect(html).toContain('stroke-width="1"');
  expect(html).toContain(
    renderToStaticMarkup(
      <Icon name="search" variant="outline" size={28} strokeWidth={2.5} />,
    ),
  );
  expect(html).toContain(
    renderToStaticMarkup(<Icon name="quote" size={28} strokeWidth={2.5} />),
  );
  expect(html).toContain('class="custom-class"');
  expect(html).toContain('role="img" aria-label="Search"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toMatch(/pack=|glyph=|label="Search"(?=\s*label=)/);
});

it('inherits nested settings, isolates provider roots, and supports arbitrary typed pack names', () => {
  const project = defineIconPack('project', { projectOnly: Custom });
  const outer = defineTheme({
    icons: { overrides: { search: Custom }, size: 30 },
  });
  const html = renderToStaticMarkup(
    <>
      <UIProvider theme={outer}>
        <UIProvider theme={defineTheme({ icons: { strokeWidth: 3 } })}>
          <Icon name="search" />
          <Icon pack={project} name="projectOnly" />
        </UIProvider>
      </UIProvider>
      <Icon name="search" />
    </>,
  );
  expect(html.match(/data-custom="true"/g)).toHaveLength(2);
  expect(html.match(/width="30"/g)).toHaveLength(2);
  expect(html).toContain('stroke-width="3"');
  expect(html.endsWith(renderToStaticMarkup(<Icon name="search" />))).toBe(true);
  expect(html).toContain('width="16"');
});

it('snapshots theme registrations and rejects invalid config or unknown names instead of drawing the wrong glyph', () => {
  const icons: Record<string, IconGlyph> = { search: Custom };
  const packs = { custom: { id: 'custom', icons } };
  const theme = defineTheme({ icons: { defaultPack: 'custom', packs } });
  icons.search = outlineIcons.icons.search;
  expect(theme.icons?.packs?.custom?.icons.search).toBe(Custom);
  expect(() => defineTheme({ icons: { defaultPack: 'missing' } })).toThrow(
    'Unknown default',
  );
  expect(() =>
    defineTheme({ icons: { packs: { other: defineIconPack('custom', {}) } } }),
  ).toThrow('must match');
  expect(() =>
    defineTheme({ icons: { defaultPack: 'constructor', packs: {} } }),
  ).toThrow('Unknown default');
  expect(() => renderToStaticMarkup(<Icon name={'toString' as never} />)).toThrow(
    'Unregistered icon',
  );
  expect(() => defineTheme({ icons: { size: 0 } })).toThrow('positive');
  expect(() => defineIconPack(' ', {})).toThrow('empty');
  expect(() => renderToStaticMarkup(<Icon name="search" pack="missing" />)).toThrow(
    'Unknown icon pack',
  );
  expect(() =>
    renderToStaticMarkup(
      <Icon pack={defineIconPack('empty', {})} name={'missing' as never} />,
    ),
  ).toThrow('Unregistered icon');
});

// Compile-time contract: custom pack keys are inferred without widening the default semantic names.
function typedUsage() {
  const project = defineIconPack('typed', { projectGlyph: Custom });
  const valid = <Icon pack={project} name="projectGlyph" />;
  // @ts-expect-error Unknown custom pack key.
  const invalidPackKey = <Icon pack={project} name="otherGlyph" />;
  // @ts-expect-error Default registry remains a semantic union.
  const invalidDefault = <Icon name="otherGlyph" />;

  return [valid, invalidPackKey, invalidDefault];
}

void typedUsage;

it('uses the curated outline/bold variants by default and supports scoped theme and IconButton overrides', async () => {
  const outline = renderToStaticMarkup(<Icon name="search" variant="outline" />);
  const bold = renderToStaticMarkup(<Icon name="search" variant="bold" />);
  expect(outline).not.toBe(bold);
  expect(renderToStaticMarkup(<Icon name="search" />)).toBe(outline);
  expect(renderToStaticMarkup(<Icon name="search" pack={outlineIcons} />)).toBe(
    outline,
  );
  expect(renderToStaticMarkup(<Icon name="search" pack={boldIcons} />)).toBe(bold);
  const theme = defineTheme({ icons: { variant: 'bold' } });
  expect(
    renderToStaticMarkup(
      <UIProvider theme={theme}>
        <Icon name="search" />
      </UIProvider>,
    ),
  ).toBe(bold);
  expect(
    renderToStaticMarkup(
      <UIProvider theme={theme}>
        <Icon name="search" variant="outline" />
      </UIProvider>,
    ),
  ).toBe(outline);
  expect(
    renderToStaticMarkup(
      <IconButton icon="search" iconVariant="bold" label="Search" />,
    ),
  ).toContain(bold);
  expect(bold).not.toContain('variant=');
});

it('requires opt-in catalogs outside kit names and keeps registrations scoped', async () => {
  const { outlineCatalog, boldCatalog } = await import('./catalog');

  const render = (variant: 'outline' | 'bold') =>
    renderToStaticMarkup(
      <UIProvider
        theme={defineTheme({
          icons: { variant, packs: { outline: outlineCatalog, bold: boldCatalog } },
        })}
      >
        <Icon name="airplane" />
      </UIProvider>,
    );

  expect(() => renderToStaticMarkup(<Icon name="airplane" />)).toThrow(
    'packs: { outline: outlineCatalog, bold: boldCatalog }',
  );
  expect(render('outline')).toBe(
    renderToStaticMarkup(<Icon name="airplane" pack={outlineCatalog} />),
  );
  expect(render('bold')).toBe(
    renderToStaticMarkup(<Icon name="airplane" pack={boldCatalog} />),
  );
  expect(() => renderToStaticMarkup(<Icon name="airplane" />)).toThrow(
    'Unregistered icon',
  );
  expect(renderToStaticMarkup(<Icon glyph={outlineCatalog.icons.airplane} />)).toBe(
    render('outline'),
  );
});

it('falls back from custom packs to the scoped variant catalog and then kit glyphs', async () => {
  const { outlineCatalog, boldCatalog } = await import('./catalog');
  const custom = defineIconPack('project', { search: Custom });
  const theme = defineTheme({
    icons: {
      variant: 'bold',
      defaultPack: 'project',
      packs: { project: custom, outline: outlineCatalog, bold: boldCatalog },
      overrides: { search: Custom },
    },
  });
  const html = renderToStaticMarkup(
    <UIProvider theme={theme}>
      <Icon name="airplane" />
      <Icon name="search" variant="outline" />
      <UIProvider theme={defineTheme({ icons: { size: 24 } })}>
        <Icon name="airplane" />
      </UIProvider>
    </UIProvider>,
  );
  expect(html).toContain(
    renderToStaticMarkup(<Icon name="airplane" pack={boldCatalog} />),
  );
  expect(html).toContain(
    renderToStaticMarkup(<Icon name="search" variant="outline" />),
  );
  expect(html).toContain('width="24"');
  expect(
    renderToStaticMarkup(
      <UIProvider
        theme={defineTheme({
          icons: {
            variant: 'bold',
            defaultPack: 'project',
            packs: { project: custom },
          },
        })}
      >
        <Icon name="calendar" />
      </UIProvider>,
    ),
  ).toBe(renderToStaticMarkup(<Icon name="calendar" variant="bold" />));
});

it('preserves scoped spinner overrides on the narrow Button loading path', () => {
  const spinner = defineIconPack('project', { spinner: Custom });
  for (const icons of [
    { variant: 'bold' as const, overrides: { spinner: Custom } },
    { defaultPack: 'project', packs: { project: spinner } },
    {
      variant: 'bold' as const,
      packs: { bold: defineIconPack('bold', { spinner: Custom }) },
    },
  ]) {
    const html = renderToStaticMarkup(
      <UIProvider theme={defineTheme({ icons })}>
        <Button loading>Save</Button>
      </UIProvider>,
    );
    expect(html.match(/data-custom="true"/g)).toHaveLength(1);
    expect(html.match(/role="status"/g)).toHaveLength(1);
  }
});
