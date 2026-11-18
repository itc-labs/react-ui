import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';

const packageExports = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).exports as Record<string, unknown>;

export type ArgValues = Map<string, ts.Expression>;

const kitRoot = new URL('../src/components/icon/', import.meta.url);
const builtinIcons = readFileSync(new URL('kit-icons.ts', kitRoot), 'utf8');

/** Peer packages a pasted example must install, by public entry. */
const optionalPeers: Record<string, string[]> = {
  '@itclabs/react-ui/chart': ['recharts', 'react-is'],
  '@itclabs/react-ui/editor': ['@tiptap/react', '@tiptap/pm', '@tiptap/starter-kit'],
  '@itclabs/react-ui/avatar-upload': ['react-easy-crop'],
  valibot: ['valibot'],
};

/** The outline glyph behind a semantic icon name, when the host must import it. */
export function glyphFor(name: string) {
  const file = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const url = new URL(`outline/${file}.tsx`, kitRoot);
  if (!existsSync(url)) return undefined;
  if (new RegExp(`\\b${name}\\s*[:,]`).test(builtinIcons)) return undefined;

  const component = /export (?:function |\{\s*)(\w+)/.exec(
    readFileSync(url, 'utf8'),
  )?.[1];

  return component
    ? { component, module: `@itclabs/react-ui/icons/outline/${file}` }
    : undefined;
}

/**
 * Storybook registers the whole icon catalog; a host does not. Names outside the kit's
 * built-ins become glyph imports so the pasted code renders without extra theme setup.
 */
export function withPublicIcons(code: string) {
  const file = parse('example.tsx', code);
  const edits: { start: number; end: number; text: string }[] = [];
  const added = new Map<string, string>();

  const use = (node: ts.StringLiteralLike, jsxValue: boolean) => {
    const glyph = glyphFor(node.text);
    if (!glyph) return;

    added.set(glyph.component, glyph.module);
    edits.push({
      start: node.getStart(file),
      end: node.getEnd(),
      text: jsxValue ? `{${glyph.component}}` : glyph.component,
    });
  };

  const strings = (node: ts.Node) => {
    if (ts.isStringLiteralLike(node)) use(node, false);
    else if (ts.isConditionalExpression(node)) {
      strings(node.whenTrue);
      strings(node.whenFalse);
    } else if (ts.isParenthesizedExpression(node)) strings(node.expression);
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name)) {
      const tag = node.parent.parent.tagName.getText(file);
      const target =
        node.name.text === 'icon' || (tag === 'Icon' && node.name.text === 'name');
      const value = node.initializer;

      if (target && value && ts.isStringLiteral(value)) {
        const before = edits.length;

        use(value, true);
        if (edits.length > before && node.name.text === 'name')
          edits.push({
            start: node.name.getStart(file),
            end: node.name.getEnd(),
            text: 'glyph',
          });
      } else if (target && value && ts.isJsxExpression(value) && value.expression)
        strings(value.expression);
    }

    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'icon'
    ) {
      const owner = node.parent.parent;
      const isClassNames =
        ts.isJsxExpression(owner) ||
        (ts.isPropertyAssignment(owner) && owner.name.getText(file) === 'classNames');
      if (!isClassNames || !ts.isJsxExpression(owner)) strings(node.initializer);
    }

    ts.forEachChild(node, visit);
  };

  visit(file);

  let output = code;
  for (const edit of edits.sort((left, right) => right.start - left.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);

  const imports = [...added]
    .filter(
      ([component]) => !new RegExp(`import \\{[^}]*\\b${component}\\b`).test(code),
    )
    .map(([component, module]) => `import { ${component} } from '${module}';`);

  return imports.length ? `${imports.join('\n')}\n${output}` : output;
}

