import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@itclabs/react-ui';
import { Lightbox, type LightboxProps } from '@itclabs/react-ui/media-gallery';

const meta = {
  title: 'Modules/Lightbox',
  component: Lightbox,
  args: {
    items: [
      {
        id: 'first',
        src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect width="800" height="600" fill="%2394a3b8"/%3E%3C/svg%3E',
        alt: 'Lorem ipsum',
      },
      {
        id: 'second',
        src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Ccircle cx="400" cy="300" r="240" fill="%236b7280"/%3E%3C/svg%3E',
        alt: 'Dolor sit amet',
      },
    ],
  },
  render: function Render(args: LightboxProps) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open media viewer</Button>
        <Lightbox {...args} open={open} onOpenChange={setOpen} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        component:
          'View images and videos in a fullscreen dialog. Use arrow buttons, Left/Right keys or thumbnails to navigate. Zoom buttons and double-click magnify images; drag to pan. Escape closes the viewer and returns focus. open/onOpenChange and index/onIndexChange support controlled state; defaultOpen/defaultIndex initialize uncontrolled state. Import from @itclabs/react-ui/media-gallery.',
      },
    },
  },
} satisfies Meta<typeof Lightbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const SecondMedia: Story = { tags: ['example'], args: { defaultIndex: 1 } };
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'bg-canvas',
    classNames: {
      toolbar: 'gap-4',
      viewport: 'rounded-panel border border-line',
      thumbnail: 'rounded-full',
      counter: 'font-bold',
    },
  },
};
