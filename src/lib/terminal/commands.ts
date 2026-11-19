import { formatRange, formatYearMonth } from '../format/dates';
import { selectHighlights } from '../format/detail';
import type { Resume } from '../resume/schema';
import { SECTION_NAMES, isDir, isFile, listDir, resolvePath, type SectionName } from './fs';
import { parse } from './parse';
import { suggest } from './suggest';
import type { Block, Detail, Effect, RunResult, TerminalState } from './types';
import { safeHref } from './href';
import { PDF_HREF, THEMES, oneOf } from './values';

const HOME = '~';
const RESUME_DIR = '~/resume';
const OPEN_TARGETS = ['email', 'github', 'linkedin', 'resume.pdf'] as const;
const OPEN_HINT = `Try: ${OPEN_TARGETS.join(', ')}`;
const README = 'Welcome. Use ls and cd to explore, cat <file> to read a section, and help to list commands.';

/** How the first argument of a command tab-completes. */
export type ArgSpec = { kind: 'dir' } | { kind: 'path' } | { kind: 'fixed'; values: readonly string[] };

interface Context {
  args: string[];
  /** Effective detail: the -v flag overrides the state's detail for this command. */
  detail: Detail;
  state: TerminalState;
  resume: Resume;
}

interface Outcome {
  output?: Block[];
  effects?: Effect[];
  state?: Partial<Pick<TerminalState, 'cwd' | 'detail' | 'theme'>>;
}

interface Command {
  name: string;
  args?: ArgSpec;
  run: (ctx: Context) => Outcome;
}

interface PublicCommand extends Command {
  description: string;
}

const text = (value: string): Block => ({ type: 'text', text: value });
/** A link block, or nothing when the href fails the allow-list (see href.ts). */
const safeLink = (label: string, href: string): Block[] => {
  const allowed = safeHref(href);
  return allowed === null ? [] : [{ type: 'link', label, href: allowed }];
};
const failure = (value: string): Outcome => ({ output: [{ type: 'error', text: value }] });

const lastSegment = (path: string): string => path.split('/').at(-1) ?? path;

// ---- section renderers (cat) ----

function renderExperience({ resume, detail }: Context): Block[] {
  return resume.work.flatMap((job): Block[] => [
    { type: 'heading', text: `${job.position} @ ${job.name} (${formatRange(job.startDate, job.endDate)})` },
    text(job.summary),
    { type: 'list', items: selectHighlights(job, detail) },
    ...(detail === 'verbose' && job.stack ? [text(`Stack: ${job.stack.join(', ')}`)] : []),
  ]);
}

function renderProjects({ resume, detail }: Context): Block[] {
  return resume.projects.flatMap((project): Block[] => {
    const href = project.repo ?? project.url;
    return [
      { type: 'heading', text: project.name },
      text(detail === 'verbose' ? (project.descriptionVerbose ?? project.description) : project.description),
      { type: 'list', items: selectHighlights(project, detail) },
      text(`Stack: ${project.stack.join(', ')}`),
      ...(href ? safeLink(href, href) : []),
    ];
  });
}

function educationDates(start?: string, end?: string): string {
  if (start) return formatRange(start, end);
  return end ? formatYearMonth(end) : '';
}

function renderEducation({ resume }: Context): Block[] {
  return resume.education.map((entry) => {
    const dates = educationDates(entry.startDate, entry.endDate);
    return text(`${entry.studyType}, ${entry.area}: ${entry.institution}${dates ? ` (${dates})` : ''}`);
  });
}

function renderContact({ resume }: Context): Block[] {
  const { email, profiles } = resume.basics;
  return [
    ...(email ? safeLink('Email', `mailto:${email}`) : []),
    ...profiles.flatMap((profile) => safeLink(profile.network, profile.url)),
  ];
}

const SECTIONS: Record<SectionName, (ctx: Context) => Block[]> = {
  contact: renderContact,
  education: renderEducation,
  experience: renderExperience,
  projects: renderProjects,
  skills: ({ resume }) => resume.skills.map((group) => text(`${group.name}: ${group.keywords.join(', ')}`)),
};

