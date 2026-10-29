import type { ReactNode } from 'react';
export interface TreeNode {
  id: string;
  label: string;
  children?: readonly TreeNode[];
  disabled?: boolean;
  icon?: ReactNode;
}
export interface VisibleTreeNode {
  node: TreeNode;
  level: number;
  parentId: string | null;
  position: number;
  siblings: number;
}

export function visibleTree(
  nodes: readonly TreeNode[],
  expanded: readonly string[],
  level = 1,
  parentId: string | null = null,
  ancestors = new Set<string>(),
): VisibleTreeNode[] {
  return nodes.flatMap((node, index) => {
    if (ancestors.has(node.id)) return [];
    const path = new Set(ancestors);
    path.add(node.id);

    return [
      { node, level, parentId, position: index + 1, siblings: nodes.length },
      ...(expanded.includes(node.id)
        ? visibleTree(node.children ?? [], expanded, level + 1, node.id, path)
        : []),
    ];
  });
}

export function validateTree(nodes: readonly TreeNode[], seen = new Set<string>()) {
  for (const node of nodes) {
    if (seen.has(node.id)) throw new Error(`Duplicate/cyclic tree ID: ${node.id}`);
    seen.add(node.id);
    validateTree(node.children ?? [], seen);
  }
}
