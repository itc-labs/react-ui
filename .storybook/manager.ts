import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: '@itclabs/react-ui',
    colorPrimary: '#2563eb',
    colorSecondary: '#2563eb',
    appBg: '#f8fafc',
    appContentBg: '#ffffff',
    appBorderColor: '#e2e8f0',
    textColor: '#0f172a',
    textMutedColor: '#475569',
    fontBase: '"Be Vietnam Pro", system-ui, sans-serif',
  }),
});
