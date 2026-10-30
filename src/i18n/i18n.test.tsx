import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';
import { createTranslator, defineLocale, enUS, viVN } from './index';
import { UIProvider } from '../theme/provider';
import { Button } from '../components/button';
import { Spinner } from '../components/spinner';
import { DatePicker } from '../components/date-picker';
import { Calendar } from '../components/calendar';
import { Select } from '../components/select';
import { Pagination } from '../modules/pagination';
import { DataTable } from '../modules/data-table';
import { getFileIssue, validateFiles } from '../components/upload-field/validation';

it('formats plurals/numbers and falls back to English for an added locale', () => {
  const en = createTranslator(enUS),
    vi = createTranslator(viVN);
  expect(en('select.count', { count: 1 })).toBe('1 option.');
  expect(en('select.count', { count: 1200 })).toBe('1,200 options.');
  expect(vi('select.count', { count: 1200 })).toBe('1.200 lựa chọn.');
  const fr = defineLocale({
    code: 'fr-FR',
    messages: { 'button.processing': 'Traitement' },
  });
  expect(fr.calendarLocale).toBeUndefined();
  expect(viVN.calendarLocale).toBeUndefined();
  expect(enUS.calendarLocale).toBeUndefined();
  const calendarLocale = { code: 'fr' };
  expect(defineLocale({ ...fr, calendarLocale }).calendarLocale).toBe(calendarLocale);
  expect(createTranslator(fr)('button.processing')).toBe('Traitement');
  expect(createTranslator(fr)('dialog.close')).toBe('Close dialog');
  expect(() => defineLocale({ code: 'not_a_locale', messages: {} })).toThrow(
    RangeError,
  );
});

it('scopes locale/overrides per provider, resets inherited translations on language changes, and honors explicit props', () => {
  const html = renderToStaticMarkup(
    <>
      <UIProvider
        locale={enUS}
        messages={{
          'common.loading': 'Fetching',
          'button.processing': 'Working',
        }}
      >
        <Spinner />
        <Button loading>Save</Button>
        <Button loading loadingLabel="Custom status">
          Save
        </Button>
        <UIProvider messages={{ 'common.loading': 'Nested' }}>
          <Spinner />
        </UIProvider>
        <UIProvider locale={viVN}>
          <Spinner />
        </UIProvider>
      </UIProvider>
      <Spinner />
    </>,
  );
  expect(html).toContain('Fetching');
  expect(html).toContain('Working');
  expect(html).toContain('Custom status');
  expect(html).toContain('Nested');
  expect(html.match(/Đang tải/g)).toHaveLength(2);
  expect(html).not.toContain('loadingLabel=');
});

it('localizes real table/selection/pagination/loading/empty output and retains controlled IDs', () => {
  const html = renderToStaticMarkup(
    <UIProvider locale={enUS}>
      <DataTable
        caption="Lorem"
        rows={[{ id: 'a', title: 'Item' }]}
        columns={[{ accessorKey: 'title', header: 'Title' }]}
        rowId={(row) => row.id}
        mode="server"
        rowCount={25}
        state={{
          sorting: [],
          pagination: { pageIndex: 1, pageSize: 10 },
          rowSelection: { a: true, previousPage: true },
        }}
        onStateChange={() => {}}
        selectable
        filterable
      />
      <DataTable caption="Empty" rows={[]} columns={[]} rowId={() => ''} />
      <Pagination pageIndex={0} pageCount={3} onPageChange={() => {}} />
    </UIProvider>,
  );
  expect(html).toContain('2 rows selected · 1 on this page');
  expect(html).toContain('Clear selection');
  expect(html).toContain('aria-label="Select row a"');
  expect(html).toContain('Page 2 / 3');
  expect(html).toContain('Rows per page');
  expect(html).toContain('First page');
  expect(html).toContain('No data yet.');
  expect(html).not.toMatch(/Phân trang|Đang tải|Chưa có|dòng đã chọn/);
});

it('localizes calendar text/ARIA and displayed dates while preserving submitted ISO date-only values', () => {
  const html = renderToStaticMarkup(
    <UIProvider locale={enUS}>
      <DatePicker name="date" defaultValue="2026-10-06" />
      <Calendar defaultMonth="2026-10-01" today="2026-10-06" value="2026-10-06" />
    </UIProvider>,
  );
  expect(html).toContain('10/06/2026');
  expect(html).toContain('name="date" value="2026-10-06"');
  expect(html).toContain('Previous month');
  expect(html).toContain('October 2026');
  expect(html).toContain('Today, Tuesday, October 6, 2026, selected');
  expect(html).not.toMatch(/Tháng trước|Hôm nay|đã chọn/);
});

it('localizes Select accessibility and structural file errors without changing the validation contract', () => {
  const html = renderToStaticMarkup(
    <UIProvider locale={enUS}>
      <Select
        multiple
        defaultValue={['a']}
        options={[{ value: 'a', label: 'Lorem' }]}
      />
    </UIProvider>,
  );
  expect(html).toContain('Remove Lorem');
  expect(html).not.toContain('Remove=');
  const files = [{ name: 'a.exe', type: 'application/octet-stream', size: 10 }];
  const issue = getFileIssue(files, { accept: '.png' })!;
  expect(createTranslator(enUS)(issue.key, issue.values)).toBe(
    'File a.exe has an unsupported type.',
  );
  expect(createTranslator(viVN)(issue.key, issue.values)).toContain(
    'không được hỗ trợ',
  );
  expect(validateFiles(files, { accept: '.png' }, createTranslator(enUS))).toBe(
    'File a.exe has an unsupported type.',
  );
});

