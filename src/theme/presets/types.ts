import type { UITheme } from '../index';

export type ThemePresetMode = 'light' | 'dark';
export type ThemePreset = Readonly<Record<ThemePresetMode, UITheme>>;