/** Removes imports and top-level helpers the expanded example ended up not using. */
export function withoutUnused(code: string) {
  let output = code;

  for (let pass = 0; pass < 5; pass += 1) {
    const file = parse('example.tsx', output);
    const uses = new Map<string, number>();

    const count = (node: ts.Node) => {
      const parent = node.parent;
      const isPropertyName =
        parent &&
        ((ts.isPropertyAccessExpression(parent) && parent.name === node) ||
          (ts.isPropertyAssignment(parent) && parent.name === node) ||
          (ts.isJsxAttribute(parent) && parent.name === node));

      if (ts.isIdentifier(node) && !isPropertyName)
        uses.set(node.text, (uses.get(node.text) ?? 0) + 1);

      ts.forEachChild(node, count);
    };

    count(file);

    const unused = (name: string) => uses.get(name) === 1;

    const edits: { start: number; end: number; text: string }[] = [];

    for (const statement of file.statements) {
      if (ts.isImportDeclaration(statement)) {
        const named = statement.importClause?.namedBindings;
        if (!named || !ts.isNamedImports(named) || statement.importClause?.name)
          continue;

        const kept = named.elements.filter((item) => !unused(item.name.text));
        if (kept.length === named.elements.length) continue;

        edits.push({
          start: statement.getStart(file),
          end: statement.getEnd(),
          text: kept.length
            ? `import ${statement.importClause?.isTypeOnly ? 'type ' : ''}{ ${kept.map((item) => item.getText(file)).join(', ')} } from ${statement.moduleSpecifier.getText(file)};`
            : '',
        });
      } else if (
        ts.isVariableStatement(statement) &&
        statement.declarationList.declarations.length === 1 &&
        !ts.getModifiers(statement)?.length
      ) {
        const name = statement.declarationList.declarations[0]!.name;
        if (ts.isIdentifier(name) && unused(name.text))
          edits.push({
            start: statement.getStart(file),
            end: statement.getEnd(),
            text: '',
          });
      } else if (
        (ts.isFunctionDeclaration(statement) ||
          ts.isTypeAliasDeclaration(statement) ||
          ts.isInterfaceDeclaration(statement)) &&
        statement.name &&
        !ts.getModifiers(statement)?.length &&
        unused(statement.name.text)
      )
        edits.push({
          start: statement.getStart(file),
          end: statement.getEnd(),
          text: '',
        });
    }

    if (!edits.length) break;

    for (const edit of edits.sort((left, right) => right.start - left.start))
      output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  }

  return output;
}

/** Names the optional packages a pasted example needs before it can run. */
export function withRequirements(code: string) {
  const packages = Object.entries(optionalPeers).flatMap(([module, peers]) =>
    code.includes(`from '${module}'`) ? peers : [],
  );
  if (!packages.length) return code;

  return `// Install first: pnpm add ${[...new Set(packages)].join(' ')}\n${code}`;
}

type FoldOptions = {
  values: ArgValues;
  isArgsParameter: (parameter: ts.ParameterDeclaration) => boolean;
  /** `expand` writes spread args as JSX attributes; `drop` removes them. */
  spread: 'drop' | 'expand';
  /** Story components whose arg props disappear together with their parameters. */
  localComponents?: Set<string>;
};

/** The public entry a host imports for a path inside the kit source. */
export function publicModule(path: string) {
  const glyph = /\/icon\/(outline|bold)\/([a-z0-9-]+)$/.exec(path);
  if (glyph) return `@itclabs/react-ui/icons/${glyph[1]}/${glyph[2]}`;

  const module = /\/modules\/([a-z0-9-]+)/.exec(path)?.[1];

  return module && `./${module}` in packageExports
    ? `@itclabs/react-ui/${module}`
    : '@itclabs/react-ui';
}

function constant(node: ts.Expression): { value: unknown } | undefined {
  if (ts.isParenthesizedExpression(node)) return constant(node.expression);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return { value: true };
  if (node.kind === ts.SyntaxKind.FalseKeyword) return { value: false };
  if (node.kind === ts.SyntaxKind.NullKeyword) return { value: null };
  if (ts.isIdentifier(node) && node.text === 'undefined') return { value: undefined };
  if (ts.isStringLiteralLike(node)) return { value: node.text };
  if (ts.isNumericLiteral(node)) return { value: Number(node.text) };

  return undefined;
}

