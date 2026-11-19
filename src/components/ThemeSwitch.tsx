import type { Effect, Theme } from '../lib/terminal/types';

export interface ThemeSwitchProps {
  initial?: Theme;
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

/** Fieldset "Theme": radios Modern | Classic. Contract stub (CRA-63). */
export function ThemeSwitch(_props: ThemeSwitchProps): React.JSX.Element {
  return <div />;
}
