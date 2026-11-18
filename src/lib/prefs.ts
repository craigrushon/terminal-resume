import type { Detail, Theme, View } from './terminal/types';

export function resolvePrefs(_input: {
  search: string;
  stored: Partial<Record<'view' | 'detail' | 'theme', string>>;
  viewportWidth: number;
}): { view: View; detail: Detail; theme: Theme } {
  throw new Error('not implemented');
}
