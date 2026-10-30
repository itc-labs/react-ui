import { toast } from '@itclabs/react-ui/toast';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastProvider, useToast, type ToastPosition } from './index';
import { Button } from '../button';
import { Select } from '../select';

function Trigger() {
  const notify = useToast();

  return (
    <Button
      onClick={() =>
        notify.success({ title: 'Saved', description: 'Lorem ipsum dolor sit amet.' })
      }
    >
      Show notification
    </Button>
  );
}

function Demo() {
  return (
    <ToastProvider client={null}>
      <Trigger />
    </ToastProvider>
  );
}

const meta = {
  title: 'Components/Toast',
  tags: ['!autodocs'],
  component: ToastProvider,
  render: () => <Demo />,
  parameters: {
    docs: {
      description: {
        component:
          'Place ToastProvider once at the application root. Call toast.success/error/warning/info to show notifications; toast.promise tracks asynchronous operations. Notifications support updates, dismissal, queueing, and pausing the timer on hover.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof Demo>;

function VariantsTrigger() {
  const notify = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          notify.info({
            title: 'Info',
            description: 'Lorem ipsum dolor sit amet.',
          })
        }
      >
        Info
      </Button>
      <Button
        onClick={() =>
          notify.success({
            title: 'Saved',
            description: 'Lorem ipsum dolor sit amet.',
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          notify.warning({
            title: 'Review needed',
            description: 'Lorem ipsum dolor sit amet.',
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="danger"
        onClick={() =>
          notify.error({
            title: 'Unable to save',
            description: 'Lorem ipsum dolor sit amet.',
          })
        }
      >
        Error
      </Button>
    </div>
  );
}

function DuplicateTrigger() {
  const notify = useToast();

  return (
    <Button
      onClick={() =>
        notify({ id: 'same-save', title: 'One notification only', tone: 'info' })
      }
    >
      Send again with the same ID
    </Button>
  );
}

function LoadingTrigger() {
  const notify = useToast();
  const [id, setId] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          setId(
            notify.loading({
              id: 'loading-demo',
              title: 'Processing',
              description: 'Lorem ipsum dolor sit amet.',
            }),
          )
        }
      >
        Start loading
      </Button>
      <Button
        disabled={!id}
        onClick={() => {
          if (id)
            notify.update(id, {
              loading: false,
              tone: 'success',
              title: 'Completed',
            });
        }}
      >
        Complete
      </Button>
      <Button
        variant="secondary"
        disabled={!id}
        onClick={() => {
          if (id) notify.dismiss(id);
          setId(null);
        }}
      >
        Dismiss toast
      </Button>
    </div>
  );
}

function PromiseTrigger() {
  const notify = useToast();

  function run(fail: boolean) {
    void notify
      .promise(
        () =>
          new Promise<string>((resolve, reject) => {
            setTimeout(
              () => (fail ? reject(new Error('Synthetic failure')) : resolve('saved')),
              1200,
            );
          }),
        {
          loading: {
            id: 'promise-demo',
            title: 'Saving',
            description: 'Lorem ipsum dolor sit amet.',
          },
          success: { title: 'Saved', description: 'Lorem ipsum dolor sit amet.' },
          error: {
            title: 'Unable to save',
            description: 'Try again using the button below.',
          },
        },
      )
      .catch(() => {});
  }

  return (
    <div className="flex gap-3">
      <Button onClick={() => run(false)}>Resolve promise</Button>
      <Button variant="danger" onClick={() => run(true)}>
        Reject promise
      </Button>
    </div>
  );
}

function QueueTrigger() {
  const notify = useToast();
  const counter = useRef(0);

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() => {
          for (let index = 0; index < 5; index++)
            notify({
              title: `Notification ${++counter.current}`,
              description: 'Lorem ipsum dolor sit amet.',
            });
        }}
      >
        Add 5 notifications
      </Button>
      <Button variant="secondary" onClick={() => notify.clearQueue()}>
        Clear queue
      </Button>
      <Button variant="secondary" onClick={() => notify.dismiss()}>
        Dismiss all
      </Button>
    </div>
  );
}

function PositionsDemo() {
  const [position, setPosition] = useState<ToastPosition>('bottom-right');
  const positions: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  return (
    <ToastProvider client={null} position={position}>
      <div className="grid max-w-sm gap-4">
        <Select
          label="Position for new notifications"
          clearable={false}
          value={position}
          options={positions.map((value) => ({ value, label: value }))}
          onValueChange={(value) => {
            if (value) setPosition(value as ToastPosition);
          }}
        />
        <Trigger />
      </div>
    </ToastProvider>
  );
}

function reportFailure() {
  toast.error('Unable to save', { description: 'Lorem ipsum dolor sit amet.' });
}

function PureFunctionTrigger() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="danger" onClick={reportFailure}>
        toast.error
      </Button>
      <Button
        onClick={() =>
          toast.info('Notification', { description: 'Lorem ipsum dolor sit amet.' })
        }
      >
        toast.info
      </Button>
      <Button
        onClick={() =>
          toast.warning('Review needed', { description: 'Lorem ipsum dolor sit amet.' })
        }
      >
        toast.warning
      </Button>
      <Button
        onClick={() =>
          toast.success('Saved', { description: 'Lorem ipsum dolor sit amet.' })
        }
      >
        toast.success
      </Button>
    </div>
  );
}

export const Playground: Story = { tags: ['usage'] };

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Info uses info-700 for the icon and border. All tones use the surface background; the loading spinner uses a neutral color.',
      },
    },
  },
  tags: ['variants'],
  render: () => (
    <ToastProvider client={null}>
      <VariantsTrigger />
    </ToastProvider>
  ),
};

