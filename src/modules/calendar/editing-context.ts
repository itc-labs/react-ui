import { createContext } from 'react';
import type { NormalizedEvent } from './engine/types';

export interface CalendarEditingContext {
  describe: (id: string) => {
    mirror: boolean;
    dragging: boolean;
    move: boolean;
    resize: boolean;
    event: NormalizedEvent | undefined;
  };
}

export const CalendarEditing = createContext<CalendarEditingContext | null>(null);
