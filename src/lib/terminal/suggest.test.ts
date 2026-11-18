import { describe, expect, it } from 'vitest';
import { suggest } from './suggest';

const known = ['cat', 'cd', 'help', 'whoami'];

describe('suggest', () => {
  it('suggests the command one edit away', () => {
    expect(suggest('whoam', known)).toBe('whoami');
  });

  it('suggests a command two edits away', () => {
    expect(suggest('hlep', known)).toBe('help');
  });

  it('returns null at distance three', () => {
    expect(suggest('hxxxp', known)).toBeNull();
  });

  it('returns null when nothing is close', () => {
    expect(suggest('xyzzy', known)).toBeNull();
  });

  it('returns null for an exact match', () => {
    expect(suggest('whoami', known)).toBeNull();
  });

  it('returns null for an empty known list', () => {
    expect(suggest('help', [])).toBeNull();
  });

  it('breaks ties alphabetically regardless of list order', () => {
    expect(suggest('bat', ['mat', 'hat', 'cat'])).toBe('cat');
  });

  it('prefers the smaller distance over alphabetical order', () => {
    expect(suggest('cat', ['ast', 'cats'])).toBe('cats');
  });
});
