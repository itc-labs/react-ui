import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

// Prettier preserves blank lines but does not add declaration/return spacing.
// Inspect statements, rather than rewriting braces/comments with a regex.
function callable(statement) {
  return (
    ts.isFunctionDeclaration(statement) ||
    (ts.isExpressionStatement(statement) &&
      ts.isCallExpression(statement.expression) &&
      statement.expression.arguments.some(
        (argument) => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument),
      )) ||
    (ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.some(
        ({ initializer }) =>
          initializer &&
          (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)),
      ))
  );
}

function spacedSource(source, filename) {
  const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const positions = new Set();

  function visit(node) {
    if (ts.isSourceFile(node) || ts.isBlock(node)) {
      for (let index = 1; index < node.statements.length; index++) {
        const previous = node.statements[index - 1];
        const current = node.statements[index];
        if (!callable(previous) && !callable(current) && !ts.isReturnStatement(current))
          continue;
        const lineEnd = source.indexOf('\n', previous.end);
        // Run after Prettier: adjacent statements already occupy separate lines.
        if (lineEnd < 0 || lineEnd >= current.getStart(tree)) continue;
        if (!/^[\t ]*\n/.test(source.slice(lineEnd + 1))) {
          positions.add(lineEnd + 1);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(tree);
  let result = source;
  for (const position of [...positions].sort((a, b) => b - a)) {
    result = result.slice(0, position) + '\n' + result.slice(position);
  }

  return result;
}

const write = process.argv.includes('--write');
const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], {
  encoding: 'utf8',
})
  .split('\0')
  .filter((file) => /\.(?:[cm]?[jt]s|[jt]sx)$/.test(file));
const changed = [];
for (const filename of files) {
  let source;
  try {
    source = await readFile(filename, 'utf8');
  } catch (error) {
    // git ls-files still includes tracked files deleted in the working tree.
    if (error.code === 'ENOENT') continue;
    throw error;
  }
  const formatted = spacedSource(source, filename);
  if (formatted === source) continue;
  changed.push(filename);
  if (write) await writeFile(filename, formatted);
}
if (changed.length) {
  console.log(
    `${write ? 'Spaced' : 'Missing function/return spacing:'} ${changed.length} files`,
  );
  if (!write) {
    console.log(changed.join('\n'));
    process.exitCode = 1;
  }
} else {
  console.log('Function/return spacing is consistent.');
}
