import { cn, partTestId } from '../../components/common';
import type { KpiGridColumns, KpiGridProps } from './types';

// Container queries let the grid respond to its own width inside panels and drawers.
const columnClasses: Record<KpiGridColumns, string> = {
  1: '',
  2: '@md:grid-cols-2',
  3: '@md:grid-cols-2 @3xl:grid-cols-3',
  4: '@md:grid-cols-2 @4xl:grid-cols-4',
  5: '@md:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-5',
  6: '@md:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-6',
};

export function KpiGrid({
  columns = 4,
  children,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: KpiGridProps) {
  return (
    <div
      {...props}
      data-testid={testId}
      className={cn('@container min-w-0', classNames?.root, className)}
    >
      <div
        data-testid={partTestId(testId, 'grid')}
        data-columns={columns}
        className={cn(
          'grid grid-cols-1 gap-4',
          columnClasses[columns] ?? columnClasses[4],
          classNames?.grid,
        )}
      >
        {children}
      </div>
    </div>
  );
}
