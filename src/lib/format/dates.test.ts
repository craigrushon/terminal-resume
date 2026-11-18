import { describe, expect, it } from 'vitest';
import { formatRange, formatYearMonth } from './dates';

describe('formatYearMonth', () => {
  it.each([
    ['2022-01', 'Jan 2022'],
    ['2022-02', 'Feb 2022'],
    ['2022-03', 'Mar 2022'],
    ['2022-04', 'Apr 2022'],
    ['2022-05', 'May 2022'],
    ['2022-06', 'Jun 2022'],
    ['2022-07', 'Jul 2022'],
    ['2022-08', 'Aug 2022'],
    ['2022-09', 'Sep 2022'],
    ['2022-10', 'Oct 2022'],
    ['2022-11', 'Nov 2022'],
    ['2022-12', 'Dec 2022'],
  ])('formats %s as %s', (input, expected) => {
    expect(formatYearMonth(input)).toBe(expected);
  });

  it('keeps the year of an older date', () => {
    expect(formatYearMonth('2011-09')).toBe('Sep 2011');
  });
});

describe('formatRange', () => {
  it('uses Present when the end is undefined', () => {
    expect(formatRange('2022-03', undefined)).toBe('Mar 2022 – Present');
  });

  it('uses Present when the end argument is omitted', () => {
    expect(formatRange('2022-03')).toBe('Mar 2022 – Present');
  });

  it('joins start and end with a spaced en dash', () => {
    expect(formatRange('2018-06', '2022-02')).toBe('Jun 2018 – Feb 2022');
  });

  it('separates with U+2013, not a hyphen', () => {
    // RED fix: originally charCodeAt(8), an off-by-one in the hand-derived index ('Sep 2015' is 8 chars, then a space).
    expect(formatRange('2015-09', '2018-05').split(' ')).toEqual(['Sep', '2015', '\u2013', 'May', '2018']);
  });
});
