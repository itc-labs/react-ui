import { cn } from '../../components/common';
import type {
  NavbarAppearance,
  NavbarDensity,
  NavbarItemVariant,
  NavbarProps,
  NavbarTone,
} from './types';

export type ResolvedNavbarAppearance = {
  tone: NavbarTone;
  itemVariant: NavbarItemVariant;
  density: NavbarDensity;
  /** Floating bars are inset, rounded and shadowed. */
  floating: boolean;
};

export const navbarAppearances: Record<NavbarAppearance, ResolvedNavbarAppearance> = {
  default: {
    tone: 'default',
    itemVariant: 'underline',
    density: 'default',
    floating: false,
  },
  floating: {
    tone: 'default',
    itemVariant: 'pill',
    density: 'compact',
    floating: true,
  },
  dark: { tone: 'dark', itemVariant: 'solid', density: 'default', floating: false },
  brand: { tone: 'brand', itemVariant: 'ghost', density: 'default', floating: false },
  transparent: {
    tone: 'transparent',
    itemVariant: 'ghost',
    density: 'default',
    floating: false,
  },
};

/** Explicit props win over the appearance preset; `activeIndicator` is the legacy itemVariant. */
export function resolveNavbarAppearance({
  appearance = 'default',
  tone,
  itemVariant,
  density,
  activeIndicator,
}: Pick<
  NavbarProps,
  'appearance' | 'tone' | 'itemVariant' | 'density' | 'activeIndicator'
>) {
  const preset = navbarAppearances[appearance];

  return {
    tone: tone ?? preset.tone,
    itemVariant: itemVariant ?? activeIndicator ?? preset.itemVariant,
    density: density ?? preset.density,
    floating: preset.floating,
  } satisfies ResolvedNavbarAppearance;
}

/**
 * Classes for a top-level menu row (link or dropdown/mega trigger). Colours come from the
 * CSS variables that `data-navbar-tone` sets on the root, so rows follow the tone.
 * The menu code renders `navbarIndicatorClass` as an extra span when it returns a value.
 */
export function navbarItemClasses(
  variant: NavbarItemVariant,
  density: NavbarDensity,
  active: boolean,
): string {
  return cn(
    'relative flex items-center gap-2 whitespace-nowrap px-3 text-ui-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
    density === 'compact' ? 'py-1.5' : density === 'comfortable' ? 'py-3' : 'py-2',
    variant === 'underline'
      ? 'h-full min-h-[var(--navbar-height,4rem)]'
      : 'rounded-control',
    // Pill and ghost rows are capsules, so they sit inside rounded containers like a grouped menu.
    (variant === 'pill' || variant === 'ghost') && 'rounded-full',
    active
      ? variant === 'underline'
        ? 'font-semibold text-[var(--navbar-accent,var(--color-accent))]'
        : variant === 'ghost'
          ? 'bg-[var(--navbar-selected)] font-semibold text-[var(--navbar-fg)]'
          : 'bg-[var(--navbar-active-bg)] text-[var(--navbar-active-fg)]'
      : 'text-[var(--navbar-muted)] hover:bg-[var(--navbar-hover)] hover:text-[var(--navbar-fg)] data-[state=open]:bg-[var(--navbar-hover)] data-[state=open]:text-[var(--navbar-fg)]',
  );
}

/** Underline bar for the active row, or `null` when the variant draws no indicator. */
export function navbarIndicatorClass(variant: NavbarItemVariant): string | null {
  return variant === 'underline'
    ? 'pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-[var(--navbar-accent,var(--color-accent))]'
    : null;
}
