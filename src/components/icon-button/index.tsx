import { interactiveTrigger } from '../common/interactive-trigger';
import { Button, type ButtonProps } from '../button';
import {
  Icon,
  type IconName,
  type IconGlyph,
  type IconPack,
  type IconVariant,
} from '../icon';
import { cn } from '../common';

export function IconButton({
  label,
  icon,
  size = 'md',
  className,
  classNames,
  loading = false,
  iconClassName,
  iconPack,
  iconVariant,
  ...props
}: Omit<ButtonProps, 'children' | 'aria-label'> & {
  label: string;
  icon: IconName | IconGlyph;
  iconPack?: string | IconPack;
  iconVariant?: IconVariant;
  iconClassName?: string | undefined;
}) {
  return (
    <Button
      {...props}
      {...(classNames ? { classNames } : {})}
      loading={loading}
      size={size}
      aria-label={label}
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
      {!loading && (
        <Icon
          {...(iconVariant ? { variant: iconVariant } : {})}
          className={iconClassName}
          {...(typeof icon === 'string'
            ? { name: icon, ...(iconPack ? { pack: iconPack } : {}) }
            : { glyph: icon })}
          size={size === 'lg' ? 20 : 16}
        />
      )}
    </Button>
  );
}

IconButton[interactiveTrigger] = true;
