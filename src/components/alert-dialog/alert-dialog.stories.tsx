import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from './index';
import { Button } from '../button';

function Demo() {
  const [done, setDone] = useState(false);

  return (
    <div className="grid justify-items-start gap-3">
      <AlertDialog
        trigger="Confirm demo action"
        title="Continue with this action?"
        description="Confirm this demo action. No data will be deleted or sent."
        confirmLabel="Continue"
        onConfirm={() => setDone(true)}
      />
      {done && <p role="status">Demo action confirmed.</p>}
    </div>
  );
}

function AsyncConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <AlertDialog
      trigger="Open confirmation"
      title="Lorem ipsum"
      description="Dolor sit amet."
      open={open}
      onOpenChange={setOpen}
      closeOnConfirm={false}
      confirmLoading={loading}
      onConfirm={async () => {
        setLoading(true);
        try {
          await new Promise<void>((resolve) => setTimeout(resolve, 1500));
          setOpen(false);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  args: {
    trigger: 'Confirm demo action',
    title: 'Continue with this action?',
    description: 'Confirm this demo action. No data will be deleted or sent.',
    confirmLabel: 'Continue',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Confirm an action with a title, description and two clear choices. Cancel receives focus first. Provide title to use the built-in layout; omit it when composing primitives. title cannot be null or undefined; an empty string or 0 still uses the built-in layout.',
      },
    },
  },
} satisfies Meta<typeof AlertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const MotionLifecycle: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Confirm demo action' });
    await userEvent.click(trigger);
    const panel = await body.findByRole('alertdialog');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(panel).animationName).toBe(
      reduced ? 'none' : 'ui-fade-in',
    );
    await userEvent.click(body.getByRole('button', { name: 'Cancel' }));
    if (!reduced) {
      await expect(panel).toHaveAttribute('data-state', 'closed');
      await expect(getComputedStyle(panel).animationName).toBe('ui-fade-out');
    }
    await waitFor(() =>
      expect(body.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const AsyncConfirm: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Use closeOnConfirm={false} and control open/confirmLoading to keep the dialog open while waiting. Loading prevents repeat confirmation and dismissal with Cancel or Escape; the application closes the dialog when the action completes.',
      },
    },
  },
  render: () => <AsyncConfirmDemo />,
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <AlertDialog
      trigger="Open confirmation"
      title="Lorem ipsum"
      description="Dolor sit amet."
      classNames={{
        trigger: 'rounded-full',
        content: 'border-brand-700',
        header: 'bg-brand-50',
        title: 'text-brand-700',
        confirm: 'rounded-full',
        cancel: 'rounded-full',
      }}
    />
  ),
};

export const ConfirmationCallback: Story = {
  tags: ['example'],
  render: () => <Demo />,
};
