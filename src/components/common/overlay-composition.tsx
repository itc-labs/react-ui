'use client';

import {
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Button } from '../button';
import { cn, partTestId, type SlotClasses } from './index';
import { isInteractiveTrigger } from './interactive-trigger';

let warnedWrappedInteractiveTrigger = false;

export type OverlayClassNames = SlotClasses<
  | 'content'
  | 'overlay'
  | 'close'
  | 'trigger'
  | 'header'
  | 'title'
  | 'description'
  | 'body'
  | 'footer'
  | 'action'
>;
export interface OverlayComposition {
  title: NonNullable<ReactNode>;
  description?: ReactNode;
  trigger?: ReactNode;
  triggerAsChild?: boolean;
  triggerLabel?: string;
  triggerDisabled?: boolean;
  footer?: ReactNode;
  actions?: readonly OverlayAction[];
  children?: ReactNode;
  className?: string;
  classNames?: OverlayClassNames;
  'data-testid'?: string;
}

/** Narrow by key presence, including falsy values from untyped callers. */
export function hasCompositionProp<Props extends object, Key extends PropertyKey>(
  props: Props,
  key: Key,
): props is Extract<Props, Record<Key, unknown>> {
  return key in props;
}

/** Return an actual trigger element so Radix Slot can forward handlers and refs. */
export function overlayTrigger(
  trigger: ReactNode,
  className?: string,
  options: {
    asChild?: boolean | undefined;
    label?: string | undefined;
    disabled?: boolean | undefined;
  } = {},
): ReactElement {
  const attributes = {
    ...(options.label === undefined ? {} : { 'aria-label': options.label }),
    ...(options.disabled === undefined ? {} : { disabled: options.disabled }),
  };
  if (options.asChild ?? isInteractiveTrigger(trigger)) {
    if (!isValidElement<{ className?: string }>(trigger) || trigger.type === Fragment)
      throw new Error(
        'triggerAsChild requires one element that forwards native props and ref.',
      );

    return cloneElement(trigger, {
      ...attributes,
      className: cn(trigger.props.className, className),
    });
  }
  if (typeof trigger === 'string' || typeof trigger === 'number')
    return (
      <Button variant="secondary" {...attributes} className={className}>
        {trigger}
      </Button>
    );

  if (
    process.env.NODE_ENV !== 'production' &&
    !warnedWrappedInteractiveTrigger &&
    (isInteractiveTrigger(trigger) ||
      (isValidElement(trigger) &&
        typeof trigger.type === 'string' &&
        ['input', 'select', 'textarea', 'summary'].includes(trigger.type)))
  ) {
    warnedWrappedInteractiveTrigger = true;
    console.warn(
      'Overlay trigger wraps an interactive element in a button. Remove triggerAsChild={false} or use triggerAsChild for a custom control that forwards native props and ref.',
    );
  }

  return (
    <button
      type="button"
      {...attributes}
      className={cn(
        'inline-flex items-center justify-center rounded-control border-0 bg-transparent p-0 align-middle outline-none focus-visible:shadow-control-focus disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {trigger}
    </button>
  );
}

export function OverlayLayout({
  title,
  description,
  footer,
  children,
  classNames,
  testId,
}: {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  classNames?: OverlayClassNames | undefined;
  testId?: string | undefined;
}) {
  const hasBody = children != null && typeof children !== 'boolean';

  return (
    <>
      <div
        data-testid={partTestId(testId, 'header')}
        className={cn(
          'shrink-0 px-5 py-4',
          hasBody && 'border-b border-line',
          classNames?.header,
        )}
      >
        {title}
        {description}
      </div>
      {hasBody && (
        <div
          data-testid={partTestId(testId, 'body')}
          className={cn('min-h-0 flex-1 overflow-y-auto p-5', classNames?.body)}
        >
          {children}
        </div>
      )}
      {footer != null && (
        <div
          data-testid={partTestId(testId, 'footer')}
          className={cn(
            'flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4',
            classNames?.footer,
          )}
        >
          {footer}
        </div>
      )}
    </>
  );
}

export interface OverlayAction {
  id: string;
  label: ReactNode;
  onClick?: React.ComponentProps<typeof Button>['onClick'];
  close?: boolean;
  loading?: boolean;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>['variant'];
  className?: string;
}

export function overlayActions(
  actions: readonly OverlayAction[] | undefined,
  Close: React.ComponentType<{ asChild?: boolean; children: ReactNode }>,
  testId?: string,
  className?: string,
) {
  return actions?.map((action) => {
    const button = (
      <Button
        data-testid={partTestId(testId, 'action', action.id)}
        onClick={action.onClick}
        disabled={action.disabled}
        loading={action.loading ?? false}
        variant={action.variant ?? 'secondary'}
        className={cn(className, action.className)}
      >
        {action.label}
      </Button>
    );

    return action.close ? (
      <Close key={action.id} asChild>
        {button}
      </Close>
    ) : (
      <span key={action.id} className="contents">
        {button}
      </span>
    );
  });
}
