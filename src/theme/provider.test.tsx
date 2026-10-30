// @vitest-environment jsdom
import { act, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { UIProvider, useTheme } from './provider';
import {
  LinkImageProvider,
  UiLink,
  UiImage,
  type UiLinkProps,
  type UiImageProps,
} from '../components/link-image-provider';
import type { UIThemeTokens } from './index';

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
});

it('ignores nested tokens, warns once per provider, and retains icon/locale composition', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  function ReadTheme() {
    const { tokens, icons } = useTheme();

    return (
      <output data-size={icons?.size} data-variant={icons?.variant}>
        {tokens?.['color-ink']}
      </output>
    );
  }

  function Example() {
    return (
      <UIProvider
        theme={{ tokens: { 'color-ink': '#123456' }, icons: { variant: 'bold' } }}
      >
        <UIProvider theme={{ tokens: { 'color-ink': '#654321' }, icons: { size: 32 } }}>
          <ReadTheme />
        </UIProvider>
      </UIProvider>
    );
  }

  act(() => root.render(<Example />));

  act(() => root.render(<Example />));

  expect(document.querySelectorAll('style')).toHaveLength(1);
  expect(document.querySelector('style')?.textContent).toBe(
    ':root{--color-ink:#123456;}',
  );
  expect(host.querySelector('output')?.textContent).toBe('#123456');
  expect(host.querySelector('output')?.dataset).toMatchObject({
    size: '32',
    variant: 'bold',
  });
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('CSS selector scope'));
});

it('allows the first token provider below providers that configure only icons', () => {
  const html = renderToStaticMarkup(
    <UIProvider theme={{ icons: { variant: 'bold' } }}>
      <UIProvider theme={{ tokens: { 'radius-control': '1rem' } }}>Lorem</UIProvider>
    </UIProvider>,
  );

  expect(html.match(/<style/g)).toHaveLength(1);
  expect(html).toContain(':root{--radius-control:1rem;}');
});

it('updates tokens without resetting child state, DOM refs or portal context', () => {
  const identities: object[] = [];

  function Child() {
    const [count, setCount] = useState(0);
    const identity = useRef({});
    const { tokens } = useTheme();
    identities.push(identity.current);

    return (
      <>
        <button onClick={() => setCount(count + 1)}>{count}</button>
        {createPortal(
          <output data-testid="portal-theme">{tokens?.['color-ink']}</output>,
          document.body,
        )}
      </>
    );
  }

  function Example({ tokens }: { tokens?: UIThemeTokens }) {
    return (
      <UIProvider theme={tokens ? { tokens } : {}}>
        <Child />
      </UIProvider>
    );
  }

  act(() =>
    root.render(
      <Example tokens={{ 'color-ink': '#123456', 'radius-control': '1rem' }} />,
    ),
  );

  const button = host.querySelector('button')!;
  const style = host.querySelector('style')!;
  expect(host.firstElementChild).toBe(style);
  expect(style.hasAttribute('href')).toBe(false);
  expect(style.hasAttribute('precedence')).toBe(false);

  act(() => button.click());

  act(() => root.render(<Example tokens={{ 'color-ink': '#654321' }} />));

  expect(host.querySelector('button')).toBe(button);
  expect(button.textContent).toBe('1');
  expect(new Set(identities).size).toBe(1);
  expect(document.querySelector('[data-testid="portal-theme"]')?.textContent).toBe(
    '#654321',
  );
  expect(document.querySelector('style')?.textContent).toBe(
    ':root{--color-ink:#654321;}',
  );
  expect(document.querySelectorAll('style')).toHaveLength(1);
  expect(host.querySelector('style')).toBe(style);

  // Removing tokens and leaving the story must restore the kit/host stylesheet.
  act(() => root.render(<Example />));

  expect(document.querySelector('style')).toBeNull();
  expect(host.querySelector('button')).toBe(button);
});

it('leaves no root overrides after navigating away from a token-themed story', () => {
  act(() =>
    root.render(
      <UIProvider theme={{ tokens: { 'color-ink': '#123456' } }}>Lorem</UIProvider>,
    ),
  );

  expect(document.querySelector('style')).not.toBeNull();

  act(() => root.render(<div>Next story</div>));

  expect(document.querySelector('style')).toBeNull();
});

function AppLink(props: UiLinkProps) {
  return <a {...props} data-adapter="app" />;
}

function AppImage(props: UiImageProps) {
  return <img {...props} data-adapter="app" />;
}

function ScopedLink(props: UiLinkProps) {
  return <a {...props} data-adapter="scoped" />;
}

function ScopedImage(props: UiImageProps) {
  return <img {...props} data-adapter="scoped" />;
}

function AdapterConsumers() {
  return (
    <>
      <UiLink href="/page">Page</UiLink>
      <UiImage src="image.png" alt="Example" />
    </>
  );
}

it('supplies UIProvider adapters to UiLink and UiImage', () => {
  act(() =>
    root.render(
      <UIProvider link={AppLink} image={AppImage}>
        <AdapterConsumers />
      </UIProvider>,
    ),
  );

  expect(host.querySelector('a')?.getAttribute('data-adapter')).toBe('app');
  expect(host.querySelector('img')?.getAttribute('data-adapter')).toBe('app');
});

it.each([
  { link: ScopedLink, image: undefined, expectedLink: 'scoped', expectedImage: 'app' },
  { link: undefined, image: ScopedImage, expectedLink: 'app', expectedImage: 'scoped' },
  { link: undefined, image: undefined, expectedLink: 'app', expectedImage: 'app' },
])(
  'inherits omitted adapters in nested UIProvider ($expectedLink/$expectedImage)',
  ({ link, image, expectedLink, expectedImage }) => {
    act(() =>
      root.render(
        <UIProvider link={AppLink} image={AppImage}>
          <UIProvider {...(link ? { link } : {})} {...(image ? { image } : {})}>
            <AdapterConsumers />
          </UIProvider>
          <section>
            <AdapterConsumers />
          </section>
        </UIProvider>,
      ),
    );

    expect(host.querySelector('a')?.getAttribute('data-adapter')).toBe(expectedLink);
    expect(host.querySelector('img')?.getAttribute('data-adapter')).toBe(expectedImage);
    expect(host.querySelector('section a')?.getAttribute('data-adapter')).toBe('app');
    expect(host.querySelector('section img')?.getAttribute('data-adapter')).toBe('app');
  },
);

it('allows LinkImageProvider to override UIProvider adapters in a local scope', () => {
  act(() =>
    root.render(
      <UIProvider link={AppLink} image={AppImage}>
        <LinkImageProvider Link={ScopedLink}>
          <AdapterConsumers />
        </LinkImageProvider>
      </UIProvider>,
    ),
  );

  expect(host.querySelector('a')?.getAttribute('data-adapter')).toBe('scoped');
  expect(host.querySelector('img')?.getAttribute('data-adapter')).toBe('app');
});
