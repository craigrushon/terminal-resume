import { usePrefState, type PrefKey, type PrefValue } from './usePref';

export interface RadioSwitchProps<K extends PrefKey> {
  prefKey: K;
  legend: string;
  fallback: PrefValue<K>;
  initial?: PrefValue<K>;
  options: readonly { value: PrefValue<K>; label: string }[];
  onChange: (value: PrefValue<K>) => void;
}

/** Shared segmented radio group behind DetailSwitch and ThemeSwitch. */
export function RadioSwitch<K extends PrefKey>({
  prefKey,
  legend,
  fallback,
  initial,
  options,
  onChange,
}: RadioSwitchProps<K>): React.JSX.Element {
  const [current, setCurrent] = usePrefState(prefKey, fallback, initial);
  return (
    <fieldset className="switch">
      <legend>{legend}</legend>
      {options.map(({ value, label }) => (
        <label key={value}>
          <input
            type="radio"
            name={prefKey}
            value={value}
            checked={current === value}
            onChange={() => {
              setCurrent(value);
              onChange(value);
            }}
          />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
