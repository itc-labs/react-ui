// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { UploadField, type UploadFieldProps } from './index';

function render(props: UploadFieldProps = {}, locale = 'en-US') {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UILocaleProvider locale={locale}>
      <UploadField data-testid="upload" {...props} />
    </UILocaleProvider>,
  );

  return host;
}

it.each([
  [0, 0],
  [45, 45],
  [100, 100],
  [-10, 0],
  [150, 100],
])(
  'renders kit progress for %s with a consistent value and label',
  (value, expected) => {
    const host = render({
      loading: true,
      progress: value,
      classNames: { progress: 'mt-2' },
    });
    const bar = host.querySelector('[data-testid="upload-progress"]')!;
    expect(bar.tagName).toBe('DIV');
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-label')).toBe('Upload progress');
    expect(bar.getAttribute('aria-valuenow')).toBe(String(expected));
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.classList.contains('mt-2')).toBe(true);
    const valueText = host.querySelector('[data-testid="upload-progress-value"]')!;
    expect(valueText.textContent).toBe(`${expected}%`);
    for (const name of ['text-ui-sm', 'text-muted', 'tabular-nums'])
      expect(valueText.classList.contains(name)).toBe(true);
    const track = host.querySelector('[data-testid="upload-progress-track"]')!;
    expect(track.classList.contains('h-1.5')).toBe(true);
    expect(track.classList.contains('bg-line')).toBe(true);
    expect(track.classList.contains('rounded-full')).toBe(true);
    const indicator = host.querySelector<HTMLElement>(
      '[data-testid="upload-progress-indicator"]',
    )!;
    expect(indicator.style.width).toBe(`${expected}%`);
    expect(indicator.classList.contains('bg-brand-700')).toBe(true);
    expect(indicator.classList.contains('motion-safe:transition-[width]')).toBe(true);
    expect(host.querySelector('progress')).toBeNull();
  },
);

it('shows indeterminate kit progress when loading without a value', () => {
  const host = render({ loading: true });
  const bar = host.querySelector('[role="progressbar"]')!;
  expect(bar.getAttribute('data-state')).toBe('indeterminate');
  expect(bar.hasAttribute('aria-valuenow')).toBe(false);
  expect(bar.getAttribute('aria-label')).toBe('Upload progress');
  expect(host.querySelector('[data-testid="upload-progress-value"]')?.textContent).toBe(
    'Loading',
  );
  expect(
    host
      .querySelector('[data-testid="upload-progress-indicator"]')
      ?.classList.contains('motion-safe:animate-table-loading'),
  ).toBe(true);
});

it('hides progress when idle and localizes the accessible name', () => {
  expect(render({ progress: 45 }).querySelector('[role="progressbar"]')).toBeNull();
  const host = render({ loading: true, progress: 45 }, 'vi-VN');
  expect(host.querySelector('[role="progressbar"]')?.getAttribute('aria-label')).toBe(
    'Tiến độ upload',
  );
});
