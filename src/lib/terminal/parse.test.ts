import { describe, expect, it } from 'vitest';
import { parse } from './parse';

describe('parse', () => {
  it.each([[''], ['   '], ['\t ']])('returns the empty command for %j', (input) => {
    expect(parse(input)).toEqual({ cmd: '', args: [], verbose: false });
  });

  it('parses a bare command', () => {
    expect(parse('help')).toEqual({ cmd: 'help', args: [], verbose: false });
  });

  it('trims surrounding whitespace', () => {
    expect(parse('  pwd  ')).toEqual({ cmd: 'pwd', args: [], verbose: false });
  });

  it('splits arguments on runs of whitespace', () => {
    expect(parse('ls   a \t b')).toEqual({ cmd: 'ls', args: ['a', 'b'], verbose: false });
  });

  it('lowercases the command', () => {
    expect(parse('HeLp')).toEqual({ cmd: 'help', args: [], verbose: false });
  });

  it('keeps argument case', () => {
    expect(parse('CAT README')).toEqual({ cmd: 'cat', args: ['README'], verbose: false });
  });

  it('groups double-quoted words into one argument without the quotes', () => {
    expect(parse('cat "a b" c')).toEqual({ cmd: 'cat', args: ['a b', 'c'], verbose: false });
  });

  it('treats an unterminated quote as running to the end of input', () => {
    expect(parse('cat "a b')).toEqual({ cmd: 'cat', args: ['a b'], verbose: false });
  });

  it('detects -v at the end and removes it from args', () => {
    expect(parse('cat experience -v')).toEqual({ cmd: 'cat', args: ['experience'], verbose: true });
  });

  it('detects --verbose in the middle and removes it from args', () => {
    expect(parse('cat --verbose experience')).toEqual({ cmd: 'cat', args: ['experience'], verbose: true });
  });

  it('detects -v directly after the command', () => {
    expect(parse('whoami -v')).toEqual({ cmd: 'whoami', args: [], verbose: true });
  });
});
