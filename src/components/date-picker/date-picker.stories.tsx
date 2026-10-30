import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker } from './index';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { Button } from '../button';
import { Input } from '../input';
const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          'Select a calendar date, clear the selection or restrict the available dates. value uses YYYY-MM-DD; the display follows the locale.',
      },
    },
  },
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function DateExample() {
  const [value, setValue] = useState<string | null>('2026-10-12');

  return (
    <div className="grid max-w-sm gap-4">
      <DatePicker
        label="Example date"
        name="date"
        value={value}
        onValueChange={setValue}
        today="2026-10-27"
      />
      <output>Selected date: {value ?? 'Not selected'}</output>
    </div>
  );
}

function DialogDateExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open date dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Date in dialog</DialogTitle>
        <DialogDescription>
          The date popover and month/year selectors share the dialog focus scope.
        </DialogDescription>
        <DatePicker label="Date in dialog" today="2026-10-27" />
      </DialogContent>
    </Dialog>
  );
}

export const Playground: Story = { tags: ['usage'], render: () => <DateExample /> };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-sm gap-5">
      <DatePicker label="Disabled" disabled defaultValue="2026-10-12" />
      <DatePicker label="Error" error="Select a valid date." />
      <DatePicker
        label="Out-of-range value"
        value="2026-10-05"
        minDate="2026-10-10"
        maxDate="2026-10-31"
      />
    </div>
  ),
};

export const Empty: Story = {
  tags: ['example'],
  args: {
    label: 'Start date',
    today: '2026-10-27',
    hint: 'Date-only value without a time zone.',
  },
};

export const Bounds: Story = {
  tags: ['example'],
  args: {
    label: 'Date in October',
    minDate: '2026-10-12',
    maxDate: '2026-10-20',
    today: '2026-10-27',
    isDateUnavailable: (date) => date === '2026-10-15',
    hint: 'Only October 12–20 is available; October 15 is disabled.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Date in October' }));

    const day = (n: string) =>
      within(document.body)
        .getAllByRole('button')
        .find((b) => b.textContent === n)!;

    await waitFor(() => expect(day('11')).toBeDisabled());
    await expect(day('15')).toBeDisabled();
    await expect(day('17')).toBeEnabled();
    await userEvent.keyboard('{Escape}');
  },
};

export const InDialog: Story = {
  tags: ['example'],
  render: () => <DialogDateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Open date dialog' });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: 'Date in dialog' }));
    await userEvent.click(
      body.getAllByRole('button').find((b) => b.textContent === '17')!,
    );
    await expect(
      body.getByRole('button', { name: 'Date in dialog' }),
    ).toHaveTextContent('10/17/2026');
    await waitFor(() => expect(body.getAllByRole('dialog')).toHaveLength(1));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <DatePicker
      label="Date"
      today="2026-10-28"
      defaultValue="2026-10-17"
      classNames={{
        root: 'max-w-sm',
        label: 'font-bold text-brand-700',
        control: 'h-12 rounded-full bg-brand-50',
        clear: 'text-danger-700',
        popover: 'rounded-panel bg-brand-50',
      }}
      calendarClassNames={{ caption: 'text-brand-800' }}
      dayClassNames={{ day_button: 'rounded-full' }}
    />
  ),
};

export const OutsideDismissal: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <div className="grid max-w-sm gap-4">
      <DateExample />
      <div className="mt-96">
        <Input label="Outside note" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Example date' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const note = canvas.getByRole('textbox', { name: 'Outside note' });
    await userEvent.click(note);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(note).toHaveFocus());
    await expect(canvas.getByText('Selected date: 2026-10-12')).toBeVisible();
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const SelectAndClear: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <DateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Example date' });
    await userEvent.click(trigger);
    const day = within(document.body)
      .getAllByRole('button')
      .find((b) => b.textContent === '17')!;
    await userEvent.click(day);
    await expect(canvas.getByText('Selected date: 2026-10-17')).toBeVisible();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(canvas.getByRole('button', { name: 'Clear date selection' }));
    await expect(canvas.getByText('Selected date: Not selected')).toBeVisible();
  },
};

export const KeyboardSelection: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <DateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Example date' });
    await userEvent.click(trigger);
    await waitFor(() => expect(document.activeElement).toHaveTextContent('12'));
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(canvas.getByText('Selected date: 2026-10-13')).toBeVisible();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
