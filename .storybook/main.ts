import { mergeConfig } from 'vite';
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
  addons: ['@storybook/addon-docs'],
  viteFinal: (config) =>
    mergeConfig(config, {
      cacheDir: '.cache/storybook-vite',
      plugins: [readableSourcePlugin()],
    }),
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
};
export default config;
