import type { Detail } from '../terminal/types';

const CONCISE_HIGHLIGHTS = 3;

/** concise: first 3 highlights; verbose: all highlights then all highlightsVerbose. */
export function selectHighlights(
  item: { highlights: string[]; highlightsVerbose?: string[] },
  detail: Detail,
): string[] {
  if (detail === 'concise') return item.highlights.slice(0, CONCISE_HIGHLIGHTS);
  return [...item.highlights, ...(item.highlightsVerbose ?? [])];
}
