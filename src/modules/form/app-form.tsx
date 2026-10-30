'use client';
import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from './context';
import { SubmitButton } from './submit-button';
import { TextField, TextAreaField } from './fields/text';
import { SelectField, MultiSelectField } from './fields/select';
import { CheckboxField, SwitchField, RadioGroupField } from './fields/choice';
import { DateField, TimeField, DateRangeField } from './fields/date-time';
import { UploadField } from './fields/media';
import { NumberField, PasswordField, OTPField } from './fields/input';
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    NumberField,
    PasswordField,
    OTPField,
    TextField,
    TextAreaField,
    SelectField,
    MultiSelectField,
    CheckboxField,
    SwitchField,
    RadioGroupField,
    DateField,
    TimeField,
    DateRangeField,
    UploadField,
  },
  formComponents: { SubmitButton },
});