const isJsx = (node: ts.Node) =>
  ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node);

function jsxAttribute(name: string, value: ts.Expression) {
  const factory = ts.factory;
  const known = constant(value);

  return factory.createJsxAttribute(
    factory.createIdentifier(name),
    known?.value === true
      ? undefined
      : typeof known?.value === 'string' && !/["\\\n]/.test(known.value)
        ? factory.createStringLiteral(known.value)
        : factory.createJsxExpression(undefined, value),
  );
}

/** Replaces story args with their values and removes the branches they turn off. */
export function foldArgs<T extends ts.Node>(root: T, options: FoldOptions): T {
  const { values, isArgsParameter, spread, localComponents } = options;
  const factory = ts.factory;
  const objects: string[] = [];
  const names: string[] = [];

  const result = ts.transform(root, [
    (context) => {
      const visit = (node: ts.Node): ts.VisitResult<ts.Node | undefined> => {
        if (ts.isTypeNode(node)) return node;

        if (ts.isFunctionLike(node) && 'parameters' in node) {
          return visitFunction(node as ts.SignatureDeclaration);
        }

        if (ts.isIdentifier(node) && names.includes(node.text)) {
          return values.get(node.text) ?? factory.createIdentifier('undefined');
        }

        if (ts.isPropertyAccessExpression(node)) {
          if (
            ts.isIdentifier(node.expression) &&
            objects.includes(node.expression.text)
          )
            return values.get(node.name.text) ?? factory.createIdentifier('undefined');

          const expression = ts.visitNode(node.expression, visit) as ts.Expression;

          return ts.isPropertyAccessChain(node)
            ? factory.updatePropertyAccessChain(
                node,
                expression,
                node.questionDotToken,
                node.name,
              )
            : factory.updatePropertyAccessExpression(node, expression, node.name);
        }

        if (ts.isPropertyAssignment(node)) {
          return factory.updatePropertyAssignment(
            node,
            node.name,
            ts.visitNode(node.initializer, visit) as ts.Expression,
          );
        }

        if (ts.isShorthandPropertyAssignment(node) && names.includes(node.name.text)) {
          return factory.createPropertyAssignment(
            node.name.text,
            values.get(node.name.text) ?? factory.createIdentifier('undefined'),
          );
        }

        if (
          ts.isJsxSpreadAttribute(node) &&
          ts.isIdentifier(node.expression) &&
          objects.includes(node.expression.text)
        ) {
          if (spread === 'drop') return undefined;

          const explicit = new Set(
            node.parent.properties.flatMap((item) =>
              ts.isJsxAttribute(item) && ts.isIdentifier(item.name)
                ? [item.name.text]
                : [],
            ),
          );

          return [...values]
            .filter(([name]) => !explicit.has(name))
            .map(([name, value]) => jsxAttribute(name, value));
        }

        if (ts.isJsxAttribute(node)) {
          const tag = node.parent.parent.tagName;
          if (
            ts.isIdentifier(node.name) &&
            values.has(node.name.text) &&
            ts.isIdentifier(tag) &&
            localComponents?.has(tag.text)
          )
            return undefined;

          const initializer = node.initializer;
          if (
            !initializer ||
            !ts.isJsxExpression(initializer) ||
            !initializer.expression
          )
            return node;

          const expression = ts.visitNode(
            initializer.expression,
            visit,
          ) as ts.Expression;
          const known = constant(expression);
          if (known && known.value === undefined) return undefined;

          return jsxAttribute(
            ts.isIdentifier(node.name) ? node.name.text : node.name.getText(),
            ts.isParenthesizedExpression(expression) && isJsx(expression.expression)
              ? expression.expression
              : expression,
          );
        }

        const visited = ts.visitEachChild(node, visit, context);

        return fold(visited);
      };

      const visitFunction = (node: ts.SignatureDeclaration) => {
        const scopedNames: string[] = [];
        const scopedObjects: string[] = [];

        for (const parameter of node.parameters) {
          if (!isArgsParameter(parameter)) continue;
          if (ts.isIdentifier(parameter.name)) scopedObjects.push(parameter.name.text);
          else if (ts.isObjectBindingPattern(parameter.name)) {
            for (const element of parameter.name.elements) {
              if (ts.isIdentifier(element.name) && values.has(element.name.text))
                scopedNames.push(element.name.text);
            }
          }
        }

        names.push(...scopedNames);
        objects.push(...scopedObjects);

        const body = (node as ts.FunctionLikeDeclaration).body;
        const nextBody = body ? (ts.visitNode(body, visit) as ts.ConciseBody) : body;

        names.splice(names.length - scopedNames.length);
        objects.splice(objects.length - scopedObjects.length);

        const parameters = node.parameters.flatMap((parameter) => {
          if (!isArgsParameter(parameter)) return [parameter];
          if (ts.isIdentifier(parameter.name)) return [];
          if (!ts.isObjectBindingPattern(parameter.name)) return [parameter];

          const rest = parameter.name.elements.filter(
            (element) =>
              !ts.isIdentifier(element.name) || !values.has(element.name.text),
          );
          if (!rest.length) return [];

          const type =
            parameter.type && ts.isIntersectionTypeNode(parameter.type)
              ? factory.createIntersectionTypeNode(
                  parameter.type.types.filter((item) => ts.isTypeLiteralNode(item)),
                )
              : parameter.type;

          return [
            factory.updateParameterDeclaration(
              parameter,
              parameter.modifiers,
              parameter.dotDotDotToken,
              factory.createObjectBindingPattern(rest),
              parameter.questionToken,
              type,
              parameter.initializer,
            ),
          ];
        });

        if (ts.isFunctionDeclaration(node)) {
          return factory.updateFunctionDeclaration(
            node,
            node.modifiers,
            node.asteriskToken,
            node.name,
            node.typeParameters,
            parameters,
            node.type,
            nextBody as ts.Block,
          );
        }

        if (ts.isArrowFunction(node)) {
          return factory.updateArrowFunction(
            node,
            node.modifiers,
            node.typeParameters,
            parameters,
            node.type,
            node.equalsGreaterThanToken,
            nextBody as ts.ConciseBody,
          );
        }

        return ts.visitEachChild(node, visit, context);
      };

      const fold = (node: ts.Node): ts.Node | undefined => {
        if (ts.isParenthesizedExpression(node) && constant(node.expression))
          return node.expression;

        if (ts.isPrefixUnaryExpression(node)) {
          const known =
            node.operator === ts.SyntaxKind.ExclamationToken && constant(node.operand);

          return known
            ? known.value
              ? factory.createFalse()
              : factory.createTrue()
            : node;
        }

        if (ts.isBinaryExpression(node)) {
          const left = constant(node.left);
          const right = constant(node.right);
          const operator = node.operatorToken.kind;

          if (left && operator === ts.SyntaxKind.AmpersandAmpersandToken)
            return left.value ? node.right : node.left;
          if (left && operator === ts.SyntaxKind.BarBarToken)
            return left.value ? node.left : node.right;
          if (left && operator === ts.SyntaxKind.QuestionQuestionToken)
            return left.value == null ? node.right : node.left;
          if (left && right && operator === ts.SyntaxKind.EqualsEqualsEqualsToken)
            return left.value === right.value
              ? factory.createTrue()
              : factory.createFalse();
          if (left && right && operator === ts.SyntaxKind.ExclamationEqualsEqualsToken)
            return left.value !== right.value
              ? factory.createTrue()
              : factory.createFalse();

          return node;
        }

        if (ts.isConditionalExpression(node)) {
          const known = constant(node.condition);

          return known ? (known.value ? node.whenTrue : node.whenFalse) : node;
        }

        if (ts.isTemplateExpression(node)) {
          let text = node.head.text;
          for (const span of node.templateSpans) {
            const known = constant(span.expression);
            if (!known || typeof known.value !== 'string') return node;
            text += known.value + span.literal.text;
          }

          return factory.createStringLiteral(text.replace(/\s+/g, ' ').trim());
        }

        if (ts.isJsxExpression(node) && node.expression) {
          const inner = ts.isParenthesizedExpression(node.expression)
            ? node.expression.expression
            : node.expression;
          const known = constant(inner);
          if (known && (known.value == null || typeof known.value === 'boolean'))
            return undefined;
          if (isJsx(inner)) return inner;
        }

        return node;
      };

      return (entry) => ts.visitNode(entry, visit) as T;
    },
  ]);

  return result.transformed[0] as T;
}

/** Top-level names a node really uses; property and attribute names do not count. */
function references(root: ts.Node) {
  const found = new Set<string>();

  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node)) {
      const parent = node.parent;
      const isName =
        parent &&
        ((ts.isPropertyAccessExpression(parent) && parent.name === node) ||
          (ts.isPropertyAssignment(parent) && parent.name === node) ||
          (ts.isJsxAttribute(parent) && parent.name === node) ||
          (ts.isPropertySignature(parent) && parent.name === node) ||
          (ts.isBindingElement(parent) && parent.propertyName === node));
      if (!isName) found.add(node.text);
    }

    ts.forEachChild(node, visit);
  };

  visit(root);

  return found;
}

