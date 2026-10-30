'use client';

import { useId, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/popover';
import { Input } from '../../components/input';
import { Button } from '../../components/button';
import { isEditorUrl } from './link-url';
import { LinkIcon } from '../../components/icon/outline/link';
import { LinkIcon as LinkBoldIcon } from '../../components/icon/bold/link';
import { CodeIcon } from '../../components/icon/outline/code';
import { CodeIcon as CodeBoldIcon } from '../../components/icon/bold/code';
import { MinusIcon } from '../../components/icon/outline/minus';
import { MinusIcon as MinusBoldIcon } from '../../components/icon/bold/minus';
import { KitIconButton } from '../../components/icon-button/kit-icon-button';
import { BoldIcon } from '../../components/icon/outline/bold';
import { BoldIcon as BoldBoldIcon } from '../../components/icon/bold/bold';
import { ItalicIcon } from '../../components/icon/outline/italic';
import { ItalicIcon as ItalicBoldIcon } from '../../components/icon/bold/italic';
import { StrikethroughIcon } from '../../components/icon/outline/strikethrough';
import { StrikethroughIcon as StrikethroughBoldIcon } from '../../components/icon/bold/strikethrough';
import { HeadingIcon } from '../../components/icon/outline/heading';
import { HeadingIcon as HeadingBoldIcon } from '../../components/icon/bold/heading';
import { ListIcon } from '../../components/icon/outline/list';
import { ListIcon as ListBoldIcon } from '../../components/icon/bold/list';
import { ListOrderedIcon } from '../../components/icon/outline/list-ordered';
import { ListOrderedIcon as ListOrderedBoldIcon } from '../../components/icon/bold/list-ordered';
import { QuoteIcon } from '../../components/icon/outline/quote';
import { QuoteIcon as QuoteBoldIcon } from '../../components/icon/bold/quote';
import { UndoIcon } from '../../components/icon/outline/undo';
import { UndoIcon as UndoBoldIcon } from '../../components/icon/bold/undo';
import { RedoIcon } from '../../components/icon/outline/redo';
import { RedoIcon as RedoBoldIcon } from '../../components/icon/bold/redo';
import { partTestId } from '../../components/common/testing';

import type { Editor as TiptapEditor } from '@tiptap/react';
import type { EditorProps } from './types';
import { cn } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
const builtinIcons = {
  link: { outline: LinkIcon, bold: LinkBoldIcon },
  code: { outline: CodeIcon, bold: CodeBoldIcon },
  minus: { outline: MinusIcon, bold: MinusBoldIcon },
  bold: { outline: BoldIcon, bold: BoldBoldIcon },
  italic: { outline: ItalicIcon, bold: ItalicBoldIcon },
  strikethrough: { outline: StrikethroughIcon, bold: StrikethroughBoldIcon },
  heading: { outline: HeadingIcon, bold: HeadingBoldIcon },
  list: { outline: ListIcon, bold: ListBoldIcon },
  listOrdered: { outline: ListOrderedIcon, bold: ListOrderedBoldIcon },
  quote: { outline: QuoteIcon, bold: QuoteBoldIcon },
  undo: { outline: UndoIcon, bold: UndoBoldIcon },
  redo: { outline: RedoIcon, bold: RedoBoldIcon },
};

export function EditorToolbar({
  'data-testid': testId,
  editor,
  disabled,
  classNames,
  className,
}: {
  editor: TiptapEditor | null;
  disabled: boolean | undefined;
  classNames: EditorProps['classNames'];
  className?: string;
} & { 'data-testid'?: string | undefined }) {
  const { t } = useUILocale();
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [invalid, setInvalid] = useState(false);
  const urlId = useId();

  function applyLink() {
    if (!editor || disabled) return;
    if (!isEditorUrl(url)) {
      setInvalid(true);

      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    setLinkOpen(false);
  }

  const commands: {
    label: string;
    icon: keyof typeof builtinIcons;
    active?: boolean;
    run: () => void;
    unavailable?: boolean;
  }[] = editor
    ? [
        {
          label: t('editor.bold'),
          icon: 'bold',
          active: editor.isActive('bold'),
          run: () => editor.chain().focus().toggleBold().run(),
        },
        {
          label: t('editor.italic'),
          icon: 'italic',
          active: editor.isActive('italic'),
          run: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          label: t('editor.strike'),
          icon: 'strikethrough',
          active: editor.isActive('strike'),
          run: () => editor.chain().focus().toggleStrike().run(),
        },
        {
          label: t('editor.heading'),
          icon: 'heading',
          active: editor.isActive('heading', { level: 2 }),
          run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          label: t('editor.list'),
          icon: 'list',
          active: editor.isActive('bulletList'),
          run: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          label: t('editor.orderedList'),
          icon: 'listOrdered',
          active: editor.isActive('orderedList'),
          run: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          label: t('editor.quote'),
          icon: 'quote',
          active: editor.isActive('blockquote'),
          run: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
          label: t('editor.codeBlock'),
          icon: 'code',
          active: editor.isActive('codeBlock'),
          run: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
          label: t('editor.horizontalRule'),
          icon: 'minus',
          run: () => editor.chain().focus().setHorizontalRule().run(),
        },
        {
          label: t('editor.undo'),
          icon: 'undo',
          unavailable: !editor.can().undo(),
          run: () => editor.chain().focus().undo().run(),
        },
        {
          label: t('editor.redo'),
          icon: 'redo',
          unavailable: !editor.can().redo(),
          run: () => editor.chain().focus().redo().run(),
        },
      ]
    : [];

  return (
    <div
      data-testid={partTestId(testId, 'toolbar')}
      role="group"
      aria-label={t('editor.toolbar')}
      className={cn(
        'flex flex-wrap gap-1 border-b border-line p-1.5',
        classNames?.toolbar,
        className,
      )}
    >
      <Popover
        open={linkOpen}
        onOpenChange={(open) => {
          if (open) {
            setUrl(String(editor?.getAttributes('link').href ?? ''));
            setInvalid(false);
          }
          setLinkOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <KitIconButton
            data-testid={partTestId(testId, 'command', 'link')}
            label={t('editor.link')}
            icon="link"
            builtin={builtinIcons.link}
            size="sm"
            variant="ghost"
            disabled={disabled || !editor}
            aria-pressed={editor?.isActive('link') ?? false}
            iconClassName={classNames?.toolbarIcon}
            className={cn(
              editor?.isActive('link') && 'bg-selected text-accent',
              classNames?.toolbarButton,
              editor?.isActive('link') && classNames?.toolbarButtonActive,
            )}
            onMouseDown={(event) => event.preventDefault()}
          />
        </PopoverTrigger>
        <PopoverContent
          data-testid={partTestId(testId, 'linkPopover')}
          aria-label={t('editor.link')}
          className={cn('grid gap-3', classNames?.linkPopover)}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (editor && !editor.isDestroyed) editor.commands.focus();
          }}
        >
          <Input
            id={urlId}
            label={t('editor.linkUrl')}
            value={url}
            data-testid={partTestId(testId, 'linkUrl')}
            onChange={(event) => {
              setUrl(event.target.value);
              setInvalid(false);
            }}
            error={invalid ? t('editor.invalidUrl') : undefined}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyLink();
              }
            }}
          />
          <div data-testid={partTestId(testId, 'linkActions')} className="flex gap-2">
            <Button
              data-testid={partTestId(testId, 'linkApply')}
              size="sm"
              onClick={applyLink}
              disabled={disabled}
            >
              {t('editor.linkApply')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              data-testid={partTestId(testId, 'linkRemove')}
              disabled={disabled}
              onClick={() => {
                editor?.chain().focus().extendMarkRange('link').unsetLink().run();
                setLinkOpen(false);
              }}
            >
              {t('editor.linkRemove')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {commands.map((command) => (
        <KitIconButton
          data-testid={partTestId(testId, 'command', command.icon)}
          key={command.label}
          label={command.label}
          title={command.label}
          icon={command.icon}
          builtin={builtinIcons[command.icon]}
          iconClassName={classNames?.toolbarIcon}
          size="sm"
          variant="ghost"
          disabled={disabled || command.unavailable}
          aria-pressed={command.active}
          className={cn(
            command.active && 'bg-selected text-accent',
            classNames?.toolbarButton,
            command.active && classNames?.toolbarButtonActive,
          )}
          onMouseDown={(event) => event.preventDefault()}
          onClick={command.run}
        />
      ))}
    </div>
  );
}
