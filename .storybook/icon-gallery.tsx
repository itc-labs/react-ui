'use client';
import { useEffect, useRef, useState } from 'react';
import { CopyIcon } from '@itclabs/react-ui/icons/outline/copy';
import { Icon, iconNames } from '../src/components/icon';
import { outlineIcons } from '../src/components/icon/outline/pack';
import { boldIcons } from '../src/components/icon/bold/pack';
import { Input } from '../src/components/input';
import { Select } from '../src/components/select';
import { Textarea } from '../src/components/textarea';
import { Button } from '../src/components/button';
import { EmptyState } from '../src/modules/empty-state';
import { useDebounce } from '../src/hooks';
import { cn } from '../src/components/common';
import { iconCatalog } from '../src/components/icon/catalog';

export const galleryPacks = {
  outline: { label: 'Outline', pack: outlineIcons },
  bold: { label: 'Bold', pack: boldIcons },
};
export type GalleryPackId = keyof typeof galleryPacks;

export function galleryEntry(packId: GalleryPackId, name: string) {
  const requested = galleryPacks[packId];
  if (!Object.hasOwn(requested.pack.icons, name))
    throw new Error(`Unknown icon: ${name}`);

  return {
    name: name as (typeof iconNames)[number],
    ...requested,
    fallback: false,
    ...iconCatalog[name as keyof typeof iconCatalog],
  };
}

export function iconUsageCode(packId: GalleryPackId, name: string) {
  galleryEntry(packId, name);
  const symbol = `${name[0]!.toUpperCase()}${name.slice(1)}Icon`;
  const file = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  return `import { ${symbol} } from '@itclabs/react-ui/icons/${packId}/${file}';\n\n<${symbol} size={24} />`;
}

const aliases: Record<string, string> = {
  delete: 'trash remove xóa',
  close: 'x dismiss đóng',
  view: 'eye preview xem',
  settings: 'configuration cấu hình',
  search: 'find magnifying glass tìm kiếm',
  user: 'account profile tài khoản',
  users: 'people group nhóm',
  home: 'house trang chủ',
  copy: 'duplicate sao chép',
  upload: 'import tải lên',
  download: 'export tải về',
  warning: 'alert cảnh báo',
};

