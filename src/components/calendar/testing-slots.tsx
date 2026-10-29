'use client';
import { createContext, useContext, type ComponentProps } from 'react';
import { DayButton } from 'react-day-picker';
import { calendarDateString } from './model';
import { partTestId } from '../common/testing';

export const CalendarTestIdContext = createContext<string | undefined>(undefined);

export function TestingDayButton(props: ComponentProps<typeof DayButton>) {
  const base = useContext(CalendarTestIdContext);

  return (
    <DayButton
      {...props}
      data-testid={partTestId(base, 'day', calendarDateString(props.day.date))}
    />
  );
}
