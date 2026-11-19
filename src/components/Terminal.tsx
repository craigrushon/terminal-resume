import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Resume } from '../lib/resume/schema';
import { applyEffect, browserEnv } from '../lib/effects';
import { initialState, run } from '../lib/terminal/commands';
import { complete } from '../lib/terminal/complete';
import type { Block, Effect, TerminalState } from '../lib/terminal/types';
import { TerminalBlock } from './TerminalBlock';

export interface TerminalProps {
  resume: Resume;
  initialState?: Partial<TerminalState>;
  /** Default: (e) => applyEffect(e, browserEnv()) */
  onEffect?: (effect: Effect) => void;
}

type Entry =
  | { id: number; kind: 'welcome'; text: string }
  | { id: number; kind: 'echo'; text: string }
  | { id: number; kind: 'options'; text: string }
  | { id: number; kind: 'block'; block: Block };

type NewEntry =
  | { kind: 'welcome'; text: string }
  | { kind: 'echo'; text: string }
  | { kind: 'options'; text: string }
  | { kind: 'block'; block: Block };

export const CHIPS = ['help', 'whoami', 'cat experience', 'cat projects', 'open linkedin', 'resume'] as const;

const defaultOnEffect = (effect: Effect): void => applyEffect(effect, browserEnv());

function promptFor(cwd: string): string {
  return `visitor@craigrushon:${cwd}$`;
}

export function Terminal({ resume, initialState: overrides, onEffect = defaultOnEffect }: TerminalProps): React.JSX.Element {
  const nextId = useRef(0);
  const withIds = (items: NewEntry[]): Entry[] => items.map((item) => ({ ...item, id: nextId.current++ }) as Entry);

  const [state, setState] = useState(() => initialState(overrides));
  const [entries, setEntries] = useState<Entry[]>(() =>
    withIds([
      { kind: 'welcome', text: `${resume.basics.name}: ${resume.basics.label}` },
      { kind: 'welcome', text: "Type 'help' to see commands, or try: cat experience" },
    ]),
  );
  const [input, setInput] = useState('');
  /** Index into state.history while walking with arrows; null = editing a fresh line. */
  const [cursor, setCursor] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log && typeof log.scrollTo === 'function') log.scrollTo({ top: log.scrollHeight });
    if (typeof inputRef.current?.scrollIntoView === 'function') inputRef.current.scrollIntoView({ block: 'nearest' });
  }, [entries]);

  const append = (items: NewEntry[]): void => setEntries((previous) => [...previous, ...withIds(items)]);
  const clearLog = (): void => setEntries([]);

  const execute = (line: string): void => {
    const result = run(line, state, resume);
    const cleared = result.effects.some((effect) => effect.type === 'clear');
    const echo: NewEntry = { kind: 'echo', text: `${promptFor(state.cwd)} ${line}` };
    if (cleared) clearLog();
    else append([echo, ...result.output.map((block): NewEntry => ({ kind: 'block', block }))]);
    setState(result.state);
    setInput('');
    setCursor(null);
    for (const effect of result.effects) onEffect(effect);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.ctrlKey && !event.altKey && !event.metaKey) {
      const key = event.key.toLowerCase();
      if (key === 'l') {
        event.preventDefault();
        clearLog();
        return;
      }
      if (key === 'c') {
        event.preventDefault();
        append([{ kind: 'echo', text: `${promptFor(state.cwd)} ${input}^C` }]);
        setInput('');
        setCursor(null);
        return;
      }
    }
    const { history } = state;
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        execute(input);
        break;
      case 'ArrowUp': {
        event.preventDefault();
        if (history.length === 0) break;
        if (cursor === null) setDraft(input);
        const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
        setCursor(next);
        setInput(history[next] ?? '');
        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        if (cursor === null) break;
        if (cursor >= history.length - 1) {
          setCursor(null);
          setInput(draft);
        } else {
          setCursor(cursor + 1);
          setInput(history[cursor + 1] ?? '');
        }
        break;
      }
      case 'Tab': {
        event.preventDefault();
        const result = complete(input, state);
        if (result.options.length > 1) {
          append([
            { kind: 'echo', text: `${promptFor(state.cwd)} ${input}` },
            { kind: 'options', text: result.options.join(' ') },
          ]);
        }
        setInput(result.line);
        setCursor(null);
        break;
      }
      default:
    }
  };

  /** Clicking the log returns focus to the input, except on links/buttons or while text is selected (copying). */
  const focusInputFromLog = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('a, button')) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    inputRef.current?.focus();
  };

  return (
    <section className="terminal" aria-label="Terminal">
      <div
        ref={logRef}
        className="terminal-log"
        role="log"
        aria-label="Terminal output"
        aria-live="polite"
        onClick={focusInputFromLog}
      >
        {entries.map((entry) => {
          switch (entry.kind) {
            case 'welcome':
              return <p key={entry.id}>{entry.text}</p>;
            case 'echo':
              return (
                <div key={entry.id} className="echo">
                  {entry.text}
                </div>
              );
            case 'options':
              return (
                <p key={entry.id} className="options">
                  {entry.text}
                </p>
              );
            case 'block':
              return <TerminalBlock key={entry.id} block={entry.block} />;
            default: {
              const unreachable: never = entry;
              return unreachable;
            }
          }
        })}
      </div>
      <nav className="chips" aria-label="Suggested commands">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              execute(chip);
              inputRef.current?.focus();
            }}
          >
            {chip}
          </button>
        ))}
      </nav>
      <div className="terminal-input" onClick={() => inputRef.current?.focus()}>
        <label htmlFor="terminal-command" className="sr-only">
          Terminal command
        </label>
        <span className="prompt">{promptFor(state.cwd)}</span>
        <input
          id="terminal-command"
          ref={inputRef}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setCursor(null);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </section>
  );
}
