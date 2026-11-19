import { iconToneClasses } from '../common/tone';
import type { DropdownMenuItemTone } from './types';

export const menuContentClass =
  'ui-floating-motion z-[var(--z-index-dropdown)] min-w-44 rounded-control border border-line bg-surface p-1 text-control text-ink shadow-floating';
export const menuItemClass =
  'flex cursor-pointer data-[disabled]:cursor-not-allowed select-none items-center gap-2 rounded px-3 py-2 outline-none data-[highlighted]:bg-hover data-[disabled]:opacity-40';
export const dangerMenuItemClass = 'text-danger-700 data-[highlighted]:bg-danger-50';

export const menuItemToneClasses: Record<DropdownMenuItemTone, string> = {
  default: '',
  brand: `${iconToneClasses.brand} data-[highlighted]:bg-brand-50`,
  info: `${iconToneClasses.info} data-[highlighted]:bg-info-50`,
  success: `${iconToneClasses.success} data-[highlighted]:bg-success-50`,
  warning: `${iconToneClasses.warning} data-[highlighted]:bg-warning-50`,
  danger: dangerMenuItemClass,
};

export const dashedMenuItemClass =
  'border border-dashed border-brand-500 bg-brand-50 text-brand-700 data-[highlighted]:border-brand-700 data-[highlighted]:bg-brand-100';
