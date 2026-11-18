import { dirname, relative, resolve, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { format } from 'prettier';
import type { Plugin } from 'vite';
import {
  foldArgs,
  glyphFor,
  publicModule,
  readArgValues,
  templateSource,
  withoutUnused,
  withPublicIcons,
  withRequirements,
} from './template-source.ts';

function unwrap(node: ts.Expression): ts.Expression {
  return ts.isSatisfiesExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isParenthesizedExpression(node)
    ? unwrap(node.expression)
    : node;
}

function property(
  node: ts.Expression | undefined,
  name: string,
): ts.Expression | undefined {
  if (!node) return;
  const object = unwrap(node);
  if (!ts.isObjectLiteralExpression(object)) return;
  const member = object.properties.find(
    (item) => item.name && item.name.getText() === name,
  );

  return member && ts.isPropertyAssignment(member) ? member.initializer : undefined;
}

function identifiers(node: ts.Node): Set<string> {
  const names = new Set<string>();

  const visit = (child: ts.Node) => {
    if (ts.isIdentifier(child)) names.add(child.text);
    ts.forEachChild(child, visit);
  };

  visit(node);

  return names;
}

/** Expand real render dependencies, not a manually maintained copy of demo JSX. */
export async function storyExamples(
  code: string,
  filename: string,
): Promise<Record<string, string>> {
  const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
  const storyPath = resolve(filename);
  const sourcePath = relative(sourceRoot, storyPath);
  const isKitStory =
    sourcePath !== '..' &&
    !sourcePath.startsWith(`..${sep}`) &&
    !isAbsolute(sourcePath) &&
    !storyPath.split(sep).includes('node_modules');
  const file = ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const print = (node: ts.Node) =>
    printer.printNode(ts.EmitHint.Unspecified, node, file);

  const declarations = new Map<string, { node: ts.Node; code: string }>();
  const stories = new Map<string, ts.Expression>();
  let meta: ts.Expression | undefined;
  for (const statement of file.statements) {
    if (ts.isVariableStatement(statement)) {
      const exported = statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      );
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
        const name = declaration.name.text;
        if (name === 'meta') meta = declaration.initializer;
        else if (exported) stories.set(name, declaration.initializer);
        else
          declarations.set(name, {
            node: declaration,
            code: `const ${print(declaration)};`,
          });
      }
    } else if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)) &&
      statement.name &&
      statement.name.text !== 'Story'
    ) {
      declarations.set(statement.name.text, {
        node: statement,
        code: print(statement),
      });
    }
  }
  const result: Record<string, string> = {};
  for (const [name, story] of stories) {
    if (
      property(
        property(property(property(story, 'parameters'), 'docs'), 'source'),
        'code',
      )
    )
      continue;
    const render = property(story, 'render') ?? property(meta, 'render');
    const component = property(meta, 'component');
    if (
      isKitStory &&
      sourcePath.startsWith(`templates${sep}dashboards${sep}`) &&
      render &&
      ts.isArrowFunction(unwrap(render))
    ) {
      const values = readArgValues(property(meta, 'args'), property(story, 'args'));

      result[name] = await format(
        withRequirements(
          withoutUnused(
            withPublicIcons(
              templateSource(
                code,
                filename,
                unwrap(render) as ts.ArrowFunction,
                values!,
              ),
            ),
          ),
        ),
        { parser: 'typescript', singleQuote: true, printWidth: 88, tabWidth: 2 },
      );
      continue;
    }
    // Real component/args stories already have useful dynamic Storybook source.
    if (
      !render &&
      (!component ||
        (ts.isIdentifier(component) && !declarations.has(component.text)) ||
        (ts.isExpressionWithTypeArguments(component) &&
          ts.isIdentifier(component.expression) &&
          !declarations.has(component.expression.text)))
    )
      continue;
    const expression = render ?? component!;
    const callable = ts.isIdentifier(expression)
      ? declarations.get(expression.text)?.node
      : unwrap(expression);
    const functionNode =
      callable && ts.isVariableDeclaration(callable) && callable.initializer
        ? unwrap(callable.initializer)
        : callable;
    const acceptsArgs =
      functionNode &&
      (ts.isFunctionDeclaration(functionNode) ||
        ts.isArrowFunction(functionNode) ||
        ts.isFunctionExpression(functionNode)) &&
      functionNode.parameters.length > 0;
    const args = acceptsArgs
      ? [property(meta, 'args'), property(story, 'args')].filter(
          (node): node is ts.Expression => Boolean(node),
        )
      : [];
    const wanted = identifiers(expression);

    args.forEach((arg) => identifiers(arg).forEach((id) => wanted.add(id)));

    const included = new Set<string>();

    const collect = (id: string) => {
      const declaration = declarations.get(id);
      if (!declaration || included.has(id)) return;
      included.add(id);

      identifiers(declaration.node).forEach((dependency) => {
        wanted.add(dependency);
        collect(dependency);
      });
    };

    [...wanted].forEach(collect);
    const imports: string[] = [];
    const uiImports = new Set<string>();
    for (const statement of file.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        !statement.importClause
      )
        continue;
      const path = statement.moduleSpecifier.text;
      if (path.startsWith('storybook') || path.startsWith('@storybook')) continue;
      const clause = statement.importClause;
      const bindings = clause.namedBindings;
      const parts: string[] = [];
      if (clause.name && wanted.has(clause.name.text)) parts.push(clause.name.text);
      if (bindings && ts.isNamespaceImport(bindings) && wanted.has(bindings.name.text))
        parts.push(`* as ${bindings.name.text}`);
      if (bindings && ts.isNamedImports(bindings)) {
        const selected = bindings.elements
          .filter((item) => wanted.has(item.name.text))
          .map(
            (item) =>
              `${clause.isTypeOnly && !item.isTypeOnly ? 'type ' : ''}${print(item)}`,
          );
        // Single glyphs are not root exports; show their public leaf subpath instead.
        const glyph = /\/icon\/(outline|bold)\/([a-z0-9-]+)$/.exec(path);
        if (glyph && isKitStory && selected.length)
          imports.push(
            `import { ${selected.join(', ')} } from '@itclabs/react-ui/icons/${glyph[1]}/${glyph[2]}';`,
          );
        // Template demo helpers are part of what hosts copy; show them as their own module.
        else if (path.startsWith('.') && path.includes('__demo/') && selected.length)
          imports.push(
            `import { ${selected.join(', ')} } from '@/demo/${path.split('__demo/')[1]}';`,
          );
        else if (path.startsWith('.') && isKitStory)
          selected.forEach((item) => uiImports.add(item));
        else if (selected.length) parts.push(`{ ${selected.join(', ')} }`);
      }
      if (parts.length) imports.push(`import ${parts.join(', ')} from '${path}';`);
    }
    if (uiImports.size)
      imports.push(`import { ${[...uiImports].join(', ')} } from '@itclabs/react-ui';`);
    const helpers = [...declarations]
      .filter(([id]) => included.has(id))
      .map(([, declaration]) => declaration.code);
    const exampleName = declarations.has(`${name}Example`)
      ? `${name}Preview`
      : `${name}Example`;
    const values = args.length ? readArgValues(...args) : undefined;
    const inlineRender =
      values &&
      ts.isArrowFunction(unwrap(expression)) &&
      (unwrap(expression) as ts.ArrowFunction).parameters.length === 1 &&
      ts.isIdentifier((unwrap(expression) as ts.ArrowFunction).parameters[0]!.name)
        ? foldArgs(unwrap(expression) as ts.ArrowFunction, {
            values,
            spread: 'expand',
            isArgsParameter: (parameter) =>
              parameter === (unwrap(expression) as ts.ArrowFunction).parameters[0],
          })
        : undefined;
    const usage = ts.isIdentifier(expression) ? expression.text : 'StoryRender';
    const attributes = values
      ? [...values]
          .map(([key, value]) =>
            value.kind === ts.SyntaxKind.TrueKeyword
              ? key
              : ts.isStringLiteral(value) && !/["\\\n]/.test(value.text)
                ? `${key}="${value.text}"`
                : `${key}={${print(value)}}`,
          )
          .join(' ')
      : '';
    const body = inlineRender
      ? `const ${exampleName} = ${print(inlineRender)};`
      : ts.isIdentifier(expression)
        ? ''
        : args.length
          ? `const StoryRender = ${print(expression)};`
          : `const ${exampleName} = ${print(expression)};`;
    const entry = inlineRender
      ? `export default ${exampleName};`
      : args.length
        ? values
          ? `export default function ${exampleName}() { return <${usage} ${attributes} />; }`
          : `const props = { ${args.map((arg) => `...(${print(arg)} as const)`).join(', ')} } as const;\nexport default function ${exampleName}() { return <${usage} {...props} />; }`
        : ts.isIdentifier(expression)
          ? `export default ${usage};`
          : `export default ${exampleName};`;
    result[name] = await format(
      (isKitStory
        ? (source: string) => withRequirements(withoutUnused(withPublicIcons(source)))
        : String)([...imports, ...helpers, body, entry].filter(Boolean).join('\n\n')),
      { parser: 'typescript', singleQuote: true, printWidth: 88, tabWidth: 2 },
    );
  }

  return result;
}

