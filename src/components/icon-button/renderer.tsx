'use client';
import type { ReactNode } from 'react';
import type { IconProps } from '../icon/props';
import { Button, type ButtonProps } from '../button';
import {
  type IconName,
  type IconGlyph,
  type IconPack,
  type IconVariant,
} from '../icon';
import { cn } from '../common';
import { Badge, isBadgeVisible, type BadgeProps } from '../badge';
import { useUILocale } from '../../i18n/provider';

export type IconButtonProps = Omit<ButtonProps, 'children' | 'aria-label'> & {
  label: string;
  icon: IconName | IconGlyph;
  iconPack?: string | IconPack;
  iconVariant?: IconVariant;
  iconClassName?: string | undefined;
  /** Count or Badge options anchored to the glyph, so it stays close even on ghost buttons. */
  badge?: number | Omit<BadgeProps, 'children'>;
};

export function IconButtonRenderer({
  renderIcon,
  label,
  icon,
  size = 'md',
  className,
  classNames,
  loading = false,
  iconClassName,
  iconPack,
  iconVariant,
  badge,
  ...props
}: IconButtonProps & { renderIcon: (props: IconProps) => ReactNode }) {
  const { t } = useUILocale();
  const badgeProps = typeof badge === 'number' ? { count: badge } : badge;
  // The button's accessible name carries the badge text; the badge's own sr-only label stays hidden.
  const badgeText =
    badgeProps && isBadgeVisible(badgeProps)
      ? (badgeProps.label ??
        (badgeProps.dot
          ? t('badge.dot')
          : t('badge.count', { count: badgeProps.count! })))
      : undefined;
  const glyph = renderIcon({
    ...(iconVariant ? { variant: iconVariant } : {}),
    className: iconClassName,
    ...(typeof icon === 'string'
      ? { name: icon, ...(iconPack ? { pack: iconPack } : {}) }
      : { glyph: icon }),
    size: size === 'lg' ? 20 : 16,
  });

  return (
    <Button
      {...props}
      {...(classNames ? { classNames } : {})}
      loading={loading}
      size={size}
      aria-label={badgeText ? `${label}, ${badgeText}` : label}
      className={cn(
        size === 'sm'
          ? 'size-control-sm p-0'
          : size === 'lg'
            ? 'size-control-lg p-0'
            : 'size-control-md p-0',
        loading && 'disabled:cursor-wait disabled:opacity-100',
        className,
      )}
    >
      {!loading &&
        (badgeProps ? (
          <Badge
            size="sm"
            {...badgeProps}
            classNames={{
              ...badgeProps.classNames,
              label: cn('hidden', badgeProps.classNames?.label),
            }}
          >
            {glyph}
          </Badge>
        ) : (
          glyph
        ))}
    </Button>
  );
}
