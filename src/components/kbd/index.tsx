'use client';
import {
  Fragment,
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { useUILocale } from '../../i18n/provider';
import type { UIMessageKey } from '../../i18n/types';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { focusRingClassName } from '../common/focus-ring';

export type KbdClassNames = SlotClasses<'root' | 'key' | 'separator'>;
export type KbdProps = ComponentProps<'kbd'> &
  TestIdProps & {
    size?: 'sm' | 'md';
    /** When supplied, renders a combination of nested key caps instead of children. */
    keys?: string[];
    /** Defaults to no separator for Apple symbols, and + otherwise. */
    separator?: ReactNode;
    /** Resolve modifier tokens after mounting; server markup uses Control. */
    platformAware?: boolean;
    classNames?: KbdClassNames;
  };
const names: Record<string, UIMessageKey> = {
  '⌘': 'kbd.command',
  command: 'kbd.command',
  cmd: 'kbd.command',
  ctrl: 'kbd.control',
  control: 'kbd.control',
  '⌥': 'kbd.alt',
  alt: 'kbd.alt',
  '⇧': 'kbd.shift',
  shift: 'kbd.shift',
  '↵': 'kbd.enter',
  enter: 'kbd.enter',
};
const appleSymbols: Record<string, string> = {
  mod: '⌘',
  alt: '⌥',
  shift: '⇧',
  enter: '↵',
};
const fallbackNames: Record<string, UIMessageKey> = {
  mod: 'kbd.controlShort',
  alt: 'kbd.alt',
  shift: 'kbd.shift',
  enter: 'kbd.enter',
};

/** Displays keyboard input; it does not register a keyboard shortcut. */
export function Kbd({
  size = 'md',
  keys,
  separator,
  platformAware = false,
  children,
  className,
  classNames,
  'data-testid': testId,
  'aria-label': ariaLabel,
  ...props
}: KbdProps) {
  const { t } = useUILocale();
  const [apple, setApple] = useState(false);

  useEffect(() => {
    if (platformAware)
      setApple(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent));
  }, [platformAware]);

  const resolveKey = (key: string) => {
    const token = key.toLowerCase();
    const mapped =
      platformAware && Object.hasOwn(fallbackNames, token)
        ? fallbackNames[token]
        : undefined;
    const text = mapped ? (apple ? appleSymbols[token]! : t(mapped)) : key;
    const nameKey =
      platformAware && token === 'mod'
        ? apple
          ? 'kbd.command'
          : 'kbd.control'
        : Object.hasOwn(names, token)
          ? names[token]
          : undefined;
    const name = nameKey ? t(nameKey) : key;

    return { text, name };
  };

  const combination = keys?.map(resolveKey);
  const single = typeof children === 'string' ? resolveKey(children) : undefined;
  const joiner =
    separator === undefined
      ? combination?.some(({ text }) => /[⌘⌥⇧↵]/.test(text))
        ? null
        : '+'
      : separator;
  const accessibleName =
    ariaLabel ??
    (combination ? combination.map(({ name }) => name).join(' ') : single?.name);
  const capClassName = cn(
    'inline-flex items-center justify-center rounded border border-line bg-surface font-mono font-medium text-ink shadow-[0_1px_0_var(--color-line)]',
    size === 'sm'
      ? 'min-h-5 min-w-5 px-1 text-xs'
      : 'min-h-6 min-w-6 px-1.5 text-ui-sm',
  );

  return (
    <kbd
      // Native kbd has no nameable role; expose named key caps as one static depiction.
      role={accessibleName ? 'img' : undefined}
      {...props}
      data-testid={testId}
      aria-label={accessibleName}
      className={cn(
        combination ? 'inline-flex items-center gap-1 font-mono' : capClassName,
        focusRingClassName,
        classNames?.root,
        className,
      )}
    >
      {combination
        ? combination.map(({ text }, index) => (
            <Fragment key={index}>
              {index > 0 && joiner !== null && joiner !== false && joiner !== '' && (
                <span
                  aria-hidden="true"
                  data-testid={partTestId(testId, 'separator', index)}
                  className={cn('text-ui-sm text-muted', classNames?.separator)}
                >
                  {joiner}
                </span>
              )}
              <kbd
                aria-hidden="true"
                data-testid={partTestId(testId, 'key', index)}
                className={cn(capClassName, classNames?.key)}
              >
                {text}
              </kbd>
            </Fragment>
          ))
        : (single?.text ?? children)}
    </kbd>
  );
}
