import { useRef } from 'react';
import { applyEffect, browserEnv } from '../lib/effects';
import type { Effect, View } from '../lib/terminal/types';
import { VIEWS } from '../lib/terminal/values';
import { usePrefState } from './usePref';

export interface ViewTabsProps {
  initial?: View;
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

const defaultOnEffect = (effect: Effect): void => applyEffect(effect, browserEnv());

const LABELS: Record<View, string> = { terminal: 'Terminal', resume: 'Resume' };

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

const ICONS: Record<View, React.JSX.Element> = {
  terminal: (
    <svg {...iconProps}>
      <path d="M3 4l4 4-4 4" />
      <path d="M9 12h4" />
    </svg>
  ),
  resume: (
    <svg {...iconProps}>
      <path d="M4 1.75h5.5L12.25 4.5v9.75H4z" />
      <path d="M6 8h4.5M6 10.5h4.5" />
    </svg>
  ),
};

/** WAI-ARIA tabs (Terminal | Resume), automatic activation. */
export function ViewTabs({ initial, onEffect = defaultOnEffect }: ViewTabsProps): React.JSX.Element {
  const [view, setView] = usePrefState('view', 'terminal', initial);
  const tabs = useRef<Partial<Record<View, HTMLButtonElement | null>>>({});

  const select = (next: View, focus = false): void => {
    if (focus) tabs.current[next]?.focus();
    if (next === view) return;
    setView(next);
    onEffect({ type: 'set-view', view: next });
  };

  /** Index of the tab a key moves to, or null if the key isn't ours. */
  const targetIndex = (key: string, at: number): number | null => {
    switch (key) {
      case 'ArrowRight':
        return (at + 1) % VIEWS.length;
      case 'ArrowLeft':
        return (at - 1 + VIEWS.length) % VIEWS.length;
      case 'Home':
        return 0;
      case 'End':
        return VIEWS.length - 1;
      default:
        return null;
    }
  };

  const onKeyDown = (event: React.KeyboardEvent): void => {
    // Leave modifier combos to the browser (Alt+← is "back", Cmd+← on macOS too).
    if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const index = targetIndex(event.key, VIEWS.indexOf(view));
    const next = index === null ? undefined : VIEWS[index];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  };

  return (
    <div className="view-tabs" role="tablist" aria-label="View" onKeyDown={onKeyDown}>
      {VIEWS.map((value) => (
        <button
          key={value}
          ref={(node) => {
            tabs.current[value] = node;
          }}
          type="button"
          role="tab"
          id={`tab-${value}`}
          aria-controls={`panel-${value}`}
          aria-selected={view === value}
          tabIndex={view === value ? 0 : -1}
          onClick={() => select(value)}
        >
          {ICONS[value]}
          <span>{LABELS[value]}</span>
        </button>
      ))}
    </div>
  );
}
