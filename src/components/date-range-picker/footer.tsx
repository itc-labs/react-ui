'use client';
import { partTestId } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../common';
import { Button } from '../button';
import { PopoverClose } from '../popover';
import { dateSpan, displayCalendarDate } from '../calendar/model';
import type { DateRangePickerProps, DateRangeValue } from './types';

export function DateRangeFooter({
  'data-testid': testId,
  candidate,
  draftIssue,
  hasDraft,
  onReset,
  onApply,
  classNames,
  className,
}: {
  candidate: DateRangeValue;
  draftIssue: string;
  hasDraft: boolean;
  onReset: () => void;
  onApply: () => void;
  classNames: DateRangePickerProps['classNames'];
  className?: string;
} & { 'data-testid'?: string | undefined }) {
  const { t, locale } = useUILocale();

  return (
    <div
      data-testid={partTestId(testId, 'footer')}
      className={cn(
        'grid shrink-0 gap-3 border-t border-line pt-3',
        classNames?.footer,
        className,
      )}
    >
      <p
        data-testid={partTestId(testId, 'summary')}
        role="status"
        className={cn('text-ui-sm text-muted', classNames?.summary)}
      >
        {candidate
          ? t('range.summary', {
              count: dateSpan(candidate.from, candidate.to),
              from: displayCalendarDate(candidate.from, locale.code),
              to: displayCalendarDate(candidate.to, locale.code),
            })
          : t('range.instruction')}
      </p>
      {draftIssue && (
        <p
          data-testid={partTestId(testId, 'draftError')}
          role="alert"
          className={cn('text-ui-sm text-danger-700', classNames?.draftError)}
        >
          {draftIssue}
        </p>
      )}
      <div
        data-testid={partTestId(testId, 'actions')}
        className={cn('flex flex-wrap justify-end gap-2', classNames?.actions)}
      >
        <Button
          data-testid={partTestId(testId, 'reset')}
          variant="ghost"
          size="sm"
          className={cn('mr-auto', classNames?.reset)}
          disabled={!hasDraft}
          onClick={onReset}
        >
          {t('range.reset')}
        </Button>
        <PopoverClose asChild>
          <Button
            data-testid={partTestId(testId, 'cancel')}
            variant="ghost"
            size="sm"
            className={classNames?.cancel}
          >
            {t('range.cancel')}
          </Button>
        </PopoverClose>
        <Button
          data-testid={partTestId(testId, 'apply')}
          size="sm"
          className={classNames?.apply}
          disabled={!candidate || Boolean(draftIssue)}
          onClick={onApply}
        >
          {t('range.apply')}
        </Button>
      </div>
    </div>
  );
}
