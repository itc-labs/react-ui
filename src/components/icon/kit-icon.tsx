'use client';
import { IconRenderer } from './renderer';
import type { IconProps } from './props';
import type { IconGlyph, IconName, IconVariant } from './types';

export type KitIconBuiltin = Readonly<Record<IconVariant, IconGlyph>>;

export function KitIcon<Name extends string = IconName>({
  builtin,
  ...props
}: IconProps<Name> & { builtin: KitIconBuiltin }) {
  const icons = (glyph: IconGlyph) => (props.name ? { [props.name]: glyph } : {});

  return (
    <IconRenderer
      {...props}
      builtins={{
        outline: { id: 'outline', icons: icons(builtin.outline) },
        bold: { id: 'bold', icons: icons(builtin.bold) },
      }}
    />
  );
}
