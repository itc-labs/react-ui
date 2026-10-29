import {
  createTranslator,
  viVN,
  type UIMessageKey,
  type UIMessageValues,
  type UITranslate,
} from '../../i18n';
export type FileRules = { accept?: string; maxBytes?: number; maxFiles?: number };
export type FileValidationIssue = { key: UIMessageKey; values: UIMessageValues };

/** Keep the issue structural so an already-visible error can follow a locale change. */
export function getFileIssue(
  files: readonly Pick<File, 'name' | 'size' | 'type'>[],
  { accept = '', maxBytes = 10 * 1024 * 1024, maxFiles = 1 }: FileRules = {},
): FileValidationIssue | undefined {
  if (files.length > maxFiles)
    return { key: 'upload.maxFiles', values: { count: maxFiles } };
  const types = accept
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  for (const file of files) {
    if (file.size > maxBytes)
      return {
        key: 'upload.maxBytes',
        values: {
          name: file.name,
          size: Math.round((maxBytes / 1024 / 1024) * 10) / 10,
        },
      };
    if (
      types.length &&
      !types.some((type) =>
        type.startsWith('.')
          ? file.name.toLowerCase().endsWith(type)
          : type.endsWith('/*')
            ? file.type.toLowerCase().startsWith(type.slice(0, -1))
            : file.type.toLowerCase() === type,
      )
    )
      return { key: 'upload.unsupported', values: { name: file.name } };
  }
}

const defaultTranslate = createTranslator(viVN);

/** Backward-compatible pure helper. Supply a translator outside React when needed. */
export function validateFiles(
  files: readonly Pick<File, 'name' | 'size' | 'type'>[],
  rules: FileRules = {},
  t: UITranslate = defaultTranslate,
): string | undefined {
  const issue = getFileIssue(files, rules);

  return issue ? t(issue.key, issue.values) : undefined;
}
