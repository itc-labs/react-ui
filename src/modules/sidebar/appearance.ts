import type { CSSProperties } from 'react';
import type { SidebarProps } from './types';

export function sidebarToneStyle(
  tone: NonNullable<SidebarProps['tone']>,
): CSSProperties {
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
      : 'color-mix(in srgb, var(--color-surface) 60%, transparent)',
    '--sidebar-active-bg': contrast
      ? `color-mix(in srgb, ${foreground} 18%, transparent)`
      : 'var(--color-surface)',
    '--sidebar-active-fg': contrast ? foreground : 'var(--color-ink)',
    '--sidebar-border': contrast
      ? `color-mix(in srgb, ${foreground} 25%, transparent)`
      : 'var(--color-line)',
    '--sidebar-badge-ring': contrast ? 'var(--sidebar-bg)' : 'var(--color-surface)',
    '--sidebar-accent': contrast ? foreground : 'var(--color-accent)',
    '--sidebar-solid-bg': tone === 'brand' ? foreground : 'var(--color-accent)',
    '--sidebar-solid-fg':
      tone === 'brand' ? 'var(--color-accent)' : 'var(--color-on-brand)',
  } as CSSProperties;
}

export function sidebarItemClasses(
  variant: NonNullable<SidebarProps['itemVariant']>,
  active: boolean,
) {
  if (!active)
    return variant === 'bar'
      ? 'text-[var(--sidebar-muted,var(--color-muted))] hover:text-[var(--sidebar-fg,var(--color-ink))]'
      : 'text-[var(--sidebar-muted,var(--color-muted))] hover:bg-[var(--sidebar-hover,color-mix(in_srgb,var(--color-surface)_60%,transparent))] hover:text-[var(--sidebar-fg,var(--color-ink))]';
  switch (variant) {
    case 'subtle':
      return 'bg-[var(--sidebar-hover,var(--color-hover))] font-medium text-[var(--sidebar-fg,var(--color-ink))]';
    case 'bar':
      return 'relative bg-transparent font-medium text-[var(--sidebar-fg,var(--color-ink))] before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-[var(--sidebar-accent,var(--color-accent))]';
    case 'solid':
      return '[--sidebar-count:currentColor] bg-[var(--sidebar-solid-bg,var(--color-accent))] font-medium text-[var(--sidebar-solid-fg,var(--color-on-brand))]';
    default:
      return 'bg-[var(--sidebar-active-bg,var(--color-surface))] font-medium text-[var(--sidebar-active-fg,var(--color-ink))] shadow-panel ring-1 ring-[var(--sidebar-border,var(--color-line))] [&_svg]:text-[var(--sidebar-accent,var(--color-accent))]';
  }
}
