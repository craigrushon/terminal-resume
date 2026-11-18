import type { Detail } from '../terminal/types';

/** concise: first 3 highlights; verbose: all highlights then all highlightsVerbose. */
export function selectHighlights(
  _item: { highlights: string[]; highlightsVerbose?: string[] },
  _detail: Detail,
): string[] {
  throw new Error('not implemented');
}
