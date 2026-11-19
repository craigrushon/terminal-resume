// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { applyEffect, PREF_KEYS, PREFS_EVENT, type EffectEnv } from './effects';

function makeEnv() {
  const env = {
    root: document.createElement('html'),
    storage: { setItem: vi.fn() },
    open: vi.fn(),
    download: vi.fn(),
    dispatch: vi.fn(),
  } satisfies EffectEnv;
  return env;
}

function dispatchedDetail(env: ReturnType<typeof makeEnv>): { type: string; detail: unknown } {
  expect(env.dispatch).toHaveBeenCalledTimes(1);
  const event = env.dispatch.mock.calls[0]?.[0] as CustomEvent<unknown>;
  return { type: event.type, detail: event.detail };
}

describe('applyEffect', () => {
  it('set-theme sets data-theme, persists it and announces it', () => {
    const env = makeEnv();
    applyEffect({ type: 'set-theme', theme: 'classic' }, env);
    expect(env.root.dataset.theme).toBe('classic');
    expect(env.storage.setItem).toHaveBeenCalledWith(PREF_KEYS.theme, 'classic');
    expect(dispatchedDetail(env)).toEqual({ type: PREFS_EVENT, detail: { theme: 'classic' } });
  });

  it('set-detail sets data-detail, persists it and announces it', () => {
    const env = makeEnv();
    applyEffect({ type: 'set-detail', detail: 'verbose' }, env);
    expect(env.root.dataset.detail).toBe('verbose');
    expect(env.storage.setItem).toHaveBeenCalledWith(PREF_KEYS.detail, 'verbose');
    expect(dispatchedDetail(env)).toEqual({ type: PREFS_EVENT, detail: { detail: 'verbose' } });
  });

  it('set-view sets data-view, persists it and announces it', () => {
    const env = makeEnv();
    applyEffect({ type: 'set-view', view: 'resume' }, env);
    expect(env.root.dataset.view).toBe('resume');
    expect(env.storage.setItem).toHaveBeenCalledWith(PREF_KEYS.view, 'resume');
    expect(dispatchedDetail(env)).toEqual({ type: PREFS_EVENT, detail: { view: 'resume' } });
  });

  it('open-url opens an allowed https url', () => {
    const env = makeEnv();
    applyEffect({ type: 'open-url', url: 'https://github.com/alex-example' }, env);
    expect(env.open).toHaveBeenCalledWith('https://github.com/alex-example');
  });

  it('open-url ignores unsafe urls', () => {
    const env = makeEnv();
    applyEffect({ type: 'open-url', url: 'javascript:alert(1)' }, env);
    applyEffect({ type: 'open-url', url: 'http://example.com' }, env);
    expect(env.open).not.toHaveBeenCalled();
  });

  it('download passes the href through', () => {
    const env = makeEnv();
    applyEffect({ type: 'download', href: '/resume.pdf' }, env);
    expect(env.download).toHaveBeenCalledWith('/resume.pdf');
  });

  it('clear touches nothing', () => {
    const env = makeEnv();
    applyEffect({ type: 'clear' }, env);
    expect(env.storage.setItem).not.toHaveBeenCalled();
    expect(env.dispatch).not.toHaveBeenCalled();
    expect(env.open).not.toHaveBeenCalled();
    expect(env.download).not.toHaveBeenCalled();
  });
});
