import type { Resume } from '../resume/schema';
import type { RunResult, TerminalState } from './types';

/** Public commands, alphabetical. Hidden easter eggs (exit, sudo) are NOT listed. */
export const COMMANDS: readonly string[] = [
  'cat',
  'cd',
  'clear',
  'concise',
  'download',
  'help',
  'history',
  'ls',
  'open',
  'pwd',
  'resume',
  'theme',
  'verbose',
  'whoami',
];

export function initialState(_overrides?: Partial<TerminalState>): TerminalState {
  throw new Error('not implemented');
}

export function run(_input: string, _state: TerminalState, _resume: Resume): RunResult {
  throw new Error('not implemented');
}
