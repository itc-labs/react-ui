import { lightColors, darkColors } from './base';
import type { ThemePreset } from './types';

export const violetTheme = {
  light: {
    tokens: {
      ...lightColors,
      'color-brand-50': '#f5f3ff',
      'color-brand-100': '#ede9fe',
      'color-brand-500': '#8b5cf6',
      'color-brand-700': '#6d28d9',
      'color-brand-800': '#5b21b6',
      'color-focus': '#8b5cf6',
      'color-sidebar': '#f5f3ff',
    },
  },
  dark: {
    tokens: {
      ...darkColors,
      'color-brand-50': '#2b2146',
      'color-brand-100': '#3b2b61',
      'color-brand-500': '#a78bfa',
      'color-brand-700': '#c4b5fd',
      'color-brand-800': '#ddd6fe',
      'color-focus': '#c4b5fd',
    },
  },
} satisfies ThemePreset;
