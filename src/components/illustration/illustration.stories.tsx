import type { Meta, StoryObj } from '@storybook/react-vite';
import { Illustration } from './index';

const meta = {
  title: 'Components/Illustration',
  component: Illustration,
  tags: ['autodocs'],
  args: { name: 'empty', className: 'max-w-64' },
} satisfies Meta<typeof Illustration>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Gallery: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      {(['empty', 'no-results', 'not-found', 'error', 'forbidden'] as const).map(
        (name) => (
          <figure key={name} className="text-center">
            <Illustration name={name} className="max-w-64" />
            <figcaption>{name}</figcaption>
          </figure>
        ),
      )}
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    name: 'no-results',
    className: 'max-w-48 rounded-panel bg-brand-50 p-4 text-brand-700',
  },
};
