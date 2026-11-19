import { useEffect, useState } from 'react';
import { PREFS_EVENT, applyEffect, browserEnv } from '../lib/effects';
import type { Detail, Effect, Theme, View } from '../lib/terminal/types';
import { DETAILS, THEMES, VIEWS, oneOf } from '../lib/terminal/values';

export interface TogglesProps {
  initial?: { view: View; detail: Detail; theme?: Theme };
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

const defaultOnEffect = (effect: Effect): void => applyEffect(effect, browserEnv());

/** <html> data attribute; undefined during server rendering. */
const rootData = (key: 'view' | 'detail' | 'theme'): string | undefined =>
  typeof document === 'undefined' ? undefined : document.documentElement.dataset[key];

const LABELS: Record<View | Detail | Theme, string> = {
  terminal: 'Terminal',
  resume: 'Resume',
  concise: 'Concise',
  verbose: 'Verbose',
  classic: 'Classic',
  modern: 'Modern',
};

export function Toggles({ initial, onEffect = defaultOnEffect }: TogglesProps): React.JSX.Element {
  // First render must equal the server render (defaults), or hydration leaves the wrong radio checked.
  const [view, setView] = useState<View>(initial?.view ?? 'terminal');
  const [detail, setDetail] = useState<Detail>(initial?.detail ?? 'concise');
  const [theme, setTheme] = useState<Theme>(initial?.theme ?? 'modern');

  // Server markup can't know the pre-paint prefs: read <html> after hydration (skipped when props pin them).
  useEffect(() => {
    if (initial) return;
    setView(oneOf(VIEWS, rootData('view')) ?? 'terminal');
    setDetail(oneOf(DETAILS, rootData('detail')) ?? 'concise');
    setTheme(oneOf(THEMES, rootData('theme')) ?? 'modern');
  }, [initial]);

  useEffect(() => {
    const onPrefs = (event: Event): void => {
      const change = (event as CustomEvent<{ view?: string; detail?: string; theme?: string }>).detail;
      const nextView = oneOf(VIEWS, change?.view);
      const nextDetail = oneOf(DETAILS, change?.detail);
      const nextTheme = oneOf(THEMES, change?.theme);
      if (nextView) setView(nextView);
      if (nextDetail) setDetail(nextDetail);
      if (nextTheme) setTheme(nextTheme);
    };
    window.addEventListener(PREFS_EVENT, onPrefs);
    return () => window.removeEventListener(PREFS_EVENT, onPrefs);
  }, []);

  return (
    <div className="toggles">
      <fieldset>
        <legend>View</legend>
        {VIEWS.map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="view"
              value={value}
              checked={view === value}
              onChange={() => {
                setView(value);
                onEffect({ type: 'set-view', view: value });
              }}
            />
            <span>{LABELS[value]}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Detail</legend>
        {DETAILS.map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="detail"
              value={value}
              checked={detail === value}
              onChange={() => {
                setDetail(value);
                onEffect({ type: 'set-detail', detail: value });
              }}
            />
            <span>{LABELS[value]}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Theme</legend>
        {THEMES.map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="theme"
              value={value}
              checked={theme === value}
              onChange={() => {
                setTheme(value);
                onEffect({ type: 'set-theme', theme: value });
              }}
            />
            <span>{LABELS[value]}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
