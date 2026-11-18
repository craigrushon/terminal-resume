import { DETAILS, THEMES, VIEWS, oneOf } from './terminal/values';
import type { Detail, Theme, View } from './terminal/types';

/** Below this width (px) the Resume view is the default. */
const PHONE_BREAKPOINT = 640;

type Stored = Partial<Record<'view' | 'detail' | 'theme', string>>;

/** First valid value wins: URL query, then storage, then the fallback. */
function pick<T extends string>(
  values: readonly T[],
  key: 'view' | 'detail' | 'theme',
  query: URLSearchParams,
  stored: Stored,
  fallback: T,
): T {
  return oneOf(values, query.get(key)) ?? oneOf(values, stored[key]) ?? fallback;
}

export function resolvePrefs(input: {
  search: string;
  stored: Stored;
  viewportWidth: number;
}): { view: View; detail: Detail; theme: Theme } {
  const query = new URLSearchParams(input.search);
  const defaultView: View = input.viewportWidth < PHONE_BREAKPOINT ? 'resume' : 'terminal';
  return {
    view: pick(VIEWS, 'view', query, input.stored, defaultView),
    detail: pick(DETAILS, 'detail', query, input.stored, 'concise'),
    theme: pick(THEMES, 'theme', query, input.stored, 'modern'),
  };
}
