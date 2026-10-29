import { toast } from '@itclabs/react-ui/toast';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastProvider, useToast, type ToastPosition } from './index';
import { Button } from '../button';
import { Select } from '../select';

function Trigger() {
  const notify = useToast();

  return (
    <Button
      onClick={() =>
        notify.success({ title: 'Đã lưu', description: 'Lorem ipsum dolor sit amet.' })
      }
    >
      Hiện thông báo
    </Button>
  );
}

function Demo() {
  return (
    <ToastProvider client={null}>
      <Trigger />
    </ToastProvider>
  );
}

const meta = {
  title: 'Components/Toast',
  tags: ['!autodocs'],
  component: ToastProvider,
  render: () => <Demo />,
  parameters: {
    docs: {
      description: {
        component:
          'Đặt ToastProvider một lần ở gốc ứng dụng. Gọi toast.success/error/warning/info để hiển thị thông báo; toast.promise theo dõi tác vụ bất đồng bộ. Thông báo hỗ trợ cập nhật, đóng, xếp hàng và tạm dừng bộ đếm khi hover.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof Demo>;

function VariantsTrigger() {
  const notify = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          notify.info({
            title: 'Info',
            description: 'Lorem ipsum dolor sit amet.',
          })
        }
      >
        Info
      </Button>
      <Button
        onClick={() =>
          notify.success({
            title: 'Đã lưu',
            description: 'Lorem ipsum dolor sit amet.',
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          notify.warning({
            title: 'Cần kiểm tra',
            description: 'Lorem ipsum dolor sit amet.',
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="danger"
        onClick={() =>
          notify.error({
            title: 'Không thể lưu',
            description: 'Lorem ipsum dolor sit amet.',
          })
        }
      >
        Error
      </Button>
    </div>
  );
}

function DuplicateTrigger() {
  const notify = useToast();

  return (
    <Button
      onClick={() =>
        notify({ id: 'same-save', title: 'Một thông báo duy nhất', tone: 'info' })
      }
    >
      Gửi lại cùng ID
    </Button>
  );
}

function LoadingTrigger() {
  const notify = useToast();
  const [id, setId] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          setId(
            notify.loading({
              id: 'loading-demo',
              title: 'Đang xử lý',
              description: 'Lorem ipsum dolor sit amet.',
            }),
          )
        }
      >
        Bắt đầu loading
      </Button>
      <Button
        disabled={!id}
        onClick={() => {
          if (id)
            notify.update(id, {
              loading: false,
              tone: 'success',
              title: 'Đã hoàn tất',
            });
        }}
      >
        Hoàn tất
      </Button>
      <Button
        variant="secondary"
        disabled={!id}
        onClick={() => {
          if (id) notify.dismiss(id);
          setId(null);
        }}
      >
        Đóng toast
      </Button>
    </div>
  );
}

function PromiseTrigger() {
  const notify = useToast();

  function run(fail: boolean) {
    void notify
      .promise(
        () =>
          new Promise<string>((resolve, reject) => {
            setTimeout(
              () => (fail ? reject(new Error('Synthetic failure')) : resolve('saved')),
              1200,
            );
          }),
        {
          loading: {
            id: 'promise-demo',
            title: 'Đang lưu',
            description: 'Lorem ipsum dolor sit amet.',
          },
          success: { title: 'Đã lưu', description: 'Lorem ipsum dolor sit amet.' },
          error: { title: 'Không thể lưu', description: 'Thử lại bằng nút bên dưới.' },
        },
      )
      .catch(() => {});
  }

  return (
    <div className="flex gap-3">
      <Button onClick={() => run(false)}>Promise thành công</Button>
      <Button variant="danger" onClick={() => run(true)}>
        Promise thất bại
      </Button>
    </div>
  );
}

function QueueTrigger() {
  const notify = useToast();
  const counter = useRef(0);

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() => {
          for (let index = 0; index < 5; index++)
            notify({
              title: `Thông báo ${++counter.current}`,
              description: 'Lorem ipsum dolor sit amet.',
            });
        }}
      >
        Thêm 5 thông báo
      </Button>
      <Button variant="secondary" onClick={() => notify.clearQueue()}>
        Xóa hàng chờ
      </Button>
      <Button variant="secondary" onClick={() => notify.dismiss()}>
        Đóng tất cả
      </Button>
    </div>
  );
}

function PositionsDemo() {
  const [position, setPosition] = useState<ToastPosition>('bottom-right');
  const positions: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  return (
    <ToastProvider client={null} position={position}>
      <div className="grid max-w-sm gap-4">
        <Select
          label="Vị trí cho thông báo mới"
          clearable={false}
          value={position}
          options={positions.map((value) => ({ value, label: value }))}
          onValueChange={(value) => {
            if (value) setPosition(value as ToastPosition);
          }}
        />
        <Trigger />
      </div>
    </ToastProvider>
  );
}

function reportFailure() {
  toast.error('Không thể lưu', { description: 'Lorem ipsum dolor sit amet.' });
}

function PureFunctionTrigger() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="danger" onClick={reportFailure}>
        toast.error
      </Button>
      <Button
        onClick={() =>
          toast.info('Thông báo', { description: 'Lorem ipsum dolor sit amet.' })
        }
      >
        toast.info
      </Button>
      <Button
        onClick={() =>
          toast.warning('Cần kiểm tra', { description: 'Lorem ipsum dolor sit amet.' })
        }
      >
        toast.warning
      </Button>
      <Button
        onClick={() =>
          toast.success('Đã lưu', { description: 'Lorem ipsum dolor sit amet.' })
        }
      >
        toast.success
      </Button>
    </div>
  );
}

export const Playground: Story = { tags: ['usage'] };

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Info dùng màu info-700 cho icon và viền. Các tone giữ nền surface; spinner khi loading dùng màu trung tính.',
      },
    },
  },
  tags: ['variants'],
  render: () => (
    <ToastProvider client={null}>
      <VariantsTrigger />
    </ToastProvider>
  ),
};

