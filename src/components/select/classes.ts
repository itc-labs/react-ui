import type { ClassNamesConfig } from 'react-select';
import { cn, clearIndicatorClassName, type ControlSize } from '../common';
import type { SelectOption, SelectClassNames } from './types';

export function selectClasses(
  size: ControlSize,
  invalid: unknown,
  classNames?: SelectClassNames,
): ClassNamesConfig<SelectOption, boolean> {
  const mergeSlot = <K extends keyof ClassNamesConfig<SelectOption, boolean>>(
    key: K,
    state: Parameters<NonNullable<ClassNamesConfig<SelectOption, boolean>[K]>>[0],
  ) => {
    const custom = classNames?.[key];

    return typeof custom === 'function' ? custom(state as never) : custom;
  };

  const defaultClasses: ClassNamesConfig<SelectOption, boolean> = {
    control: ({ isFocused, isDisabled }) =>
      cn(
        'rounded-control border bg-surface text-control text-ink transition-[border-color,box-shadow] motion-reduce:transition-none',
        size === 'sm'
          ? 'min-h-control-sm'
          : size === 'lg'
            ? 'min-h-control-lg'
            : 'min-h-control-md',
        invalid ? 'border-danger-700' : 'border-control-border',
        isFocused &&
          'forced-colors:outline-2 forced-colors:outline-solid forced-colors:outline-[Highlight]',
        isFocused &&
          (invalid ? 'shadow-control-error' : 'border-accent shadow-control-focus'),
        isDisabled && 'cursor-not-allowed bg-canvas opacity-60',
      ),
    valueContainer: () => 'gap-1 px-3 py-1',
    placeholder: () => 'text-muted',
    input: () => 'm-0 p-0',
    indicatorsContainer: () => 'cursor-pointer gap-1 px-2 text-muted',
    clearIndicator: () => clearIndicatorClassName,
    dropdownIndicator: () => 'rounded p-0.5',
    indicatorSeparator: () => 'hidden',
    menu: () =>
      'my-1 overflow-hidden rounded-control border border-line bg-surface p-1 text-control text-ink shadow-floating',
    menuList: () => 'max-h-60 overflow-y-auto',
    option: ({ isFocused, isSelected, isDisabled }) =>
      cn(
        'cursor-pointer rounded px-3 py-2',
        isSelected ? 'bg-accent text-on-brand' : isFocused && 'bg-hover',
        isDisabled && 'cursor-not-allowed opacity-40',
      ),
    multiValue: () => 'gap-1 rounded bg-selected px-1.5 py-0.5 text-ui-sm text-ink',
    multiValueRemove: () => 'rounded hover:bg-hover',
    noOptionsMessage: () => 'p-3 text-muted',
    loadingMessage: () => 'p-3 text-muted',
  };

  const mergedClasses: ClassNamesConfig<SelectOption, boolean> = {};

  function assignClass<K extends keyof ClassNamesConfig<SelectOption, boolean>>(
    key: K,
  ) {
    mergedClasses[key] = ((
      state: Parameters<NonNullable<ClassNamesConfig<SelectOption, boolean>[K]>>[0],
    ) =>
      cn(
        defaultClasses[key]?.(state as never),
        mergeSlot(key, state),
      )) as ClassNamesConfig<SelectOption, boolean>[K];
  }

  for (const key of new Set([
    ...Object.keys(defaultClasses),
    ...Object.keys(classNames ?? {}),
  ])) {
    if (
      ![
        'root',
        'label',
        'required',
        'hint',
        'error',
        'feedback',
        'optionsError',
        'retry',
        'loadMore',
        'menuFooter',
        'loadingMore',
      ].includes(key)
    )
      assignClass(key as keyof ClassNamesConfig<SelectOption, boolean>);
  }

  return mergedClasses;
}
