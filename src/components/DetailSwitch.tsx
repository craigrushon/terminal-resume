import type { Detail, Effect } from '../lib/terminal/types';

export interface DetailSwitchProps {
  initial?: Detail;
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

/** Fieldset "Detail": radios Concise | Detailed (values concise/verbose). Contract stub (CRA-63). */
export function DetailSwitch(_props: DetailSwitchProps): React.JSX.Element {
  return <div />;
}
