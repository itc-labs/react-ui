import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './index';

function Demo() {
  return (
    <div className="grid max-w-xl gap-3">
      <Alert tone="neutral">Lorem ipsum dolor sit amet.</Alert>
      <Alert title="Lorem ipsum" tone="info">
        Dolor sit amet.
      </Alert>
      <Alert tone="warning" title="Sed do eiusmod">
        Consectetur adipiscing elit.
      </Alert>
      <Alert tone="danger">Could not connect to the server.</Alert>
      <Alert tone="success">Changes saved.</Alert>
      <Alert variant="inline" tone="success">
        Saved.
      </Alert>
    </div>
  );
}

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: { title: 'Lorem ipsum', children: 'Lorem ipsum dolor sit amet.' },
  parameters: {
    docs: {
      description: {
        component:
          'Display info, success, warning or danger messages. Use tone="neutral" for neutral messages and variant="inline" for brief feedback within content. action accepts a button or link supplied by the application.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Variants: Story = { tags: ['variants'], render: () => <Demo /> };

export const Inline: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-xl gap-3">
      <Alert variant="inline" tone="neutral">
        Lorem ipsum dolor sit amet.
      </Alert>
      <Alert variant="inline" tone="info">
        Dolor sit amet.
      </Alert>
      <Alert variant="inline" tone="success">
        Saved.
      </Alert>
      <Alert variant="inline" tone="warning">
        Review the content.
      </Alert>
      <Alert variant="inline" tone="danger">
        Could not save the content.
      </Alert>
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Alert
      title="Lorem ipsum"
      className="max-w-lg rounded-panel"
      classNames={{
        icon: 'size-6 text-brand-700',
        title: 'uppercase',
        content: 'space-y-2',
      }}
    >
      Lorem ipsum dolor sit amet.
    </Alert>
  ),
};
