import { useEffect, useState } from 'react';
import { PREFS_EVENT } from '../lib/effects';
import type { Detail, Theme, View } from '../lib/terminal/types';
import { DETAILS, THEMES, VIEWS, oneOf } from '../lib/terminal/values';

export type PrefKey = 'view' | 'detail' | 'theme';
export type PrefValue<K extends PrefKey> = K extends 'view' ? View : K extends 'detail' ? Detail : Theme;

const VALID: { [K in PrefKey]: readonly PrefValue<K>[] } = { view: VIEWS, detail: DETAILS, theme: THEMES };

function parse<K extends PrefKey>(key: K, value: string | null | undefined): PrefValue<K> | undefined {
  return oneOf<PrefValue<K>>(VALID[key], value);
}

/**
 * One <html data-*> pref, hydration-safe. First render returns `initial ?? fallback` (equals the server render).
 * After mount, unless `initial` is given, reads document.documentElement.dataset[key] (valid values only).
 * Always listens for PREFS_EVENT on window (event.detail[key], valid values only); removes the listener on unmount.
 */
export function usePref<K extends PrefKey>(key: K, fallback: PrefValue<K>, initial?: PrefValue<K>): PrefValue<K> {
  return usePrefState(key, fallback, initial)[0];
}

/** Like usePref, plus a setter so a component can show its own user's choice at once. */
export function usePrefState<K extends PrefKey>(
  key: K,
  fallback: PrefValue<K>,
  initial?: PrefValue<K>,
): readonly [PrefValue<K>, (value: PrefValue<K>) => void] {
  const [value, setValue] = useState<PrefValue<K>>(initial ?? fallback);

  useEffect(() => {
    if (initial !== undefined) return;
    setValue(parse(key, document.documentElement.dataset[key]) ?? fallback);
  }, [key, fallback, initial]);

  useEffect(() => {
    const onPrefs = (event: Event): void => {
      const next = parse(key, (event as CustomEvent<Partial<Record<PrefKey, string>>>).detail?.[key]);
      if (next) setValue(next);
    };
    window.addEventListener(PREFS_EVENT, onPrefs);
    return () => window.removeEventListener(PREFS_EVENT, onPrefs);
  }, [key]);

  return [value, setValue];
}
