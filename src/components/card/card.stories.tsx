import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './index';
import { Tag } from '../tag';
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'Group content in a section with title, description, action and footer slots. Data fetching and application logic belong in the application.',
      },
    },
  },
  title: 'Components/Card',
  component: Card,
  args: {
    title: 'Lorem ipsum',
    description: 'Dolor sit amet, consectetur adipiscing elit.',
    children: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const WithSlots: Story = {
  tags: ['example'],
  args: {
    action: <Tag tone="brand">Lorem ipsum</Tag>,
    footer: 'Ut enim ad minim veniam.',
  },
};

export const Composition: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-3xl gap-5 md:grid-cols-2">
      <Card
        title="Lorem ipsum"
        description="Dolor sit amet"
        footer="Ut enim ad minim veniam."
      >
        <p>
          Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
          dolore magna aliqua.
        </p>
      </Card>
      <Card title="Duis aute irure" action={<Tag tone="warning">Dolor sit amet</Tag>}>
        <p>
          Dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </p>
      </Card>
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Card
      title="Lorem ipsum"
      description="Dolor sit amet."
      footer="Consectetur adipiscing."
      className="max-w-lg rounded-none"
      classNames={{
        header: 'border-b border-line pb-4',
        title: 'text-brand-700',
        content: 'text-ink',
        footer: 'bg-canvas p-3',
      }}
    >
      Sed do eiusmod tempor incididunt.
    </Card>
  ),
};
