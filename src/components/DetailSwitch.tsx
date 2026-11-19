import { applyEffect, browserEnv } from '../lib/effects';
import type { Detail, Effect } from '../lib/terminal/types';
import { RadioSwitch } from './RadioSwitch';

export interface DetailSwitchProps {
  initial?: Detail;
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

const defaultOnEffect = (effect: Effect): void => applyEffect(effect, browserEnv());

const OPTIONS = [
  { value: 'concise', label: 'Concise' },
  { value: 'verbose', label: 'Detailed' },
] as const;

/** Fieldset "Detail": radios Concise | Detailed (values concise/verbose). */
export function DetailSwitch({ initial, onEffect = defaultOnEffect }: DetailSwitchProps): React.JSX.Element {
  return (
    <RadioSwitch
      prefKey="detail"
      legend="Detail"
      fallback="concise"
      initial={initial}
      options={OPTIONS}
      onChange={(detail) => onEffect({ type: 'set-detail', detail })}
    />
  );
}
