import { safeHref } from './terminal/href';
import type { Effect } from './terminal/types';

export const PREF_KEYS = { view: 'pref:view', detail: 'pref:detail', theme: 'pref:theme' } as const;
export const PREFS_EVENT = 'resume:prefs';

export interface EffectEnv {
  /** The <html> element: data-view / data-detail / data-theme live here. */
  root: HTMLElement;
  storage: Pick<Storage, 'setItem'>;
  /** Opens in a new tab with noopener. */
  open: (url: string) => void;
  download: (href: string) => void;
  /** window.dispatchEvent */
  dispatch: (event: Event) => void;
  /** Mirrors a pref into the URL query (browserEnv: searchParams.set + history.replaceState). */
  setParam: (key: 'view' | 'detail' | 'theme', value: string) => void;
}

/**
 * Performs one terminal Effect (spec §7 "Effects vs state").
 * set-view/detail/theme: root.dataset.<key> = value, storage.setItem(PREF_KEYS.<key>, value),
 * dispatch CustomEvent(PREFS_EVENT, { detail: { <key>: value } }).
 * open-url: env.open(url) only if safeHref(url) allows it. download: env.download(href). clear: no-op.
 */
export function applyEffect(effect: Effect, env: EffectEnv): void {
  switch (effect.type) {
    case 'set-view':
      setPref(env, 'view', effect.view);
      return;
    case 'set-detail':
      setPref(env, 'detail', effect.detail);
      return;
    case 'set-theme':
      setPref(env, 'theme', effect.theme);
      return;
    case 'open-url': {
      const url = safeHref(effect.url);
      if (url !== null) env.open(url);
      return;
    }
    // No safeHref check needed: the Effect type pins download.href to the literal '/resume.pdf'.
    case 'download':
      env.download(effect.href);
      return;
    case 'clear':
      return;
    default: {
      const unreachable: never = effect;
      return unreachable;
    }
  }
}

function setPref(env: EffectEnv, key: keyof typeof PREF_KEYS, value: string): void {
  env.root.dataset[key] = value;
  try {
    env.storage.setItem(PREF_KEYS[key], value);
  } catch {
    // Storage can throw (private mode, quota); the pref still applies for this page.
  }
  env.dispatch(new CustomEvent(PREFS_EVENT, { detail: { [key]: value } }));
}

/** Thin DOM glue over window/document (not unit-tested). */
export function browserEnv(): EffectEnv {
  return {
    root: document.documentElement,
    storage: {
      setItem(key, value) {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          // Unavailable (private mode): ignore.
        }
      },
    },
    open: (url) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    download: (href) => {
      const a = document.createElement('a');
      a.href = href;
      a.download = '';
      a.rel = 'noopener';
      document.body.append(a);
      a.click();
      a.remove();
    },
    dispatch: (event) => {
      window.dispatchEvent(event);
    },
    setParam: (key, value) => {
      const url = new URL(window.location.href);
      url.searchParams.set(key, value);
      window.history.replaceState(window.history.state, '', url);
    },
  };
}
