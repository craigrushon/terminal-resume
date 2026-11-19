import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from './contrast';

describe('contrast', () => {
  it('rates black on white 21:1, accepting #rgb shorthand', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5);
  });

  it('gives white luminance 1 and black 0', () => {
    expect([relativeLuminance('#FFFFFF'), relativeLuminance('#000000')]).toEqual([1, 0]);
  });

  it('rates #777777 on white about 4.48:1 (just under AA)', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it('is independent of argument order', () => {
    expect(contrastRatio('#ffffff', '#777777')).toBe(contrastRatio('#777777', '#ffffff'));
  });

  it('rejects invalid hex with the offending input in the message', () => {
    expect(() => relativeLuminance('#12345')).toThrow('Invalid hex colour: #12345');
  });
});
