import type { Effect, View } from '../lib/terminal/types';

export interface ViewTabsProps {
  initial?: View;
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

/** WAI-ARIA tabs (Terminal | Resume), automatic activation. Contract stub (CRA-63). */
export function ViewTabs(_props: ViewTabsProps): React.JSX.Element {
  return <div />;
}
