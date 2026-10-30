import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { enUS, vi, fr } from 'react-day-picker/locale';
import { defineLocale } from '../../i18n';
import { UILocaleProvider } from '../../i18n/provider';
import { resolveCalendarLocale, useCalendarLocale } from './locale';
import { Calendar } from './index';

it('resolves selected overrides, built-ins, fallback overrides and English in order', () => {
  const locale = (code: string, calendarLocale?: typeof enUS) =>
    defineLocale({ code, messages: {}, calendarLocale });

  expect(resolveCalendarLocale(locale('vi-VN'), 'en-US')).toBe(vi);
  expect(resolveCalendarLocale(locale('en-GB'), 'vi-VN')).toBe(enUS);
  expect(resolveCalendarLocale(locale('vi-VN', fr), 'en-US', { 'vi-vn': enUS })).toBe(
    enUS,
  );
  expect(resolveCalendarLocale(locale('vi-VN', fr), 'en-US')).toBe(fr);
  expect(resolveCalendarLocale(locale('vi-VN'), 'en-US', { 'en-US': fr })).toBe(vi);
  expect(resolveCalendarLocale(locale('ja-JP'), 'vi-VN', { 'vi-vn': fr })).toBe(fr);
  expect(resolveCalendarLocale(locale('ja-JP'), 'vi-VN')).toBe(vi);
  expect(resolveCalendarLocale(locale('ja-JP'), 'de-DE')).toBe(enUS);
});

it('inherits calendar maps and fallback codes and gives the map priority over explicit locales', () => {
  const selected: ReturnType<typeof useCalendarLocale>[] = [];

  function Probe() {
    selected.push(useCalendarLocale());

    return null;
  }

  renderToStaticMarkup(
    <>
      <Probe />
      <UILocaleProvider fallbackLocale="vi-VN" calendarLocales={{ 'vi-vn': fr }}>
        <UILocaleProvider locale={defineLocale({ code: 'ja-JP', messages: {} })}>
          <Probe />
        </UILocaleProvider>
        <UILocaleProvider
          locale={defineLocale({ code: 'vi-VN', messages: {}, calendarLocale: enUS })}
        >
          <Probe />
          <UILocaleProvider calendarLocales={{ 'vi-VN': enUS }}>
            <Probe />
          </UILocaleProvider>
        </UILocaleProvider>
      </UILocaleProvider>
    </>,
  );
  expect(selected).toEqual([vi, fr, fr, enUS]);
});

it('uses the calendar locale for weekday labels with Vietnamese defaults and English overrides', () => {
  const props = { defaultMonth: '2026-10-01', today: '2026-10-06' };
  expect(renderToStaticMarkup(<Calendar {...props} />)).toContain(
    '<th aria-label="Thứ Hai"',
  );
  expect(
    renderToStaticMarkup(
      <UILocaleProvider locale="en-US">
        <Calendar {...props} />
      </UILocaleProvider>,
    ),
  ).toContain('<th aria-label="Monday"');
  expect(
    renderToStaticMarkup(
      <UILocaleProvider calendarLocales={{ 'vi-VN': enUS }}>
        <Calendar {...props} />
      </UILocaleProvider>,
    ),
  ).toContain('<th aria-label="Monday"');
});
