import { AvatarField } from '@itclabs/react-ui/avatar-upload';
import { EditorField } from '@itclabs/react-ui/editor';
import { DatePicker } from '../../components/date-picker';
import { Input } from '../../components/input';
import { InputPassword } from '../../components/input-password';
import { NumberInput } from '../../components/number-input';
import { InputOTP } from '../../components/input-otp';
import { Select } from '../../components/select';
import { Checkbox } from '../../components/checkbox';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import * as v from 'valibot';
import { Form, FormField, FormSubmit, useAppForm } from './index';
import { Button } from '../../components/button';
import { validateFiles } from '../../components/upload-field/validation';
import type { DateRangeValue } from '../../components/date-range-picker';
import {
  parseCalendarDate,
  dateSpan,
  timeSlots,
} from '../../components/calendar/model';

function Demo() {
  const [saved, setSaved] = useState(false);
  const form = useAppForm({
    defaultValues: { item: '', note: '' },
    validators: {
      onChange: v.object({
        item: v.pipe(v.string(), v.trim(), v.minLength(1, 'Enter an item.')),
        note: v.pipe(v.string(), v.maxLength(40, 'Use at most 40 characters.')),
      }),
    },
    onSubmit: async () => {
      setSaved(true);
    },
  });

  return (
    <Form form={form} className="grid max-w-lg gap-4">
      <form.AppField name="item">
        {(field) => <field.TextField label="Item" required />}
      </form.AppField>
      <form.AppField name="note">
        {(field) => <field.TextAreaField label="Notes" />}
      </form.AppField>
      <form.SubmitButton>Save form</form.SubmitButton>
      {saved && <p role="status">Demo saved.</p>}
    </Form>
  );
}

const meta = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Connect controls to TanStack Form values and validation. Compose controls with FormField or use bound fields from useAppForm. Submission supports asynchronous actions and focuses the first invalid field.',
      },
    },
  },
  title: 'Modules/Form',
  component: Form,
  render: () => <Demo />,
} satisfies Meta;
export default meta;
type Story = StoryObj;

const requiredText = (message: string) =>
  v.pipe(v.string(), v.trim(), v.minLength(1, message));

const allFieldsSchema = v.object({
  password: v.pipe(
    v.string(),
    v.minLength(8, 'Enter a password with at least 8 characters.'),
  ),
  quantity: v.pipe(
    v.number('Enter a quantity.'),
    v.minValue(1, 'Quantity must be at least 1.'),
  ),
  otp: v.pipe(v.string(), v.regex(/^\d{6}$/, 'Enter all 6 digits.')),
  avatar: v.custom<File | null>(
    (value) =>
      typeof File !== 'undefined' &&
      value instanceof File &&
      !validateFiles([value], {
        accept: 'image/png,image/jpeg,image/webp',
        maxBytes: 2 * 1024 * 1024,
      }),
    'Choose a valid avatar image.',
  ),
  files: v.custom<File[]>(
    (value) =>
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((file) => typeof File !== 'undefined' && file instanceof File) &&
      !validateFiles(value, { accept: '.txt,.pdf,.png,.jpg,.jpeg,.webp', maxFiles: 3 }),
    'Choose valid attachments.',
  ),
  content: requiredText('Enter editor content.'),
  title: requiredText('Enter a title.'),
  note: requiredText('Enter a description.'),
  category: requiredText('Select a category.'),
  item: requiredText('Select an item.'),
  tags: v.pipe(v.array(v.string()), v.minLength(1, 'Select at least one tag.')),
  consent: v.literal(true, 'Consent is required.'),
  compact: v.literal(true, 'Enable demo mode.'),
  status: requiredText('Select a decision.'),
  date: v.pipe(
    v.string(),
    v.check((value) => parseCalendarDate(value) != null, 'Choose a valid date.'),
  ),
  time: v.pipe(
    v.string(),
    v.check(
      (value) => timeSlots('09:00', '17:00', 15).includes(value),
      'Choose a valid time.',
    ),
  ),
  range: v.pipe(
    v.nullable(v.object({ from: v.string(), to: v.string() })),
    v.check(
      (value) =>
        Boolean(
          value &&
          parseCalendarDate(value.from) &&
          parseCalendarDate(value.to) &&
          dateSpan(value.from, value.to) >= 1,
        ),
      'Choose a valid date range.',
    ),
  ),
});

