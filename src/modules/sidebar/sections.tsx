'use client';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { SidebarEntryIcon } from './rail-entry';
import { sidebarItemClasses } from './appearance';
import { useContext } from 'react';
import { SidebarAppearanceContext } from './context';
import { useUILocale } from '../../i18n/provider';
import type { SidebarClassNames, SidebarSection } from './types';

export function SidebarSections({
  sections,
  value,
  onChange,
  panelId,
  testId,
  classNames,
  mobile = false,
}: {
  sections: readonly SidebarSection[];
  value: string | undefined;
  onChange: (value: string) => void;
  panelId: string;
  testId: string | undefined;
  classNames: SidebarClassNames | undefined;
  mobile?: boolean;
}) {
  const variant = useContext(SidebarAppearanceContext);
  const { t } = useUILocale();

  return (
    <div
      role="group"
      aria-label={t('sidebar.sections')}
      data-testid={partTestId(testId, 'sections')}
      className={cn(
        'flex gap-2',
        mobile
          ? 'shrink-0 overflow-x-auto rounded-control bg-[var(--sidebar-hover)] p-1'
          : 'min-h-0 flex-1 flex-col overflow-y-auto',
        classNames?.sections,
      )}
      onKeyDown={(event) => {
        const keys = mobile ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
        if (![...keys, 'Home', 'End'].includes(event.key)) return;
        const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
        const index = buttons.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;
        event.preventDefault();
        buttons[
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : (index + (event.key === keys[0] ? -1 : 1) + buttons.length) %
                buttons.length
        ]?.focus();
      }}
    >
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          aria-label={section.label}
          aria-description={
            section.badge !== undefined && section.badge > 0
              ? t('sidebar.sectionCount', { count: section.badge })
              : undefined
          }
          title={section.label}
          aria-pressed={value === section.id}
          aria-controls={panelId}
          data-testid={partTestId(testId, 'section', section.id)}
          onClick={() => onChange(section.id)}
          className={cn(
            'flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-control p-2 text-control motion-safe:transition-colors',
            focusRingClassName,
            sidebarItemClasses(variant, value === section.id),
            classNames?.section,
          )}
        >
          <SidebarEntryIcon
            item={section}
            collapsed
            testId={partTestId(testId, 'section', section.id)}
            classNames={classNames}
          />
          {mobile && <span>{section.label}</span>}
        </button>
      ))}
    </div>
  );
}
