import type { Detail, Effect, View } from '../lib/terminal/types';

export interface TogglesProps {
  initial?: { view: View; detail: Detail };
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

export function Toggles(_props: TogglesProps): React.JSX.Element {
  return <div className="toggles" />;
}
