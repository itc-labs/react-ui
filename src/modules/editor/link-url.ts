/** Only absolute web and email URLs are accepted by the editor. */
export function isEditorUrl(value: string): boolean {
  if (!/^(https?:\/\/|mailto:)/i.test(value.trim())) return false;
  try {
    const url = new URL(value.trim());

    return (
      ['http:', 'https:', 'mailto:'].includes(url.protocol) &&
      Boolean(url.protocol === 'mailto:' ? url.pathname : url.hostname)
    );
  } catch {
    return false;
  }
}