/** Catalog icons a story's controls can print, so live source can import them. */
function storyGlyphs(code: string) {
  const names = code.matchAll(/\bicon\w*\s*[:=]\s*['"]([a-zA-Z0-9]+)['"]/g);

  return Object.fromEntries(
    [...names].flatMap(([, name]) => {
      const glyph = glyphFor(name!);

      return glyph ? [[name!, glyph]] : [];
    }),
  );
}

/** Dynamic stories keep live Controls output and gain the import a host needs to paste it. */
export function dynamicSourceImports(
  code: string,
  filename: string,
  generated: string[],
) {
  const file = ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let component: string | undefined;
  const stories: string[] = [];

  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;

      if (declaration.name.text === 'meta') {
        const value = property(declaration.initializer, 'component');
        if (value) component = value.getText().replace(/<.*$/, '');
      } else if (
        statement.modifiers?.some(
          (item) => item.kind === ts.SyntaxKind.ExportKeyword,
        ) &&
        !generated.includes(declaration.name.text) &&
        !property(declaration.initializer, 'render') &&
        !property(
          property(property(declaration.initializer, 'parameters'), 'docs'),
          'source',
        )
      )
        stories.push(declaration.name.text);
    }
  }

  if (!component || !/^[A-Z]/.test(component)) return {};

  const imported = file.statements.find(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      statement.importClause?.namedBindings &&
      ts.isNamedImports(statement.importClause.namedBindings) &&
      statement.importClause.namedBindings.elements.some(
        (item) => item.name.text === component,
      ),
  ) as ts.ImportDeclaration | undefined;
  const path = (imported?.moduleSpecifier as ts.StringLiteral | undefined)?.text;
  if (!path?.startsWith('.')) return {};

  const module = publicModule(resolve(dirname(filename), path));

  return Object.fromEntries(
    stories.map((story) => [story, `import { ${component} } from '${module}';`]),
  );
}

