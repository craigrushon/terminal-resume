import { describe, expect, it } from 'vitest';
import { selectHighlights } from './detail';

describe('selectHighlights', () => {
  it('concise returns only the first three highlights', () => {
    expect(selectHighlights({ highlights: ['a', 'b', 'c', 'd'] }, 'concise')).toEqual(['a', 'b', 'c']);
  });

  it('concise returns all highlights when there are fewer than three', () => {
    expect(selectHighlights({ highlights: ['a', 'b'] }, 'concise')).toEqual(['a', 'b']);
  });

  it('concise ignores highlightsVerbose', () => {
    expect(selectHighlights({ highlights: ['a'], highlightsVerbose: ['x'] }, 'concise')).toEqual(['a']);
  });

  it('verbose returns all highlights, not just three, when there is no verbose list', () => {
    expect(selectHighlights({ highlights: ['a', 'b', 'c', 'd'] }, 'verbose')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('verbose appends highlightsVerbose after all highlights', () => {
    expect(
      selectHighlights({ highlights: ['a', 'b', 'c', 'd'], highlightsVerbose: ['x', 'y'] }, 'verbose'),
    ).toEqual(['a', 'b', 'c', 'd', 'x', 'y']);
  });

  it('returns an empty list for an item without highlights', () => {
    expect(selectHighlights({ highlights: [] }, 'verbose')).toEqual([]);
  });
});
