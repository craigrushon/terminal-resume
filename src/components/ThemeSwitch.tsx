import { applyEffect, browserEnv } from '../lib/effects';
import type { Effect, Theme } from '../lib/terminal/types';
import { RadioSwitch } from './RadioSwitch';

export interface ThemeSwitchProps {
  initial?: Theme;
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

const defaultOnEffect = (effect: Effect): void => applyEffect(effect, browserEnv());

const OPTIONS = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
] as const;

/** Fieldset "Theme": radios Modern | Classic. */
export function ThemeSwitch({ initial, onEffect = defaultOnEffect }: ThemeSwitchProps): React.JSX.Element {
  return (
    <RadioSwitch
      prefKey="theme"
      legend="Theme"
      fallback="modern"
      initial={initial}
      options={OPTIONS}
      onChange={(theme) => onEffect({ type: 'set-theme', theme })}
    />
  );
}
