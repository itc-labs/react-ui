import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { UploadField } from './index';
import { useState } from 'react';
import { StarIcon } from '../icon/outline/star';
const meta = {
  title: 'Components/UploadField',
  component: UploadField,
  args: {
    label: 'Attachments',
    accept: '.txt,.pdf',
    hint: 'TXT or PDF, up to 10 MB.',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Select or drop files, preview them, and remove them from the list. onValueChange returns the selected File objects; the application supplies loading, progress, and error states.',
      },
    },
  },
} satisfies Meta<typeof UploadField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <UploadField label="Ready" />
      <UploadField label="Disabled" disabled />
      <UploadField label="Starting upload" loading progress={0} />
      <UploadField label="Loading" loading progress={45} />
      <UploadField label="Upload complete" loading progress={100} />
      <UploadField label="Indeterminate" loading />
      <UploadField
        label="Error"
        error="Could not upload the file. Try again to continue."
      />
    </div>
  ),
};

export const Loading: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
      {[0, 45, 100].map((progress) => (
        <UploadField
          key={progress}
          label={`Uploading (${progress}%)`}
          loading
          progress={progress}
        />
      ))}
      <UploadField label="Indeterminate" loading />
    </div>
  ),
};

export const Multiple: Story = {
  tags: ['example'],
  args: { multiple: true, maxFiles: 3 },
};

export const Preview: Story = {
  tags: ['example'],
  args: {
    accept: 'image/png,image/jpeg,image/webp,.txt',
    hint: 'Choose an image or TXT file, then click its thumbnail to preview.',
  },
};

/** items are controlled; onValueChange emits new files, without saved items. */
export const Gallery: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-6">
      <UploadField variant="gallery" label="Empty gallery" accept="image/*" />
      <UploadField
        variant="gallery"
        label="Images"
        accept="image/*"
        items={[
          {
            id: 'first',
            src: 'https://picsum.photos/seed/gallery/300',
            alt: 'Lorem ipsum',
            badge: (
              <span className="rounded-control bg-surface px-2 text-ui-sm">Cover</span>
            ),
          },
          {
            id: 'starting',
            src: 'https://picsum.photos/seed/starting/300',
            alt: 'Starting upload',
            status: 'uploading',
            progress: 0,
          },
          {
            id: 'complete',
            src: 'https://picsum.photos/seed/complete/300',
            alt: 'Finishing upload',
            status: 'uploading',
            progress: 100,
          },
          {
            id: 'uploading',
            src: 'https://picsum.photos/seed/upload/300',
            alt: 'Dolor sit amet',
            status: 'uploading',
            progress: 45,
          },
          {
            id: 'error',
            src: 'https://picsum.photos/seed/error/300',
            alt: 'Consectetur',
            status: 'error',
            error:
              'The connection was interrupted while uploading this image. Check your network connection and retry. Your other images have been saved.',
          },
        ]}
        onItemRemove={() => {}}
        onItemRetry={() => {}}
      />
      <UploadField
        variant="gallery"
        label="Maximum reached"
        maxFiles={1}
        items={[
          {
            id: 'saved',
            src: 'https://picsum.photos/seed/saved/300',
            alt: 'Lorem ipsum',
          },
        ]}
        onItemRemove={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'items là danh sách ảnh do ứng dụng quản lý. onValueChange chỉ trả về file mới; value và defaultValue không dùng trong gallery. maxFiles tính cả items và file mới. multiple mặc định là true cho gallery.',
      },
    },
  },
};

export const GalleryThumbnail: Story = {
  tags: ['example'],
  render: function GalleryThumbnailExample() {
    const [thumbnailId, setThumbnailId] = useState('front');

    return (
      <UploadField
        variant="gallery"
        label="Product images"
        accept="image/*"
        items={['front', 'back', 'detail'].map((id) => ({
          id,
          src: `https://picsum.photos/seed/product-${id}/300`,
          alt: `Product ${id}`,
          selected: id === thumbnailId,
          badge:
            id === thumbnailId ? (
              <span className="rounded-control bg-surface px-2 text-ui-sm">
                Thumbnail
              </span>
            ) : null,
          actions: [
            {
              id: 'thumbnail',
              label: 'Set as thumbnail',
              icon: StarIcon,
              disabled: id === thumbnailId,
              onSelect: () => setThumbnailId(id),
            },
          ],
        }))}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Per-item actions appear before preview/remove on idle tiles and use label tooltips plus accessible names that include the image alt. The app controls selected and badge independently; selecting a thumbnail here moves both.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = await canvas.findByRole('button', {
      name: 'Set as thumbnail Product back',
    });
    action.focus();
    await userEvent.keyboard('{Enter}');
    await expect(action).toBeDisabled();
    await expect(action.closest('li')).toHaveAttribute('aria-current', 'true');
    await expect(
      canvas.getByRole('button', { name: 'Set as thumbnail Product front' }),
    ).toBeEnabled();
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <UploadField
      label="Attachments"
      hint="PNG, JPG or TXT."
      accept="image/png,image/jpeg,.txt"
      classNames={{
        root: 'max-w-lg',
        label: 'font-bold text-brand-700',
        dropzone: 'rounded-panel border-solid bg-brand-50 p-6',
        trigger: 'rounded-full',
        file: 'rounded-control border border-line bg-surface p-2',
        previewTrigger: 'size-20',
        thumbnail: 'object-contain',
        previewContent: 'max-w-xl',
        hint: 'italic',
      }}
    />
  ),
};

export const SelectRemoveAndReject: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(
      input,
      new File(['Lorem ipsum'], 'example.txt', { type: 'text/plain' }),
    );
    await expect(canvas.getByText(/example.txt/)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove example.txt' }));
    await expect(canvas.queryByText(/example.txt/)).not.toBeInTheDocument();
    await userEvent
      .setup({ applyAccept: false })
      .upload(
        input,
        new File(['invalid'], 'image.exe', { type: 'application/octet-stream' }),
      );
    await expect(canvas.getByRole('alert')).toHaveTextContent('unsupported type');
  },
};

export const TextPreview: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body),
      input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(
      input,
      new File(['Lorem ipsum dolor sit amet.'], 'example.txt', { type: 'text/plain' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Preview example.txt' }));
    await expect(await body.findByText('Lorem ipsum dolor sit amet.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const ImagePreview: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { accept: 'image/png,image/jpeg,image/webp', hint: 'PNG, JPEG or WebP.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body),
      input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const png = Uint8Array.from(
      atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHioAAAAASUVORK5CYII=',
      ),
      (char) => char.charCodeAt(0),
    );
    await userEvent.upload(
      input,
      new File([png], 'example.png', { type: 'image/png' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Preview example.png' }));
    const preview = await body.findByRole('img', { name: 'example.png' });
    await waitFor(() => expect(preview).toBeVisible());
  },
};
