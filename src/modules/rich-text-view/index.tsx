'use client';

import { useEffect, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import createDOMPurify from 'dompurify';
import { focusRingClassName } from '../../components/common/focus-ring';
import { cn, type SlotClasses, type TestIdProps } from '../../components/common';

export interface RichTextViewProps
  extends
    Omit<ComponentPropsWithRef<'div'>, 'children' | 'dangerouslySetInnerHTML'>,
    TestIdProps {
  html: string;
  /** Defaults to true. Set false only for HTML already sanitized by the host. For SEO, sanitize on the server and pass false. */
  sanitize?: boolean;
  as?: 'div' | 'article';
  classNames?: SlotClasses<'root'>;
  emptyFallback?: ReactNode;
}

function sanitizeHtml(html: string): string {
  const purifier = createDOMPurify(window);

  purifier.addHook('afterSanitizeAttributes', (node) => {
    for (const attribute of Array.from(node.attributes)) {
      if (node.tagName !== 'A' || !['href', 'target', 'rel'].includes(attribute.name))
        node.removeAttribute(attribute.name);
    }
    if (node.tagName === 'A' && node.getAttribute('target')?.toLowerCase() === '_blank')
      node.setAttribute('rel', 'noopener noreferrer nofollow');
  });

  return purifier.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'h2',
      'h3',
      'strong',
      'em',
      's',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
      'code',
      'pre',
      'hr',
      'br',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}

/** Sanitized content appears after mount; SSR and initial hydration render the fallback. */
export function RichTextView({
  html,
  sanitize = true,
  as: Tag = 'div',
  className,
  classNames,
  emptyFallback,
  ...props
}: RichTextViewProps) {
  const [clean, setClean] = useState<{ source: string; html: string } | null>(null);

  useEffect(() => {
    if (sanitize) setClean({ source: html, html: sanitizeHtml(html) });
  }, [html, sanitize]);

  const content = sanitize ? (clean?.source === html ? clean.html : '') : html;
  const rootClassName = cn(
    'pod-rich-text min-w-0 text-control text-ink',
    focusRingClassName,
    '[&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-focus',
    classNames?.root,
    className,
  );

  return content.trim() ? (
    <Tag
      {...props}
      className={rootClassName}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  ) : (
    <Tag {...props} className={rootClassName}>
      {emptyFallback}
    </Tag>
  );
}
