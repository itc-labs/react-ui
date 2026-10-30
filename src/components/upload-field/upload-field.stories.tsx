import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { UploadField } from './index';
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
      <UploadField label="Loading" loading progress={45} />
      <UploadField
        label="Error"
        error="Could not upload the file. Try again to continue."
      />
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
