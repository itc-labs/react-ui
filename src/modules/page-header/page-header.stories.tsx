import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './index';
import { Breadcrumb } from '../../components/breadcrumb';
import { Button } from '../../components/button';
const meta = {
  title: 'Modules/PageHeader',
  component: PageHeader,
  parameters: {
    docs: {
      description: {
        component:
          'PageHeader là khối tiêu đề h1 của từng trang, có các slot breadcrumb, eyebrow, description và action. Dùng AppHeader cho thanh điều hướng chung của ứng dụng.',
      },
    },
  },
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

export const WithBreadcrumb: Story = {
  tags: ['example'],
  args: {
    breadcrumb: (
      <Breadcrumb
        items={[
          { key: 'home', title: 'Trang chủ', href: '/' },
          { key: 'current', title: 'Trang hiện tại' },
        ]}
      />
    ),
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <PageHeader
      title="Lorem ipsum"
      eyebrow="Example"
      description="Dolor sit amet."
      breadcrumb={<Breadcrumb items={[{ key: 'current', title: 'Trang hiện tại' }]} />}
      classNames={{
        breadcrumb: 'mb-3',
        root: 'rounded-panel bg-brand-50 p-6',
        title: 'text-heading text-brand-700',
        eyebrow: 'mb-2',
        description: 'mt-3 italic',
      }}
    />
  ),
};
