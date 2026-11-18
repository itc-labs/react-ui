import type { CSSProperties } from 'react';
import { cn } from '../../components/common';
import type { SidebarProps } from './types';

export function sidebarToneStyle(
  tone: NonNullable<SidebarProps['tone']>,
): CSSProperties {
  if (tone === 'soft')
    return {
      '--sidebar-bg':
        'var(--color-brand-50, color-mix(in srgb, var(--color-accent) 7%, var(--color-surface)))',
      '--sidebar-fg': 'var(--color-ink)',
      '--sidebar-muted': 'color-mix(in srgb, var(--color-ink) 80%, transparent)',
      '--sidebar-hover':
        'var(--color-brand-100, color-mix(in srgb, var(--color-accent) 12%, transparent))',
      '--sidebar-active-bg': 'var(--color-surface)',
      '--sidebar-active-fg': 'var(--color-ink)',
      '--sidebar-border':
        'color-mix(in srgb, var(--color-accent) 14%, var(--color-line))',
      '--sidebar-badge-ring': 'var(--sidebar-bg)',
      '--sidebar-accent': 'var(--color-accent)',
      '--sidebar-tint':
        'color-mix(in srgb, var(--color-accent) 22%, var(--sidebar-bg))',
      '--sidebar-solid-bg': 'var(--color-accent)',
      '--sidebar-solid-fg': 'var(--color-on-brand)',
    } as CSSProperties;

  const contrast = tone !== 'default';
  const foreground = tone === 'dark' ? 'var(--color-surface)' : 'var(--color-on-brand)';

  return {
    '--sidebar-bg':
      tone === 'dark'
        ? 'var(--color-ink)'
        : tone === 'brand'
          ? 'var(--color-accent)'
          : 'var(--color-sidebar)',
    '--sidebar-fg': contrast ? foreground : 'var(--color-ink)',
    '--sidebar-muted': contrast
      ? `color-mix(in srgb, ${foreground} 75%, transparent)`
      : 'var(--color-muted)',
    '--sidebar-hover': contrast
      ? `color-mix(in srgb, ${foreground} 12%, transparent)`
      : // Ink-based so hover shows on any sidebar colour, including one equal to the surface.
        'color-mix(in srgb, var(--color-ink) 6%, transparent)',
    '--sidebar-active-bg': contrast
      ? `color-mix(in srgb, ${foreground} 18%, transparent)`
      : 'var(--color-surface)',
    '--sidebar-active-fg': contrast ? foreground : 'var(--color-ink)',
    '--sidebar-border': contrast
      ? `color-mix(in srgb, ${foreground} 25%, transparent)`
      : 'var(--color-line)',
    '--sidebar-badge-ring': contrast ? 'var(--sidebar-bg)' : 'var(--color-surface)',
    '--sidebar-accent': contrast ? foreground : 'var(--color-accent)',
    '--sidebar-tint': contrast
      ? `color-mix(in srgb, ${foreground} 18%, transparent)`
      : 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
    '--sidebar-solid-bg': tone === 'brand' ? foreground : 'var(--color-accent)',
    '--sidebar-solid-fg':
      tone === 'brand' ? 'var(--color-accent)' : 'var(--color-on-brand)',
  } as CSSProperties;
}

export function sidebarItemClasses(
  variant: NonNullable<SidebarProps['itemVariant']>,
  active: boolean,
) {
  if (variant === 'pill')
    // Full-width rows; nested rows indent their content through --sidebar-indent.
    return cn(
      'relative min-h-10 rounded-xl ps-[calc(0.75rem+var(--sidebar-indent,0rem))] pe-3',
      active
        ? // The trailing bar sits on the sidebar edge; the expanded nav extends into the panel padding for it.
          'bg-[var(--sidebar-tint,color-mix(in_srgb,var(--color-brand-500)_30%,var(--color-surface)))] font-semibold text-[var(--sidebar-active-fg,var(--color-ink))] after:pointer-events-none after:absolute after:inset-y-1.5 after:-end-3 after:w-1 after:rounded-s-full after:bg-[var(--sidebar-accent,var(--color-accent))]'
        : 'text-[var(--sidebar-fg,var(--color-ink))] hover:bg-[var(--sidebar-hover,var(--color-brand-100))]',
    );
  if (variant === 'indicator')
    return active
      ? 'relative rounded-none bg-[var(--sidebar-tint,color-mix(in_srgb,var(--color-accent)_12%,transparent))] font-medium text-[var(--sidebar-active-fg,var(--color-ink))] before:pointer-events-none before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:bg-[var(--sidebar-accent,var(--color-accent))] [&_svg]:text-[var(--sidebar-accent,var(--color-accent))]'
      : 'rounded-none text-[var(--sidebar-muted,var(--color-muted))] hover:bg-[var(--sidebar-hover,color-mix(in_srgb,var(--color-ink)_6%,transparent))] hover:text-[var(--sidebar-fg,var(--color-ink))]';
  if (!active)
    return variant === 'bar'
      ? 'text-[var(--sidebar-muted,var(--color-muted))] hover:text-[var(--sidebar-fg,var(--color-ink))]'
      : 'text-[var(--sidebar-muted,var(--color-muted))] hover:bg-[var(--sidebar-hover,color-mix(in_srgb,var(--color-ink)_6%,transparent))] hover:text-[var(--sidebar-fg,var(--color-ink))]';
  switch (variant) {
    case 'subtle':
      return 'bg-[var(--sidebar-tint,color-mix(in_srgb,var(--color-accent)_12%,transparent))] font-medium text-[var(--sidebar-accent,var(--color-accent))]';
    case 'bar':
      return 'relative bg-linear-to-r from-[var(--sidebar-tint,color-mix(in_srgb,var(--color-accent)_12%,transparent))] to-transparent font-semibold text-[var(--sidebar-accent,var(--color-accent))] before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-full before:bg-[var(--sidebar-accent,var(--color-accent))]';
    case 'solid':
      return '[--sidebar-count:currentColor] bg-[var(--sidebar-solid-bg,var(--color-accent))] font-medium text-[var(--sidebar-solid-fg,var(--color-on-brand))]';
    default:
      return 'bg-[var(--sidebar-active-bg,var(--color-surface))] font-medium text-[var(--sidebar-active-fg,var(--color-ink))] shadow-panel inset-ring-1 inset-ring-[var(--sidebar-border,var(--color-line))] [&_svg]:text-[var(--sidebar-accent,var(--color-accent))]';
  }
}
