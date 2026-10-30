'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import { IconRenderer } from '../icon/renderer';
import type { IconGlyph } from '../icon/types';
import { InputRenderer, type InputProps } from './renderer';

/** Internal Input variant for compositions that do not need the named icon registry. */
export function KitInput(
  props: Omit<InputProps, 'icon' | 'iconRight'> & {
    icon?: IconGlyph;
    iconRight?: IconGlyph;
  },
) {
  return (
    <InputRenderer
      {...props}
      renderIcon={(iconProps) => <IconRenderer {...iconProps} builtins={{}} />}
    />
  );
}

KitInput[interactiveTrigger] = true;