export const LoadingAndUpdate: Story = {
  tags: ['example'],
  render: () => (
    <ToastProvider client={null}>
      <LoadingTrigger />
    </ToastProvider>
  ),
};

export const Positions: Story = { tags: ['example'], render: () => <PositionsDemo /> };

export const PureFunction: Story = {
  tags: ['example'],
  render: () => (
    <ToastProvider>
      <PureFunctionTrigger />
    </ToastProvider>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <ToastProvider
      client={null}
      className="left-4 right-auto"
      classNames={{
        toast: 'rounded-none border-brand-700 bg-brand-50',
        title: 'text-brand-800',
        close: 'rounded-full',
        description: 'italic',
      }}
    >
      <Trigger />
    </ToastProvider>
  ),
};

export const Dismissal: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Hiện thông báo' }),
    );
    await expect(await body.findByText('Đã lưu')).toBeVisible();
    await userEvent.click(body.getByRole('button', { name: 'Đóng thông báo' }));
    await waitFor(() => expect(body.queryByText('Đã lưu')).not.toBeInTheDocument());
  },
};

export const Deduplicated: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null}>
      <DuplicateTrigger />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Gửi lại cùng ID',
    });
    const body = within(document.body);
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    await expect(body.getAllByText('Một thông báo duy nhất')).toHaveLength(1);
    await userEvent.click(body.getByRole('button', { name: 'Đóng thông báo' }));
  },
};

export const AutoDismiss: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null} duration={1000}>
      <Trigger />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Hiện thông báo' }),
    );
    await expect(await body.findByText('Đã lưu')).toBeVisible();
    await waitFor(() => expect(body.queryByText('Đã lưu')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
  },
};

export const PauseOnHover: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null} duration={800}>
      <Trigger />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Hiện thông báo' }),
    );
    const title = await body.findByText('Đã lưu');
    const toast = title.closest('.Toastify__toast');
    if (!toast) throw new Error('Missing toast root.');
    await userEvent.hover(toast);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(title).toBeVisible();
    await userEvent.unhover(toast);
    await waitFor(() => expect(body.queryByText('Đã lưu')).not.toBeInTheDocument(), {
      timeout: 2500,
    });
  },
};

export const PromiseLifecycle: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null}>
      <PromiseTrigger />
    </ToastProvider>
  ),
};

export const Queue: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <ToastProvider client={null} maxVisible={2} duration={false}>
      <QueueTrigger />
    </ToastProvider>
  ),
};
