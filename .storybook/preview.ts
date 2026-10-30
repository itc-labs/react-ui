import { createElement } from 'react';
import { UIProvider } from '../src/theme/provider';
import { defineTheme } from '../src/theme';
import { outlineCatalog, boldCatalog } from '@itclabs/react-ui/icons/catalog';
import type { Preview } from '@storybook/react-vite';
import './preview.css';
import './themes.css';

const catalogTheme = defineTheme({
  icons: { packs: { outline: outlineCatalog, bold: boldCatalog } },
});

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Sample host theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'default', title: 'Default' },
          { value: 'ocean', title: 'Ocean · rebrand' },
          { value: 'compact', title: 'Compact · shape & font' },
        ],
      },
    },
    locale: {
      description: 'Kit locale for built-in labels',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        dynamicTitle: true,
        items: [
          { value: 'en-US', title: 'English' },
          { value: 'vi-VN', title: 'Tiếng Việt' },
        ],
      },
    },
  },
  // Docs are English; the kit's own default locale stays vi-VN for host apps.
  initialGlobals: { theme: 'default', locale: 'en-US' },
  decorators: [
    (Story, { globals }) => {
      // Theme the document root so portalled overlays and derived role tokens follow.
      const theme = typeof globals.theme === 'string' ? globals.theme : 'default';
      if (theme === 'default') delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = theme;

      return createElement(UIProvider, {
        theme: catalogTheme,
        locale: typeof globals.locale === 'string' ? globals.locale : 'en-US',
        children: createElement(Story),
      });
    },
  ],
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    docs: { toc: true, codePanel: true },
    viewport: {
      options: {
        mobile: { name: 'Mobile · 390', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet · 768', styles: { width: '768px', height: '1024px' } },
        laptop: { name: 'Laptop · 1024', styles: { width: '1024px', height: '768px' } },
        desktop: {
          name: 'Desktop · 1440',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
    options: {
      storySort: {
        includeNames: true,
        order: [
          'Overview',
          ['Introduction', 'Getting started'],
          'Guides',
          [
            'Providers & adapters',
            'Theming',
            'Localization',
            'Icons',
            'Forms',
            'Overlays & feedback',
            'Navigation',
            'Event calendar',
            'Customization',
          ],
          'Reference',
          ['Catalog', 'Entry points & bundle size', 'Hooks'],
          'Foundations',
          'Components',
          [
            '*',
            [
              'Docs',
              'Playground',
              'Variants',
              'All Tones',
              'Sizes',
              'Shapes',
              'States',
              'Appearance',
              'Gallery',
              '*',
              'Custom Classes',
              'Composed Custom Classes',
            ],
          ],
          'Modules',
          [
            '*',
            [
              'Docs',
              'Playground',
              'Variants',
              'All Tones',
              'Sizes',
              'Shapes',
              'States',
              'Appearance',
              'Gallery',
              '*',
              'Custom Classes',
              'Composed Custom Classes',
            ],
          ],
          'Templates',
          [
            '*',
            [
              'Docs',
              'Playground',
              'Variants',
              'All Tones',
              'Sizes',
              'Shapes',
              'States',
              'Appearance',
              'Gallery',
              '*',
              'Custom Classes',
              'Composed Custom Classes',
            ],
          ],
          'Hooks',
        ],
      },
    },
  },
};
export default preview;
