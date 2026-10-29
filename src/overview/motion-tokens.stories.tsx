import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '../components';

const groups = {
  Duration: [
    '--motion-duration-control',
    '--motion-duration-fast',
    '--motion-duration-normal',
    '--motion-duration-slow',
    '--motion-duration-exit',
    '--motion-duration-instant-exit',
    '--motion-duration-loading',
    '--motion-duration-spin',
    '--motion-duration-pulse',
  ],
  Easing: [
    '--motion-ease-enter',
    '--motion-ease-exit',
    '--motion-ease-standard',
    '--motion-ease-loop',
  ],
  Controls: ['--spacing-control-sm', '--spacing-control-md', '--spacing-control-lg'],
  Overlays: ['--container-dialog', '--container-drawer', '--container-popover'],
  Shadows: ['--shadow-panel', '--shadow-floating', '--shadow-overlay'],
  Focus: ['--shadow-control-focus', '--shadow-control-error'],
  Layers: [
    '--z-index-dropdown',
    '--z-index-header',
    '--z-index-overlay',
    '--z-index-modal',
    '--z-index-popover',
    '--z-index-select',
    '--z-index-tooltip',
    '--z-index-toast',
  ],
};

function ElevationPreview() {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-section font-semibold text-ink">Elevation</h2>
        <p className="mt-2 text-control text-muted">
          Shadow phân biệt độ nổi của bề mặt; z-index quyết định thứ tự xếp lớp.
        </p>
      </div>
      <div className="grid gap-6 rounded-panel bg-canvas p-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Flat', token: 'none', usage: 'Nền trang', shadow: 'shadow-none' },
          {
            name: 'Panel',
            token: '--shadow-panel',
            usage: 'Card · Table',
            shadow: 'shadow-panel',
          },
          {
            name: 'Floating',
            token: '--shadow-floating',
            usage: 'Select · Popover · Menu · Toast',
            shadow: 'shadow-floating',
          },
          {
            name: 'Overlay',
            token: '--shadow-overlay',
            usage: 'Dialog · Drawer',
            shadow: 'shadow-overlay',
          },
        ].map((item) => (
          <div key={item.name} className="grid gap-3">
            <div
              className={`flex min-h-32 items-center justify-center rounded-panel border border-line bg-surface px-4 text-control font-medium text-ink ${item.shadow}`}
            >
              {item.name}
            </div>
            <code className="text-ui-sm text-muted">{item.token}</code>
            <p className="text-ui-sm text-muted">{item.usage}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-3 rounded-panel border border-line bg-surface p-6">
          <h3 className="text-control font-semibold">Focus ring</h3>
          <div className="rounded-control border border-brand-700 bg-surface px-3 py-2 text-control shadow-control-focus">
            Lorem ipsum
          </div>
          <code className="text-ui-sm text-muted">--shadow-control-focus</code>
        </div>
        <div className="grid gap-3 rounded-panel border border-line bg-surface p-6">
          <h3 className="text-control font-semibold">Error focus ring</h3>
          <div className="rounded-control border border-danger-700 bg-surface px-3 py-2 text-control shadow-control-error">
            Lorem ipsum
          </div>
          <code className="text-ui-sm text-muted">--shadow-control-error</code>
        </div>
      </div>
    </div>
  );
}

function Demo() {
  const [values, setValues] = useState<Record<string, string>>({});
  const readTokens = useCallback(() => {
    const styles = getComputedStyle(document.documentElement);
    setValues(
      Object.fromEntries(
        Object.values(groups)
          .flat()
          .map((name) => [name, styles.getPropertyValue(name).trim()]),
      ),
    );
  }, []);
  useEffect(readTokens, [readTokens]);

  return (
    <div className="grid max-w-5xl gap-6">
      <p className="text-control text-muted">
        Giá trị đọc từ CSS theme đang chạy, không phải bảng số sao chép. Đổi token trong
        theme để áp dụng toàn bộ kit.
      </p>
      <div className="flex gap-3">
        <Button size="sm" variant="ghost" onClick={readTokens}>
          Đọc lại token
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Thử dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Motion chung</DialogTitle>
            <DialogDescription>
              Fade nhẹ, giữ nguyên hệ tọa độ cho menu Select.
            </DialogDescription>
          </DialogContent>
        </Dialog>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="secondary" size="sm">
              Thử drawer
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Motion drawer</DrawerTitle>
            <DrawerDescription>
              Trượt từ cạnh; đóng xong mới unmount. Reduced motion tắt animation.
            </DrawerDescription>
          </DrawerContent>
        </Drawer>
      </div>
      <ElevationPreview />
      <div className="grid gap-5 md:grid-cols-2">
        {Object.entries(groups).map(([group, names]) => (
          <section
            key={group}
            className="overflow-hidden rounded-panel border border-line bg-surface"
          >
            <h3 className="border-b border-line px-4 py-3 text-control font-semibold">
              {group}
            </h3>
            <dl className="divide-y divide-line">
              {names.map((name) => (
                <div key={name} className="grid gap-1 px-4 py-2 text-ui-sm">
                  <dt className="font-mono text-muted">{name}</dt>
                  <dd className="font-medium text-ink">{values[name] || '…'}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}

const meta = { title: 'Foundations/Motion & layers', component: Demo } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const TokenReference: Story = {};

export const Elevation: Story = {
  render: () => (
    <div className="max-w-5xl">
      <ElevationPreview />
    </div>
  ),
};