it('keeps default visible/accessible literals in dictionaries instead of component source', async () => {
  async function files(dir: string): Promise<string[]> {
    return (
      await Promise.all(
        (await readdir(dir, { withFileTypes: true })).map((entry) =>
          entry.isDirectory()
            ? files(resolve(dir, entry.name))
            : [resolve(dir, entry.name)],
        ),
      )
    ).flat();
  }

  const violations: string[] = [];
  for (const dir of ['components', 'modules', 'templates'])
    for (const file of await files(resolve('src', dir))) {
      // Generated glyph modules hold SVG paths only; parsing ~1300 of them adds no coverage.
      if (
        !file.endsWith('.tsx') ||
        /\.(stories|test)\.tsx$/.test(file) ||
        /\/icon\/(outline|bold|shared)\//.test(file)
      )
        continue;
      const source = ts.createSourceFile(
        file,
        await readFile(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );

      function visit(node: ts.Node) {
        if (
          ts.isJsxText(node) &&
          /[\p{L}]/u.test(node.text) &&
          !/^KB\)?$/.test(node.text.trim())
        )
          violations.push(`${file}: ${node.text.trim()}`);
        if (
          ts.isJsxAttribute(node) &&
          ['aria-label', 'label', 'placeholder', 'title'].includes(
            node.name.getText(source),
          ) &&
          node.initializer &&
          ts.isStringLiteral(node.initializer) &&
          /[\p{L}]/u.test(node.initializer.text)
        )
          violations.push(`${file}: ${node.initializer.text}`);
        ts.forEachChild(node, visit);
      }

      visit(source);
    }
  expect(violations).toEqual([]);
});

it('accepts a typed JSON array and resolves many languages without per-message branches', async () => {
  const { resolveUILocale } = await import('./index');
  const json = (await import('../overview/locales/translations.json')).default;
  const dictionaries: import('./types').UITranslations = json;
  expect(
    createTranslator(resolveUILocale('en-US', dictionaries))('button.processing'),
  ).toBe('Saving changes');
  expect(
    createTranslator(resolveUILocale('vi-VN', dictionaries))('button.processing'),
  ).toBe('Đang lưu');
  expect(
    createTranslator(resolveUILocale('ja-JP', dictionaries))('button.processing'),
  ).toBe('保存中');
  expect(createTranslator(resolveUILocale('ja-JP', dictionaries))('dialog.close')).toBe(
    'Close dialog',
  );
  expect(resolveUILocale('de-DE', dictionaries, { fallbackLocale: 'vi-VN' }).code).toBe(
    'vi-VN',
  );
  const calendarLocale = { code: 'ja' };
  expect(
    resolveUILocale('ja-JP', dictionaries, {
      calendarLocales: { 'ja-jp': calendarLocale },
    }).calendarLocale,
  ).toBe(calendarLocale);
  expect(
    resolveUILocale('ja-JP', dictionaries, { fallbackLocale: 'vi-VN' }).calendarLocale,
  ).toBeUndefined();
  expect(
    createTranslator(
      resolveUILocale('ja-JP', dictionaries, { fallbackLocale: 'vi-VN' }),
    )('dialog.close'),
  ).toBe('Đóng hộp thoại');
});

it('inherits catalogs and scopes calendar dictionaries and single-control overrides', async () => {
  const json = (await import('../overview/locales/translations.json')).default;
  const html = renderToStaticMarkup(
    <UIProvider locale="vi-VN" translations={json}>
      <Button loading>First</Button>
      <UIProvider locale="en-US">
        <Button loading>Second</Button>
        <UIProvider messages={{ 'button.processing': 'Local' }}>
          <Button loading>Third</Button>
        </UIProvider>
      </UIProvider>
      <UIProvider locale="ja-JP">
        <Button loading>Fourth</Button>
      </UIProvider>
    </UIProvider>,
  );
  expect(html).toContain('Đang lưu');
  expect(html).toContain('Saving changes');
  expect(html).toContain('Local');
  expect(html).toContain('保存中');
});

it('rejects duplicate locale identifiers and malformed JSON messages', async () => {
  const { resolveUILocale } = await import('./index');
  expect(() =>
    resolveUILocale('en-US', [
      { locale: 'en-US', messages: {} },
      { locale: 'en-us', messages: {} },
    ]),
  ).toThrow('Duplicate UI locale');
  expect(() =>
    resolveUILocale('en-US', [
      { locale: 'en-US', messages: { unknown: 'x' } as never },
    ]),
  ).toThrow('Unknown UI message');
  expect(() =>
    resolveUILocale('en-US', [
      {
        locale: 'en-US',
        messages: { 'select.count': { one: 'One' } as never },
      },
    ]),
  ).toThrow('Invalid UI message');
});
