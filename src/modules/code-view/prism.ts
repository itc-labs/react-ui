import { Prism, type PrismTheme } from 'prism-react-renderer';

// Keep the additional shell grammar local to this entry point.
export const codePrism = {
  ...Prism,
  languages: {
    ...Prism.languages,
    bash: {
      comment: { pattern: /(^|\s)#.*/m, lookbehind: true },
      string: [
        { pattern: /"(?:\\[\s\S]|[^"\\])*"/, greedy: true },
        { pattern: /'(?:[^'])*'/, greedy: true },
      ],
      variable: /\$\{[^}]+\}|\$[\w@#?$!*-]+/,
      keyword:
        /\b(?:if|then|else|elif|fi|for|while|in|do|done|case|esac|function|select|until)\b/,
      builtin:
        /\b(?:echo|printf|cd|pwd|export|source|read|exit|set|unset|alias|test)\b/,
      function: { pattern: /(^|[;&|]\s*)[\w./-]+/m, lookbehind: true },
      number: /\b\d+\b/,
      operator: /&&|\|\||[|&;<>!=]/,
      punctuation: /[()[\]{}]/,
    },
  },
};

export const codeTheme: PrismTheme = {
  plain: { color: 'var(--color-code-ink)' },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--color-code-comment)' },
    },
    {
      types: ['keyword', 'tag', 'selector', 'important'],
      style: { color: 'var(--color-code-keyword)' },
    },
    {
      types: ['string', 'char', 'attr-value', 'inserted'],
      style: { color: 'var(--color-code-string)' },
    },
    {
      types: ['number', 'boolean', 'constant', 'deleted'],
      style: { color: 'var(--color-code-number)' },
    },
    {
      types: ['function', 'class-name', 'builtin', 'attr-name', 'property'],
      style: { color: 'var(--color-code-function)' },
    },
    { types: ['operator', 'punctuation'], style: { color: 'var(--color-code-ink)' } },
    {
      types: ['variable', 'symbol', 'regex'],
      style: { color: 'var(--color-code-keyword)' },
    },
    { types: ['bold'], style: { fontWeight: 'bold' } },
    { types: ['italic'], style: { fontStyle: 'italic' } },
  ],
};
