import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './index';
import { Button } from '../button';
import { Select } from '../select';
import { Textarea } from '../textarea';

function Demo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Dialog
      title="Lorem ipsum"
      description="The dialog manages focus; Select works within the same focus scope."
      trigger="Open dialog"
      actions={[{ id: 'done', label: 'Done', close: true }]}
    >
      <Select
        label="Category in dialog"
        searchable
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'pets', label: 'Pets' },
          { value: 'gifts', label: 'Gifts' },
        ]}
      />
    </Dialog>
  );
}

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  args: {
    title: 'Lorem ipsum',
    trigger: 'Open dialog',
    description: 'The dialog manages focus; Select works within the same focus scope.',
    actions: [{ id: 'done', label: 'Done', close: true }],
    children: (
      <Select
        label="Category in dialog"
        searchable
        options={[
          { value: 'pets', label: 'Pets' },
          { value: 'gifts', label: 'Gifts' },
        ]}
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Display content or actions that need focused attention. Pass trigger, title, description, footer and children. Focus stays inside the dialog and returns to the trigger on close. Supply title for the built-in composition, or omit it to compose primitives. title cannot be null/undefined; an empty string or 0 still uses the built-in composition.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

function RefFocusDemo() {
  const panel = useRef<HTMLDivElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open with custom focus</Button>
      </DialogTrigger>
      <DialogContent
        ref={panel}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          panel.current?.querySelector('textarea')?.focus();
        }}
      >
        <DialogTitle>Focus using a consumer ref</DialogTitle>
        <DialogDescription>
          Use the content ref to choose the initial focus target.
        </DialogDescription>
        <Select label="Status" options={[{ value: 'test', label: 'Ready to test' }]} />
        <Textarea label="Focused note" className="mt-4" />
      </DialogContent>
    </Dialog>
  );
}

export const Playground: Story = { tags: ['usage'] };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open custom dialog</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-lg rounded-none"
        classNames={{
          overlay: 'bg-brand-800/40',
          close: 'rounded-full bg-brand-100',
          content: 'border-brand-700 p-8',
        }}
      >
        <DialogTitle className="text-brand-700">Lorem ipsum</DialogTitle>
        <DialogDescription className="italic">Dolor sit amet.</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
};

export const KeyboardAndSelect: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Open dialog' });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog');
    await userEvent.click(
      within(dialog).getByRole('combobox', { name: 'Category in dialog' }),
    );
    await userEvent.click(await body.findByRole('option', { name: 'Pets' }));
    await expect(within(dialog).getByText('Pets')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const MotionLifecycle: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Open dialog' });
    await userEvent.click(trigger);
    const panel = await body.findByRole('dialog');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(panel).animationName).toBe(
      reduced ? 'none' : 'ui-fade-in',
    );
    await expect(getComputedStyle(panel).transform).toBe('none');
    await Promise.all(panel.getAnimations().map((animation) => animation.finished));
    await userEvent.click(body.getByRole('button', { name: 'Done' }));
    if (!reduced) {
      await expect(panel).toHaveAttribute('data-state', 'closed');
      await expect(getComputedStyle(panel).animationName).toBe('ui-fade-out');
    }
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ConsumerRefFocus: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RefFocusDemo />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open with custom focus',
    });
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(
        within(document.body).getByRole('textbox', { name: 'Focused note' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
