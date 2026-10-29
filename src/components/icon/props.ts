import type { SVGProps } from 'react';
import type { TestIdProps } from '../common/testing';
import type { IconGlyph, IconName, IconPack, IconVariant } from './types';

export type IconProps<Name extends string = IconName> = (Omit<
  SVGProps<SVGSVGElement>,
  'name'
> & {
  size?: number;
  label?: string;
  variant?: IconVariant;
} & (
    | { name: NoInfer<Name>; pack?: string | IconPack<Name>; glyph?: never }
    | { glyph: IconGlyph; name?: never; pack?: never }
  )) &
  TestIdProps;
