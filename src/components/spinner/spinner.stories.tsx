import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './index';

function Demo() {
  return (
    <div className="flex gap-3 text-muted">
      <Spinner label="Loading sample data" />
      Loading…
    </div>
  );
}

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { label: 'Loading' },
  parameters: {
    docs: {
      description: {
        component:
          'Indicates an operation in progress. label provides screen reader text; size controls the icon size.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Sizes: Story = { tags: ['example'], render: () => <Demo /> };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Spinner
      label="Loading"
      className="rounded-full bg-brand-50 p-3"
      classNames={{ icon: 'size-6 text-brand-700' }}
    />
  ),
};
