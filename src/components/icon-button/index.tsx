'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import { Icon } from '../icon';
import { IconButtonRenderer, type IconButtonProps } from './renderer';

export function IconButton(props: IconButtonProps) {
  return (
    <IconButtonRenderer
      {...props}
      renderIcon={(iconProps) => <Icon {...iconProps} />}
    />
  );
}

IconButton[interactiveTrigger] = true;
