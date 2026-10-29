import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: '@itclabs/react-ui',
    colorPrimary: '#365c42',
    colorSecondary: '#365c42',
    appBg: '#f5f5ef',
    appContentBg: '#fcfcf8',
    appBorderColor: '#dde2d7',
    textColor: '#203932',
    textMutedColor: '#5c6c63',
    fontBase: '"Be Vietnam Pro", system-ui, sans-serif',
  }),
});
