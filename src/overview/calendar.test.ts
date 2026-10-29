import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

it(
  'typechecks every calendar overview recipe against public exports',
  { timeout: 60_000 },
  () => {
    const mdx = readFileSync('src/overview/calendar.mdx', 'utf8');
    const recipes = [...mdx.matchAll(/```tsx\n([\s\S]*?)```/g)].map(
      (match) => match[1]!,
    );
    expect(recipes).toHaveLength(7);
    const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
    const { options } = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      process.cwd(),
    );
    const sources = new Map(
      recipes.map((recipe, index) => [
        resolve(`src/overview/calendar-recipe-${index}.tsx`),
        recipe,
      ]),
    );
    const host = ts.createCompilerHost(options);
    const getSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (name, ...args) =>
      sources.has(name)
        ? ts.createSourceFile(
            name,
            sources.get(name)!,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TSX,
          )
        : getSourceFile(name, ...args);
    const program = ts.createProgram(
      [...sources.keys()],
      { ...options, noEmit: true },
      host,
    );
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        ),
    ).toEqual([]);
  },
);
