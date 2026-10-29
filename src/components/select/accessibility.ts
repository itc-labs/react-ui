import type { Props as ReactSelectProps } from 'react-select';
import type { UITranslate } from '../../i18n';
import { fieldDescription } from '../common';
import type { SelectOption, SelectProps } from './types';

type AccessibilityProps = Pick<
  ReactSelectProps<SelectOption, boolean>,
  | 'aria-label'
  | 'aria-invalid'
  | 'ariaLiveMessages'
  | 'screenReaderStatus'
  | 'noOptionsMessage'
  | 'loadingMessage'
> & { 'aria-describedby'?: string };

export function selectAccessibility(
  props: SelectProps,
  inputId: string,
  t: UITranslate,
): AccessibilityProps {
  const description = fieldDescription(
    inputId,
    Boolean(props.error),
    Boolean(props.hint),
    [
      props['aria-describedby'],
      props.hasMore && props.onLoadMore ? `${inputId}-more-hint` : undefined,
    ]
      .filter(Boolean)
      .join(' '),
  );

  return {
    ...(props['aria-label'] ? { 'aria-label': props['aria-label'] } : {}),
    'aria-invalid': (Boolean(props.error) || props['aria-invalid']) ?? false,
    ...(description ? { 'aria-describedby': description } : {}),
    screenReaderStatus: ({ count }) => t('select.count', { count }),
    ariaLiveMessages: {
      guidance: () => t(props.searchable ? 'select.searchGuidance' : 'select.guidance'),
      onChange: ({ label, action }) =>
        label
          ? t(
              ['remove-value', 'pop-value', 'deselect-option'].includes(action)
                ? 'select.removed'
                : 'select.selected',
              { label },
            )
          : t('select.cleared'),
      onFocus: ({ focused }) => focused.label,
      onFilter: ({ resultsMessage }) => resultsMessage,
    },
    noOptionsMessage: () => t(props.optionsError ? 'select.error' : 'select.empty'),
    loadingMessage: () => t('select.loading'),
  };
}
