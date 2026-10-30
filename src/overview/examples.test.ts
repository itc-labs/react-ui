import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

it(
  'typechecks every complete MDX TSX example against the public source API',
  { timeout: 120_000 },
  () => {
    const root = process.cwd();
    const overview = resolve(root, 'src/overview');
    const examples = new Map<string, { label: string; source: string }>();

    for (const entry of readdirSync(overview, {
      recursive: true,
      withFileTypes: true,
    })) {
      if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;
      const file = resolve(entry.parentPath, entry.name);
      const mdx = readFileSync(file, 'utf8');
      let block = 0;
      for (const match of mdx.matchAll(
        /^```([^\r\n]*)\r?\n([\s\S]*?)^```[ \t]*\r?$/gm,
      )) {
        const language = match[1]!.trim();
        if (language !== 'tsx' && language !== 'tsx snippet') continue;
        block += 1;
        if (language === 'tsx snippet') continue;
        examples.set(`${file}.block-${block}.tsx`, {
          label: `${relative(root, file)} block ${block}`,
          // Keep even import-free fragments isolated in this shared program.
          source: `${match[2]!}\nexport {};\n`,
        });
      }
    }
    expect(examples.size, 'Expected at least one complete TSX example').toBeGreaterThan(
      0,
    );

    const configFile = resolve(root, 'tsconfig.json');
    const config = ts.readConfigFile(configFile, ts.sys.readFile);
    expect(config.error).toBeUndefined();
    const configResult = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    expect(configResult.errors).toEqual([]);

    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      name: string;
      exports: Record<string, string>;
    };
    // Development exports mirror the build's preserved source modules, including
    // wildcard glyph entries. ui.css is the compiled version of src/ui.css.
    const paths = Object.fromEntries(
      Object.entries(pkg.exports).map(([subpath, target]) => [
        subpath === '.' ? pkg.name : `${pkg.name}${subpath.slice(1)}`,
        [resolve(root, target.replace(/^\.\/dist\//, './src/'))],
      ]),
    );
    const options: ts.CompilerOptions = {
      ...configResult.options,
      paths: { ...configResult.options.paths, ...paths },
      noEmit: true,
      incremental: false,
    };

    const ambientFile = resolve(overview, '__example-adapters.d.ts');
    const virtualFiles = new Map(
      [...examples].map(([file, example]) => [file, example.source]),
    );
    // These describe only the native-prop adapter surface used by the recipes;
    // they do not substitute for checking an application's Next.js integration.
    virtualFiles.set(
      ambientFile,
      `declare module 'next/link' {
        import type { ComponentPropsWithRef, ReactElement } from 'react';
        export default function Link(
          props: ComponentPropsWithRef<'a'> & { href: string },
        ): ReactElement;
      }
      declare module 'next/image' {
        import type { ComponentPropsWithRef, ReactElement } from 'react';
        export default function Image(
          props: Omit<ComponentPropsWithRef<'img'>, 'src' | 'alt' | 'width' | 'height'> & {
            src: string;
            alt: string;
            width: number | \`\${number}\`;
            height: number | \`\${number}\`;
          },
        ): ReactElement;
      }
      declare module '*.css' {}`,
    );

    const host = ts.createCompilerHost(options);
    const readFile = host.readFile.bind(host);
    const fileExists = host.fileExists.bind(host);
    const getSourceFile = host.getSourceFile.bind(host);
    host.readFile = (file) => virtualFiles.get(file) ?? readFile(file);
    host.fileExists = (file) => virtualFiles.has(file) || fileExists(file);
    host.getSourceFile = (file, ...args) => {
      const source = virtualFiles.get(file);

      return source === undefined
        ? getSourceFile(file, ...args)
        : ts.createSourceFile(file, source, options.target!, true);
    };

    const program = ts.createProgram([...virtualFiles.keys()], options, host);
    const diagnostics = ts.getPreEmitDiagnostics(program).map((diagnostic) => {
      const file = diagnostic.file;
      const label = file
        ? (examples.get(file.fileName)?.label ?? relative(root, file.fileName))
        : 'Compiler options';
      const position = file?.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      const location = position
        ? `:${position.line + 1}:${position.character + 1}`
        : '';

      return `${label}${location} TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;
    });
    expect(diagnostics, diagnostics.join('\n')).toEqual([]);
  },
);
