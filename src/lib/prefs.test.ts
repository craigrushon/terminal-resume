import { describe, expect, it } from 'vitest';
import { resolvePrefs } from './prefs';

const wide = 1280;

describe('resolvePrefs defaults', () => {
  it('defaults to terminal, concise, modern on a wide viewport', () => {
    expect(resolvePrefs({ search: '', stored: {}, viewportWidth: wide })).toEqual({
      view: 'terminal',
      detail: 'concise',
      theme: 'modern',
    });
  });

  it('defaults to the resume view at 639px', () => {
    expect(resolvePrefs({ search: '', stored: {}, viewportWidth: 639 }).view).toBe('resume');
  });

  it('defaults to the terminal view at 640px', () => {
    expect(resolvePrefs({ search: '', stored: {}, viewportWidth: 640 }).view).toBe('terminal');
  });
});

describe('resolvePrefs priority', () => {
  it('reads all three keys from the query string', () => {
    expect(
      resolvePrefs({ search: '?view=resume&detail=verbose&theme=classic', stored: {}, viewportWidth: wide }),
    ).toEqual({ view: 'resume', detail: 'verbose', theme: 'classic' });
  });

  it('reads all three keys from storage', () => {
    expect(
      resolvePrefs({
        search: '',
        stored: { view: 'resume', detail: 'verbose', theme: 'classic' },
        viewportWidth: wide,
      }),
    ).toEqual({ view: 'resume', detail: 'verbose', theme: 'classic' });
  });

  it('query beats storage', () => {
    expect(resolvePrefs({ search: '?theme=classic', stored: { theme: 'modern' }, viewportWidth: wide }).theme).toBe(
      'classic',
    );
  });

  it('storage beats the viewport default', () => {
    expect(resolvePrefs({ search: '', stored: { view: 'terminal' }, viewportWidth: 400 }).view).toBe('terminal');
  });

  it('query beats the viewport default', () => {
    expect(resolvePrefs({ search: '?view=terminal', stored: {}, viewportWidth: 400 }).view).toBe('terminal');
  });

  it('resolves each key independently', () => {
    expect(resolvePrefs({ search: '?detail=verbose', stored: { theme: 'classic' }, viewportWidth: 400 })).toEqual({
      view: 'resume',
      detail: 'verbose',
      theme: 'classic',
    });
  });

  it('ignores unrelated query parameters', () => {
    expect(resolvePrefs({ search: '?utm=x&detail=verbose', stored: {}, viewportWidth: wide }).detail).toBe('verbose');
  });
});

describe('resolvePrefs invalid values', () => {
  it('an invalid query value falls through to storage', () => {
    expect(resolvePrefs({ search: '?theme=neon', stored: { theme: 'classic' }, viewportWidth: wide }).theme).toBe(
      'classic',
    );
  });

  it('an invalid query value with no storage falls through to the default', () => {
    expect(resolvePrefs({ search: '?detail=lots', stored: {}, viewportWidth: wide }).detail).toBe('concise');
  });

  it('an invalid stored value falls through to the default', () => {
    expect(resolvePrefs({ search: '', stored: { view: 'tablet' }, viewportWidth: 400 }).view).toBe('resume');
  });

  it('values are case-sensitive, so Resume is invalid', () => {
    expect(resolvePrefs({ search: '?view=Resume', stored: {}, viewportWidth: wide }).view).toBe('terminal');
  });

  it('an empty query value is invalid', () => {
    expect(resolvePrefs({ search: '?theme=', stored: {}, viewportWidth: wide }).theme).toBe('modern');
  });
});
