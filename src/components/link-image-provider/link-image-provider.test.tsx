// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import {
  LinkImageProvider,
  UiLink,
  UiImage,
  type UiLinkProps,
  type UiImageProps,
} from './index';
import { Breadcrumb } from '../breadcrumb';
import { Sidebar } from '../../modules/sidebar';

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
});

it('forwards native refs, attributes, events and consumer classes/selectors', async () => {
  let link: HTMLAnchorElement | null = null,
    image: HTMLImageElement | null = null;
  const clicked = vi.fn(),
    failed = vi.fn();
  await act(async () =>
    root.render(
      <>
        <UiLink
          ref={(node) => {
            link = node;
          }}
          href="/file"
          download="file.txt"
          target="_blank"
          rel="noreferrer"
          data-testid="link"
          className="link-class"
          onClick={(event) => {
            event.preventDefault();
            clicked();
          }}
        >
          Download
        </UiLink>
        <UiImage
          ref={(node) => {
            image = node;
          }}
          src="image.png"
          alt="Example"
          width={80}
          height={60}
          sizes="80px"
          srcSet="image.png 1x"
          loading="lazy"
          decoding="async"
          className="image-class"
          data-testid="image"
          onError={failed}
        />
      </>,
    ),
  );
  expect(link).toBe(host.querySelector('a'));
  expect(image).toBe(host.querySelector('img'));
  expect(host.querySelector('a')?.getAttribute('download')).toBe('file.txt');
  expect(host.querySelector('img')?.getAttribute('loading')).toBe('lazy');
  expect(host.querySelector('img')?.getAttribute('srcset')).toBe('image.png 1x');

  act(() => {
    host.querySelector('a')!.click();
    host.querySelector('img')!.dispatchEvent(new Event('error'));
  });

  expect(clicked).toHaveBeenCalledOnce();
  expect(failed).toHaveBeenCalledOnce();
  expect(host.querySelector('[data-testid="image"]')?.className).toBe('image-class');
});

function ProjectLink(props: UiLinkProps) {
  return <a {...props} data-project="link" />;
}

function ProjectImage(props: UiImageProps) {
  return <img {...props} data-project="image" />;
}

function NestedLink(props: UiLinkProps) {
  return <a {...props} data-project="nested" />;
}

it('inherits unspecified nested adapters without global mutation and routes generated consumers through them', async () => {
  await act(async () =>
    root.render(
      <LinkImageProvider Link={ProjectLink} Image={ProjectImage}>
        <Breadcrumb
          data-testid="path"
          items={[
            { key: 'parent/a', title: 'Parent', href: '/parent' },
            { key: 'current', title: 'Current', href: '/current' },
          ]}
        />
        <Sidebar items={[{ id: 'page', label: 'Page', href: '/page', active: true }]} />
        <LinkImageProvider Link={NestedLink}>
          <UiLink href="/nested">Nested</UiLink>
          <UiImage src="a.png" alt="Nested image" />
        </LinkImageProvider>
        <UiLink href="/after">After</UiLink>
      </LinkImageProvider>,
    ),
  );
  expect(
    host
      .querySelector('[data-testid="path-link-parent%2Fa"]')
      ?.getAttribute('data-project'),
  ).toBe('link');
  expect(host.querySelector('[aria-current="page"]')?.tagName).toBe('SPAN');
  expect(host.querySelector('a[href="/current"]')).toBeNull();
  expect(host.querySelector('a[href="/page"]')?.getAttribute('data-project')).toBe(
    'link',
  );
  expect(host.querySelector('a[href="/nested"]')?.getAttribute('data-project')).toBe(
    'nested',
  );
  expect(host.querySelector('img')?.getAttribute('data-project')).toBe('image');
  expect(host.querySelector('a[href="/after"]')?.getAttribute('data-project')).toBe(
    'link',
  );
  await act(async () => root.render(<UiLink href="/default">Default</UiLink>));
  expect(host.querySelector('a')?.hasAttribute('data-project')).toBe(false);
});

it('keeps runtime UI link/image rendering centralized in the native adapter boundary', () => {
  function files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? files(resolve(dir, entry.name))
        : [resolve(dir, entry.name)],
    );
  }

  const violations: string[] = [];
  for (const file of files(resolve('src')).filter(
    (file) =>
      file.endsWith('.tsx') &&
      !/\.(stories|test)\.tsx$/.test(file) &&
      !file.endsWith('/link-image-provider/index.tsx'),
  )) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    function visit(node: ts.Node) {
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        ['a', 'img'].includes(node.tagName.getText(source))
      )
        violations.push(file);
      if (
        ts.isImportDeclaration(node) &&
        /next\/(link|image)/.test(node.moduleSpecifier.getText(source))
      )
        violations.push(file);
      ts.forEachChild(node, visit);
    }

    visit(source);
  }
  expect(violations).toEqual([]);
});

it('lets the image adapter own Avatar source loading and keeps fallback/error behavior', async () => {
  const { Avatar } = await import('../avatar');

  function RewrittenImage(props: UiImageProps) {
    return <img {...props} src="rewritten.png" data-project="rewritten" />;
  }

  await act(async () =>
    root.render(
      <LinkImageProvider Image={RewrittenImage}>
        <Avatar src="adapter-owned-source" alt="Example User" data-testid="avatar" />
      </LinkImageProvider>,
    ),
  );
  expect(host.querySelector('img')?.getAttribute('src')).toBe('rewritten.png');
  expect(host.querySelector('[data-testid="avatar-fallback"]')).not.toBeNull();

  act(() => host.querySelector('img')!.dispatchEvent(new Event('load')));

  expect(host.querySelector('[data-testid="avatar-fallback"]')).toBeNull();

  act(() => host.querySelector('img')!.dispatchEvent(new Event('error')));

  expect(host.querySelector('[data-testid="avatar-fallback"]')?.textContent).toBe('EU');
  await act(async () =>
    root.render(
      <LinkImageProvider Image={RewrittenImage}>
        <Avatar src="next-source" alt="Example User" data-testid="avatar" />
      </LinkImageProvider>,
    ),
  );
  expect(host.querySelector('img')).not.toBeNull();
});
