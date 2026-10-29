'use client';
import { useControl } from '../context';
import { NumberInput, type NumberInputProps } from '../../../components/number-input';
import {
  InputPassword,
  type InputPasswordProps,
} from '../../../components/input-password';
import { InputOTP, type InputOTPProps } from '../../../components/input-otp';

export function NumberField(
  props: Omit<
    NumberInputProps,
    'value' | 'defaultValue' | 'name' | 'onValueChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl<number | null>();

  return (
    <NumberInput
      {...props}
      name={field.name}
      value={field.state.value}
      onValueChange={field.handleChange}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}

export function PasswordField(
  props: Omit<
    InputPasswordProps,
    'value' | 'defaultValue' | 'name' | 'onChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl();

  return (
    <InputPassword
      {...props}
      name={field.name}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}

export function OTPField(
  props: Omit<
    InputOTPProps,
    'value' | 'defaultValue' | 'name' | 'onValueChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl();

  return (
    <InputOTP
      {...props}
      name={field.name}
      value={field.state.value}
      onValueChange={field.handleChange}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}
