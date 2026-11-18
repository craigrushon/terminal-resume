import { describe, expect, it } from 'vitest';
import { complete } from './complete';
import type { TerminalState } from './types';

const home: TerminalState = { cwd: '~', detail: 'concise', theme: 'modern', history: [] };
const inResume: TerminalState = { ...home, cwd: '~/resume' };

describe('complete: command names', () => {
  it('completes a unique prefix and adds a space', () => {
    expect(complete('he', home)).toEqual({ line: 'help ', options: [] });
  });

  it('completes a longer unique prefix', () => {
    expect(complete('hi', home)).toEqual({ line: 'history ', options: [] });
  });

  it('lists sorted options when the prefix is ambiguous', () => {
    expect(complete('c', home)).toEqual({ line: 'c', options: ['cat', 'cd', 'clear', 'concise'] });
  });

  it('lists every command for an empty line', () => {
    expect(complete('', home)).toEqual({
      line: '',
      options: [
        'cat',
        'cd',
        'clear',
        'concise',
        'download',
        'help',
        'history',
        'ls',
        'open',
        'pwd',
        'resume',
        'theme',
        'verbose',
        'whoami',
      ],
    });
  });

  it('leaves the line unchanged when nothing matches', () => {
    expect(complete('zzz', home)).toEqual({ line: 'zzz', options: [] });
  });

  it('does not offer hidden easter eggs', () => {
    expect(complete('su', home)).toEqual({ line: 'su', options: [] });
  });
});

describe('complete: paths', () => {
  it('cd completes a directory with a trailing slash and no space', () => {
    expect(complete('cd re', home)).toEqual({ line: 'cd resume/', options: [] });
  });

  it('cd does not offer files', () => {
    expect(complete('cd R', home)).toEqual({ line: 'cd R', options: [] });
  });

  it('ls completes a directory', () => {
    expect(complete('ls re', home)).toEqual({ line: 'ls resume/', options: [] });
  });

  it('cat completes a file and adds a space', () => {
    expect(complete('cat R', home)).toEqual({ line: 'cat README ', options: [] });
  });

  it('cat completes relative to the current directory', () => {
    expect(complete('cat ed', inResume)).toEqual({ line: 'cat education ', options: [] });
  });

  it('cat lists files and directories sorted when the argument is empty', () => {
    expect(complete('cat ', home)).toEqual({ line: 'cat ', options: ['README', 'resume/'] });
  });

  it('cat lists sorted options for an ambiguous prefix', () => {
    expect(complete('cat e', inResume)).toEqual({ line: 'cat e', options: ['education', 'experience'] });
  });

  it('cat completes through a nested path', () => {
    expect(complete('cat resume/pr', home)).toEqual({ line: 'cat resume/projects ', options: [] });
  });

  it('cat completes an absolute home path', () => {
    expect(complete('cat ~/resume/s', home)).toEqual({ line: 'cat ~/resume/skills ', options: [] });
  });

  it('cd with no subdirectories leaves the line unchanged', () => {
    expect(complete('cd ', inResume)).toEqual({ line: 'cd ', options: [] });
  });

  it('cat with no match leaves the line unchanged', () => {
    expect(complete('cat zz', home)).toEqual({ line: 'cat zz', options: [] });
  });
});

describe('complete: fixed arguments', () => {
  it('theme completes classic', () => {
    expect(complete('theme c', home)).toEqual({ line: 'theme classic ', options: [] });
  });

  it('theme lists both themes for an empty argument', () => {
    expect(complete('theme ', home)).toEqual({ line: 'theme ', options: ['classic', 'modern'] });
  });

  it('open completes github', () => {
    expect(complete('open g', home)).toEqual({ line: 'open github ', options: [] });
  });

  it('open completes resume.pdf', () => {
    expect(complete('open r', home)).toEqual({ line: 'open resume.pdf ', options: [] });
  });

  it('open lists all targets sorted for an empty argument', () => {
    expect(complete('open ', home)).toEqual({
      line: 'open ',
      options: ['email', 'github', 'linkedin', 'resume.pdf'],
    });
  });

  it('a command without arguments completes nothing', () => {
    expect(complete('pwd x', home)).toEqual({ line: 'pwd x', options: [] });
  });
});
