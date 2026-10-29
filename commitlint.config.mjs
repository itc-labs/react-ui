/** Conventional Commits; squash merges use the pull request title, which CI checks too. */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'refactor',
        'test',
        'perf',
        'ci',
        'build',
        'style',
        'revert',
      ],
    ],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [0],
  },
};
