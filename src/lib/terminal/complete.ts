import type { Completion, TerminalState } from './types';

export function complete(_line: string, _state: TerminalState): Completion {
  throw new Error('not implemented');
}