/** Storybook-only explorer; not exported from the production UI package. */
export function IconGallery({
  initialPack = 'outline',
}: {
  initialPack?: GalleryPackId;
}) {
  const [packId, setPackId] = useState<GalleryPackId>(initialPack),
    [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(80);
  const search = useDebounce(query, 150).trim().toLocaleLowerCase('vi');
  const [snippet, setSnippet] = useState(''),
    [selected, setSelected] = useState(''),
    [status, setStatus] = useState<'idle' | 'pending' | 'copied' | 'error'>('idle');
  const text = useRef<HTMLTextAreaElement>(null),
    busy = useRef(false),
    mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (status === 'error') {
      text.current?.focus();
      text.current?.select();
    }
  }, [status, snippet]);

  useEffect(() => {
    if (status !== 'copied') return;
    const timer = setTimeout(() => setStatus('idle'), 1800);

    return () => clearTimeout(timer);
  }, [status]);

  const names = [...iconNames].sort();
  const categories = [
    ...new Set(Object.values(iconCatalog).map((item) => item.category)),
  ].sort();
  const entries = names
    .filter((name) => category === 'all' || iconCatalog[name].category === category)
    .filter((name) =>
      `${name} ${name.replace(/([a-z])([A-Z])/g, '$1 $2')} ${aliases[name] ?? ''} ${iconCatalog[name].aliases}`
        .toLocaleLowerCase('vi')
        .includes(search),
    )
    .map((name) => galleryEntry(packId, name));

  async function copy(name: string) {
    if (busy.current) return;
    const code = iconUsageCode(packId, name);
    busy.current = true;
    setSnippet(code);
    setSelected(name);
    setStatus('pending');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(code);
      if (mounted.current) setStatus('copied');
    } catch {
      if (mounted.current) setStatus('error');
    } finally {
      busy.current = false;
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_10rem]">
        <Input
          label="Tìm icon"
          placeholder="Tên icon, trash, tìm kiếm…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(80);
          }}
        />
        <Select
          label="Nhóm"
          clearable={false}
          disabled={status === 'pending'}
          value={category}
          options={[
            { value: 'all', label: 'Tất cả nhóm' },
            ...categories.map((value) => ({ value, label: value })),
          ]}
          onValueChange={(value) => {
            if (value) {
              setCategory(value);
              setVisibleCount(80);
            }
          }}
        />
        <Select
          label="Kiểu icon"
          searchable={false}
          clearable={false}
          disabled={status === 'pending'}
          value={packId}
          options={Object.entries(galleryPacks).map(([value, item]) => ({
            value,
            label: item.label,
          }))}
          onValueChange={(value) => {
            if (value && Object.hasOwn(galleryPacks, value)) {
              setPackId(value as GalleryPackId);
              setSnippet('');
              setSelected('');
              setStatus('idle');
            }
          }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-ui-sm text-muted">
        <output aria-label="Số icon">
          {entries.length} / {names.length} icon đã đăng ký
        </output>
        <span>Bấm icon để copy JSX và import.</span>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={cn(
          'min-h-5 text-ui-sm',
          status === 'error' ? 'text-danger-700' : 'text-muted',
        )}
      >
        {status === 'pending'
          ? 'Đang sao chép…'
          : status === 'copied'
            ? `Đã copy ${selected}.`
            : status === 'error'
              ? 'Không thể copy tự động. Code đã được chọn bên dưới; dùng Ctrl/Cmd+C.'
              : '\u00a0'}
      </p>
      {entries.length ? (
        <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4 lg:grid-cols-6">
          {entries.slice(0, visibleCount).map((entry) => (
            <li key={entry.name}>
              <button
                type="button"
                data-icon={entry.name}
                disabled={status === 'pending'}
                aria-label={`Copy ${entry.name} (${entry.pack.id})`}
                title={`Copy ${entry.name} JSX`}
                onClick={() => void copy(entry.name)}
                className={cn(
                  'group grid h-full min-h-32 w-full cursor-pointer grid-rows-[1.5rem_2rem_2rem] items-center justify-items-center gap-2 rounded-control border border-line bg-surface px-2 py-3 text-ink transition-colors hover:border-brand-700 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-wait',
                  selected === entry.name && 'border-brand-700 bg-brand-50',
                )}
              >
                <Icon name={entry.name} pack={entry.pack} size={24} />
                <span className="line-clamp-2 max-w-full break-all text-center text-ui-sm leading-4">
                  {entry.name}
                </span>
                <span className="grid h-8 grid-rows-2 text-center text-xs leading-4 text-muted">
                  <span className="whitespace-nowrap">
                    {selected === entry.name && status === 'copied'
                      ? 'Đã copy'
                      : 'Copy JSX'}
                  </span>
                  <span
                    className="whitespace-nowrap text-eyebrow leading-4 tracking-normal"
                    aria-hidden={!entry.neutral && !entry.outlineOnly}
                  >
                    {entry.neutral
                      ? 'Trung tính'
                      : entry.outlineOnly
                        ? 'Chỉ có Outline'
                        : '\u00a0'}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          variant="no-results"
          size="compact"
          title="Không tìm thấy icon"
          description="Thử tên khác hoặc xóa từ khóa tìm kiếm."
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Xóa tìm kiếm
            </Button>
          }
        />
      )}
      {entries.length > visibleCount && (
        <Button
          variant="secondary"
          onClick={() => setVisibleCount((current) => current + 80)}
        >
          Xem thêm ({Math.min(visibleCount, entries.length)}/{entries.length})
        </Button>
      )}
      {snippet && (
        <div className="grid gap-3 rounded-panel border border-line bg-canvas p-4">
          <Textarea
            ref={text}
            label={`Code: ${selected}`}
            value={snippet}
            readOnly
            rows={7}
            className="font-mono text-ui-sm"
          />
          <div>
            <Button
              size="sm"
              variant="secondary"
              disabled={status === 'pending'}
              onClick={() => void copy(selected)}
            >
              <Icon glyph={CopyIcon} />
              Copy lại
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
