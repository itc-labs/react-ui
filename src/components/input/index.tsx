'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import { Icon } from '../icon';
import { InputRenderer, type InputProps } from './renderer';
export type { InputProps } from './renderer';

export function Input(props: InputProps) {
  return (
    <InputRenderer {...props} renderIcon={(iconProps) => <Icon {...iconProps} />} />
  );
}

Input[interactiveTrigger] = true;
