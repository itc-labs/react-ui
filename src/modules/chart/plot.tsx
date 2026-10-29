'use client';

import { useTheme } from '../../theme/provider';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '../../components/common';
import type { ChartProps } from './types';
import type { ChartModel, ChartRow } from './model';
import { ChartTooltip } from './content';

interface PlotProps {
  config: ChartProps;
  model: ChartModel;
  formatValue: (value: number) => string;
  missingLabel: string;
}

/** Rendering-engine details remain behind Chart's own public data contract. */
export function ChartPlot({ config, model, formatValue, missingLabel }: PlotProps) {
  const { colors } = useTheme();
  const radial = config.type === 'pie' || config.type === 'donut';
  const horizontal = config.type === 'bar' && config.orientation === 'horizontal';
  const classes = config.classNames;
  const tooltip =
    config.tooltip !== false ? (
      <Tooltip
        filterNull={false}
        isAnimationActive={false}
        cursor={
          radial ? false : { stroke: colors.controlBorder, fill: colors.brand[50] }
        }
        content={(props) => (
          <ChartTooltip
            {...props}
            model={model}
            radial={radial}
            formatValue={formatValue}
            missingLabel={missingLabel}
            classNames={classes}
            testId={config['data-testid']}
          />
        )}
      />
    ) : null;
  const common = {
    data: model.rows,
    accessibilityLayer: true,
    'aria-label': config.label,
    margin: { top: 12, right: 16, bottom: 4, left: 4 },
  };
  const axes = !radial ? (
    <>
      {config.grid !== false && (
        <CartesianGrid
          stroke={colors.line}
          strokeDasharray="3 3"
          vertical={horizontal}
          horizontal={!horizontal}
          className={cn(classes?.grid)}
        />
      )}
      <XAxis
        hide={config.xAxis === false}
        type={horizontal ? 'number' : 'category'}
        {...(!horizontal ? { dataKey: 'label' as const } : {})}
        tickLine={false}
        axisLine={false}
        tickMargin={10}
        tick={{ fill: colors.muted, fontSize: 'var(--text-ui-sm)' }}
        {...(horizontal ? { tickFormatter: formatValue } : {})}
        className={cn(classes?.axis)}
      />
      <YAxis
        hide={config.yAxis === false}
        type={horizontal ? 'category' : 'number'}
        {...(horizontal ? { dataKey: 'label' as const } : {})}
        tickLine={false}
        axisLine={false}
        width={horizontal ? 88 : 64}
        tickMargin={8}
        tick={{ fill: colors.muted, fontSize: 'var(--text-ui-sm)' }}
        {...(!horizontal ? { tickFormatter: formatValue } : {})}
        className={cn(classes?.axis)}
      />
    </>
  ) : null;
  let chart;
  if (radial) {
    chart = (
      <PieChart {...common}>
        <Pie
          data={model.rows.map((row) => ({
            ...row,
            fill: model.entries.find((entry) => entry.id === row.id)!.color,
          }))}
          dataKey={(row: ChartRow) => row.values[0]}
          nameKey="label"
          innerRadius={
            config.type === 'donut' ? `${(config.innerRadius ?? 0.62) * 85}%` : 0
          }
          outerRadius="85%"
          stroke={colors.surface}
          strokeWidth={2}
          isAnimationActive={false}
          className={cn(classes?.series)}
        >
          {model.entries.map((entry) => (
            <Cell key={entry.id} fill={entry.color} />
          ))}
        </Pie>
        {tooltip}
      </PieChart>
    );
  } else {
    const series = model.entries.map((entry, index) => {
      const props = {
        dataKey: (row: ChartRow) => row.values[index],
        name: entry.label,
        stroke: entry.color,
        fill: entry.color,
        isAnimationActive: false,
        className: cn(classes?.series),
      };
      if (config.type === 'bar')
        return (
          <Bar
            key={entry.id}
            {...props}
            {...(config.stacked ? { stackId: 'values' } : {})}
            maxBarSize={48}
          />
        );
      if (config.type === 'area')
        return (
          <Area
            key={entry.id}
            {...props}
            type={config.curve ?? 'monotone'}
            {...(config.stacked ? { stackId: 'values' } : {})}
            connectNulls={false}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        );

      return (
        <Line
          key={entry.id}
          {...props}
          type={config.curve ?? 'monotone'}
          connectNulls={false}
          fill="none"
          strokeWidth={2}
          dot={config.dots ?? false}
          activeDot={{ r: 4 }}
        />
      );
    });
    if (config.type === 'bar')
      chart = (
        <BarChart {...common} layout={horizontal ? 'vertical' : 'horizontal'}>
          {axes}
          {series}
          {tooltip}
        </BarChart>
      );
    else if (config.type === 'area')
      chart = (
        <AreaChart {...common}>
          {axes}
          {series}
          {tooltip}
        </AreaChart>
      );
    else
      chart = (
        <LineChart {...common}>
          {axes}
          {series}
          {tooltip}
        </LineChart>
      );
  }

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minWidth={0}
      initialDimension={{ width: 320, height: config.height ?? 288 }}
    >
      {chart}
    </ResponsiveContainer>
  );
}