type Binding = { module: string; imported: string; typeOnly: boolean };
type Declaration = { name: string; node: ts.Node; text: string; file: string };
type DemoModule = {
  file: string;
  bindings: Map<string, Binding>;
  declarations: Map<string, Declaration>;
  reExports: Map<string, string>;
};

function parse(file: string, code: string) {
  return ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function declaredNames(statement: ts.Statement) {
  if (ts.isVariableStatement(statement))
    return statement.declarationList.declarations.flatMap((item) =>
      ts.isIdentifier(item.name) ? [item.name.text] : [],
    );

  return (ts.isFunctionDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement)) &&
    statement.name
    ? [statement.name.text]
    : [];
}

function readBindings(file: ts.SourceFile) {
  const bindings = new Map<string, Binding>();

  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;

    const module = (statement.moduleSpecifier as ts.StringLiteral).text;
    const clause = statement.importClause;
    if (clause.name)
      bindings.set(clause.name.text, {
        module,
        imported: 'default',
        typeOnly: clause.isTypeOnly,
      });
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const item of clause.namedBindings.elements) {
        bindings.set(item.name.text, {
          module,
          imported: item.propertyName?.text ?? item.name.text,
          typeOnly: clause.isTypeOnly || item.isTypeOnly,
        });
      }
    }
  }

  return bindings;
}

