import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './index';
import { Button } from '../../components/button';
const meta = {
  title: 'Modules/PageHeader',
  component: PageHeader,
  args: {
    eyebrow: 'Example',
    title: 'Lorem ipsum dolor sit amet',
    description:
      'Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Playground', tags: ['example'] };

export const WithAction: Story = {
  tags: ['example'],
  args: { action: <Button>Thêm mục</Button> },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <PageHeader
      title="Lorem ipsum"
      eyebrow="Example"
      description="Dolor sit amet."
      classNames={{
        root: 'rounded-panel bg-brand-50 p-6',
        title: 'text-heading text-brand-700',
        eyebrow: 'mb-2',
        description: 'mt-3 italic',
      }}
    />
  ),
};
