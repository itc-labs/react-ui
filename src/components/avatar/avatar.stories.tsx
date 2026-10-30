import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './index';
const image =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#dce8d6"/><circle cx="48" cy="35" r="16" fill="#365c45"/><path d="M16 96v-8a32 32 0 0 1 64 0v8" fill="#365c45"/></svg>',
  );
const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { alt: 'Lorem Ipsum' },
  parameters: {
    docs: {
      description: {
        component:
          'Display an image, initials when the image is missing or fails to load, and a loading state. Use Modules/AvatarUpload to let users choose an image.',
      },
    },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'], args: { src: image } };

export const Shapes: Story = {
  tags: ['variants'],
  name: 'Variants',
  render: () => (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar alt="Lorem Ipsum" src={image} shape="circle" size="lg" />
      <Avatar alt="Lorem Ipsum" src={image} shape="square" size="lg" />
      <Avatar alt="Lorem Ipsum" shape="square" />
      <Avatar alt="Lorem Ipsum" shape="square" loading />
    </div>
  ),
};

export const Sizes: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar alt="Lorem Ipsum" size="sm" />
      <Avatar alt="Lorem Ipsum" />
      <Avatar alt="Lorem Ipsum" size="lg" />
    </div>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar alt="Lorem Ipsum" size="lg" />
      <Avatar alt="Lorem Ipsum" fallback="AL" size="lg" />
      <Avatar alt="Lorem Ipsum" src="data:image/png;base64,broken" size="lg" />
      <Avatar alt="Lorem Ipsum" loading size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Missing or failed images show initials from alt. Provide fallback to customize the replacement content; loading shows a spinner.',
      },
    },
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Avatar
      alt="Lorem Ipsum"
      src={image}
      size="lg"
      className="border-4 border-brand-700"
      classNames={{ image: 'object-top', fallback: 'bg-brand-700 text-on-brand' }}
    />
  ),
};
