import { expect, it } from 'vitest';
import { validateTree, visibleTree, type TreeNode } from './model';

it('flattens only expanded branches with ARIA hierarchy positions', () => {
  const nodes: TreeNode[] = [
    { id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] },
    { id: 'other', label: 'Other' },
  ];
  expect(visibleTree(nodes, []).map(({ node }) => node.id)).toEqual(['root', 'other']);
  expect(visibleTree(nodes, ['root'])[1]).toMatchObject({
    level: 2,
    parentId: 'root',
    position: 1,
    siblings: 1,
  });
});

it('rejects duplicate or cyclic identities instead of rendering ambiguous keyboard targets', () => {
  expect(() =>
    validateTree([{ id: 'a', label: 'A', children: [{ id: 'a', label: 'Again' }] }]),
  ).toThrow('Duplicate/cyclic');
});
