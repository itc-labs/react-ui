'use client';
import { createContext } from 'react';

/** Submission state shared by `Form`, so a plain submit `Button` can show loading without form imports. */
export const FormStatusContext = createContext<{ submitting: boolean } | null>(null);
