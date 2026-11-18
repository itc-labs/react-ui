// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { InputOTP } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('shows a default value without the controlled and uncontrolled warning', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});

  await act(async () => root.render(<InputOTP label="Code" defaultValue="123456" />));

  expect(host.querySelector('input')!.value).toBe('123456');
  expect(host.querySelector('input')!.hasAttribute('defaultvalue')).toBe(false);
  expect(error).not.toHaveBeenCalled();
});

it('keeps a controlled value from the host', async () => {
  await act(async () => root.render(<InputOTP label="Code" value="42" />));

  expect(host.querySelector('input')!.value).toBe('42');
});
