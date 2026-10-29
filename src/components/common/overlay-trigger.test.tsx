import { MoreIcon } from '@itclabs/react-ui/icons/outline/more';
// @vitest-environment jsdom
import { act, createRef, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AlertDialog } from '../alert-dialog';
import { Avatar } from '../avatar';
import { Button } from '../button';
import { Dialog } from '../dialog';
import { Drawer } from '../drawer';
import { DropdownMenu } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import { Input } from '../input';
import { UiLink } from '../link-image-provider';
import { Popover } from '../popover';
import { Tooltip } from '../tooltip';
import { overlayTrigger } from './overlay-composition';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

it('uses one IconButton with its accessible name, handlers, ref and menu semantics', async () => {
  const ref = createRef<HTMLButtonElement>();
  const clicked = vi.fn();
  await act(async () =>
    root.render(
      <DropdownMenu
        trigger={
          <IconButton
            ref={ref}
            icon={MoreIcon}
            label="Row actions"
            onClick={clicked}
            className="bg-brand-50"
          />
        }
        classNames={{ trigger: 'rounded-full' }}
        items={[]}
        data-testid="actions"
      />,
    ),
  );
  const button = host.querySelector('button')!;
  expect(host.querySelectorAll('button')).toHaveLength(1);
  expect(button.getAttribute('aria-haspopup')).toBe('menu');
  expect(button.getAttribute('aria-label')).toBe('Row actions');
  expect(button.dataset.testid).toBe('actions-trigger');
  expect(button.classList.contains('rounded-full')).toBe(true);
  expect(button.classList.contains('bg-brand-50')).toBe(true);
  expect(ref.current).toBe(button);

  act(() => button.click());

  expect(clicked).toHaveBeenCalledOnce();
});

it('uses the same automatic trigger contract across all composed overlays', async () => {
  const trigger = <IconButton icon={MoreIcon} label="Actions" />;
  for (const overlay of [
    <Dialog title="Details" trigger={trigger} />,
    <Drawer title="Details" trigger={trigger} />,
    <AlertDialog title="Details" trigger={trigger} />,
    <Popover content="Details" trigger={trigger} />,
    <Tooltip content="Details" trigger={trigger} />,
  ]) {
    await act(async () => root.render(overlay));
    expect(host.querySelectorAll('button')).toHaveLength(1);
    expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('Actions');
  }
});

it('wraps Avatar in a generated button with triggerLabel', async () => {
  await act(async () =>
    root.render(
      <DropdownMenu
        trigger={<Avatar alt="Account" />}
        triggerLabel="Open account menu"
        items={[]}
      />,
    ),
  );
  expect(host.querySelectorAll('button')).toHaveLength(1);
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe(
    'Open account menu',
  );
  expect(host.querySelector('button')?.className).not.toContain('h-control-md');
});

it('automatically composes native and other marked controls', () => {
  for (const element of [
    <button />,
    <a href="#details" />,
    <Button>Open</Button>,
    <UiLink href="#details">Details</UiLink>,
    <Input />,
  ]) {
    expect(overlayTrigger(element).type).toBe(element.type);
  }
});

it('does not warn for wrapped interactive triggers in production', () => {
  vi.stubEnv('NODE_ENV', 'production');
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  overlayTrigger(<button />, undefined, { asChild: false });
  expect(warn).not.toHaveBeenCalled();
});

it('keeps explicit true for custom controls and false wrapping, warning only once in development', async () => {
  function CustomControl(props: ComponentProps<'button'>) {
    return <button {...props} />;
  }

  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.stubEnv('NODE_ENV', 'development');
  const wrapped = overlayTrigger(<button aria-label="Custom" />, undefined, {
    asChild: false,
  });
  expect(wrapped).toMatchObject({
    type: 'button',
    props: { children: { type: 'button' } },
  });
  overlayTrigger(<IconButton icon={MoreIcon} label="Actions" />, undefined, {
    asChild: false,
  });
  expect(warn).toHaveBeenCalledOnce();
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('wraps an interactive element'),
  );
  await act(async () =>
    root.render(
      <DropdownMenu
        trigger={<a href="#details">Details</a>}
        triggerAsChild={false}
        items={[]}
      />,
    ),
  );
  expect(host.querySelector('button > a')?.textContent).toBe('Details');
  expect(host.querySelector('button')?.getAttribute('aria-haspopup')).toBe('menu');
  expect(warn).toHaveBeenCalledOnce();
  const ref = createRef<HTMLButtonElement>();
  await act(async () =>
    root.render(
      <DropdownMenu
        trigger={<CustomControl ref={ref} aria-label="Custom actions" />}
        triggerAsChild
        items={[]}
      />,
    ),
  );
  expect(host.querySelectorAll('button')).toHaveLength(1);
  expect(ref.current).toBe(host.querySelector('button'));
  expect(ref.current?.getAttribute('aria-haspopup')).toBe('menu');
});
