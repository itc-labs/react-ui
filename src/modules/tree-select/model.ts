import { validateTree } from '../tree/model';
import type { TreeSelectNode, TreeSelectProps } from './types';

export const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase();

export const isBranch = (node: TreeSelectNode) =>
  Boolean(node.children?.length || node.hasChildren || node.hasMore);

export interface Entry {
  node: TreeSelectNode;
  parent: string | null;
  level: number;
  position: number;
  siblings: number;
  path: string[];
  disabled: boolean;
  selectable: boolean;
}

export function buildModel(props: TreeSelectProps) {
  validateTree(props.nodes);
  const entries = new Map<string, Entry>();

  const visit = (
    nodes: readonly TreeSelectNode[],
    parent: string | null,
    path: string[],
    blocked: boolean,
  ) => {
    nodes.forEach((node, index) => {
      const subtree = blocked || Boolean(props.disabledSubtreeIds?.includes(node.id));
      const disabled =
        subtree || Boolean(node.disabled || props.isNodeDisabled?.(node));
      entries.set(node.id, {
        node,
        parent,
        level: path.length + 1,
        position: index + 1,
        siblings: nodes.length,
        path: node.path ? [...node.path] : path,
        disabled,
        selectable:
          !disabled &&
          node.selectable !== false &&
          (props.selectableLevels !== 'leaf' || !isBranch(node)),
      });
      visit(node.children ?? [], node.id, [...path, node.label], subtree);
    });
  };

  visit(props.nodes, null, [], false);

  return entries;
}

export function ancestors(id: string, model: Map<string, Entry>) {
  const result: string[] = [];
  let parent = model.get(id)?.parent;
  while (parent != null) {
    result.push(parent);
    parent = model.get(parent)?.parent;
  }

  return result;
}

/** Expand compressed parent values and derive aggregate state bottom-up. */
export function cascadeState(ids: readonly string[], model: Map<string, Entry>) {
  const checked = new Set<string>();
  const mixed = new Set<string>();
  const seeds = new Set(ids);
  const participating = new Set<string>();
  for (const [id, entry] of [...model].reverse()) {
    if (
      !entry.disabled &&
      (entry.selectable ||
        entry.node.children?.some((child) => participating.has(child.id)))
    )
      participating.add(id);
  }
  for (const [id, entry] of model) {
    if (
      entry.selectable &&
      (seeds.has(id) || ancestors(id, model).some((parent) => seeds.has(parent)))
    )
      checked.add(id);
  }
  for (const [id, entry] of [...model].reverse()) {
    if (entry.disabled) continue;
    const children = (entry.node.children ?? []).filter((node) =>
      participating.has(node.id),
    );
    if (!children.length) continue;
    const all = children.every((node) => checked.has(node.id));
    const some = children.some((node) => checked.has(node.id) || mixed.has(node.id));
    if (all) checked.add(id);
    else {
      checked.delete(id);
      if (some) mixed.add(id);
    }
  }

  return { checked, mixed };
}

export function serialize(
  checked: Set<string>,
  model: Map<string, Entry>,
  strategy: 'all' | 'parent' | 'child',
) {
  return [...checked].filter((id) => {
    const entry = model.get(id);
    if (!entry) return true;
    if (!entry.selectable) return false;
    if (strategy === 'child') return !isBranch(entry.node);
    if (strategy === 'parent')
      return !ancestors(id, model).some(
        (parent) => checked.has(parent) && model.get(parent)?.selectable,
      );

    return true;
  });
}

/** Map normalized matches back to original UTF-16 offsets for accented labels. */
export function matchRange(label: string, query: string): [number, number] | undefined {
  const offsets: number[] = [];
  let offset = 0;
  for (const character of label) {
    for (const _ of normalize(character)) offsets.push(offset);
    offset += character.length;
  }
  const start = normalize(label).indexOf(normalize(query));
  if (start < 0 || !query) return;
  const from = offsets[start]!;
  const end = offsets[start + normalize(query).length] ?? label.length;

  return [from, end];
}
