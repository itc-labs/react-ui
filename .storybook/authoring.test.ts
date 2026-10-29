import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

it('keeps public copy independent of reference projects and repetitive placeholder descriptions', () => {
  for (const file of files('src').filter((file) =>
    /\.stories\.tsx$|\.mdx$/.test(file),
  )) {
    expect(readFileSync(file, 'utf8'), file).not.toMatch(
      /UI presentation; interactive synthetic examples/i,
    );
  }
});

it('keeps navigation focused while regression stories remain eligible for testing', () => {
  for (const file of files('src').filter(
    (file) => file.endsWith('.stories.tsx') && /\/(components|modules)\//.test(file),
  )) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    let visible = 0;
    for (const statement of source.statements) {
      if (
        !ts.isVariableStatement(statement) ||
        !statement.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        )
      )
        continue;
      const story = statement.declarationList.declarations[0]?.initializer;
      if (!story || !ts.isObjectLiteralExpression(story)) continue;
      const tagsProperty = story.properties.find(
        (property) =>
          ts.isPropertyAssignment(property) && property.name.getText(source) === 'tags',
      );
      expect(tagsProperty, `${file}: explicit story purpose`).toBeDefined();
      const tags = tagsProperty?.getText(source) ?? '';
      if (tags.includes('regression')) {
        expect(tags, file).toContain('!dev');
        expect(tags, file).toContain('!autodocs');
        expect(tags, file).not.toContain('!test');
      }
      if (!tags.includes('!dev')) visible++;
    }
    expect(visible, file).toBeLessThanOrEqual(9);
  }
});
