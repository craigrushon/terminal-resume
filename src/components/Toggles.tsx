import { useEffect, useState } from 'react';
import { PREFS_EVENT, applyEffect, browserEnv } from '../lib/effects';
import type { Detail, Effect, View } from '../lib/terminal/types';
import { DETAILS, VIEWS, oneOf } from '../lib/terminal/values';

export interface TogglesProps {
  initial?: { view: View; detail: Detail };
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

const defaultOnEffect = (effect: Effect): void => applyEffect(effect, browserEnv());

/** <html> data attribute; undefined during server rendering. */
const rootData = (key: 'view' | 'detail'): string | undefined =>
  typeof document === 'undefined' ? undefined : document.documentElement.dataset[key];

const LABELS: Record<View | Detail, string> = {
  terminal: 'Terminal',
  resume: 'Resume',
  concise: 'Concise',
  verbose: 'Verbose',
};

export function Toggles({ initial, onEffect = defaultOnEffect }: TogglesProps): React.JSX.Element {
  // First render must equal the server render (defaults), or hydration leaves the wrong radio checked.
  const [view, setView] = useState<View>(initial?.view ?? 'terminal');
  const [detail, setDetail] = useState<Detail>(initial?.detail ?? 'concise');

  // Server markup can't know the pre-paint prefs: read <html> after hydration (skipped when props pin them).
  useEffect(() => {
    if (initial) return;
    setView(oneOf(VIEWS, rootData('view')) ?? 'terminal');
    setDetail(oneOf(DETAILS, rootData('detail')) ?? 'concise');
  }, [initial]);

  useEffect(() => {
    const onPrefs = (event: Event): void => {
      const change = (event as CustomEvent<{ view?: string; detail?: string }>).detail;
      const nextView = oneOf(VIEWS, change?.view);
      const nextDetail = oneOf(DETAILS, change?.detail);
      if (nextView) setView(nextView);
      if (nextDetail) setDetail(nextDetail);
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
    </div>
  );
}
