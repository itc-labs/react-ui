import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tabs, TabsList, TabsTrigger, TabsContent, type TabsProps } from './index';
import { Input } from '../input';
import { Button } from '../button';
import { Icon } from '../icon';

function Example({ variant = 'segmented', size = 'md', ...props }: TabsProps) {
  return (
    <Tabs
      variant={variant}
      size={size}
      {...props}
      label={props.label ?? `Ví dụ ${variant} ${size}`}
      items={
        props.items ?? [
          {
            value: 'summary',
            label: (
              <>
                <Icon name="folder" />
                Tổng quan
              </>
            ),
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          },
          {
            value: 'notes',
            label: (
              <>
                Ghi chú
                <span className="rounded-full bg-brand-100 px-1.5 text-ui-sm text-ink">
                  8
                </span>
              </>
            ),
            content:
              'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          },
          { value: 'future', label: 'Chưa khả dụng', content: null, disabled: true },
        ]
      }
    />
  );
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  render: (args: Parameters<typeof Example>[0]) => <Example {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          'Radix Tabs: 4 variants, 3 sizes, horizontal/vertical, automatic/manual activation. Mặc định mount khi mở lần đầu, giữ panel ẩn để bảo toàn draft/DOM. React vẫn có thể render khi props/state đổi; không cam kết zero render. keepMounted=false cho panel cần reset.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

function DraftPanel({ onMount }: { onMount: () => void }) {
  const [draft, setDraft] = useState('');
  const [count, setCount] = useState(0);

  useEffect(() => {
    onMount();
  }, [onMount]);

  return (
    <div className="grid max-w-lg gap-4">
      <Input
        label="Bản nháp"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button variant="secondary" onClick={() => setCount(count + 1)}>
        Tăng {count}
      </Button>
    </div>
  );
}

function RetentionDemo({ keepMounted = true }: { keepMounted?: boolean }) {
  const [mounts, setMounts] = useState(0);
  const [otherMounts, setOtherMounts] = useState(0);
  const record = useCallback(() => setMounts((count) => count + 1), []);
  const recordOther = useCallback(() => setOtherMounts((count) => count + 1), []);

  return (
    <div className="grid gap-4">
      <Tabs defaultValue="draft" keepMounted={keepMounted}>
        <TabsList aria-label="Giữ bản nháp">
          <TabsTrigger value="draft">Soạn thảo</TabsTrigger>
          <TabsTrigger value="other">Khác</TabsTrigger>
        </TabsList>
        <TabsContent value="draft">
          <DraftPanel onMount={record} />
        </TabsContent>
        <TabsContent value="other">
          <DraftPanel onMount={recordOther} />
        </TabsContent>
      </Tabs>
      <p className="text-ui-sm text-muted">
        Số lần mount: <span data-testid="draft-mounts">{mounts}</span> · panel Khác:{' '}
        <span data-testid="other-mounts">{otherMounts}</span>
      </p>
    </div>
  );
}

export const Playground: Story = {
  tags: ['usage'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: /Ghi chú/ }));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    );
  },
};

export const Variants: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid max-w-3xl gap-6">
      {(['segmented', 'underline', 'pills', 'outline'] as const).map((variant) => (
        <section key={variant} className="grid gap-2">
          <h3 className="text-ui-sm font-semibold text-muted">{variant}</h3>
          <Example variant={variant} />
        </section>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-8">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Example key={size} size={size} />
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  tags: ['example'],
  args: { variant: 'underline', orientation: 'vertical' },
};

export const PreservesDraft: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RetentionDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Bản nháp' });
    await expect(canvas.getByTestId('other-mounts')).toHaveTextContent('0');
    const mounts = canvas.getByTestId('draft-mounts').textContent;
    await userEvent.type(input, 'Lorem ipsum dolor sit amet.');
    await userEvent.click(canvas.getByRole('button', { name: 'Tăng 0' }));
    await userEvent.click(canvas.getByRole('tab', { name: 'Khác' }));
    await expect(input).not.toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: 'Soạn thảo' }));
    await expect(canvas.getByRole('textbox', { name: 'Bản nháp' })).toBe(input);
    await expect(input).toHaveValue('Lorem ipsum dolor sit amet.');
    await expect(canvas.getByRole('button', { name: 'Tăng 1' })).toBeVisible();
    await expect(canvas.getByTestId('draft-mounts')).toHaveTextContent(mounts ?? '');
  },
};

export const UnmountOnExit: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RetentionDemo keepMounted={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Bản nháp' }),
      'Reset khi rời tab',
    );
    await userEvent.click(canvas.getByRole('tab', { name: 'Khác' }));
    await userEvent.click(canvas.getByRole('tab', { name: 'Soạn thảo' }));
    await expect(canvas.getByRole('textbox', { name: 'Bản nháp' })).toHaveValue('');
  },
};

export const ManualActivation: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <Tabs defaultValue="one" activationMode="manual" variant="underline">
      <TabsList aria-label="Manual tabs">
        <TabsTrigger value="one">Một</TabsTrigger>
        <TabsTrigger value="two">Hai</TabsTrigger>
      </TabsList>
      <TabsContent value="one">Nội dung một</TabsContent>
      <TabsContent value="two">Nội dung hai</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Một' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Hai' })).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Nội dung một');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('tabpanel')).toHaveTextContent('Nội dung hai'),
    );
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Tabs
      className="max-w-xl"
      classNames={{
        list: 'rounded-full bg-brand-50',
        trigger: 'rounded-full',
        content: 'rounded-panel border-brand-700 bg-surface p-6',
      }}
      items={[
        { value: 'first', label: 'Phần một', content: 'Lorem ipsum dolor sit amet.' },
        { value: 'second', label: 'Phần hai', content: 'Consectetur adipiscing elit.' },
      ]}
    />
  ),
};
