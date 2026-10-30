import type { Meta, StoryObj } from '@storybook/react-vite';
import { MediaGallery, type MediaGalleryProps } from '@itclabs/react-ui/media-gallery';

const placeholder = (background: string, foreground: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800" viewBox="0 0 640 800"><rect width="640" height="800" fill="${background}"/><circle cx="320" cy="320" r="160" fill="${foreground}"/><path d="M80 720L320 440L560 720Z" fill="${foreground}"/></svg>`)}`;

const first = placeholder('#e2e8f0', '#94a3b8');
const second = placeholder('#e7e5e4', '#a8a29e');
const third = placeholder('#d1d5db', '#6b7280');
const video =
  'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAARTbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAB9AAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAA310cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAB9AAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAKAAAAB4AAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAfQAAAIAAABAAAAAAL1bWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAAYABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAACoG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAmBzdGJsAAAAwHN0c2QAAAAAAAAAAQAAALBhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAKAAeABIAAAASAAAAAAAAAABFUxhdmM2Mi4yOC4xMDIgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAANmF2Y0MBZAAK/+EAGWdkAAqs2UKEflwEQAAAAwBAAAAGA8SJZYABAAZo6+PLIsD9+PgAAAAAEHBhc3AAAAABAAAAAQAAABRidHJ0AAAAAAAAETwAAAAAAAAAGHN0dHMAAAAAAAAAAQAAABgAAAQAAAAAFHN0c3MAAAAAAAAAAQAAAAEAAADIY3R0cwAAAAAAAAAXAAAAAQAACAAAAAABAAAUAAAAAAEAAAgAAAAAAQAAAAAAAAABAAAEAAAAAAEAABQAAAAAAQAACAAAAAABAAAAAAAAAAEAAAQAAAAAAQAAFAAAAAABAAAIAAAAAAEAAAAAAAAAAQAABAAAAAABAAAUAAAAAAEAAAgAAAAAAQAAAAAAAAABAAAEAAAAAAEAABQAAAAAAQAACAAAAAABAAAAAAAAAAEAAAQAAAAAAQAAEAAAAAACAAAEAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAGAAAAAEAAAB0c3RzegAAAAAAAAAAAAAAGAAAAusAAAAQAAAADQAAAA0AAAANAAAAFgAAAA8AAAANAAAADQAAABYAAAAPAAAADQAAAA0AAAAWAAAADwAAAA0AAAANAAAAFgAAAA8AAAANAAAADQAAABUAAAAPAAAADQAAABRzdGNvAAAAAAAAAAEAAASDAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY2Mi4xMi4xMDIAAAAIZnJlZQAABFdtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NSByMzIyMiBiMzU2MDVhIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTQgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEyIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAANWWIhAAR//7n4/wKZtsLD+djo51tdyoujXh1cYhTyC6u2OqN+Hdwy1OBQfXYESAAXsGusEUxAAAADEGaJGxBD/6qVQAfcAAAAAlBnkJ4hv8AWUEAAAAJAZ5hdEM/AGzAAAAACQGeY2pDPwBswQAAABJBmmhJqEFomUwIIf/+qlUAH3EAAAALQZ6GRREsN/8AWUEAAAAJAZ6ldEM/AGzBAAAACQGep2pDPwBswAAAABJBmqxJqEFsmUwIIf/+qlUAH3AAAAALQZ7KRRUsN/8AWUEAAAAJAZ7pdEM/AGzAAAAACQGe62pDPwBswAAAABJBmvBJqEFsmUwIIf/+qlUAH3EAAAALQZ8ORRUsN/8AWUEAAAAJAZ8tdEM/AGzBAAAACQGfL2pDPwBswAAAABJBmzRJqEFsmUwIf//+qZYAesAAAAALQZ9SRRUsN/8AWUEAAAAJAZ9xdEM/AGzAAAAACQGfc2pDPwBswAAAABFBm3dJqEFsmUwIZ//+nhADtwAAAAtBn5VFFSw3/wBZQAAAAAkBn7ZqQz8AbME=';

const meta = {
  title: 'Modules/MediaGallery',
  component: MediaGallery,
  args: {
    items: [
      { id: 'first', src: first, alt: 'Lorem ipsum', width: 640, height: 800 },
      { id: 'second', src: second, alt: 'Dolor sit amet', width: 640, height: 800 },
      {
        id: 'video',
        type: 'video',
        src: video,
        poster: third,
        thumbnail: third,
        alt: 'Consectetur adipiscing',
        width: 160,
        height: 120,
      },
    ],
    thumbnails: 'left',
    className: 'max-w-2xl',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Browse images and native video with swipe gestures, arrow controls, and a thumbnail strip. Import from @itclabs/react-ui/media-gallery. Omit thumbnails for left placement on desktop and bottom placement on small screens. index/defaultIndex and onIndexChange use zero-based indices; out-of-range indices are clamped. Images use the host image adapter. Leaving a video pauses it. Hovering an image with a fine mouse pointer magnifies it; zoom and zoomScale configure this behavior. Click or press Enter to open the fullscreen lightbox. Set lightbox=false for a host-owned view; onOpen receives the activated index. classNames exposes root, main, slide, media, thumbnails, thumbnail, and video slots. Part test IDs use stable item IDs.',
      },
    },
  },
} satisfies Meta<typeof MediaGallery>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const BottomThumbnails: Story = {
  tags: ['example'],
  args: { thumbnails: 'bottom' },
};

export const AspectRatios: Story = {
  tags: ['variants'],
  render: (args: MediaGalleryProps) => (
    <div className="grid gap-6 sm:grid-cols-2">
      <MediaGallery
        {...args}
        thumbnails="bottom"
        aspectRatio="1 / 1"
        aria-label="Square media"
      />
      <MediaGallery
        {...args}
        thumbnails="bottom"
        aspectRatio="3 / 4"
        aria-label="Portrait media"
      />
    </div>
  ),
};

export const ZoomAndLightbox: Story = {
  tags: ['example'],
  args: { zoom: true, zoomScale: 2.5, lightbox: true },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'max-w-2xl rounded-panel border border-line p-4',
    classNames: {
      root: 'bg-surface',
      main: 'rounded-panel',
      slide: 'rounded-none bg-selected',
      media: 'object-cover',
      thumbnails: 'gap-3',
      thumbnail: 'rounded-full',
      video: 'rounded-panel',
    },
  },
};
