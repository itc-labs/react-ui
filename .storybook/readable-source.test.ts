import { expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';
import { storyExamples } from './readable-source';

it('expands a stateful wrapper with real imports and JSX, excluding play/metadata', async () => {
  const source = `import {useState} from 'react'; import {Switch} from './index'; import {expect} from 'storybook/test';
    function Demo(){const [checked,setChecked]=useState(false);return <Switch checked={checked} onCheckedChange={setChecked}/>}
    const meta={component:Demo}; export const Playground={play:()=>expect(true)};`;
  const snippet = (
    await storyExamples(source, resolve('src/components/switch/switch.stories.tsx'))
  ).Playground!;
  expect(snippet).toContain("from '@itclabs/react-ui'");
  expect(snippet).toContain('useState(false)');
  expect(snippet).toContain('<Switch');
  expect(snippet).not.toContain('play:');
  expect(snippet).not.toContain('storybook/test');
  expect(snippet.trim()).not.toBe('<Demo />');
});

it('includes transitive helper dependencies and selected story arguments', async () => {
  const source = `import {Select} from './index';const options=[{value:'a',label:'A'}];function Picker({disabled=false}){return <Select options={options} disabled={disabled}/>}
  const meta={component:Picker};export const Disabled={args:{disabled:true}};export const Custom={render:()=> <Picker disabled/>};`;
  const result = await storyExamples(
    source,
    resolve('src/components/select/select.stories.tsx'),
  );
  expect(result.Disabled).toContain('const options');
  expect(result.Disabled).toContain('disabled: true');
  expect(result.Custom).toContain('function Picker');
});

it('retains native dynamic args source for a direct public component', async () => {
  expect(
    await storyExamples(
      `import {Button} from './index';const meta={component:Button};export const Primary={args:{children:'Run'}};`,
      resolve('src/components/button/button.stories.tsx'),
    ),
  ).toEqual({});
  expect(
    await storyExamples(
      `import {DataTable} from './index';type Row={id:string};const meta={component:DataTable<Row>,args:{rows:[],columns:[]}};export const Playground={};`,
      resolve('src/components/data-table/data-table.stories.tsx'),
    ),
  ).toEqual({});
});

// Type-checks every story example in one TypeScript program; allow for slow CI runners.
it(
  'parses examples from every current story without leaking CSF or interaction tests',
  { timeout: 60_000 },
  async () => {
    async function files(dir: string): Promise<string[]> {
      const entries = await readdir(dir, { withFileTypes: true });

      return (
        await Promise.all(
          entries.map((entry) =>
            entry.isDirectory()
              ? files(resolve(dir, entry.name))
              : [resolve(dir, entry.name)],
          ),
        )
      ).flat();
    }

    let count = 0;
    const virtual = new Map<string, string>();
    for (const file of (await files(resolve('src'))).filter((path) =>
      path.endsWith('.stories.tsx'),
    )) {
      for (const example of Object.values(
        await storyExamples(await readFile(file, 'utf8'), file),
      )) {
        virtual.set(resolve(`__story_example_${count}.tsx`), example);
        const parsed = ts.transpileModule(example, {
          fileName: 'example.tsx',
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
          reportDiagnostics: true,
        });
        expect(parsed.diagnostics ?? [], file).toEqual([]);
        expect(example).not.toContain('export const meta');
        expect(example).not.toContain('storybook/test');
        count++;
      }
    }
    expect(count).toBeGreaterThan(50);
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      esModuleInterop: true,
      baseUrl: process.cwd(),
      paths: { '@itclabs/react-ui': ['./src/index.ts'] },
    };
    const host = ts.createCompilerHost(options);
    const read = host.getSourceFile.bind(host);
    host.getSourceFile = (file, languageVersion, onError, shouldCreateNew) =>
      virtual.has(file)
        ? ts.createSourceFile(
            file,
            virtual.get(file)!,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TSX,
          )
        : read(file, languageVersion, onError, shouldCreateNew);
    const program = ts.createProgram([...virtual.keys()], options, host);
    const errors = ts
      .getPreEmitDiagnostics(program)
      .filter((error) => error.file && virtual.has(error.file.fileName));
    expect(
      errors.map(
        (error) =>
          `${error.file?.fileName}: ${ts.flattenDiagnosticMessageText(error.messageText, ' ')}`,
      ),
    ).toEqual([]);
  },
  30_000,
); // Compiles every generated recipe; shared CI runners exceed the 5s unit-test default.

it.each([
  resolve('../external/src/entry.stories.tsx'),
  resolve('src-external/entry.stories.tsx'),
  resolve('node_modules/example/src/entry.stories.tsx'),
  resolve('src/node_modules/example/entry.stories.tsx'),
])('preserves relative imports outside library source: %s', async (filename) => {
  const result = await storyExamples(
    `import {Example} from './example'; const meta={component:Example}; export const Entry={render:()=> <Example/>};`,
    filename,
  );
  expect(result.Entry).toContain("from './example'");
  expect(result.Entry).not.toContain("from '@itclabs/react-ui'");
});

it.each([
  'src/components/button/button.stories.tsx',
  resolve('src/components/button/button.stories.tsx'),
])('rewrites library-relative imports under repository src: %s', async (filename) => {
  const result = await storyExamples(
    `import {Button} from './index'; export const Entry={render:()=> <Button>Run</Button>};`,
    filename,
  );
  expect(result.Entry).toContain("from '@itclabs/react-ui'");
  expect(result.Entry).not.toContain("from './index'");
});

it('uses the composition render with public component metadata and allows story overrides', async () => {
  const result = await storyExamples(
    `import {Form, Input} from './index';
     function ComposedExample(){ return <Input label="Name"/>; }
     const meta={component:Form,render:()=> <ComposedExample/>};
     export const Playground={};
     export const Override={render:()=> <Input label="Other"/>};`,
    resolve('src/components/form/form.stories.tsx'),
  );
  expect(result.Playground).toContain('function ComposedExample');
  expect(result.Playground).toContain('<ComposedExample');
  expect(result.Playground).not.toContain('<Form');
  expect(result.Override).toContain('label="Other"');
  expect(result.Override).not.toContain('ComposedExample');
});
