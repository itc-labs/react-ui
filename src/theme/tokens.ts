import { uiThemeTokenNames, type UIThemeTokens } from './token-names';

/** Snapshot at the boundary, including plain objects passed across RSC props. */
export function validateThemeTokens(tokens: UIThemeTokens): Readonly<UIThemeTokens> {
  const result: UIThemeTokens = {};

  for (const [name, value] of Object.entries(tokens)) {
    if (!uiThemeTokenNames.some((token) => token === name)) {
      throw new Error(`Unknown theme token: ${name}`);
    }
    if (
      typeof value !== 'string' ||
      !value.trim() ||
      /[;{}<>\\\r\n\u2028\u2029]|\/\*|!\s*important/i.test(value)
    ) {
      throw new Error(`Unsafe theme token value: ${name}`);
    }
    result[name as keyof UIThemeTokens] = value;
  }

  return Object.freeze(result);
}

/** Canonical order is independent of the insertion order of a host's object. */
export function themeTokenRule(tokens: Readonly<UIThemeTokens>): string {
  return `:root{${uiThemeTokenNames
    .filter((name) => tokens[name] !== undefined)
    .map((name) => `--${name}:${tokens[name]};`)
    .join('')}}`;
}
