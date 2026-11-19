import type { Detail, Theme, View } from './types';

export const VIEWS = ['terminal', 'resume'] as const satisfies readonly View[];
export const DETAILS = ['concise', 'verbose'] as const satisfies readonly Detail[];
export const THEMES = ['classic', 'modern'] as const satisfies readonly Theme[];

/** Narrow an unknown string to one member of a closed list. */
export function oneOf<T extends string>(values: readonly T[], value: string | null | undefined): T | undefined {
  return values.find((candidate) => candidate === value);
}

/** The only non-https href the terminal may emit (built at build time, spec §6b). */
export const PDF_HREF = '/resume.pdf' as const;
