export type View = 'terminal' | 'resume';
export type Detail = 'concise' | 'verbose';
export type Theme = 'classic' | 'modern';
export type Block =
  | { type: 'text'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'link'; label: string; href: string }
  | { type: 'error'; text: string };
export type Effect =
  | { type: 'set-view'; view: View }
  | { type: 'set-detail'; detail: Detail }
  | { type: 'set-theme'; theme: Theme }
  | { type: 'open-url'; url: string }
  | { type: 'download'; href: '/resume.pdf' }
  | { type: 'clear' };
export interface TerminalState {
  cwd: string;
  detail: Detail;
  theme: Theme;
  history: string[];
}
export interface RunResult {
  output: Block[];
  state: TerminalState;
  effects: Effect[];
}
export interface Parsed {
  cmd: string;
  args: string[];
  verbose: boolean;
}
export interface Completion {
  line: string;
  options: string[];
}
