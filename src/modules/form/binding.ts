import { NumberInput } from '../../components/number-input';
import { InputOTP } from '../../components/input-otp';
import { Select } from '../../components/select';
import { DatePicker } from '../../components/date-picker';
import { DateRangePicker } from '../../components/date-range-picker';
import { TimePicker } from '../../components/time-picker';
import { RadioGroup } from '../../components/radio-group';
import { UploadField } from '../../components/upload-field';
export const valueControls = new Set<unknown>([
  NumberInput,
  InputOTP,
  Select,
  DatePicker,
  DateRangePicker,
  TimePicker,
  RadioGroup,
  UploadField,
]);

export function changedValue(value: unknown) {
  if (value && typeof value === 'object' && 'target' in value) {
    const target = value.target as HTMLInputElement;
    if (target.type === 'checkbox') return target.checked;
    if (target.type === 'number')
      return target.value === '' || !Number.isFinite(target.valueAsNumber)
        ? null
        : target.valueAsNumber;

    return target.value;
  }

  return value;
}
