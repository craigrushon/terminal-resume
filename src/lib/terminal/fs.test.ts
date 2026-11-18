import { describe, expect, it } from 'vitest';
import { isDir, isFile, listDir, resolvePath } from './fs';

describe('resolvePath', () => {
  it.each([
    ['~', '', '~'],
    ['~/resume', '', '~/resume'],
    ['~', '.', '~'],
    ['~/resume', '.', '~/resume'],
    ['~/resume', '..', '~'],
    ['~', '..', '~'],
    ['~', '../..', '~'],
    ['~/resume', '~', '~'],
    ['~', '~', '~'],
    ['~/resume', '~/resume', '~/resume'],
    ['~', '~/resume/skills', '~/resume/skills'],
    ['~', 'resume', '~/resume'],
    ['~', 'resume/', '~/resume'],
    ['~', 'resume/skills', '~/resume/skills'],
    ['~/resume', 'skills', '~/resume/skills'],
    ['~/resume', '../README', '~/README'],
    ['~', 'README', '~/README'],
    ['~', './resume', '~/resume'],
  ])('from %s, %j resolves to %s', (cwd, path, expected) => {
    expect(resolvePath(cwd, path)).toBe(expected);
  });

  it.each([
    ['~', 'nope'],
    ['~', 'skills'],
    ['~/resume', 'resume'],
    ['~', 'resume/nope'],
    ['~', 'README/x'],
  ])('from %s, %j is unknown (null)', (cwd, path) => {
    expect(resolvePath(cwd, path)).toBeNull();
  });
});

describe('isDir / isFile', () => {
  it.each(['~', '~/resume'])('%s is a directory and not a file', (path) => {
    expect(isDir(path)).toBe(true);
    expect(isFile(path)).toBe(false);
  });

  it.each([
    '~/README',
    '~/resume/contact',
    '~/resume/education',
    '~/resume/experience',
    '~/resume/projects',
    '~/resume/skills',
  ])('%s is a file and not a directory', (path) => {
    expect(isFile(path)).toBe(true);
    expect(isDir(path)).toBe(false);
  });

  it('an unknown path is neither', () => {
    expect(isDir('~/nope')).toBe(false);
    expect(isFile('~/nope')).toBe(false);
  });
});

describe('listDir', () => {
  it('lists home with directories marked by a trailing slash', () => {
    expect(listDir('~')).toEqual(['README', 'resume/']);
  });

  it('lists the resume directory in the documented order', () => {
    expect(listDir('~/resume')).toEqual(['contact', 'education', 'experience', 'projects', 'skills']);
  });

  it('returns an empty list for a file', () => {
    expect(listDir('~/README')).toEqual([]);
  });

  it('returns an empty list for an unknown path', () => {
    expect(listDir('~/nope')).toEqual([]);
  });
});
