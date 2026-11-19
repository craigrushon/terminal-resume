// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { prepaint } from './prepaint';
import { resolvePrefs } from './prefs';

type Stored = Partial<Record<'view' | 'detail' | 'theme', string>>;

function storageOf(stored: Stored): Pick<Storage, 'getItem'> {
  return { getItem: (key) => stored[key.replace('pref:', '') as 'view' | 'detail' | 'theme'] ?? null };
}

function datasetOf(root: HTMLElement) {
  return { view: root.dataset.view, detail: root.dataset.detail, theme: root.dataset.theme };
}

describe('prepaint', () => {
  it.each<[string, string, Stored, number]>([
    ['URL beats storage', '?view=resume&detail=verbose&theme=classic', { view: 'terminal', detail: 'concise', theme: 'modern' }, 1200],
    ['storage beats default', '', { view: 'resume', detail: 'verbose', theme: 'classic' }, 1200],
    ['invalid values fall through', '?view=bogus&theme=neon', { view: 'resume', detail: 'loud', theme: 'classic' }, 1200],
    ['width 639 defaults to resume', '', {}, 639],
    ['width 640 defaults to terminal', '', {}, 640],
  ])('matches resolvePrefs: %s', (_name, search, stored, width) => {
    const root = document.createElement('html');
    prepaint({ search, storage: storageOf(stored), width, root });
    expect(datasetOf(root)).toEqual(resolvePrefs({ search, stored, viewportWidth: width }));
  });

  it('treats null storage as empty', () => {
    const root = document.createElement('html');
    prepaint({ search: '', storage: null, width: 500, root });
    expect(datasetOf(root)).toEqual({ view: 'resume', detail: 'concise', theme: 'modern' });
  });

  it('treats a throwing getItem as empty', () => {
    const root = document.createElement('html');
    const storage = {
      getItem: (): string | null => {
        throw new Error('denied');
      },
    };
    prepaint({ search: '?theme=classic', storage, width: 1200, root });
    expect(datasetOf(root)).toEqual({ view: 'terminal', detail: 'concise', theme: 'classic' });
  });

  it('is self-contained: runs when rebuilt from its source alone', () => {
    const standalone = new Function('env', `(${prepaint.toString()})(env)`) as (env: unknown) => void;
    const root = document.createElement('html');
    const stored: Stored = { detail: 'verbose' };
    standalone({ search: '?view=resume', storage: storageOf(stored), width: 1200, root });
    expect(datasetOf(root)).toEqual({ view: 'resume', detail: 'verbose', theme: 'modern' });
  });
});
