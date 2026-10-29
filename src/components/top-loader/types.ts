import type { ComponentProps, CSSProperties } from 'react';
import type { SlotClasses, TestIdProps } from '../common';

export interface TopLoaderController {
  start(): void;
  /** Estimated fraction between 0 and 1; 1 completes the loader. */
  set(value: number): void;
  inc(amount?: number): void;
  done(): void;
}
export type TopLoaderClient = TopLoaderController;
export type TopLoaderClassNames = SlotClasses<'root' | 'bar' | 'peg'>;
export type TopLoaderProps = Omit<ComponentProps<'div'>, 'children'> &
  TestIdProps & {
    height?: CSSProperties['height'];
    color?: CSSProperties['color'];
    peg?: boolean;
    classNames?: TopLoaderClassNames;
  };
export type TopLoaderProviderProps = TopLoaderProps & {
  children?: React.ReactNode;
  /** null disables the hook-free binding for local scopes. */
  client?: TopLoaderClient | null;
  currentPath?: string;
  trackLinks?: boolean;
  delay?: number;
  minimumDuration?: number;
  fadeDuration?: number;
  trickle?: boolean;
  trickleInterval?: number;
};
