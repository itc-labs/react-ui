import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  LinkImageProvider,
  UiLink,
  UiImage,
  type UiLinkProps,
  type UiImageProps,
} from './index';

const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#e1e9d7"/><circle cx="160" cy="90" r="45" fill="#365c42"/></svg>')}`;
const meta = {
  title: 'Components/LinkImageProvider',
  component: LinkImageProvider,
  subcomponents: { UiLink, UiImage },
  parameters: {
    docs: {
      description: {
        component:
          'UiLink and UiImage preserve native props, refs and className, and render as a/img by default. Supply Link/Image adapters through LinkImageProvider to use your app router or image optimizer. Nested providers inherit adapters they do not override.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = {
  tags: ['usage'],
  render: () => (
    <div className="grid max-w-sm gap-4">
      <UiLink href="#image-example" className="text-brand-700 underline">
        View example image
      </UiLink>
      <UiImage
        id="image-example"
        src={image}
        alt="A green circle on a light green background"
        width={320}
        height={180}
      />
    </div>
  ),
};

function ProjectLink(props: UiLinkProps) {
  return <a {...props} data-adapter="project-link" />;
}

function ProjectImage(props: UiImageProps) {
  return <img {...props} data-adapter="project-image" />;
}

export const CustomAdapters: Story = {
  tags: ['example'],
  render: () => (
    <LinkImageProvider Link={ProjectLink} Image={ProjectImage}>
      <div className="grid max-w-sm gap-4">
        <UiLink href="#custom-image" className="text-brand-700 underline">
          View image through adapter
        </UiLink>
        <UiImage
          id="custom-image"
          src={image}
          alt="A green circle on a light green background"
          width={320}
          height={180}
        />
      </div>
    </LinkImageProvider>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <div className="grid max-w-sm justify-items-start gap-4">
      <UiLink
        href="#styled-image"
        className="rounded-full bg-brand-700 px-4 py-2 text-on-brand"
      >
        View image
      </UiLink>
      <UiImage
        id="styled-image"
        src={image}
        alt="A green circle on a light green background"
        width={320}
        height={180}
        className="rounded-panel border-4 border-brand-700"
      />
    </div>
  ),
};
