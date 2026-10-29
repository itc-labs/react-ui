import { describe, expect, it } from 'vitest';
import { validateFiles } from './validation';

describe('upload selection constraints', () => {
  it('accepts extensions, MIME and wildcard types', () => {
    expect(
      validateFiles([{ name: 'a.PDF', size: 10, type: 'application/pdf' }], {
        accept: '.pdf',
      }),
    ).toBeUndefined();
    expect(
      validateFiles([{ name: 'a.png', size: 10, type: 'image/png' }], {
        accept: 'image/*',
      }),
    ).toBeUndefined();
    expect(
      validateFiles([{ name: 'a.png', size: 10, type: 'image/png' }], {
        accept: 'image/png,image/jpeg',
      }),
    ).toBeUndefined();
  });

  it('rejects unsupported, oversized and excess files without mutating the selection', () => {
    const files = [{ name: 'a.exe', size: 100, type: 'application/octet-stream' }];
    expect(validateFiles(files, { accept: '.pdf' })).toContain('không được hỗ trợ');
    expect(validateFiles(files, { maxBytes: 50 })).toContain('vượt giới hạn');
    expect(validateFiles([...files, ...files], { maxFiles: 1 })).toContain('tối đa 1');
    expect(files).toHaveLength(1);
  });
});
