import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const source = resolve(import.meta.dirname, 'src');
// Discover every source entry, including isolated subpaths such as calendar, carousel and code-view.
const entries = readdirSync(source, { recursive: true, withFileTypes: true })
  .filter(
    (entry) =>
      entry.isFile() &&
      /\.tsx?$/.test(entry.name) &&
      !/\.(test|stories)\./.test(entry.name) &&
      !entry.parentPath.includes('/overview') &&
      !entry.parentPath.includes('/__'),
  )
  .map((entry) => resolve(entry.parentPath, entry.name));

export default defineConfig({
  build: {
    target: 'es2022',
    minify: false,
    lib: { entry: entries, formats: ['es'] },
    rolldownOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/'),
      output: {
        preserveModules: true,
        preserveModulesRoot: source,
        entryFileNames: '[name].js',
      },
    },
  },
});
