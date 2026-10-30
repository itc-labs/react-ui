import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DateRangePicker, type DateRangeValue } from './index';
const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    docs: {
      description: {
        component:
          'Select a date range and click Apply to confirm. Canceling or closing the popup preserves the previous value. Supports date bounds, range length limits and unavailable dates.',
      },
    },
  },
} satisfies Meta<typeof DateRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function RangeExample() {
  const [value, setValue] = useState<DateRangeValue>({
    from: '2026-10-12',
    to: '2026-10-16',
  });

  return (
    <div className="grid max-w-md gap-4">
      <DateRangePicker
        label="Date range"
        name="range"
        value={value}
        onValueChange={setValue}
        today="2026-10-27"
      />
      <output>
        Selected: {value ? `${value.from} / ${value.to}` : 'Not selected'}
      </output>
    </div>
  );
}

export const Playground: Story = { tags: ['usage'], render: () => <RangeExample /> };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-md gap-5">
      <DateRangePicker
        label="Disabled"
        disabled
        defaultValue={{ from: '2026-10-12', to: '2026-10-16' }}
      />
      <DateRangePicker
        label="Invalid date range"
        value={{ from: '2026-10-20', to: '2026-10-12' }}
      />
    </div>
  ),
};

export const BoundsAndUnavailable: Story = {
  tags: ['example'],
  args: {
    label: '2–5 day range',
    minDate: '2026-10-01',
    maxDate: '2026-11-30',
    minDays: 2,
    maxDays: 5,
    today: '2026-10-27',
    isDateUnavailable: (date) => date === '2026-10-15',
    hint: 'October 15 is unavailable; the range cannot include this date.',
  },
};

export const SingleDay: Story = {
  tags: ['example'],
  args: {
    label: 'Single day',
    minDays: 1,
    maxDays: 1,
    today: '2026-10-27',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Single day' }));
    await userEvent.click(
      body.getAllByRole('button').find((b) => b.textContent === '17')!,
    );
    await expect(body.getByRole('button', { name: 'Apply' })).toBeEnabled();
    await userEvent.click(body.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByRole('button', { name: 'Single day' })).toHaveTextContent(
      '10/17/2026 — 10/17/2026',
    );
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <DateRangePicker
      label="Date range"
      today="2026-10-28"
      classNames={{
        root: 'max-w-md',
        control: 'rounded-full',
        popover: 'bg-brand-50',
        footer: 'border-brand-700',
        apply: 'rounded-full',
        cancel: 'rounded-full',
        summary: 'text-brand-700',
      }}
    />
  ),
};

export const ApplyAndCancel: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RangeExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Date range' });
    await userEvent.click(trigger);
    await userEvent.click(body.getByRole('button', { name: 'Reset' }));

    const day = (n: string) =>
      body.getAllByRole('button').find((b) => b.textContent === n)!;

    await userEvent.click(day('20'));
    await userEvent.click(day('22'));
    await userEvent.click(body.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByText('Selected: 2026-10-20 / 2026-10-22')).toBeVisible();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.click(body.getByRole('button', { name: 'Reset' }));
    await userEvent.click(day('27'));
    await userEvent.click(body.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByText('Selected: 2026-10-20 / 2026-10-22')).toBeVisible();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
