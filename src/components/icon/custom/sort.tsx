import { IconSvg, type IconSvgProps } from '../svg';

function SortPair({
  sortDirection,
  ...props
}: IconSvgProps & { sortDirection?: 'asc' | 'desc' }) {
  return (
    <IconSvg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m5 6 3-3 3 3" opacity={sortDirection === 'desc' ? 0.25 : 1} />
      <path d="m5 10 3 3 3-3" opacity={sortDirection === 'asc' ? 0.25 : 1} />
    </IconSvg>
  );
}

export function SortAscendingIcon(props: IconSvgProps) {
  return <SortPair {...props} sortDirection="asc" />;
}

export function SortDescendingIcon(props: IconSvgProps) {
  return <SortPair {...props} sortDirection="desc" />;
}

export function SortUnsortedIcon(props: IconSvgProps) {
  return <SortPair {...props} />;
}
