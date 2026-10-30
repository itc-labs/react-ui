'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import type { TestIdProps } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { useContext, type ComponentProps } from 'react';
import { FormStatusContext } from '../common/form-status';
import { cva, type VariantProps } from 'class-variance-authority';
import { Spinner } from '../spinner';
import { type SlotClasses, cn } from '../common';
import { focusRingClassName } from '../common/focus-ring';

const button = cva(
  cn(
    focusRingClassName,
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-semibold transition-colors focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  ),
  {
    variants: {
      variant: {
        primary: 'bg-brand-700 text-on-brand hover:bg-brand-800',
        secondary: 'border border-line bg-surface text-ink hover:bg-hover',
        ghost: 'text-ink hover:bg-hover-strong',
        danger: 'bg-danger-700 text-on-brand hover:bg-danger-800',
      },
      size: {
        sm: 'h-control-sm px-3 text-ui-sm',
        md: 'h-control-md px-4 text-control',
        lg: 'h-control-lg px-5 text-control',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = (ComponentProps<'button'> &
  VariantProps<typeof button> & {
    /** Defaults to the surrounding `Form` submission state for `type="submit"`. */
    loading?: boolean;
    loadingLabel?: string;
    classNames?: SlotClasses<'root' | 'spinner'>;
  }) &
  TestIdProps;

export function Button({
  variant,
  size,
  loading: loadingProp,
  disabled,
  type = 'button',
  className,
  classNames,
  children,
  loadingLabel,
  ...props
}: ButtonProps) {
  const { t } = useUILocale();
  const formStatus = useContext(FormStatusContext);
  const loading = loadingProp ?? (type === 'submit' && Boolean(formStatus?.submitting));

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        button({ variant, size }),
        loading && 'disabled:cursor-wait',
        classNames?.root,
        className,
      )}
    >
      {loading && (
        <Spinner
          className={classNames?.spinner}
          label={loadingLabel ?? t('button.processing')}
          size={size === 'lg' ? 20 : 16}
        />
      )}
      {children}
    </button>
  );
}

Button[interactiveTrigger] = true;