export function readableSourcePlugin(): Plugin {
  return {
    name: 'react-ui-readable-story-source',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\.stories\.tsx$/.test(id)) return;
      const examples = await storyExamples(code, id);
      const append = Object.entries(examples)
        .map(
          ([name, example]) =>
            `Object.assign(${name}, { parameters: { ...${name}.parameters, docs: { ...${name}.parameters?.docs, source: { ...${name}.parameters?.docs?.source, code: ${JSON.stringify(example)}, language: 'tsx', type: 'code' } } } });`,
        )
        .join('\n');
      const dynamic = Object.entries(
        dynamicSourceImports(code, id, Object.keys(examples)),
      )
        .map(
          ([name, line]) =>
            `Object.assign(${name}, { parameters: { ...${name}.parameters, docs: { ...${name}.parameters?.docs, source: { ...${name}.parameters?.docs?.source, transform: (source) => __pasteableSource(source, ${JSON.stringify({ line, story: name, glyphs: storyGlyphs(code) })}) } } } });`,
        )
        .join('\n');
      const helper = dynamic
        ? `import { pasteableSource as __pasteableSource } from ${JSON.stringify(fileURLToPath(new URL('./dynamic-source.ts', import.meta.url)))};`
        : '';

      return { code: `${helper}\n${code}\n${append}\n${dynamic}`, map: null };
    },
  };
}
