import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { storyNameFromExport, toId } from 'storybook/internal/csf';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('resolves catalog and guide links against authored story and MDX IDs', () => {
  const ids = new Set<string>();
  const files = readdirSync('src', { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => resolve(entry.parentPath, entry.name));

  for (const file of files.filter((file) => file.endsWith('.stories.tsx'))) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    let title: string | undefined;
    let explicitId: string | undefined;
    const exports: string[] = [];
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        if (declaration.name.text === 'meta' && declaration.initializer) {
          let expression = declaration.initializer;
          while (
            ts.isSatisfiesExpression(expression) ||
            ts.isAsExpression(expression) ||
            ts.isParenthesizedExpression(expression)
          )
            expression = expression.expression;
          if (ts.isObjectLiteralExpression(expression)) {
            for (const property of expression.properties) {
              if (
                !ts.isPropertyAssignment(property) ||
                !ts.isStringLiteral(property.initializer)
              )
                continue;
              if (property.name.getText(source) === 'title')
                title = property.initializer.text;
              if (property.name.getText(source) === 'id')
                explicitId = property.initializer.text;
            }
          }
        }
        if (
          statement.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
          )
        )
          exports.push(declaration.name.text);
      }
    }
    if (!title) continue;
    const componentId = explicitId ?? toId(title);
    ids.add(`${componentId}--docs`);
    for (const name of exports) ids.add(toId(componentId, storyNameFromExport(name)));
  }

  for (const file of files.filter((file) => file.endsWith('.mdx'))) {
    const source = readFileSync(file, 'utf8');
    const title = source.match(/<Meta\s+title="([^"]+)"/);
    if (title) ids.add(`${toId(title[1]!)}--docs`);
  }

  const linkedFiles = files.filter((file) => file.endsWith('.mdx'));
  linkedFiles.push(resolve('README.md'));
  let checked = 0;
  for (const file of linkedFiles) {
    for (const match of readFileSync(file, 'utf8').matchAll(
      /\?path=\/(?:docs|story)\/([\w-]+)/g,
    )) {
      expect(ids.has(match[1]!), `${file}: missing story ID ${match[1]}`).toBe(true);
      checked++;
    }
  }
  expect(checked).toBeGreaterThan(80);
});
