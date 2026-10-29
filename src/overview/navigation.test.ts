import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('typechecks the shared Navbar and Sidebar menu recipe against the public API', () => {
  const mdx = readFileSync('src/overview/navigation.mdx', 'utf8');
  const recipe = mdx.match(/```tsx\n([\s\S]*?)```/)?.[1];
  expect(recipe).toBeDefined();

  const file = resolve('src/overview/navigation-recipe.tsx');
  const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    process.cwd(),
  );
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (name, ...args) =>
    name === file
      ? ts.createSourceFile(
          name,
          recipe!,
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TSX,
        )
      : getSourceFile(name, ...args);
  const program = ts.createProgram([file], { ...options, noEmit: true }, host);
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));

  expect(diagnostics).toEqual([]);
});