export const LoadingAndUpdate: Story = {
  tags: ['example'],
  render: () => (
    <ToastProvider client={null}>
      <LoadingTrigger />
    </ToastProvider>
  ),
};

export const Positions: Story = { tags: ['example'], render: () => <PositionsDemo /> };

export const PureFunction: Story = {
  tags: ['example'],
  render: () => (
    <ToastProvider>
      <PureFunctionTrigger />
    </ToastProvider>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <ToastProvider
      client={null}
      className="left-4 right-auto"
      classNames={{
        toast: 'rounded-none border-brand-700 bg-brand-50',
        title: 'text-brand-800',
        close: 'rounded-full',
        description: 'italic',
      }}
    >
      <Trigger />
    </ToastProvider>
  ),
};

export const Dismissal: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Show notification' }),
    );
    await expect(await body.findByText('Saved')).toBeVisible();
    await userEvent.click(body.getByRole('button', { name: 'Dismiss notification' }));
    await waitFor(() => expect(body.queryByText('Saved')).not.toBeInTheDocument());
  },
};

export const Deduplicated: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null}>
      <DuplicateTrigger />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Send again with the same ID',
    });
    const body = within(document.body);
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    await expect(body.getAllByText('One notification only')).toHaveLength(1);
    await userEvent.click(body.getByRole('button', { name: 'Dismiss notification' }));
  },
};

export const AutoDismiss: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null} duration={1000}>
      <Trigger />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Show notification' }),
    );
    await expect(await body.findByText('Saved')).toBeVisible();
    await waitFor(() => expect(body.queryByText('Saved')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
  },
};

export const PauseOnHover: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null} duration={800}>
      <Trigger />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Show notification' }),
    );
    const title = await body.findByText('Saved');
    const toast = title.closest('.Toastify__toast');
    if (!toast) throw new Error('Missing toast root.');
    await userEvent.hover(toast);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(title).toBeVisible();
    await userEvent.unhover(toast);
    await waitFor(() => expect(body.queryByText('Saved')).not.toBeInTheDocument(), {
      timeout: 2500,
    });
  },
};

export const PromiseLifecycle: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null}>
      <PromiseTrigger />
    </ToastProvider>
  ),
};

export const Queue: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null} maxVisible={2} duration={false}>
      <QueueTrigger />
    </ToastProvider>
  ),
};
