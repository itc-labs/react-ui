// @vitest-environment jsdom
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import sources from './sources.json';
import { iconCatalog } from './catalog';
import { outlineIcons } from './outline/pack';
import { boldIcons } from './bold/pack';
import { CloseIcon } from './outline/close';
import { SortAscendingIcon, SortDescendingIcon, SortUnsortedIcon } from './custom';
import type { IconPack } from './types';

const require = createRequire(import.meta.url);
const packs: Record<string, IconPack> = { outline: outlineIcons, bold: boldIcons };

it('preserves upstream SVG geometry and paint for every curated source glyph', () => {
  const shape = (markup: string) => {
    const container = document.createElement('div');
    container.innerHTML = markup;
    const svg = container.querySelector('svg')!;

    return {
      viewBox: svg.getAttribute('viewBox'),
      fill: svg.getAttribute('fill'),
      stroke: svg.getAttribute('stroke'),
      strokeWidth: svg.getAttribute('stroke-width'),
      children: svg.innerHTML,
    };
  };

  const pairs = new Map<string, { outline?: string; bold?: string; shared: boolean }>();
  for (const source of sources) {
    const Glyph = packs[source.variant]!.icons[source.name]!;
    const Upstream = require(source.module)[source.upstream];
    const geometry = JSON.stringify(shape(renderToStaticMarkup(createElement(Glyph))));
    const pair = pairs.get(source.name) ?? {
      shared: source.neutral || source.outlineOnly,
    };
    pair[source.variant as 'outline' | 'bold'] = geometry;
    pairs.set(source.name, pair);
    expect(
      shape(renderToStaticMarkup(createElement(Glyph))),
      `${source.family}/${source.variant}/${source.name}`,
    ).toEqual(shape(renderToStaticMarkup(createElement(Upstream))));
  }
  const seen = new Map<string, string[]>();
  for (const [name, pair] of pairs) {
    if (pair.shared) expect(pair.bold, name).toBe(pair.outline);
    else expect(pair.bold, name).not.toBe(pair.outline);
    const identity = `${pair.outline}\n${pair.bold}`;
    seen.set(identity, [...(seen.get(identity) ?? []), name]);
  }
  // Only these documented compatibility fallbacks may share upstream artwork.
  expect(
    [...seen.values()]
      .filter((names) => names.length > 1)
      .map((names) => names.sort())
      .sort(),
  ).toEqual([
    ['archiveCheck', 'deliveryBox'],
    ['bank', 'courthouse'],
    ['cardEdit', 'cardReceive', 'cardSend'],
    ['circuitBoard', 'cpuSettings'],
    ['codeXml', 'programming'],
    ['convertCard', 'walletCheck'],
    ['convertShape', 'shape'],
    ['cpu', 'cpuCharge'],
    ['deliveryCheck', 'deliveryRemove', 'deliveryTime'],
    ['driver', 'driverRefresh'],
    ['folderCloud', 'folderSync'],
    ['globeEdit', 'globeRefresh', 'globeSearch'],
    ['heartCircle', 'heartEdit', 'heartSearch'],
    ['keyboard', 'keyboardOpen'],
    ['securitySearch', 'shieldQuestion'],
    ['shopAdd', 'shopRemove'],
    ['simCard', 'simCards'],
    ['walletAdd', 'walletSearch'],
    ['walletMoney', 'walletRemove'],
  ]);
}, 20_000);

it('supports provider-free direct imports, labels, sizing and caller classes', () => {
  const html = renderToStaticMarkup(
    <CloseIcon
      size={28}
      label="Find"
      className="text-danger-700 size-7"
      strokeWidth={3}
    />,
  );
  expect(html).toContain('width="28"');
  expect(html).toContain('height="28"');
  expect(html).toContain('aria-label="Find"');
  expect(html).toContain('role="img"');
  expect(html).not.toContain('aria-hidden');
  expect(html).toContain('stroke-width="3"');
  expect(html).toContain('text-danger-700 size-7');
  expect(renderToStaticMarkup(<CloseIcon />)).toContain('aria-hidden="true"');
});

it('keeps the paired sort arrows and active-direction opacity in the icon library', () => {
  const opacities = (Glyph: typeof SortAscendingIcon) => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(<Glyph className="sort-override" />);

    return Array.from(container.querySelectorAll('path')).map((path) =>
      path.getAttribute('opacity'),
    );
  };

  expect(opacities(SortAscendingIcon)).toEqual(['1', '0.25']);
  expect(opacities(SortDescendingIcon)).toEqual(['0.25', '1']);
  expect(opacities(SortUnsortedIcon)).toEqual(['1', '1']);
});

it('direct leaf modules contain native SVG code without vendor or pack imports', () => {
  for (const source of sources) {
    const name = source.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const file = readFileSync(
      `src/components/icon/${source.variant}/${name}.tsx`,
      'utf8',
    );
    expect(file).not.toMatch(
      /from ['"](?:lucide-react|@heroicons\/react|.*\/pack)['"]/,
    );
    if (source.neutral) expect(file).toContain("from '../custom/spinner'");
    else if (source.outlineOnly) expect(file).toContain("from '../shared/");
    else expect(file).toContain('<IconSvg');
  }
});

it('exposes exactly one canonical name in both variants, with neutral controls explicitly identified', () => {
  expect(Object.keys(outlineIcons.icons).sort()).toEqual(
    Object.keys(boldIcons.icons).sort(),
  );
  expect(Object.keys(outlineIcons.icons)).toHaveLength(651);
  expect(new Set(sources.map(({ name }) => name)).size).toBe(648);
  expect(sources.filter(({ neutral }) => neutral).map(({ name }) => name)).toEqual([
    'spinner',
    'spinner',
  ]);
});

it('uses the exact outline implementation in bold mode for outline-only icons and publishes honest metadata', () => {
  const fallbackNames = Object.entries(iconCatalog)
    .filter(([, item]) => item.outlineOnly)
    .map(([name]) => name as keyof typeof outlineIcons.icons);
  expect(fallbackNames).toHaveLength(359);
  for (const name of fallbackNames) {
    expect(boldIcons.icons[name]).toBe(outlineIcons.icons[name]);
    expect(renderToStaticMarkup(createElement(boldIcons.icons[name]))).toBe(
      renderToStaticMarkup(createElement(outlineIcons.icons[name])),
    );
  }
  expect(Object.keys(iconCatalog).sort()).toEqual(
    Object.keys(outlineIcons.icons).sort(),
  );
  expect(
    new Set(Object.values(iconCatalog).map(({ category }) => category)).size,
  ).toBeGreaterThan(12);
});

it('limits source artwork to the two approved families and matches their installed modules', () => {
  const counts = { heroicons: 0, lucide: 0 };
  for (const source of sources) {
    expect(['heroicons', 'lucide']).toContain(source.family);
    if (source.family === 'heroicons') {
      expect(source.module).toBe(
        `@heroicons/react/24/${source.variant === 'bold' ? 'solid' : 'outline'}`,
      );
      expect(source.outlineOnly).toBe(false);
    } else {
      expect(source.module).toBe('lucide-react');
      expect(source.sourceVariant).toBe('outline');
      expect(source.outlineOnly || source.neutral).toBe(true);
    }
    if (source.variant === 'outline') counts[source.family as keyof typeof counts]++;
  }
  expect(counts).toEqual({ heroicons: 288, lucide: 360 });
});
