import { mergeConfig } from 'vite';
import remarkGfm from 'remark-gfm';
import { readableSourcePlugin } from './readable-source.ts';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/overview/**/*.mdx',
    '../src/components/**/*.stories.tsx',
    '../src/modules/**/*.stories.tsx',
    '../src/overview/**/*.stories.tsx',
    '../src/templates/**/*.stories.tsx',
    '../src/hooks/**/*.stories.tsx',
  ],
  addons: [
    {
      name: '@storybook/addon-docs',
      // GitHub-flavoured Markdown so docs pages can use pipe tables.
      options: {
        mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } },
      },
    },
  ],
  viteFinal: (config) =>
    mergeConfig(config, {
      cacheDir: '.cache/storybook-vite',
      plugins: [readableSourcePlugin()],
    }),
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
};
export default config;
