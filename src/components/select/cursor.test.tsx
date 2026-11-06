// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { userEvent, within } from 'storybook/test';
import { Select } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('overrides the engine default cursor on options and keeps disabled options unavailable', async () => {
  Element.prototype.scrollIntoView = vi.fn();
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const change = vi.fn();
  try {
    act(() =>
      root.render(
        <Select
          label="Category"
          onValueChange={change}
          options={[
            { value: 'one', label: 'Available' },
            { value: 'two', label: 'Unavailable', disabled: true },
          ]}
        />,
      ),
    );

    await act(async () => {
      await userEvent.click(within(host).getByRole('combobox'));
    });
    const enabled = within(document.body).getByRole('option', {
      name: /^Available$/,
    });
    const disabled = within(document.body).getByRole('option', {
      name: /^Unavailable$/,
    });
    expect(getComputedStyle(enabled).cursor).toBe('pointer');
    expect(getComputedStyle(disabled).cursor).toBe('not-allowed');
    await act(async () => {
      await userEvent.click(disabled);
    });
    expect(change).not.toHaveBeenCalled();
    await act(async () => {
      await userEvent.click(enabled);
    });
    expect(change).toHaveBeenCalledExactlyOnceWith('one');
  } finally {
    act(() => root.unmount());

    host.remove();
  }
});
