import { relative, resolve, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { format } from 'prettier';
import type { Plugin } from 'vite';

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
    const usage = ts.isIdentifier(expression) ? expression.text : 'StoryExample';
    const body = ts.isIdentifier(expression)
      ? ''
      : `const StoryExample = ${print(expression)};`;
    const entry = args.length
      ? `const exampleProps = { ${args.map((arg) => `...(${print(arg)} as const)`).join(', ')} } as const;\nexport default function ExampleUsage() { return <${usage} {...exampleProps} />; }`
      : `export default ${usage};`;
    result[name] = await format(
      [...imports, ...helpers, body, entry].filter(Boolean).join('\n\n'),
      { parser: 'typescript', singleQuote: true, printWidth: 88, tabWidth: 2 },
    );
  }

  return result;
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

      return { code: `${code}\n${append}`, map: null };
    },
  };
}
