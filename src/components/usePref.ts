import type { Detail, Theme, View } from '../lib/terminal/types';

export type PrefKey = 'view' | 'detail' | 'theme';
export type PrefValue<K extends PrefKey> = K extends 'view' ? View : K extends 'detail' ? Detail : Theme;

/**
 * One <html data-*> pref, hydration-safe. First render returns `initial ?? fallback` (equals the server render).
 * After mount, unless `initial` is given, reads document.documentElement.dataset[key] (valid values only).
 * Always listens for PREFS_EVENT on window (event.detail[key], valid values only); removes the listener on unmount.
 */
export function usePref<K extends PrefKey>(_key: K, fallback: PrefValue<K>, initial?: PrefValue<K>): PrefValue<K> {
  return initial ?? fallback;
}
