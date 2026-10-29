import type { ComponentType, SVGProps } from 'react';
import type { outlineIcons } from './outline/pack';

/** Augment this interface to register project-wide semantic icon names. */
export interface UIIconNames {}
export type IconVariant = 'outline' | 'bold';
export type IconName =
  keyof typeof outlineIcons.icons | Extract<keyof UIIconNames, string>;
export type IconGlyph = ComponentType<SVGProps<SVGSVGElement>>;
export interface IconPack<Name extends string = string> {
  readonly id: string;
  readonly icons: Readonly<Record<Name, IconGlyph>>;
}
