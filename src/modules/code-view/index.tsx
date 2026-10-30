'use client';

import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { Highlight } from 'prism-react-renderer';
import {
  cn,
  partTestId,
  type SlotClasses,
  type TestIdProps,
} from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { useCopy } from '../../components/common/use-copy';
import { KitIcon } from '../../components/icon/kit-icon';
import { CopyIcon } from '../../components/icon/outline/copy';
import { CopyIcon as CopyBoldIcon } from '../../components/icon/bold/copy';
import { useUILocale } from '../../i18n/provider';
import { codePrism, codeTheme } from './prism';

export type CodeViewLanguage =
  | 'tsx'
  | 'ts'
  | 'typescript'
  | 'jsx'
  | 'js'
  | 'javascript'
  | 'json'
  | 'css'
  | 'bash'
  | 'markdown'
  | 'html'
  | 'markup';
export type CodeViewClassNames = SlotClasses<
  | 'root'
  | 'header'
  | 'title'
  | 'copyButton'
  | 'status'
  | 'pre'
  | 'code'
  | 'line'
  | 'lineNumber'
  | 'highlightedLine'
  | 'token'
>;
export interface CodeViewProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'className'>, TestIdProps {
  code: string;
  language?: CodeViewLanguage;
  /** Takes precedence over filename when both are supplied. */
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  /** One-based line numbers and inclusive ranges, for example [1, '3-5']. Invalid entries are ignored. */
  highlightLines?: readonly (number | string)[];
  wrap?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
  copyable?: boolean;
  className?: string;
  classNames?: CodeViewClassNames;
}

const aliases: Partial<Record<CodeViewLanguage, string>> = {
  ts: 'typescript',
  js: 'javascript',
  html: 'markup',
};
const copyIcon = { outline: CopyIcon, bold: CopyBoldIcon };

function isHighlighted(line: number, entries: CodeViewProps['highlightLines']) {
  return (
    entries?.some((entry) => {
      if (typeof entry === 'number') return entry === line;
      const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(entry.trim());
      if (!match) return false;
      const start = Number(match[1]);
      const end = Number(match[2] ?? match[1]);

      return start > 0 && line >= start && line <= end;
    }) ?? false
  );
}

/** Read-only syntax-highlighted source. Import from @itclabs/react-ui/code-view. */
export function CodeView({
  code,
  language = 'tsx',
  title,
  filename,
  showLineNumbers = false,
  highlightLines,
  wrap = false,
  maxHeight,
  copyable = true,
  className,
  classNames,
  'data-testid': testId,
  'aria-label': ariaLabel,
  ...props
}: CodeViewProps) {
  const { t } = useUILocale();
  const { copy, copied } = useCopy();
  const heading = title ?? filename;

  return (
    <div
      {...props}
      data-testid={testId}
      className={cn(
        'relative min-w-0 overflow-hidden rounded-panel border border-line bg-code-surface font-mono text-control text-code-ink',
        classNames?.root,
        className,
      )}
    >
      {(heading !== undefined || copyable) && (
        <div
          data-testid={partTestId(testId, 'header')}
          className={cn(
            'flex min-h-10 items-center justify-between gap-3 border-b border-line px-3 py-2',
            classNames?.header,
          )}
        >
          <span
            data-testid={partTestId(testId, 'title')}
            className={cn('min-w-0 truncate', classNames?.title)}
          >
            {heading}
          </span>
          {copyable && (
            <button
              type="button"
              data-testid={partTestId(testId, 'copy')}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-control px-2 py-1 text-muted hover:bg-hover hover:text-ink',
                focusRingClassName,
                classNames?.copyButton,
              )}
              onClick={() => void copy(code)}
            >
              <KitIcon name="copy" builtin={copyIcon} size={16} />
              {t(copied ? 'copy.copied' : 'copy.label')}
            </button>
          )}
        </div>
      )}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid={partTestId(testId, 'status')}
        className={cn('sr-only', classNames?.status)}
      >
        {copied ? t('copy.copied') : ''}
      </span>
      <Highlight
        prism={codePrism}
        code={code}
        language={aliases[language] ?? language}
        theme={codeTheme}
      >
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre
            role="region"
            aria-label={ariaLabel ?? heading ?? t('codeView.label')}
            tabIndex={0}
            data-testid={partTestId(testId, 'pre')}
            style={{ maxHeight }}
            className={cn(
              'm-0 overflow-auto p-3 outline-offset-[-2px]',
              focusRingClassName,
              wrap ? 'whitespace-pre-wrap' : 'whitespace-pre',
              classNames?.pre,
            )}
          >
            <code
              data-testid={partTestId(testId, 'code')}
              className={cn(
                'block min-w-full font-mono',
                wrap ? 'w-full' : 'w-max',
                classNames?.code,
              )}
            >
              {tokens.map((line, index) => {
                const highlighted = isHighlighted(index + 1, highlightLines);

                return (
                  <span
                    {...getLineProps({ line })}
                    key={index}
                    data-testid={partTestId(testId, 'line', index + 1)}
                    data-highlighted={highlighted || undefined}
                    className={cn(
                      'flex min-h-[1lh]',
                      highlighted && 'bg-code-highlight',
                      classNames?.line,
                      highlighted && classNames?.highlightedLine,
                    )}
                  >
                    {showLineNumbers && (
                      <span
                        aria-hidden="true"
                        data-testid={partTestId(testId, 'lineNumber', index + 1)}
                        className={cn(
                          'mr-4 inline-block min-w-[3ch] shrink-0 select-none text-right text-code-comment',
                          classNames?.lineNumber,
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                    <span
                      className={cn(
                        'min-w-0 flex-1',
                        wrap && '[overflow-wrap:anywhere]',
                      )}
                    >
                      {line.map((token, tokenIndex) => (
                        <span
                          {...getTokenProps({ token })}
                          key={tokenIndex}
                          children={token.empty ? '' : token.content}
                          className={cn(
                            'token',
                            token.types.join(' '),
                            classNames?.token,
                          )}
                        />
                      ))}
                      {index < tokens.length - 1 ? '\n' : null}
                    </span>
                  </span>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
