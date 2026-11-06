import { lightColors, darkColors } from './base';
import type { ThemePreset } from './types';

export const oceanTheme = {
  light: {
    tokens: {
      ...lightColors,
      'color-brand-50': '#eff6ff',
      'color-brand-100': '#dbeafe',
      'color-brand-500': '#3b82f6',
      'color-brand-700': '#1d4ed8',
      'color-brand-800': '#1e40af',
      'color-focus': '#3b82f6',
      'color-sidebar': '#eff6ff',
    },
  },
  dark: {
    tokens: {
      ...darkColors,
      'color-brand-50': '#162c4b',
      'color-brand-100': '#203e63',
      'color-brand-500': '#60a5fa',
      'color-brand-700': '#93c5fd',
      'color-brand-800': '#bfdbfe',
      'color-focus': '#93c5fd',
    },
  },
} satisfies ThemePreset;
