import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
import { Calendar, type DateRange } from './index';
const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component:
          'Select a single date or date range. Supports keyboard navigation, month and year selection, date bounds and unavailable dates.',
      },
    },
  },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

function SingleExample() {
  const [value, setValue] = useState<string | null>('2026-10-12');

  return (
    <div className="grid justify-items-start gap-4">
      <Calendar value={value} onValueChange={setValue} today="2026-10-27" />
      <output>Date: {value ?? 'No date selected'}</output>
    </div>
  );
}

function RangeExample() {
  const [value, setValue] = useState<DateRange | undefined>();

  return (
    <Calendar mode="range" value={value} onValueChange={setValue} today="2026-10-27" />
  );
}

export const Single: Story = {
  name: 'Playground',
  tags: ['example'],
  render: () => <SingleExample />,
  play: async ({ canvasElement }) => {
    const calendar = canvasElement.querySelector<HTMLElement>('.pod-calendar')!;
    const root = calendar.querySelector<HTMLElement>('.rdp-root')!;
    await expect(
      getComputedStyle(root).getPropertyValue('--rdp-accent-color').trim(),
    ).toBe(getComputedStyle(calendar).getPropertyValue('--color-brand-700').trim());
    await expect(root.scrollWidth).toBeLessThanOrEqual(calendar.clientWidth);
    for (const name of ['Month', 'Year']) {
      await expect(within(calendar).getByRole('combobox', { name })).toBeVisible();
    }
  },
};

export const Range: Story = { tags: ['example'], render: () => <RangeExample /> };

export const Bounded: Story = {
  tags: ['example'],
  render: () => (
    <Calendar today="2026-10-27" minDate="2026-10-10" maxDate="2026-11-20" />
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Calendar
      today="2026-10-28"
      classNames={{
        root: 'rounded-panel bg-brand-50 p-3',
        caption: 'text-brand-800',
        selects: 'gap-3',
      }}
      dayClassNames={{
        day_button: 'rounded-full',
        weekday: 'text-brand-700 font-bold',
      }}
    />
  ),
};
