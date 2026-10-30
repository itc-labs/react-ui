// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Icon, defineIconPack, type IconGlyph, type IconProps } from './index';
import { KitIcon } from './kit-icon';
import { CloseIcon } from './outline/close';
import { CloseIcon as CloseBoldIcon } from './bold/close';
import { IconButton } from '../icon-button';
import { KitIconButton } from '../icon-button/kit-icon-button';
import { isInteractiveTrigger } from '../common/interactive-trigger';
import { defineTheme } from '../../theme';
import { UIProvider } from '../../theme/provider';

const builtin = { outline: CloseIcon, bold: CloseBoldIcon };

const Custom: IconGlyph = (props) => <svg data-custom="true" {...props} />;

it('matches public Icon resolution for overrides, packs, variants, and fallback glyphs', () => {
  const project = defineIconPack('project', { close: Custom });
  const themes = [
    {},
    { variant: 'bold' as const },
    { overrides: { close: Custom }, size: 28, strokeWidth: 2.5 },
    { defaultPack: 'project', packs: { project } },
    {
      variant: 'bold' as const,
      defaultPack: 'project',
      packs: { project: defineIconPack('project', {}) },
    },
    {
      packs: { outline: defineIconPack('outline', { close: Custom }) },
      overrides: { close: CloseBoldIcon },
    },
  ];
  const cases: IconProps<string>[] = [
    { name: 'close' },
    { name: 'close', variant: 'outline' },
    { name: 'close', variant: 'bold' },
    { name: 'close', pack: 'outline' },
    { name: 'close', pack: project },
    { name: 'close', pack: defineIconPack('empty', {}) },
    { glyph: Custom },
  ];
  for (const icons of themes) {
    for (const props of cases) {
      const render = (narrow: boolean) =>
        renderToStaticMarkup(
          <UIProvider theme={defineTheme({ icons })}>
            {narrow ? (
              <KitIcon {...props} builtin={builtin} label="Close" data-testid="icon" />
            ) : (
              <Icon {...props} label="Close" data-testid="icon" />
            )}
          </UIProvider>,
        );

      expect(render(true)).toBe(render(false));
    }
  }
  expect(() =>
    renderToStaticMarkup(<KitIcon name="close" builtin={builtin} pack="missing" />),
  ).toThrow('Unknown icon pack: missing');
  const missing = { glyph: undefined } as unknown as IconProps;

  const error = (narrow: boolean) => {
    try {
      renderToStaticMarkup(
        narrow ? <KitIcon {...missing} builtin={builtin} /> : <Icon {...missing} />,
      );
    } catch (error) {
      return (error as Error).message;
    }
  };

  expect(error(true)).toBe(error(false));
  expect(error(true)).toContain('Unregistered icon');
});

it('preserves IconButton markup, loading, badges, and trigger opt-in', () => {
  for (const loading of [false, true]) {
    const props = {
      icon: 'close' as const,
      label: 'Close',
      badge: 3,
      loading,
      iconVariant: 'bold' as const,
      'data-testid': 'close',
      classNames: { root: 'root-slot' },
      iconClassName: 'icon-slot',
    };
    expect(renderToStaticMarkup(<KitIconButton {...props} builtin={builtin} />)).toBe(
      renderToStaticMarkup(<IconButton {...props} />),
    );
  }
  expect(
    isInteractiveTrigger(
      <KitIconButton icon="close" label="Close" builtin={builtin} />,
    ),
  ).toBe(true);
});

it('forwards React 19 refs to the SVG and button', () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;
  const host = document.createElement('div');
  const root = createRoot(host);
  const svg = createRef<SVGSVGElement>();
  const button = createRef<HTMLButtonElement>();
  try {
    act(() =>
      root.render(
        <>
          <KitIcon name="close" builtin={builtin} ref={svg} />
          <KitIconButton icon="close" builtin={builtin} label="Close" ref={button} />
        </>,
      ),
    );

    expect(svg.current).toBe(host.querySelector('svg'));
    expect(button.current).toBe(host.querySelector('button'));
  } finally {
    act(() => root.unmount());
  }
  expect(svg.current).toBeNull();
  expect(button.current).toBeNull();
});
