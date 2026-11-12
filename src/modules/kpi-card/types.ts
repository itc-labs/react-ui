import type { ComponentProps, MouseEvent, ReactNode, Ref } from 'react';
import type { SlotClasses, TestIdProps, UITone } from '../../components/common';
import type { IconGlyph, IconName } from '../../components/icon';

export type MetricTrendDirection = 'up' | 'down' | 'flat';
/** Whether the change is good, bad or neither; independent of its direction. */
export type MetricTrendIntent = 'positive' | 'negative' | 'neutral';
export type MetricTrendClassNames = SlotClasses<'root' | 'icon' | 'value' | 'label'>;
export type MetricTrendProps = Omit<ComponentProps<'span'>, 'children'> &
  TestIdProps & {
    /** Signed change. Its sign selects the direction unless `direction` is set. */
    value?: number | null;
    direction?: MetricTrendDirection;
    /** Defaults to positive for up, negative for down and neutral for flat. */
    intent?: MetricTrendIntent;
    /** Receives the absolute change. Defaults to a locale percentage (3.9 → 3.9%). */
    valueFormatter?: (value: number) => string;
    /** Context after the value, for example a comparison period. */
    label?: ReactNode;
    /** Replaces the formatted value and label. */
    children?: ReactNode;
    /**
     * Screen-reader direction text before the content. Defaults to the localized
     * increase/decrease/no-change message; pass an empty string when the visible
     * content already states the direction.
     */
    directionLabel?: string;
    classNames?: MetricTrendClassNames;
  };

export type KpiCardTone = UITone;
export type KpiCardDensity = 'default' | 'dashboard';
export type KpiCardTrend = Pick<
  MetricTrendProps,
  | 'value'
  | 'direction'
  | 'intent'
  | 'valueFormatter'
  | 'label'
  | 'children'
  | 'directionLabel'
>;
export type KpiCardClassNames = SlotClasses<
  | 'root'
  | 'bar'
  | 'decoration'
  | 'content'
  | 'header'
  | 'icon'
  | 'badge'
  | 'label'
  | 'value'
  | 'unit'
  | 'trend'
  | 'hint'
  | 'progress'
  | 'action'
>;
export type KpiCardProps = Omit<ComponentProps<'div'>, 'children' | 'onClick'> &
  TestIdProps & {
    ref?: Ref<HTMLDivElement>;
    label: ReactNode;
    /** Formatted value. `0` is displayed; `null`/`undefined` shows a missing value. */
    value: ReactNode;
    unit?: ReactNode;
    tone?: KpiCardTone;
    icon?: IconName | IconGlyph;
    /** Non-interactive status content on the header row, for example a Tag. */
    badge?: ReactNode;
    trend?: KpiCardTrend;
    /** Supporting line below the value and trend. */
    hint?: ReactNode;
    /** Percentage from 0 to 100; values outside the range are clamped. */
    progress?: number | null;
    /** Accessible progress name. Defaults to a string `label` or the localized label. */
    progressLabel?: string;
    compact?: boolean;
    density?: KpiCardDensity;
    /** Makes the whole card a link rendered through the UIProvider link component. */
    href?: string;
    /** Makes the whole card a button. Ignored when `href` is set. */
    onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
    loading?: boolean;
    loadingLabel?: string;
    missingValueLabel?: string;
    classNames?: KpiCardClassNames;
  };

export type KpiGridColumns = 1 | 2 | 3 | 4 | 5 | 6;
export type KpiGridClassNames = SlotClasses<'root' | 'grid'>;
export type KpiGridProps = ComponentProps<'div'> &
  TestIdProps & {
    /** Maximum columns on wide containers. Narrow containers use 1, then 2. */
    columns?: KpiGridColumns;
    classNames?: KpiGridClassNames;
  };
