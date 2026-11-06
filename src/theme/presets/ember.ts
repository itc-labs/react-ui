import { lightColors, darkColors } from './base';
import type { ThemePreset } from './types';

export const emberTheme = {
  light: {
    tokens: {
      ...lightColors,
      'color-brand-50': '#fff7ed',
      'color-brand-100': '#ffedd5',
      'color-brand-500': '#c86a26',
      'color-brand-700': '#9a3412',
      'color-brand-800': '#7c2d12',
      'color-focus': '#c86a26',
      'color-sidebar': '#fff7ed',
    },
  },
  dark: {
    tokens: {
      ...darkColors,
      'color-brand-50': '#3a251c',
      'color-brand-100': '#523224',
      'color-brand-500': '#e6a26e',
      'color-brand-700': '#fdba8c',
      'color-brand-800': '#fed7aa',
      'color-focus': '#fdba8c',
    },
  },
} satisfies ThemePreset;