function catFile(path: string, ctx: Context): Block[] {
  const section = oneOf(SECTION_NAMES, lastSegment(path));
  return section ? SECTIONS[section](ctx) : [text(README)];
}

/** cwd first, then ~/resume (spec §6 cat fallback). */
function catOne(arg: string, ctx: Context): Block[] {
  const path = resolvePath(ctx.state.cwd, arg) ?? resolvePath(RESUME_DIR, arg);
  if (path === null) return [{ type: 'error', text: `cat: ${arg}: No such file or directory` }];
  if (isDir(path)) return [{ type: 'error', text: `cat: ${arg}: Is a directory` }];
  return catFile(path, ctx);
}

// ---- open / download ----

function downloadOutcome(): Outcome {
  return { output: [text('Downloading resume.pdf')], effects: [{ type: 'download', href: PDF_HREF }] };
}

function openLink(target: string, label: string, url: string): Outcome {
  const allowed = safeHref(url);
  if (allowed === null) return failure(`open: ${target}: link blocked (unsafe URL)`);
  return { output: [{ type: 'link', label, href: allowed }], effects: [{ type: 'open-url', url: allowed }] };
}

function openTarget(target: (typeof OPEN_TARGETS)[number], resume: Resume): Outcome {
  const { email, profiles } = resume.basics;
  if (target === 'resume.pdf') return downloadOutcome();
  if (target === 'email') {
    return email ? openLink(target, email, `mailto:${email}`) : failure('open: email: not available in this resume');
  }
  const url = profiles.find((profile) => profile.network.toLowerCase() === target)?.url;
  return url ? openLink(target, url, url) : failure(`open: ${target}: not available in this resume`);
}

// ---- command table: single source for help, COMMANDS, completion and dispatch ----

const setDetail = (detail: Detail): Outcome => ({
  output: [text(`Detail: ${detail}`)],
  effects: [{ type: 'set-detail', detail }],
  state: { detail },
});

