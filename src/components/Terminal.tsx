import type { Resume } from '../lib/resume/schema';
import type { Effect, TerminalState } from '../lib/terminal/types';

export interface TerminalProps {
  resume: Resume;
  initialState?: Partial<TerminalState>;
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

export function Terminal(_props: TerminalProps): React.JSX.Element {
  return <div />;
}
