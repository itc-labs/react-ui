'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import { KitIcon, type KitIconBuiltin } from '../icon/kit-icon';
import { IconRenderer } from '../icon/renderer';
import type { IconGlyph } from '../icon/types';
import { IconButtonRenderer, type IconButtonProps } from './renderer';

export function KitIconButton({
  builtin,
  ...props
}: IconButtonProps &
  ({ builtin: KitIconBuiltin } | { icon: IconGlyph; builtin?: never })) {
  return (
    <IconButtonRenderer
      {...props}
      renderIcon={(iconProps) =>
        builtin ? (
          <KitIcon {...iconProps} builtin={builtin} />
        ) : (
          <IconRenderer {...iconProps} builtins={{}} />
        )
      }
    />
  );
}

KitIconButton[interactiveTrigger] = true;