function loadDemoModule(file: string, cache: Map<string, DemoModule>) {
  const cached = cache.get(file);
  if (cached) return cached;

  const path = [file, `${file}.ts`, `${file}.tsx`].find((item) => {
    try {
      return readFileSync(item) && true;
    } catch {
      return false;
    }
  })!;
  const source = parse(path, readFileSync(path, 'utf8'));
  const declarations = new Map<string, Declaration>();
  const reExports = new Map<string, string>();

  for (const statement of source.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const item of statement.exportClause.elements) {
        reExports.set(
          item.name.text,
          resolve(dirname(path), (statement.moduleSpecifier as ts.StringLiteral).text),
        );
      }
    }

    for (const name of declaredNames(statement)) {
      declarations.set(name, {
        name,
        node: statement,
        file: path,
        text: statement
          .getFullText(source)
          .trim()
          .replace(/^((?:\/\*[\s\S]*?\*\/\s*)?)export\s+/, '$1'),
      });
    }
  }

  const module = {
    file: path,
    bindings: readBindings(source),
    declarations,
    reExports,
  };

  cache.set(file, module);

  return module;
}

function pascalCase(file: string) {
  return file
    .replace(/\.stories\.tsx$/, '')
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join('');
}

/** The body of the story render without the demo host around it. */
function withoutDemoHost(body: ts.Expression): ts.Expression {
  const node = ts.isParenthesizedExpression(body) ? body.expression : body;
  const tagName = ts.isJsxElement(node) ? node.openingElement.tagName : undefined;
  if (
    !ts.isJsxElement(node) ||
    !tagName ||
    !ts.isIdentifier(tagName) ||
    tagName.text !== 'DemoApp'
  )
    return node;

  const theme = node.openingElement.attributes.properties.find(
    (item) =>
      ts.isJsxAttribute(item) &&
      ts.isIdentifier(item.name) &&
      item.name.text === 'theme',
  );
  const children = node.children.filter(
    (child) => !ts.isJsxText(child) || child.text.trim(),
  );
  if (!theme && children.length === 1 && isJsx(children[0]!))
    return children[0] as unknown as ts.Expression;

  const tag = ts.factory.createIdentifier('UIProvider');

  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(
      tag,
      undefined,
      ts.factory.createJsxAttributes(theme ? [theme] : []),
    ),
    node.children,
    ts.factory.createJsxClosingElement(tag),
  );
}

