type Glyph = { component: string; module: string };
type SourceOptions = { line: string; story: string; glyphs: Record<string, Glyph> };

/** Turns live JSX from Storybook Controls into a module a host can paste and run. */
export function pasteableSource(
  source: string,
  { line, story, glyphs }: SourceOptions,
) {
  if (source.startsWith('import ')) return source;

  const imports = new Set([line]);
  const body = source.replace(
    /\b(icon\w*)="([a-zA-Z0-9]+)"/g,
    (match, prop: string, name: string) => {
      const glyph = glyphs[name];
      if (!glyph) return match;

      imports.add(`import { ${glyph.component} } from '${glyph.module}';`);

      return `${prop}={${glyph.component}}`;
    },
  );
  const rows = body
    .split('\n')
    .map((row) => `    ${row}`)
    .join('\n');

  return `${[...imports].join('\n')}\n\nexport default function ${story}Example() {\n  return (\n${rows}\n  );\n}\n`;
}
