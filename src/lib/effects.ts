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
}

/**
 * Performs one terminal Effect (spec §7 "Effects vs state").
 * set-view/detail/theme: root.dataset.<key> = value, storage.setItem(PREF_KEYS.<key>, value),
 * dispatch CustomEvent(PREFS_EVENT, { detail: { <key>: value } }).
 * open-url: env.open(url) only if safeHref(url) allows it. download: env.download(href). clear: no-op.
 */
export function applyEffect(_effect: Effect, _env: EffectEnv): void {
  throw new Error('not implemented');
}

/** Thin DOM glue over window/document (not unit-tested). */
export function browserEnv(): EffectEnv {
  throw new Error('not implemented');
}
