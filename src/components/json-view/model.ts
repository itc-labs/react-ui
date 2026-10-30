export interface JsonNode {
  id: string;
  key?: string;
  text: string;
  kind: 'string' | 'number' | 'boolean' | 'null' | 'other' | 'object' | 'array';
  children?: JsonNode[];
}

export function jsonNode(
  value: unknown,
  sortKeys = false,
  id = '$',
  key?: string,
  ancestors: readonly object[] = [],
): JsonNode {
  const base = { id, ...(key === undefined ? {} : { key }) };
  if (value === null) return { ...base, kind: 'null', text: 'null' };
  if (value instanceof Date)
    return {
      ...base,
      kind: 'string',
      text: Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString(),
    };
  if (typeof value === 'object') {
    if (ancestors.includes(value))
      return { ...base, kind: 'other', text: '[Circular]' };
    const array = Array.isArray(value);
    const keys = array
      ? Array.from({ length: value.length }, (_, index) => String(index))
      : Object.keys(value);
    if (sortKeys && !array) keys.sort();

    return {
      ...base,
      kind: array ? 'array' : 'object',
      text: '',
      children: keys.map((childKey) =>
        jsonNode(
          (value as Record<string, unknown>)[childKey],
          sortKeys,
          `${id}/${childKey.replace(/~/g, '~0').replace(/\//g, '~1')}`,
          childKey,
          [...ancestors, value],
        ),
      ),
    };
  }
  const kind = typeof value;

  return {
    ...base,
    kind: kind === 'string' || kind === 'number' || kind === 'boolean' ? kind : 'other',
    text: kind === 'function' ? '[Function]' : String(value),
  };
}

function safeValue(node: JsonNode): unknown {
  if (node.children)
    return node.kind === 'array'
      ? node.children.map(safeValue)
      : Object.fromEntries(node.children.map((child) => [child.key, safeValue(child)]));
  if (node.kind === 'null') return null;
  if (node.kind === 'number') return Number(node.text);
  if (node.kind === 'boolean') return node.text === 'true';

  return node.text;
}

export function copyJson(data: unknown): string {
  try {
    const result = JSON.stringify(data, null, 2);
    if (result !== undefined) return result;
  } catch {
    // Extended values use the same safe representation as the tree.
  }

  return JSON.stringify(safeValue(jsonNode(data)), null, 2);
}
