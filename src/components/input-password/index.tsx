'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import type { TestIdProps } from '../common/testing';

import { partTestId } from '../common/testing';
import { useState } from 'react';
import { Input, type InputProps } from '../input';
import { IconButton } from '../icon-button';
import { useUILocale } from '../../i18n/provider';

export type InputPasswordProps = (Omit<
  InputProps,
  'type' | 'iconRight' | 'endAddon'
> & {
  showLabel?: string;
  hideLabel?: string;
}) &
  TestIdProps;

export function InputPassword({
  disabled,
  readOnly,
  showLabel,
  hideLabel,
  classNames,
  ...props
}: InputPasswordProps) {
  const [visible, setVisible] = useState(false);
  const { t } = useUILocale();

  return (
    <Input
      {...props}
      {...(classNames ? { classNames } : {})}
      disabled={disabled}
      readOnly={readOnly}
      type={visible ? 'text' : 'password'}
      endAddon={
        <IconButton
          data-testid={partTestId(props['data-testid'], 'toggle')}
          icon={visible ? 'eyeOff' : 'view'}
          label={
            visible
              ? (hideLabel ?? t('password.hide'))
              : (showLabel ?? t('password.show'))
          }
          aria-pressed={visible}
          disabled={disabled}
          variant="ghost"
          size="sm"
          className={classNames?.iconRight}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible((value) => !value)}
        />
      }
    />
  );
}

InputPassword[interactiveTrigger] = true;
