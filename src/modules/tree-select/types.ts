import type { FocusEventHandler, ReactNode, Ref } from 'react';
import type { ControlSize, SlotClasses, TestIdProps } from '../../components/common';

export interface TreeSelectNode {
  id: string;
  label: string;
  children?: readonly TreeSelectNode[];
  hasChildren?: boolean;
  hasMore?: boolean;
  disabled?: boolean;
  selectable?: boolean;
  icon?: ReactNode;
  description?: ReactNode;
  /** Ancestor labels supplied with remote results. */
  path?: readonly string[];
}
export interface TreeSelectOption {
  id: string;
  label: string;
  path?: readonly string[];
}
export interface TreeSelectNodeState {
  selected: boolean;
  checked: boolean | 'mixed';
  expanded: boolean;
  disabled: boolean;
  level: number;
}
export type TreeSelectClassNames = SlotClasses<
  | 'root'
  | 'label'
  | 'control'
  | 'value'
  | 'tag'
  | 'tagRemove'
  | 'placeholder'
  | 'popover'
  | 'search'
  | 'tree'
  | 'row'
  | 'rowSelected'
  | 'toggle'
  | 'checkbox'
  | 'rowLabel'
  | 'highlight'
  | 'loadMore'
  | 'empty'
  | 'hint'
  | 'error'
>;
interface Base extends TestIdProps {
  nodes: readonly TreeSelectNode[];
  selectedOptions?: readonly TreeSelectOption[];
  selectableLevels?: 'all' | 'leaf';
  isNodeDisabled?: (node: TreeSelectNode) => boolean;
  disabledSubtreeIds?: readonly string[];
  hasMore?: boolean;
  loadingIds?: readonly (string | null)[];
  onLoadMore?: (parentId: string | null) => void;
  loadChildren?: (node: TreeSelectNode) => Promise<void> | void;
  showPath?: boolean;
  maxTagCount?: number;
  searchable?: boolean;
  onSearchChange?: (query: string) => void;
  searchDebounceMs?: number;
  searchLoading?: boolean;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
  label?: ReactNode;
  required?: boolean;
  name?: string;
  id?: string;
  size?: ControlSize;
  className?: string;
  classNames?: TreeSelectClassNames;
  ref?: Ref<HTMLDivElement>;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  onFocus?: FocusEventHandler<HTMLDivElement>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  renderNode?: (node: TreeSelectNode, state: TreeSelectNodeState) => ReactNode;
}
export interface SingleTreeSelectProps extends Base {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  cascade?: never;
  checkedStrategy?: never;
}
export interface MultiTreeSelectProps extends Base {
  multiple: true;
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  cascade?: boolean;
  checkedStrategy?: 'all' | 'parent' | 'child';
}
export type TreeSelectProps = SingleTreeSelectProps | MultiTreeSelectProps;
