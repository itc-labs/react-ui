'use client';

import { cn, partTestId } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import type { ChartClassNames } from './types';
import type { ChartModel } from './model';

interface ContentProps {
  model: ChartModel;
  classNames?: ChartClassNames | undefined;
  testId?: string | undefined;
}

export function ChartLegend({ model, classNames, testId }: ContentProps) {
  const { t } = useUILocale();

  return (
    <ul
      aria-label={t('chart.legend')}
      data-testid={partTestId(testId, 'legend')}
      className={cn(
        'flex flex-wrap justify-center gap-x-5 gap-y-2 text-ui-sm text-muted',
        classNames?.legend,
      )}
    >
      {model.entries.map((entry) => (
        <li
          key={entry.id}
          data-testid={partTestId(testId, 'legend', entry.id)}
          className={cn(
            'inline-flex min-w-0 items-center gap-2',
            classNames?.legendItem,
          )}
        >
          <span
            aria-hidden="true"
            style={{ backgroundColor: entry.color }}
            className={cn('size-2.5 shrink-0 rounded-sm', classNames?.legendMarker)}
          />
          <span className="break-words">{entry.label}</span>
        </li>
      ))}
    </ul>
  );
}

interface TableProps extends ContentProps {
  label: string;
  radial: boolean;
  visible?: boolean;
  formatValue: (value: number) => string;
  missingLabel: string;
}

export function ChartDataTable({
  model,
  label,
  radial,
  visible,
  formatValue,
  missingLabel,
  classNames,
  testId,
}: TableProps) {
  const { t } = useUILocale();

  return (
    <table
      data-testid={partTestId(testId, 'table')}
      className={cn(
        visible ? 'w-full border-collapse text-left text-ui-sm' : 'sr-only',
        classNames?.table,
      )}
    >
      <caption
        className={cn('pb-3 text-left font-medium text-ink', classNames?.tableCaption)}
      >
        {label}
      </caption>
      <thead className={cn('border-b border-line', classNames?.tableHead)}>
        <tr className={cn(classNames?.tableRow)}>
          <th
            scope="col"
            className={cn('px-3 py-2 font-medium', classNames?.tableHeader)}
          >
            {t('chart.category')}
          </th>
          {radial ? (
            <th
              scope="col"
              className={cn('px-3 py-2 font-medium', classNames?.tableHeader)}
            >
              {t('chart.value')}
            </th>
          ) : (
            model.entries.map((entry) => (
              <th
                key={entry.id}
                scope="col"
                className={cn('px-3 py-2 font-medium', classNames?.tableHeader)}
              >
                {entry.label}
              </th>
            ))
          )}
        </tr>
      </thead>
      <tbody>
        {model.rows.map((row) => (
          <tr
            key={row.id}
            data-testid={partTestId(testId, 'row', row.id)}
            className={cn('border-b border-line', classNames?.tableRow)}
          >
            <th
              scope="row"
              className={cn('px-3 py-2 font-medium', classNames?.tableHeader)}
            >
              {row.label}
            </th>
            {row.values.map((value, index) => (
              <td
                key={radial ? 'value' : model.entries[index]!.id}
                data-testid={partTestId(
                  testId,
                  'cell',
                  row.id,
                  radial ? 'value' : model.entries[index]!.id,
                )}
                className={cn('px-3 py-2 tabular-nums', classNames?.tableCell)}
              >
                {value === null ? missingLabel : formatValue(value)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface TooltipProps extends ContentProps {
  active?: boolean | undefined;
  payload?: readonly { payload?: unknown }[] | undefined;
  radial: boolean;
  formatValue: (value: number) => string;
  missingLabel: string;
}

export function ChartTooltip({
  active,
  payload,
  radial,
  model,
  formatValue,
  missingLabel,
  classNames,
  testId,
}: TooltipProps) {
  const point = payload?.[0]?.payload;
  const id =
    typeof point === 'object' && point !== null && 'id' in point ? point.id : undefined;
  const row = model.rows.find((item) => item.id === id);
  if (!active || !row) return null;
  const entries = radial
    ? model.entries.filter((entry) => entry.id === row.id)
    : model.entries;

  return (
    <div
      role="tooltip"
      data-testid={partTestId(testId, 'tooltip')}
      className={cn(
        'max-w-xs rounded-control border border-line bg-surface p-3 text-ui-sm text-ink shadow-floating',
        classNames?.tooltip,
      )}
    >
      <p className={cn('mb-2 break-words font-semibold', classNames?.tooltipLabel)}>
        {row.label}
      </p>
      <dl className="grid gap-2">
        {entries.map((entry, index) => {
          const value = row.values[radial ? 0 : index] ?? null;

          return (
            <div
              key={entry.id}
              className={cn('flex items-center gap-3', classNames?.tooltipRow)}
            >
              <dt className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: entry.color }}
                  className={cn(
                    'size-2 shrink-0 rounded-sm',
                    classNames?.tooltipMarker,
                  )}
                />
                <span className="break-words">{entry.label}</span>
              </dt>
              <dd
                className={cn(
                  'ml-auto font-medium tabular-nums',
                  classNames?.tooltipValue,
                )}
              >
                {value === null ? missingLabel : formatValue(value)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
