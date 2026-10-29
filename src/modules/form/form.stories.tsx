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
        item: v.pipe(v.string(), v.trim(), v.minLength(1, 'Nhập item.')),
        note: v.pipe(v.string(), v.maxLength(40, 'Tối đa 40 ký tự.')),
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
        {(field) => <field.TextAreaField label="Ghi chú" />}
      </form.AppField>
      <form.SubmitButton>Lưu form</form.SubmitButton>
      {saved && <p role="status">Đã lưu bản minh họa.</p>}
    </Form>
  );
}

const meta = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Kết nối các control với giá trị và validation của TanStack Form. Dùng FormField để ghép control trực tiếp hoặc các bound field từ useAppForm. Submit hỗ trợ tác vụ bất đồng bộ và chuyển focus đến field lỗi đầu tiên.',
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
  password: v.pipe(v.string(), v.minLength(8, 'Nhập mật khẩu ít nhất 8 ký tự.')),
  quantity: v.pipe(v.number('Nhập số lượng.'), v.minValue(1, 'Số lượng tối thiểu 1.')),
  otp: v.pipe(v.string(), v.regex(/^\d{6}$/, 'Nhập đủ 6 chữ số.')),
  avatar: v.custom<File | null>(
    (value) =>
      typeof File !== 'undefined' &&
      value instanceof File &&
      !validateFiles([value], {
        accept: 'image/png,image/jpeg,image/webp',
        maxBytes: 2 * 1024 * 1024,
      }),
    'Chọn ảnh đại diện hợp lệ.',
  ),
  files: v.custom<File[]>(
    (value) =>
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((file) => typeof File !== 'undefined' && file instanceof File) &&
      !validateFiles(value, { accept: '.txt,.pdf,.png,.jpg,.jpeg,.webp', maxFiles: 3 }),
    'Chọn tệp đính kèm hợp lệ.',
  ),
  content: requiredText('Nhập nội dung editor.'),
  title: requiredText('Nhập tiêu đề.'),
  note: requiredText('Nhập mô tả.'),
  category: requiredText('Chọn danh mục.'),
  item: requiredText('Chọn item.'),
  tags: v.pipe(v.array(v.string()), v.minLength(1, 'Chọn ít nhất một nhãn.')),
  consent: v.literal(true, 'Cần xác nhận đồng ý.'),
  compact: v.literal(true, 'Cần bật chế độ minh họa.'),
  status: requiredText('Chọn quyết định.'),
  date: v.pipe(
    v.string(),
    v.check((value) => parseCalendarDate(value) != null, 'Chọn ngày hợp lệ.'),
  ),
  time: v.pipe(
    v.string(),
    v.check(
      (value) => timeSlots('09:00', '17:00', 15).includes(value),
      'Chọn giờ hợp lệ.',
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
      'Chọn khoảng ngày hợp lệ.',
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
    <Form
      form={form}
      className="grid max-w-3xl gap-6"
      aria-label="Tất cả field bắt buộc"
    >
      <p className="text-ui-sm text-muted">
        Tất cả field có dấu * đều bắt buộc. Checkbox và switch phải bật trong ví dụ này;
        form không gọi API.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <form.AppField name="avatar">
            {() => (
              <AvatarField label="Ảnh đại diện" alt="Lorem Ipsum" size="lg" required />
            )}
          </form.AppField>
        </div>
        <form.AppField name="title">
          {(field) => <field.TextField label="Tiêu đề" required />}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.PasswordField
              label="Mật khẩu"
              icon="lock"
              required
              autoComplete="new-password"
            />
          )}
        </form.AppField>
        <form.AppField name="quantity">
          {(field) => <field.NumberField label="Số lượng" required min={1} max={100} />}
        </form.AppField>
        <div className="md:col-span-2">
          <form.AppField name="otp">
            {(field) => <field.OTPField label="Mã xác nhận" required />}
          </form.AppField>
        </div>
        <form.AppField name="category">
          {(field) => (
            <field.SelectField
              label="Danh mục"
              required
              clearable
              options={[
                { value: 'pets', label: 'Pets' },
                { value: 'gifts', label: 'Gifts' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="item">
          {(field) => (
            <field.SelectField
              label="Item (tìm kiếm)"
              required
              searchable
              clearable
              options={[
                { value: 'cat', label: 'Cat shirt' },
                { value: 'dog', label: 'Dog shirt' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="tags">
          {(field) => (
            <field.MultiSelectField
              label="Nhãn"
              required
              searchable
              clearable
              options={[
                { value: 'cats', label: 'Cats' },
                { value: 'dogs', label: 'Dogs' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="date">
          {(field) => <field.DateField label="Ngày gửi" required today="2026-10-28" />}
        </form.AppField>
        <form.AppField name="time">
          {(field) => (
            <field.TimeField
              label="Giờ gửi"
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
                label="Khoảng theo dõi"
                required
                today="2026-10-28"
              />
            )}
          </form.AppField>
        </div>
        <div className="md:col-span-2">
          <form.AppField name="note">
            {(field) => <field.TextAreaField label="Mô tả" required />}
          </form.AppField>
        </div>
        <div className="md:col-span-2">
          <form.AppField name="files">
            {(field) => (
              <field.UploadField
                label="Tệp đính kèm"
                multiple
                maxFiles={3}
                accept=".txt,.pdf,.png,.jpg,.jpeg,.webp"
                required
                hint="Ảnh, TXT hoặc PDF; tối đa 3 file, 10 MB mỗi file."
              />
            )}
          </form.AppField>
        </div>
        <div className="md:col-span-2">
          <form.AppField name="content">
            {() => <EditorField label="Nội dung editor" required />}
          </form.AppField>
        </div>
        <form.AppField name="status">
          {(field) => (
            <field.RadioGroupField
              label="Quyết định"
              required
              options={[
                { value: 'explore', label: 'Nghiên cứu thêm' },
                { value: 'test', label: 'Đáng thử' },
              ]}
            />
          )}
        </form.AppField>
        <div className="grid content-start gap-5">
          <form.AppField name="consent">
            {(field) => <field.CheckboxField label="Đồng ý minh họa" required />}
          </form.AppField>
          <form.AppField name="compact">
            {(field) => <field.SwitchField label="Bật chế độ minh họa" required />}
          </form.AppField>
        </div>
      </div>
      <div className="flex gap-3">
        <form.SubmitButton>Lưu tất cả field</form.SubmitButton>
        <Button
          variant="secondary"
          onClick={() => {
            form.reset();
            setSaved('');
          }}
        >
          Đặt lại
        </Button>
      </div>
      {saved && (
        <div role="status">
          <p>Đã lưu đủ 14 field minh họa.</p>
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
    v.check((value) => parseCalendarDate(value) != null, 'Chọn ngày hợp lệ.'),
  ),
  time: v.pipe(
    v.string(),
    v.check(
      (value) => timeSlots('09:00', '17:00', 15).includes(value),
      'Chọn giờ trong 09:00–17:00 theo bước 15 phút.',
    ),
  ),
  range: v.pipe(
    v.nullable(v.object({ from: v.string(), to: v.string() })),
    v.check((value) => Boolean(value), 'Chọn khoảng ngày.'),
    v.check(
      (value) => !value || dateSpan(value.from, value.to) >= 1,
      'Khoảng ngày không hợp lệ.',
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
    <Form
      form={form}
      className="grid max-w-md gap-5"
      aria-label="Form ngày giờ minh họa"
    >
      <form.AppField name="date">
        {(field) => <field.DateField label="Ngày gửi" required today="2026-10-27" />}
      </form.AppField>
      <form.AppField name="time">
        {(field) => (
          <field.TimeField
            label="Giờ gửi"
            required
            minTime="09:00"
            maxTime="17:00"
            minuteStep={15}
          />
        )}
      </form.AppField>
      <form.AppField name="range">
        {(field) => (
          <field.DateRangeField label="Khoảng theo dõi" required today="2026-10-27" />
        )}
      </form.AppField>
      <form.SubmitButton>Lưu ngày giờ minh họa</form.SubmitButton>
      {saved && <p role="status">Đã lưu: {saved}</p>}
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
            label="Lorem ipsum"
            required
            className="rounded-full"
            classNames={{ label: 'font-bold text-brand-700', hint: 'italic' }}
            hint="Dolor sit amet."
          />
        )}
      </form.AppField>
      <form.AppField name="category">
        {(field) => (
          <field.SelectField
            label="Danh mục"
            options={[{ value: 'a', label: 'Lorem ipsum' }]}
            classNames={{ control: 'rounded-full bg-brand-50', option: 'rounded-full' }}
          />
        )}
      </form.AppField>
      <form.SubmitButton className="rounded-full">Lưu nội dung</form.SubmitButton>
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
    name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Nhập họ tên.')),
    password: v.pipe(v.string(), v.minLength(8, 'Nhập mật khẩu ít nhất 8 ký tự.')),
    quantity: v.pipe(
      v.number('Nhập số lượng.'),
      v.minValue(1, 'Số lượng tối thiểu 1.'),
    ),
    otp: v.pipe(v.string(), v.regex(/^\d{6}$/, 'Nhập đủ 6 chữ số.')),
    status: v.pipe(v.string(), v.minLength(1, 'Chọn trạng thái.')),
    agree: v.pipe(
      v.boolean(),
      v.check((value) => value, 'Cần xác nhận.'),
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
        <FormField name="name" label="Họ tên" required>
          <Input icon="user" placeholder="Lorem ipsum" />
        </FormField>
        <FormField name="password" label="Mật khẩu" required>
          <InputPassword icon="lock" autoComplete="new-password" />
        </FormField>
        <FormField name="quantity" label="Số lượng" required>
          <NumberInput min={1} max={100} />
        </FormField>
        <FormField name="status" label="Trạng thái" required>
          <Select
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
            ]}
          />
        </FormField>
      </div>
      <FormField name="otp" label="Mã xác nhận" required>
        <InputOTP />
      </FormField>
      <FormField name="agree" required>
        <Checkbox label="Xác nhận thông tin" />
      </FormField>
      <FormSubmit form={form}>
        {(submitting) => (
          <Button type="submit" loading={submitting}>
            Lưu thông tin
          </Button>
        )}
      </FormSubmit>
      {saved && <p role="status">Đã lưu bản minh họa.</p>}
    </Form>
  );
}

function ComposedCustomDemo() {
  const form = useAppForm({ defaultValues: { name: '' }, onSubmit: async () => {} });

  return (
    <Form form={form}>
      <FormField
        name="name"
        label="Lorem ipsum"
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
        Bật/tắt lỗi để kiểm tra căn hàng
      </Button>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="grid gap-5 sm:grid-cols-2">
          <Select
            label={`Nhãn · ${size}`}
            size={size}
            multiple
            required
            options={[{ value: 'one', label: 'Lorem ipsum' }]}
            {...(errors ? { error: 'Chọn ít nhất một nhãn.' } : {})}
          />
          <DatePicker
            label={`Ngày gửi · ${size}`}
            size={size}
            required
            defaultValue="2026-10-17"
          />
          <NumberInput
            label={`Số lượng · ${size}`}
            size={size}
            defaultValue={3233232}
            iconRight="info"
          />
          <Input
            label={`Tiêu đề · ${size}`}
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
          'Dùng FormField để nối control với giá trị, validation và trạng thái touched của form. Ví dụ này yêu cầu nhập tất cả các field; bấm Lưu để kiểm tra lỗi và xem giá trị được submit.',
      },
    },
  },
};

export const ValidatedSubmit: Story = {
  tags: ['example'],
  name: 'Validation',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Lưu form' }));
    await expect(canvas.getByText('Nhập item.')).toBeVisible();
    await userEvent.type(canvas.getByRole('textbox', { name: /Item/ }), 'example item');
    await userEvent.click(canvas.getByRole('button', { name: 'Lưu form' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Đã lưu bản minh họa.');
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
          '17 field, mặc định trống và required: Text, Password, Number, OTP, Textarea, Select, Select có tìm kiếm, MultiSelect, Date, Time, DateRange, Radio, Checkbox, Switch, Avatar, Upload và Editor. Required được thực thi bằng Valibot, không chỉ dấu sao. Switch/Checkbox phải true riêng trong ví dụ này.',
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
    await userEvent.click(
      canvas.getByRole('button', { name: 'Lưu ngày giờ minh họa' }),
    );
    await expect(canvas.getByText('Chọn ngày hợp lệ.')).toBeVisible();
    const date = canvas.getByRole('button', { name: /Ngày gửi/ });
    await waitFor(() => expect(date).toHaveFocus());
    await userEvent.click(date);
    await userEvent.click(
      body.getAllByRole('button').find((b) => b.textContent === '17')!,
    );
    await userEvent.type(canvas.getByRole('combobox', { name: /Giờ gửi/ }), '09:30');
    await userEvent.click(await body.findByRole('option', { name: '09:30' }));
    await userEvent.click(canvas.getByRole('button', { name: /Khoảng theo dõi/ }));
    await userEvent.click(
      body.getAllByRole('button').find((b) => b.textContent === '20')!,
    );
    await userEvent.click(
      body.getAllByRole('button').find((b) => b.textContent === '22')!,
    );
    await userEvent.click(body.getByRole('button', { name: 'Áp dụng' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Lưu ngày giờ minh họa' }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Đã lưu: 2026-10-17 · 09:30 · 2026-10-20 — 2026-10-22',
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
    await userEvent.click(canvas.getByRole('button', { name: 'Lưu tất cả field' }));
    for (const message of [
      'Chọn ảnh đại diện hợp lệ.',
      'Chọn tệp đính kèm hợp lệ.',
      'Nhập nội dung editor.',
      'Nhập tiêu đề.',
      'Nhập mật khẩu ít nhất 8 ký tự.',
      'Nhập số lượng.',
      'Nhập đủ 6 chữ số.',
      'Nhập mô tả.',
      'Chọn danh mục.',
      'Chọn item.',
      'Chọn ít nhất một nhãn.',
      'Cần xác nhận đồng ý.',
      'Cần bật chế độ minh họa.',
      'Chọn quyết định.',
      'Chọn ngày hợp lệ.',
      'Chọn giờ hợp lệ.',
      'Chọn khoảng ngày hợp lệ.',
    ]) {
      await expect(canvas.getByText(message, { exact: true })).toBeVisible();
    }
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Ảnh đại diện' })).toHaveFocus(),
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
      expect(body.getByRole('button', { name: 'Dùng ảnh' })).toBeEnabled(),
    );
    await userEvent.click(body.getByRole('button', { name: 'Dùng ảnh' }));
    await userEvent.upload(
      inputs[1]!,
      new File(['Lorem ipsum'], 'example.txt', { type: 'text/plain' }),
    );
    await userEvent.type(canvas.getByLabelText('Mật khẩu'), 'example-password');
    await userEvent.type(canvas.getByRole('spinbutton', { name: 'Số lượng' }), '10');
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Mã xác nhận' }),
      '123456',
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Tiêu đề' }),
      'Lorem ipsum',
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Mô tả' }),
      'Dolor sit amet.',
    );
    await userEvent.click(canvas.getByRole('combobox', { name: 'Danh mục' }));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await userEvent.type(
      canvas.getByRole('combobox', { name: 'Item (tìm kiếm)' }),
      'Cat',
    );
    await userEvent.click(await body.findByRole('option', { name: 'Cat shirt' }));
    await userEvent.type(canvas.getByRole('combobox', { name: 'Nhãn' }), 'Cats');
    await userEvent.click(await body.findByRole('option', { name: 'Cats' }));
    await userEvent.type(canvas.getByRole('combobox', { name: 'Giờ gửi' }), '09:30');
    await userEvent.click(await body.findByRole('option', { name: '09:30' }));
    await userEvent.click(canvas.getByRole('button', { name: /Ngày gửi/ }));
    await userEvent.click(
      body.getByRole('button', { name: 'Thứ Bảy, ngày 17 tháng 10 năm 2026' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: /Khoảng theo dõi/ }));
    const rangePopup = within(body.getByRole('dialog', { name: 'Khoảng theo dõi' }));
    await userEvent.click(
      rangePopup.getByRole('button', { name: 'Thứ Ba, ngày 20 tháng 10 năm 2026' }),
    );
    await userEvent.click(
      rangePopup.getByRole('button', { name: 'Thứ Năm, ngày 22 tháng 10 năm 2026' }),
    );
    await userEvent.click(body.getByRole('button', { name: 'Áp dụng' }));
    await userEvent.type(
      await canvas.findByRole('textbox', { name: 'Nội dung editor' }),
      'Lorem ipsum dolor sit amet.',
    );
    await userEvent.click(canvas.getByRole('radio', { name: 'Đáng thử' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Đồng ý minh họa' }));
    await userEvent.click(canvas.getByRole('switch', { name: 'Bật chế độ minh họa' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Lưu tất cả field' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Đã lưu đủ 17 field minh họa.',
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('avatar-cropped.png');
    await userEvent.click(canvas.getByRole('button', { name: 'Đặt lại' }));
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        canvas.getByRole('textbox', { name: 'Nội dung editor' }),
      ).toHaveTextContent(/^$/),
    );
  },
};

export const CustomClasses: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <CustomFormExample />,
};
