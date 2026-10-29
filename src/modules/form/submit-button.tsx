'use client';
import { useFormContext } from './context';
import { Button, type ButtonProps } from '../../components/button';

export function SubmitButton({ children, disabled, ...props }: ButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {([canSubmit, submitting]) => (
        <Button
          {...props}
          type="submit"
          loading={submitting}
          disabled={disabled || !canSubmit}
        >
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}
