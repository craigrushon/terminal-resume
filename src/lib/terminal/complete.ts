import { COMMANDS, argSpecFor, type ArgSpec } from './commands';
import { isDir, listDir, resolvePath } from './fs';
import type { Completion, TerminalState } from './types';

/** Options for the partially typed argument, honouring the command's completion rule. */
function candidates(spec: ArgSpec, partial: string, cwd: string): { options: string[]; prefix: string } {
  if (spec.kind === 'fixed') {
    return { options: spec.values.filter((value) => value.startsWith(partial)), prefix: '' };
  }
  const slash = partial.lastIndexOf('/') + 1;
  const dirPart = partial.slice(0, slash);
  const namePart = partial.slice(slash);
  const dir = resolvePath(cwd, dirPart === '' ? '.' : dirPart);
  if (dir === null || !isDir(dir)) return { options: [], prefix: dirPart };
  const options = listDir(dir).filter(
    (entry) => entry.startsWith(namePart) && (spec.kind === 'path' || entry.endsWith('/')),
  );
  return { options, prefix: dirPart };
}

/** Unique match completes (directories without a space); several are listed; none leaves the line. */
function finish(line: string, partial: string, prefix: string, options: string[]): Completion {
  const [only, ...others] = options;
  if (only === undefined || others.length > 0) return { line, options };
  const suffix = only.endsWith('/') ? '' : ' ';
  return { line: line.slice(0, line.length - partial.length) + prefix + only + suffix, options: [] };
}

export function complete(line: string, state: TerminalState): Completion {
  const [command = '', partial, ...rest] = line.split(/\s+/);

  if (partial === undefined) {
    const lower = command.toLowerCase();
    return finish(line, command, '', COMMANDS.filter((name) => name.startsWith(lower)));
  }
  const spec = rest.length === 0 ? argSpecFor(command.toLowerCase()) : undefined;
  if (spec === undefined) return { line, options: [] };
  const { options, prefix } = candidates(spec, partial, state.cwd);
  return finish(line, partial, prefix, options);
}