const PUBLIC_COMMANDS: readonly PublicCommand[] = [
  {
    name: 'cat',
    description: 'Show a file or section',
    args: { kind: 'path' },
    run: (ctx) =>
      ctx.args.length === 0
        ? failure('cat: missing file operand')
        : { output: ctx.args.flatMap((arg) => catOne(arg, ctx)) },
  },
  {
    name: 'cd',
    description: 'Change directory',
    args: { kind: 'dir' },
    run: ({ args, state }) => {
      const arg = args[0] ?? HOME;
      const path = resolvePath(state.cwd, arg);
      if (path === null) return failure(`cd: ${arg}: No such file or directory`);
      if (!isDir(path)) return failure(`cd: ${arg}: Not a directory`);
      return { state: { cwd: path } };
    },
  },
  { name: 'clear', description: 'Clear the screen', run: () => ({ effects: [{ type: 'clear' }] }) },
  { name: 'concise', description: 'Show concise detail', run: () => setDetail('concise') },
  { name: 'download', description: 'Download the PDF resume', run: downloadOutcome },
  {
    name: 'help',
    description: 'List commands',
    run: () => ({
      output: [
        { type: 'heading', text: 'Commands' },
        { type: 'list', items: SORTED_PUBLIC.map((command) => `${command.name}  ${command.description}`) },
      ],
    }),
  },
  {
    name: 'history',
    description: 'Show previous commands',
    run: ({ state }) => ({
      output: [{ type: 'list', items: state.history.map((entry, i) => `${i + 1}  ${entry}`) }],
    }),
  },
  {
    name: 'ls',
    description: 'List directory contents',
    args: { kind: 'dir' },
    run: ({ args, state }) => {
      const arg = args[0] ?? '.';
      const path = resolvePath(state.cwd, arg);
      if (path === null) return failure(`ls: ${arg}: No such file or directory`);
      return { output: [{ type: 'list', items: isFile(path) ? [lastSegment(path)] : listDir(path) }] };
    },
  },
  {
    name: 'open',
    description: `Open a link: ${OPEN_TARGETS.join(', ')}`,
    args: { kind: 'fixed', values: OPEN_TARGETS },
    run: ({ args, resume }) => {
      const arg = args[0];
      if (arg === undefined) return failure(`open: missing target. ${OPEN_HINT}`);
      const target = oneOf(OPEN_TARGETS, arg);
      return target ? openTarget(target, resume) : failure(`open: ${arg}: unknown target. ${OPEN_HINT}`);
    },
  },
  { name: 'pwd', description: 'Print working directory', run: ({ state }) => ({ output: [text(state.cwd)] }) },
  {
    name: 'resume',
    description: 'Switch to Resume view',
    run: () => ({ effects: [{ type: 'set-view', view: 'resume' }] }),
  },
  {
    name: 'theme',
    description: 'Show or set the theme',
    args: { kind: 'fixed', values: THEMES },
    run: ({ args, state }) => {
      const arg = args[0];
      if (arg === undefined) return { output: [text(`theme: ${state.theme}`)] };
      const theme = oneOf(THEMES, arg);
      if (!theme) return failure(`theme: ${arg}: unknown theme. Try: ${THEMES.join(', ')}`);
      return { output: [text(`theme: ${theme}`)], effects: [{ type: 'set-theme', theme }], state: { theme } };
    },
  },
  { name: 'verbose', description: 'Show verbose detail', run: () => setDetail('verbose') },
  {
    name: 'whoami',
    description: 'Show name, title and summary',
    run: ({ resume, detail }) => {
      const { name, label, summary, summaryVerbose } = resume.basics;
      return {
        output: [text(`${name}: ${label}`), text(detail === 'verbose' ? (summaryVerbose ?? summary) : summary)],
      };
    },
  },
];

/** Easter eggs: dispatchable but not listed in help, COMMANDS or completion. */
const HIDDEN_COMMANDS: readonly Command[] = [
  { name: 'exit', run: () => ({ effects: [{ type: 'set-view', view: 'resume' }] }) },
  { name: 'sudo', run: () => ({ output: [text('Nice try.')] }) },
];

const SORTED_PUBLIC: readonly PublicCommand[] = [...PUBLIC_COMMANDS].sort((a, b) =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
);

/** Public commands, alphabetical. Hidden easter eggs (exit, sudo) are NOT listed. */
export const COMMANDS: readonly string[] = SORTED_PUBLIC.map((command) => command.name);

/** Argument completion rule for a public command, if it takes completable arguments. */
export function argSpecFor(name: string): ArgSpec | undefined {
  return PUBLIC_COMMANDS.find((command) => command.name === name)?.args;
}

export function initialState(overrides: Partial<TerminalState> = {}): TerminalState {
  return { cwd: HOME, detail: 'concise', theme: 'modern', history: [], ...overrides };
}

function unknownCommand(cmd: string): Block[] {
  const close = suggest(cmd, [...COMMANDS]);
  return [
    { type: 'error', text: `command not found: ${cmd}. Try 'help'.` },
    ...(close ? [text(`Did you mean '${close}'?`)] : []),
  ];
}

export function run(input: string, state: TerminalState, resume: Resume): RunResult {
  const { cmd, args, verbose } = parse(input);
  if (cmd === '') return { output: [], state, effects: [] };

  const command = [...PUBLIC_COMMANDS, ...HIDDEN_COMMANDS].find((candidate) => candidate.name === cmd);
  const detail: Detail = verbose ? 'verbose' : state.detail;
  const outcome: Outcome = command ? command.run({ args, detail, state, resume }) : { output: unknownCommand(cmd) };

  return {
    output: outcome.output ?? [],
    effects: outcome.effects ?? [],
    state: { ...state, ...outcome.state, history: [...state.history, input.trim()] },
  };
}