const unwrap = (node: ts.Expression): ts.Expression =>
  ts.isSatisfiesExpression(node) ||
  ts.isAsExpression(node) ||
  ts.isParenthesizedExpression(node)
    ? unwrap(node.expression)
    : node;

export function readArgValues(...sources: (ts.Expression | undefined)[]) {
  const values: ArgValues = new Map();

  for (const source of sources) {
    const object = source && unwrap(source);
    if (!object || !ts.isObjectLiteralExpression(object)) continue;

    for (const item of object.properties) {
      if (!ts.isPropertyAssignment(item)) return undefined;
      values.set(item.name.getText().replace(/['"]/g, ''), item.initializer);
    }
  }

  return values;
}

/**
 * One file a host can paste and run: story args become fixed values, the demo host is
 * removed, and every sample block the page needs is written out with public imports.
 */
export function templateSource(
  code: string,
  filename: string,
  render: ts.ArrowFunction,
  values: ArgValues,
) {
  const story = parse(filename, code);
  const argsType = render.parameters[0]?.type?.getText();
  const bindings = readBindings(story);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const cache = new Map<string, DemoModule>();
  const emitted = new Map<string, Declaration>();
  const imports = new Map<string, { values: Set<string>; types: Set<string> }>();

  const localComponents = new Set(
    story.statements.flatMap((statement) =>
      ts.isFunctionDeclaration(statement) && statement.name
        ? [statement.name.text]
        : [],
    ),
  );

  const fold = <T extends ts.Node>(node: T) =>
    foldArgs(node, {
      values,
      spread: 'drop',
      localComponents,
      isArgsParameter: (parameter) =>
        Boolean(argsType && parameter.type?.getText().includes(argsType)),
    });

  const locals = new Map<string, Declaration>();

  for (const statement of story.statements) {
    const exported = ts.canHaveModifiers(statement)
      ? ts
          .getModifiers(statement)
          ?.some((item) => item.kind === ts.SyntaxKind.ExportKeyword)
      : false;
    if (exported) continue;

    for (const name of declaredNames(statement)) {
      if (name === 'meta' || name === 'Story' || name === argsType) continue;

      const folded = fold(statement);

      locals.set(name, {
        name,
        node: statement,
        file: filename,
        text: printer.printNode(ts.EmitHint.Unspecified, folded, story),
      });
    }
  }

  const addImport = (binding: Binding, local: string) => {
    const module = binding.module.startsWith('.')
      ? publicModule(binding.module)
      : binding.module;
    const entry = imports.get(module) ?? { values: new Set(), types: new Set() };
    const name = binding.imported === local ? local : `${binding.imported} as ${local}`;

    (binding.typeOnly ? entry.types : entry.values).add(name);
    imports.set(module, entry);
  };

  const include = (declaration: Declaration, scope: Map<string, Binding>) => {
    if (emitted.has(declaration.name)) {
      if (emitted.get(declaration.name)!.file !== declaration.file)
        throw new Error(
          `${filename}: "${declaration.name}" is declared in two sample modules.`,
        );

      return;
    }

    emitted.set(declaration.name, declaration);
    visitNames(
      references(parse(declaration.file, declaration.text)),
      declaration,
      scope,
    );
    emitted.delete(declaration.name);
    emitted.set(declaration.name, declaration);
  };

  const visitNames = (
    names: Set<string>,
    owner: Declaration | undefined,
    scope: Map<string, Binding>,
  ) => {
    for (const name of names) {
      if (owner?.name === name) continue;

      const demo =
        owner && owner.file !== filename
          ? cache.get(owner.file.replace(/\.tsx?$/, ''))
          : undefined;
      const local =
        owner?.file === filename || !owner
          ? locals.get(name)
          : demo?.declarations.get(name);
      if (local) {
        include(local, scope);
        continue;
      }

      const binding = scope.get(name);
      if (!binding || binding.module.startsWith('react-router')) continue;
      if (
        binding.module.includes('__demo') ||
        (owner && owner.file !== filename && binding.module.startsWith('./'))
      ) {
        if (binding.module.endsWith('demo-app')) continue;

        const base = owner?.file ?? filename;
        includeDemo(resolve(dirname(base), binding.module), binding.imported);
        continue;
      }

      addImport(binding, name);
    }
  };

  const includeDemo = (file: string, name: string) => {
    const module = loadDemoModule(file, cache);
    const target = module.reExports.get(name);
    if (target) return includeDemo(target, name);

    cache.set(module.file.replace(/\.tsx?$/, ''), module);

    const declaration = module.declarations.get(name);
    if (declaration) include(declaration, module.bindings);
  };

  const body = withoutDemoHost(fold(render).body as ts.Expression);
  const bodyText = printer.printNode(ts.EmitHint.Unspecified, body, story);

  visitNames(
    references(parse(filename, `const page = ${bodyText};`)),
    undefined,
    bindings,
  );

  const name = `${pascalCase(filename.split('/').pop()!)}Template`;
  const sample = [...emitted.values()].filter((item) => item.file !== filename);
  const page = [...emitted.values()].filter((item) => item.file === filename);

  let output = [
    sample.length
      ? `// Sample data and blocks. Replace them with your API and components.\n${sample
          .map((item) => item.text)
          .join('\n\n')}`
      : '',
    `// Page\n${page.map((item) => item.text).join('\n\n')}`,
    `export default function ${name}() {\n  return (${bodyText});\n}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  output = output
    .replace(/\bDemoNotifications\b/g, 'NotificationBell')
    .replace(/\bDemoOrderStatus\b/g, 'OrderStatus')
    .replace(/\bDemoOrder\b/g, 'Order')
    .replace(/\bcreateDemo/g, 'createSample')
    .replace(/\bdemo(?=[A-Z])/g, 'sample');

  if (/<UIProvider\b/.test(output)) {
    const kit = imports.get('@itclabs/react-ui') ?? {
      values: new Set<string>(),
      types: new Set<string>(),
    };

    kit.values.add('UIProvider');
    imports.set('@itclabs/react-ui', kit);
  }

  const lines = [...imports]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([module, entry]) => {
      const items = [
        ...[...entry.values],
        ...[...entry.types].map((item) => `type ${item}`),
      ];

      return `import { ${items.join(', ')} } from '${module}';`;
    });

  return `${lines.join('\n')}\n\n${output}`;
}
