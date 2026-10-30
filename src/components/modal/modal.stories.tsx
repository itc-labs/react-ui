import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalProvider, useModal, type ModalProviderProps } from './index';
import { Button } from '../button';
import { Input } from '../input';

type Example =
  | 'playground'
  | 'queue'
  | 'priority'
  | 'stacked'
  | 'async'
  | 'dedupe'
  | 'custom'
  | 'classes';

function ModalValueContent({ close }: { close: (value?: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <div className="grid gap-4">
      <Input
        label="Return value"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button onClick={() => close(value)}>Choose value</Button>
    </div>
  );
}

function ModalExamples({ example }: { example: Example }) {
  const modal = useModal();
  const [result, setResult] = useState('');

  async function custom() {
    const value = await modal.open<string>({
      title: 'Lorem ipsum',
      description: 'Lorem ipsum dolor sit amet.',
      content: ({ close }) => <ModalValueContent close={close} />,
      actions: ({ dismiss }) => (
        <Button variant="secondary" onClick={dismiss}>
          Cancel
        </Button>
      ),
    });
    setResult(value === undefined ? 'Canceled' : `Value: ${value}`);
  }

  function queue() {
    void modal.alert({ title: 'Step 1', description: 'Lorem ipsum dolor sit amet.' });
    void modal.confirm({ title: 'Step 2', description: 'Lorem ipsum dolor sit amet.' });
    void modal.alert({
      title: 'Step 3',
      description: 'Lorem ipsum dolor sit amet.',
      tone: 'success',
    });
  }

  function priorityQueue() {
    void modal.alert({
      id: 'current',
      title: 'Current dialog',
      description: 'Lorem ipsum dolor sit amet.',
    });
    void modal.alert({
      id: 'normal',
      title: 'Normal priority: shown third',
      description: 'Lorem ipsum dolor sit amet.',
    });
    void modal.alert({
      id: 'high',
      title: 'High priority: shown second',
      description: 'Lorem ipsum dolor sit amet.',
      priority: 10,
    });
  }

  function stacked() {
    void modal.open({
      title: 'Lorem ipsum',
      content: ({ close }) => (
        <Button
          onClick={async () => {
            const confirmed = await modal.confirm({
              title: 'Confirm close',
              stack: true,
              tone: 'danger',
            });
            if (confirmed) close();
          }}
        >
          Confirm close
        </Button>
      ),
    });
  }

  function asyncConfirm(fail: boolean) {
    void modal.confirm({
      title: 'Confirm save',
      description: 'Lorem ipsum dolor sit amet.',
      onConfirm: () =>
        new Promise<void>((resolve, reject) => {
          setTimeout(
            () => (fail ? reject(new Error('Simulated failure')) : resolve()),
            1000,
          );
        }),
      onError: () => setResult('Action failed; retry or cancel.'),
    });
  }

  function dedupe() {
    const first = modal.confirm({ id: 'same-action', title: 'Confirm once' });
    const second = modal.confirm({ id: 'same-action', title: 'Confirm once' });
    setResult(first === second ? 'Both calls share one Promise.' : '');
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        {(example === 'playground' || example === 'classes') && (
          <>
            <Button
              onClick={() => {
                void modal
                  .confirm({
                    title: 'Confirm action',
                    description: 'Lorem ipsum dolor sit amet.',
                    classNames:
                      example === 'classes'
                        ? { confirm: 'rounded-full', title: 'text-brand-800' }
                        : {},
                  })
                  .then((value) => setResult(value ? 'Confirmed' : 'Canceled'));
              }}
            >
              Confirm
            </Button>
            <Button
              onClick={() => {
                void modal.alert({
                  title: 'Lorem ipsum',
                  content: 'Lorem ipsum dolor sit amet.',
                  tone: 'info',
                });
              }}
            >
              Alert
            </Button>
            <Button onClick={custom}>Open</Button>
          </>
        )}
        {example === 'queue' && (
          <Button onClick={queue}>Open three dialogs in sequence</Button>
        )}
        {example === 'priority' && (
          <Button onClick={priorityQueue}>
            Open a sequence with a high-priority entry
          </Button>
        )}
        {example === 'stacked' && (
          <Button onClick={stacked}>Open dialog with nested confirmation</Button>
        )}
        {example === 'async' && (
          <>
            <Button onClick={() => asyncConfirm(false)}>Save successfully</Button>
            <Button variant="danger" onClick={() => asyncConfirm(true)}>
              Simulate save failure
            </Button>
          </>
        )}
        {example === 'dedupe' && (
          <Button onClick={dedupe}>Call confirm twice with the same ID</Button>
        )}
        {example === 'custom' && <Button onClick={custom}>Enter a return value</Button>}
      </div>
      <output aria-live="polite">{result}</output>
    </div>
  );
}

const meta = {
  title: 'Components/Modal',
  component: ModalProvider,
  args: { client: null },
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="playground" />
    </ModalProvider>
  ),
  parameters: {
    controls: { exclude: ['client', 'children'] },
    docs: {
      description: {
        component:
          'ModalProvider queues confirmations, alerts and custom content. Use useModal in React or modal in browser code after the provider mounts. Use a declarative Dialog for forms and longer content with its own state.',
      },
    },
  },
} satisfies Meta<typeof ModalProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const Queue: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="queue" />
    </ModalProvider>
  ),
};
export const PriorityQueue: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'The current dialog stays open. After it closes, the later high-priority entry appears before the earlier normal entry.',
      },
    },
  },
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="priority" />
    </ModalProvider>
  ),
};
export const Stacked: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="stacked" />
    </ModalProvider>
  ),
};
export const AsyncConfirm: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="async" />
    </ModalProvider>
  ),
};
export const Dedupe: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="dedupe" />
    </ModalProvider>
  ),
};
export const CustomContent: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="custom" />
    </ModalProvider>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-none border-brand-700',
    classNames: {
      header: 'bg-brand-50',
      body: 'bg-surface',
      confirm: 'rounded-none',
      cancel: 'rounded-full',
      ok: 'rounded-full',
      error: 'font-semibold',
      accent: 'text-brand-700',
      icon: 'text-brand-700',
    },
  },
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="classes" />
    </ModalProvider>
  ),
};
