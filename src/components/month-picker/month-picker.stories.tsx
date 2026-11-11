import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MonthPicker } from './index';
import { Button } from '../button';
import { Form, useAppForm } from '../../modules/form';
import * as v from 'valibot';

const meta = {
  title: 'Components/MonthPicker',
  component: MonthPicker,
  parameters: {
    docs: {
      description: {
        component:
          'Select a calendar month for billing periods, reports or statements. value uses YYYY-MM; the trigger text and month names follow the UI locale. Arrow keys move between months across years, Home/End jump to January/December, PageUp/PageDown change the year and Escape returns focus to the field.',
      },
    },
  },
} satisfies Meta<typeof MonthPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function MonthExample() {
  const [value, setValue] = useState<string | null>('2026-10');

  return (
    <div className="grid max-w-sm gap-4">
      <MonthPicker
        label="Billing period"
        name="period"
        value={value}
        onValueChange={setValue}
        currentMonth="2026-11"
      />
      <output>Selected month: {value ?? 'Not selected'}</output>
    </div>
  );
}

function MonthFormExample() {
  const [saved, setSaved] = useState('');
  const form = useAppForm({
    defaultValues: { period: '' },
    onSubmit: async ({ value }) => setSaved(value.period),
  });

  return (
    <Form
      form={form}
      className="grid max-w-sm gap-4"
      schema={{
        period: v.pipe(v.string(), v.minLength(1, 'Choose a billing period.')),
      }}
    >
      <form.AppField name="period">
        {(field) => (
          <field.MonthField
            label="Billing period"
            required
            min="2026-01"
            currentMonth="2026-11"
          />
        )}
      </form.AppField>
      <Button type="submit">Create invoice</Button>
      {saved && <output>Saved period: {saved}</output>}
    </Form>
  );
}

export const Playground: Story = { tags: ['usage'], render: () => <MonthExample /> };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-sm gap-5">
      <MonthPicker label="Empty" currentMonth="2026-11" hint="Lorem ipsum dolor sit." />
      <MonthPicker label="Disabled" disabled defaultValue="2026-10" />
      <MonthPicker label="Error" error="Select a billing period." />
      <MonthPicker
        label="Out-of-range value"
        value="2025-12"
        min="2026-01"
        max="2026-12"
      />
      <MonthPicker label="Not clearable" clearable={false} defaultValue="2026-10" />
    </div>
  ),
};

export const Sizes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid max-w-sm gap-5">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <MonthPicker
          key={size}
          label={`Billing period · ${size}`}
          size={size}
          defaultValue="2026-10"
        />
      ))}
    </div>
  ),
};

export const Bounds: Story = {
  tags: ['example'],
  args: {
    label: 'Statement month',
    min: '2026-03',
    max: '2027-02',
    currentMonth: '2026-11',
    hint: 'Only March 2026 through February 2027 is available.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Statement month' }));
    await waitFor(() =>
      expect(body.getByRole('button', { name: /February 2026/ })).toBeDisabled(),
    );
    await expect(body.getByRole('button', { name: /March 2026/ })).toBeEnabled();
    await expect(body.getByRole('button', { name: 'Previous year' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
  },
};

export const InForm: Story = {
  tags: ['example'],
  render: () => <MonthFormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Create invoice' }));
    await expect(canvas.getByText('Choose a billing period.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /Billing period/ }));
    await userEvent.click(await body.findByRole('button', { name: /^July 2026/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Create invoice' }));
    await expect(canvas.getByText('Saved period: 2026-07')).toBeVisible();
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <MonthPicker
      label="Billing period"
      currentMonth="2026-11"
      defaultValue="2026-10"
      classNames={{
        root: 'max-w-sm',
        label: 'font-bold text-brand-700',
        control: 'h-12 rounded-full bg-brand-50',
        clear: 'text-danger-700',
        popover: 'rounded-panel bg-brand-50',
      }}
      panelClassNames={{
        caption: 'text-brand-800',
        month: 'rounded-full',
        footer: 'border-brand-100',
      }}
    />
  ),
};

export const SelectAndClear: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <MonthExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Billing period' });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: /^March 2026/ }));
    await expect(canvas.getByText('Selected month: 2026-03')).toBeVisible();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear month selection' }),
    );
    await expect(canvas.getByText('Selected month: Not selected')).toBeVisible();
  },
};

export const KeyboardSelection: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <MonthExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Billing period' });
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(document.activeElement).toHaveAccessibleName(/October 2026/),
    );
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{Enter}');
    await expect(canvas.getByText('Selected month: 2027-02')).toBeVisible();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