function ControlsDemo() {
  const [saved, setSaved] = useState('');
  const form = useAppForm({
    defaultValues: {
      title: '',
      password: '',
      quantity: null as number | null,
      otp: '',
      note: '',
      category: '',
      item: '',
      tags: [] as string[],
      consent: false,
      compact: false,
      status: '',
      date: '',
      time: '',
      range: null as DateRangeValue,
      avatar: null as File | null,
      files: [] as File[],
      content: '',
    },
    validators: { onChange: allFieldsSchema },
    onSubmit: async ({ value }) => {
      setSaved(
        JSON.stringify(
          v.parse(allFieldsSchema, value),
          (_key, item) =>
            _key === 'password' || _key === 'otp'
              ? '[redacted]'
              : item instanceof File
                ? { name: item.name, size: item.size, type: item.type }
                : item,
          2,
        ),
      );
    },
  });

  return (
    <Form form={form} className="grid max-w-3xl gap-6" aria-label="All required fields">
      <p className="text-ui-sm text-muted">
        All fields marked * are required. The checkbox and switch must be enabled in
        this example; the form does not call an API.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <form.AppField name="avatar">
            {() => <AvatarField label="Avatar" alt="Lorem Ipsum" size="lg" required />}
          </form.AppField>
        </div>
        <form.AppField name="title">
          {(field) => <field.TextField label="Title" required />}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.PasswordField
              label="Password"
              icon="lock"
              required
              autoComplete="new-password"
            />
          )}
        </form.AppField>
        <form.AppField name="quantity">
          {(field) => <field.NumberField label="Quantity" required min={1} max={100} />}
        </form.AppField>
        <div className="md:col-span-2">
          <form.AppField name="otp">
            {(field) => <field.OTPField label="Verification code" required />}
          </form.AppField>
        </div>
        <form.AppField name="category">
          {(field) => (
            <field.SelectField
              label="Category"
              required
              clearable
              options={[
                { value: 'pets', label: 'Lorem ipsum' },
                { value: 'gifts', label: 'Dolor sit amet' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="item">
          {(field) => (
            <field.SelectField
              label="Item (searchable)"
              required
              searchable
              clearable
              options={[
                { value: 'cat', label: 'Consectetur adipiscing' },
                { value: 'dog', label: 'Sed do eiusmod' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="tags">
          {(field) => (
            <field.MultiSelectField
              label="Tags"
              required
              searchable
              clearable
              options={[
                { value: 'cats', label: 'Tempor incididunt' },
                { value: 'dogs', label: 'Ut labore' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="date">
          {(field) => <field.DateField label="Send date" required today="2026-10-28" />}
        </form.AppField>
        <form.AppField name="time">
          {(field) => (
            <field.TimeField
              label="Send time"
              required
              minTime="09:00"
              maxTime="17:00"
              minuteStep={15}
            />
          )}
        </form.AppField>
        <div className="md:col-span-2">
          <form.AppField name="range">
            {(field) => (
              <field.DateRangeField
                label="Tracking range"
                required
                today="2026-10-28"
              />
            )}
          </form.AppField>
        </div>
        <div className="md:col-span-2">
          <form.AppField name="note">
            {(field) => <field.TextAreaField label="Description" required />}
          </form.AppField>
        </div>
        <div className="md:col-span-2">
          <form.AppField name="files">
            {(field) => (
              <field.UploadField
                label="Attachments"
                multiple
                maxFiles={3}
                accept=".txt,.pdf,.png,.jpg,.jpeg,.webp"
                required
                hint="Images, TXT or PDF; up to 3 files, 10 MB each."
              />
            )}
          </form.AppField>
        </div>
        <div className="md:col-span-2">
          <form.AppField name="content">
            {() => <EditorField label="Editor content" required />}
          </form.AppField>
        </div>
        <form.AppField name="status">
          {(field) => (
            <field.RadioGroupField
              label="Decision"
              required
              options={[
                { value: 'explore', label: 'Research further' },
                { value: 'test', label: 'Worth trying' },
              ]}
            />
          )}
        </form.AppField>
        <div className="grid content-start gap-5">
          <form.AppField name="consent">
            {(field) => <field.CheckboxField label="Demo consent" required />}
          </form.AppField>
          <form.AppField name="compact">
            {(field) => <field.SwitchField label="Enable demo mode" required />}
          </form.AppField>
        </div>
      </div>
      <div className="flex gap-3">
        <form.SubmitButton>Save all fields</form.SubmitButton>
        <Button
          variant="secondary"
          onClick={() => {
            form.reset();
            setSaved('');
          }}
        >
          Reset
        </Button>
      </div>
      {saved && (
        <div role="status">
          <p>Saved all 17 demo fields.</p>
          <pre className="overflow-auto rounded-control bg-surface p-3 text-ui-sm">
            {saved}
          </pre>
        </div>
      )}
    </Form>
  );
}

const dateTimeSchema = v.object({
  date: v.pipe(
    v.string(),
    v.check((value) => parseCalendarDate(value) != null, 'Choose a valid date.'),
  ),
  time: v.pipe(
    v.string(),
    v.check(
      (value) => timeSlots('09:00', '17:00', 15).includes(value),
      'Choose a time from 09:00–17:00 in 15-minute intervals.',
    ),
  ),
  range: v.pipe(
    v.nullable(v.object({ from: v.string(), to: v.string() })),
    v.check((value) => Boolean(value), 'Choose a date range.'),
    v.check(
      (value) => !value || dateSpan(value.from, value.to) >= 1,
      'Invalid date range.',
    ),
  ),
});

function DateTimeFormExample() {
  const [saved, setSaved] = useState('');
  const form = useAppForm({
    defaultValues: { date: '', time: '', range: null as DateRangeValue },
    validators: { onChange: dateTimeSchema },
    onSubmit: async ({ value }) => {
      const parsed = v.parse(dateTimeSchema, value);
      setSaved(
        `${parsed.date} · ${parsed.time} · ${parsed.range!.from} — ${parsed.range!.to}`,
      );
    },
  });

  return (
    <Form form={form} className="grid max-w-md gap-5" aria-label="Date and time form">
      <form.AppField name="date">
        {(field) => <field.DateField label="Send date" required today="2026-10-27" />}
      </form.AppField>
      <form.AppField name="time">
        {(field) => (
          <field.TimeField
            label="Send time"
            required
            minTime="09:00"
            maxTime="17:00"
            minuteStep={15}
          />
        )}
      </form.AppField>
      <form.AppField name="range">
        {(field) => (
          <field.DateRangeField label="Tracking range" required today="2026-10-27" />
        )}
      </form.AppField>
      <form.SubmitButton>Save date and time</form.SubmitButton>
      {saved && <p role="status">Saved: {saved}</p>}
    </Form>
  );
}

function CustomFormExample() {
  const form = useAppForm({
    defaultValues: { title: '', category: '' },
    onSubmit: async () => {},
  });

  return (
    <Form
      form={form}
      className="grid max-w-lg gap-6 rounded-panel border border-line bg-surface p-6"
    >
      <form.AppField name="title">
        {(field) => (
          <field.TextField
            label="Title"
            required
            className="rounded-full"
            classNames={{ label: 'font-bold text-brand-700', hint: 'italic' }}
            hint="Enter a title for this item."
          />
        )}
      </form.AppField>
      <form.AppField name="category">
        {(field) => (
          <field.SelectField
            label="Category"
            options={[{ value: 'a', label: 'Lorem ipsum' }]}
            classNames={{ control: 'rounded-full bg-brand-50', option: 'rounded-full' }}
          />
        )}
      </form.AppField>
      <form.SubmitButton className="rounded-full">Save content</form.SubmitButton>
    </Form>
  );
}

function ComposedFormDemo() {
  const [saved, setSaved] = useState(false);
  const form = useAppForm({
    defaultValues: {
      name: '',
      password: '',
      quantity: null as number | null,
      otp: '',
      status: '',
      agree: false,
    },
    onSubmit: async () => {
      setSaved(true);
    },
  });
  const schema = {
    name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Enter your full name.')),
    password: v.pipe(
      v.string(),
      v.minLength(8, 'Enter a password with at least 8 characters.'),
    ),
    quantity: v.pipe(
      v.number('Enter a quantity.'),
      v.minValue(1, 'Quantity must be at least 1.'),
    ),
    otp: v.pipe(v.string(), v.regex(/^\d{6}$/, 'Enter all 6 digits.')),
    status: v.pipe(v.string(), v.minLength(1, 'Select a status.')),
    agree: v.pipe(
      v.boolean(),
      v.check((value) => value, 'Confirmation is required.'),
    ),
  };

  return (
    <Form
      form={form}
      schema={schema}
      className="grid max-w-2xl gap-5"
      aria-label="Form composition"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="name" label="Full name" required>
          <Input icon="user" placeholder="Lorem ipsum" />
        </FormField>
        <FormField name="password" label="Password" required>
          <InputPassword icon="lock" autoComplete="new-password" />
        </FormField>
        <FormField name="quantity" label="Quantity" required>
          <NumberInput min={1} max={100} />
        </FormField>
        <FormField name="status" label="Status" required>
          <Select
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
            ]}
          />
        </FormField>
      </div>
      <FormField name="otp" label="Verification code" required>
        <InputOTP />
      </FormField>
      <FormField name="agree" required>
        <Checkbox label="Confirm information" />
      </FormField>
      <FormSubmit form={form}>
        {(submitting) => (
          <Button type="submit" loading={submitting}>
            Save information
          </Button>
        )}
      </FormSubmit>
      {saved && <p role="status">Demo saved.</p>}
    </Form>
  );
}

function ComposedCustomDemo() {
  const form = useAppForm({ defaultValues: { name: '' }, onSubmit: async () => {} });

  return (
    <Form form={form}>
      <FormField
        name="name"
        label="Title"
        required
        className="max-w-md"
        classNames={{ root: 'rounded-panel bg-brand-50 p-4' }}
      >
        <Input
          icon="user"
          className="rounded-full"
          classNames={{ icon: 'text-brand-700' }}
        />
      </FormField>
    </Form>
  );
}

function FieldAlignmentDemo() {
  const [errors, setErrors] = useState(true);

  return (
    <div className="grid max-w-3xl gap-6">
      <Button variant="secondary" onClick={() => setErrors((current) => !current)}>
        Toggle errors to check alignment
      </Button>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="grid gap-5 sm:grid-cols-2">
          <Select
            label={`Tags · ${size}`}
            size={size}
            multiple
            required
            options={[{ value: 'one', label: 'Lorem ipsum' }]}
            {...(errors ? { error: 'Select at least one tag.' } : {})}
          />
          <DatePicker
            label={`Send date · ${size}`}
            size={size}
            required
            defaultValue="2026-10-17"
          />
          <NumberInput
            label={`Quantity · ${size}`}
            size={size}
            defaultValue={3233232}
            iconRight="info"
          />
          <Input
            label={`Title · ${size}`}
            size={size}
            icon="search"
            {...(errors
              ? {
                  hint: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin commodo.',
                }
              : {})}
          />
        </div>
      ))}
    </div>
  );
}

export const ComposedFields: Story = {
  tags: ['usage'],
  name: 'Playground',
  render: () => <ComposedFormDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Use FormField to connect controls to form values, validation, and touched state. All fields in this example are required; click Save to check errors and submit the values.',
      },
    },
  },
};

export const ValidatedSubmit: Story = {
  tags: ['example'],
  name: 'Validation',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save form' }));
    await expect(canvas.getByText('Enter an item.')).toBeVisible();
    await userEvent.type(canvas.getByRole('textbox', { name: /Item/ }), 'Lorem ipsum');
    await userEvent.click(canvas.getByRole('button', { name: 'Save form' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Demo saved.');
  },
};

export const AllBoundControls: Story = {
  tags: ['example'],
  name: 'Bound fields',
  render: () => <ControlsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          '17 fields, initially empty and required: Text, Password, Number, OTP, Textarea, Select, searchable Select, MultiSelect, Date, Time, DateRange, Radio, Checkbox, Switch, Avatar, Upload, and Editor. Valibot enforces required values. Switch and Checkbox must be true in this example.',
      },
    },
  },
};

export const DateAndTimeFields: Story = {
  tags: ['example'],
  name: 'Date and time',
  render: () => <DateTimeFormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Save date and time' }));
    await expect(canvas.getByText('Choose a valid date.')).toBeVisible();
    const date = canvas.getByRole('button', { name: /Send date/ });
    await waitFor(() => expect(date).toHaveFocus());
    await userEvent.click(date);
    await userEvent.click(
      body.getAllByRole('button').find((b) => b.textContent === '17')!,
    );
    await userEvent.type(canvas.getByRole('combobox', { name: /Send time/ }), '09:30');
    await userEvent.click(await body.findByRole('option', { name: '09:30' }));
    await userEvent.click(canvas.getByRole('button', { name: /Tracking range/ }));
    await userEvent.click(
      body.getAllByRole('button').find((b) => b.textContent === '20')!,
    );
    await userEvent.click(
      body.getAllByRole('button').find((b) => b.textContent === '22')!,
    );
    await userEvent.click(body.getByRole('button', { name: 'Apply' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Save date and time' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Saved: 2026-10-17 · 09:30 · 2026-10-20 — 2026-10-22',
    );
  },
};

export const FieldAlignment: Story = {
  tags: ['example'],
  name: 'Field alignment',
  render: () => <FieldAlignmentDemo />,
};

export const ComposedCustomClasses: Story = {
  tags: ['customization'],
  name: 'CustomClasses',
  render: () => <ComposedCustomDemo />,
};

export const RequiredValidation: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <ControlsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save all fields' }));
    for (const message of [
      'Choose a valid avatar image.',
      'Choose valid attachments.',
      'Enter editor content.',
      'Enter a title.',
      'Enter a password with at least 8 characters.',
      'Enter a quantity.',
      'Enter all 6 digits.',
      'Enter a description.',
      'Select a category.',
      'Select an item.',
      'Select at least one tag.',
      'Consent is required.',
      'Enable demo mode.',
      'Select a decision.',
      'Choose a valid date.',
      'Choose a valid time.',
      'Choose a valid date range.',
    ]) {
      await expect(canvas.getByText(message, { exact: true })).toBeVisible();
    }
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Avatar' })).toHaveFocus(),
    );
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  },
};

export const CompleteSubmit: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <ControlsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    const png = Uint8Array.from(
      atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHioAAAAASUVORK5CYII=',
      ),
      (char) => char.charCodeAt(0),
    );
    const inputs =
      canvasElement.querySelectorAll<HTMLInputElement>('input[type="file"]');
    await userEvent.upload(
      inputs[0]!,
      new File([png], 'avatar.png', { type: 'image/png' }),
    );
    await waitFor(() =>
      expect(body.getByRole('button', { name: 'Use image' })).toBeEnabled(),
    );
    await userEvent.click(body.getByRole('button', { name: 'Use image' }));
    await userEvent.upload(
      inputs[1]!,
      new File(['Lorem ipsum'], 'example.txt', { type: 'text/plain' }),
    );
    await userEvent.type(canvas.getByLabelText('Password'), 'example-password');
    await userEvent.type(canvas.getByRole('spinbutton', { name: 'Quantity' }), '10');
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Verification code' }),
      '123456',
    );
    await userEvent.type(canvas.getByRole('textbox', { name: 'Title' }), 'Lorem ipsum');
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Description' }),
      'Dolor sit amet.',
    );
    await userEvent.click(canvas.getByRole('combobox', { name: 'Category' }));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await userEvent.type(
      canvas.getByRole('combobox', { name: 'Item (searchable)' }),
      'Consectetur',
    );
    await userEvent.click(
      await body.findByRole('option', { name: 'Consectetur adipiscing' }),
    );
    await userEvent.type(
      canvas.getByRole('combobox', { name: 'Tags' }),
      'Tempor incididunt',
    );
    await userEvent.click(
      await body.findByRole('option', { name: 'Tempor incididunt' }),
    );
    await userEvent.type(canvas.getByRole('combobox', { name: 'Send time' }), '09:30');
    await userEvent.click(await body.findByRole('option', { name: '09:30' }));
    await userEvent.click(canvas.getByRole('button', { name: /Send date/ }));
    await userEvent.click(
      body.getByRole('button', { name: 'Saturday, October 17, 2026' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: /Tracking range/ }));
    const rangePopup = within(body.getByRole('dialog', { name: 'Tracking range' }));
    await userEvent.click(
      rangePopup.getByRole('button', { name: 'Tuesday, October 20, 2026' }),
    );
    await userEvent.click(
      rangePopup.getByRole('button', { name: 'Thursday, October 22, 2026' }),
    );
    await userEvent.click(body.getByRole('button', { name: 'Apply' }));
    await userEvent.type(
      await canvas.findByRole('textbox', { name: 'Editor content' }),
      'Lorem ipsum dolor sit amet.',
    );
    await userEvent.click(canvas.getByRole('radio', { name: 'Worth trying' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Demo consent' }));
    await userEvent.click(canvas.getByRole('switch', { name: 'Enable demo mode' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Save all fields' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Saved all 17 demo fields.',
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('avatar-cropped.png');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'Editor content' })).toHaveTextContent(
        /^$/,
      ),
    );
  },
};

export const CustomClasses: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <CustomFormExample />,
};
