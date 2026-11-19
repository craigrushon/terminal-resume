import { describe, expect, it } from 'vitest';
import example from '../../../content/resume.example.json';
import { parseResume } from '../resume/schema';
import { COMMANDS, initialState, run } from './commands';
import { complete } from './complete';
import { safeHref } from './href';
import type { Resume } from '../resume/schema';
import type { Block, RunResult, TerminalState } from './types';

const resume = parseResume(example);

const exec = (input: string, overrides: Partial<TerminalState> = {}): RunResult =>
  run(input, initialState(overrides), resume);

const outputOf = (input: string, overrides: Partial<TerminalState> = {}): Block[] => exec(input, overrides).output;

const SUMMARY =
  'Backend-leaning full-stack engineer who builds reliable product systems and AI-assisted developer tooling.';
const SUMMARY_VERBOSE =
  'Backend-leaning full-stack engineer with a decade of shipping product systems: payments, internal tools and data pipelines. Lately focused on AI-assisted developer workflows, where an orchestrator hands real tickets to specialised agents with human approval gates, measured cost and test-first guardrails.';

const EXPERIENCE_CONCISE: Block[] = [
  { type: 'heading', text: 'Senior Software Engineer @ Example Payments Co. (Mar 2022 – Present)' },
  { type: 'text', text: 'Own the payout reconciliation service and the internal tools used by the operations team.' },
  {
    type: 'list',
    items: [
      'Cut payout reconciliation time from hours to minutes by moving matching into an idempotent job pipeline',
      'Led the migration of money values from floats to integer cents across 40 endpoints',
      'Introduced characterization tests before refactors; zero money regressions in two years',
    ],
  },
  { type: 'heading', text: 'Software Developer @ Sample Learning Platform (Jun 2018 – Feb 2022)' },
  { type: 'text', text: 'Built course commerce and team-permission features for a learning platform.' },
  {
    type: 'list',
    items: [
      'Shipped team pages with role-based permissions used by 2,000+ organisations',
      'Rebuilt the checkout tax calculation with exhaustive tests across 12 regions',
    ],
  },
  { type: 'heading', text: 'Support Engineer @ Demo Support Team (Sep 2015 – May 2018)' },
  {
    type: 'text',
    text: "Resolved technical escalations and built the scripts that became the team's first internal tools.",
  },
  { type: 'list', items: ['Automated the five most common account fixes, saving roughly ten hours a week'] },
];

const EXPERIENCE_VERBOSE: Block[] = [
  { type: 'heading', text: 'Senior Software Engineer @ Example Payments Co. (Mar 2022 – Present)' },
  { type: 'text', text: 'Own the payout reconciliation service and the internal tools used by the operations team.' },
  {
    type: 'list',
    items: [
      'Cut payout reconciliation time from hours to minutes by moving matching into an idempotent job pipeline',
      'Led the migration of money values from floats to integer cents across 40 endpoints',
      'Introduced characterization tests before refactors; zero money regressions in two years',
      'Designed the dead-letter and replay flow so failed matches are retried safely and visible to operations',
      'Mentored three engineers through their first on-call rotations',
      'Built an agent workflow that drafts test plans for tickets, reviewed by a human before any code is written',
    ],
  },
  { type: 'text', text: 'Stack: TypeScript, Node.js, PostgreSQL, React' },
  { type: 'heading', text: 'Software Developer @ Sample Learning Platform (Jun 2018 – Feb 2022)' },
  { type: 'text', text: 'Built course commerce and team-permission features for a learning platform.' },
  {
    type: 'list',
    items: [
      'Shipped team pages with role-based permissions used by 2,000+ organisations',
      'Rebuilt the checkout tax calculation with exhaustive tests across 12 regions',
      'Moved support-escalated bugs into a weekly triage that halved repeat tickets',
    ],
  },
  { type: 'text', text: 'Stack: Ruby on Rails, React, MySQL' },
  { type: 'heading', text: 'Support Engineer @ Demo Support Team (Sep 2015 – May 2018)' },
  {
    type: 'text',
    text: "Resolved technical escalations and built the scripts that became the team's first internal tools.",
  },
  { type: 'list', items: ['Automated the five most common account fixes, saving roughly ten hours a week'] },
  { type: 'text', text: 'Stack: Python, SQL' },
];

const PROJECTS_CONCISE: Block[] = [
  { type: 'heading', text: 'Property ROI Calculator' },
  { type: 'text', text: 'Real-estate ROI calculator with mortgage, HELOC and cash financing.' },
  { type: 'list', items: ['Pinned the ROI maths with independently recomputed characterization tests'] },
  { type: 'text', text: 'Stack: Next.js, TypeScript, Prisma, Vitest' },
  {
    type: 'link',
    label: 'https://github.com/alex-example/property-roi',
    href: 'https://github.com/alex-example/property-roi',
  },
  { type: 'heading', text: 'Agent workflow' },
  {
    type: 'text',
    text: 'Orchestrator plus specialised subagents that take real tickets from plan to reviewed pull request.',
  },
  { type: 'list', items: ['Three merged pull requests at under one dollar each, with human approval gates'] },
  { type: 'text', text: 'Stack: TypeScript, LLM agents, Linear API' },
  {
    type: 'link',
    label: 'https://github.com/alex-example/agent-workflow',
    href: 'https://github.com/alex-example/agent-workflow',
  },
];

const PROJECTS_VERBOSE: Block[] = [
  PROJECTS_CONCISE[0]!,
  {
    type: 'text',
    text: 'Next.js app that models cash flow, cash-on-cash return and appreciation for rental properties, with characterization tests pinning the financial maths before each refactor.',
  },
  ...PROJECTS_CONCISE.slice(2),
];

const SKILLS: Block[] = [
  { type: 'text', text: 'Languages: TypeScript, Ruby, Python, SQL' },
  { type: 'text', text: 'Backend: Node.js, Rails, PostgreSQL, Event-driven pipelines' },
  { type: 'text', text: 'Frontend: React, Next.js, Astro' },
  { type: 'text', text: 'Practices: Test-first development, Characterization testing, AI-assisted workflows' },
];

const EDUCATION: Block[] = [
  { type: 'text', text: 'Bachelor of Science, Computer Science: Example University (Sep 2011 – May 2015)' },
];

const CONTACT: Block[] = [
  { type: 'link', label: 'Email', href: 'mailto:alex@example.com' },
  { type: 'link', label: 'GitHub', href: 'https://github.com/alex-example' },
  { type: 'link', label: 'LinkedIn', href: 'https://www.linkedin.com/in/alex-example' },
];

const README: Block[] = [
  {
    type: 'text',
    text: 'Welcome. Use ls and cd to explore, cat <file> to read a section, and help to list commands.',
  },
];

describe('initialState', () => {
  it('initialState returns the defaults', () => {
    expect(initialState()).toEqual({ cwd: '~', detail: 'concise', theme: 'modern', history: [] });
  });

  it('initialState applies overrides', () => {
    expect(initialState({ cwd: '~/resume', theme: 'classic' })).toEqual({
      cwd: '~/resume',
      detail: 'concise',
      theme: 'classic',
      history: [],
    });
  });
});

describe('run: purity and history', () => {
  it('empty input produces nothing and records no history', () => {
    expect(exec('')).toEqual({ output: [], state: initialState(), effects: [] });
  });

  it('whitespace-only input produces nothing and records no history', () => {
    expect(exec('   ')).toEqual({ output: [], state: initialState(), effects: [] });
  });

  it('appends the trimmed input to history', () => {
    expect(exec('  pwd  ', { history: ['help'] }).state.history).toEqual(['help', 'pwd']);
  });

  it('records unknown commands in history', () => {
    expect(exec('foo').state.history).toEqual(['foo']);
  });

  it('never mutates nested state (deep check)', () => {
    const state = initialState({ cwd: '~/resume', history: ['help', 'ls'] });
    const before = structuredClone(state);
    for (const input of ['cd ..', 'verbose', 'theme classic', 'history', 'clear', 'foo']) run(input, state, resume);
    expect(state).toEqual(before);
  });

  it('never mutates the state passed in', () => {
    const state: TerminalState = Object.freeze({
      cwd: '~',
      detail: 'concise',
      theme: 'modern',
      history: Object.freeze(['help']) as string[],
    });
    const result = run('cd resume', state, resume);
    expect(state).toEqual({ cwd: '~', detail: 'concise', theme: 'modern', history: ['help'] });
    expect(result.state).toEqual({ cwd: '~/resume', detail: 'concise', theme: 'modern', history: ['help', 'cd resume'] });
  });

  it('commands are case-insensitive', () => {
    expect(exec('PWD').output).toEqual([{ type: 'text', text: '~' }]);
  });
});

describe('run: help and whoami', () => {
  it('help prints a heading and every command with its description', () => {
    expect(outputOf('help')).toEqual([
      { type: 'heading', text: 'Commands' },
      {
        type: 'list',
        items: [
          'cat  Show a file or section',
          'cd  Change directory',
          'clear  Clear the screen',
          'concise  Show concise detail',
          'download  Download the PDF resume',
          'help  List commands',
          'history  Show previous commands',
          'ls  List directory contents',
          'open  Open a link: email, github, linkedin, resume.pdf',
          'pwd  Print working directory',
          'resume  Switch to Resume view',
          'theme  Show or set the theme',
          'verbose  Show verbose detail',
          'whoami  Show name, title and summary',
        ],
      },
    ]);
  });

  it('whoami prints name, title and the concise summary', () => {
    expect(outputOf('whoami')).toEqual([
      { type: 'text', text: 'Alex Example: Senior Software Engineer' },
      { type: 'text', text: SUMMARY },
    ]);
  });

  it('whoami -v prints the verbose summary', () => {
    expect(outputOf('whoami -v')).toEqual([
      { type: 'text', text: 'Alex Example: Senior Software Engineer' },
      { type: 'text', text: SUMMARY_VERBOSE },
    ]);
  });

  it('whoami uses the verbose summary when the state detail is verbose', () => {
    expect(outputOf('whoami', { detail: 'verbose' })).toEqual([
      { type: 'text', text: 'Alex Example: Senior Software Engineer' },
      { type: 'text', text: SUMMARY_VERBOSE },
    ]);
  });
});

describe('run: navigation', () => {
  it('pwd prints the current directory', () => {
    expect(outputOf('pwd', { cwd: '~/resume' })).toEqual([{ type: 'text', text: '~/resume' }]);
  });

  it('ls lists the current directory', () => {
    expect(outputOf('ls')).toEqual([{ type: 'list', items: ['README', 'resume/'] }]);
  });

  it('ls with a path lists that directory', () => {
    expect(outputOf('ls resume')).toEqual([
      { type: 'list', items: ['contact', 'education', 'experience', 'projects', 'skills'] },
    ]);
  });

  it('ls of a file lists just that file', () => {
    expect(outputOf('ls README')).toEqual([{ type: 'list', items: ['README'] }]);
  });

  it('ls of an unknown path is an error', () => {
    expect(outputOf('ls nope')).toEqual([{ type: 'error', text: 'ls: nope: No such file or directory' }]);
  });

  it('cd into a directory changes cwd and prints nothing', () => {
    const result = exec('cd resume');
    expect(result.output).toEqual([]);
    expect(result.effects).toEqual([]);
    expect(result.state.cwd).toBe('~/resume');
  });

  it('cd with no argument goes home', () => {
    expect(exec('cd', { cwd: '~/resume' }).state.cwd).toBe('~');
  });

  it('cd ~ goes home', () => {
    expect(exec('cd ~', { cwd: '~/resume' }).state.cwd).toBe('~');
  });

  it('cd .. goes up one level', () => {
    expect(exec('cd ..', { cwd: '~/resume' }).state.cwd).toBe('~');
  });

  it('cd to an unknown path is an error and keeps cwd', () => {
    const result = exec('cd nope');
    expect(result.output).toEqual([{ type: 'error', text: 'cd: nope: No such file or directory' }]);
    expect(result.state.cwd).toBe('~');
  });

  it('cd into a file is an error and keeps cwd', () => {
    const result = exec('cd README');
    expect(result.output).toEqual([{ type: 'error', text: 'cd: README: Not a directory' }]);
    expect(result.state.cwd).toBe('~');
  });
});

describe('run: cat', () => {
  it('cat without an operand is an error', () => {
    expect(outputOf('cat')).toEqual([{ type: 'error', text: 'cat: missing file operand' }]);
  });

  it('cat of an unknown path is an error', () => {
    expect(outputOf('cat nope')).toEqual([{ type: 'error', text: 'cat: nope: No such file or directory' }]);
  });

  it('cat of a directory is an error', () => {
    expect(outputOf('cat resume')).toEqual([{ type: 'error', text: 'cat: resume: Is a directory' }]);
  });

  // Spec §6 (decision B, 2026-11-18): if the path is not found relative to cwd, cat also looks in ~/resume,
  // so a visitor's first `cat experience` works from the home directory.
  it('cat falls back to ~/resume when the section is not found from the current directory', () => {
    expect(outputOf('cat experience')).toEqual(EXPERIENCE_CONCISE);
  });

  it('cat fallback respects -v', () => {
    expect(outputOf('cat experience -v')).toEqual(EXPERIENCE_VERBOSE);
  });

  it('cat fallback only applies to ~/resume (README is not found from ~/resume)', () => {
    expect(outputOf('cat README', { cwd: '~/resume' })).toEqual([
      { type: 'error', text: 'cat: README: No such file or directory' },
    ]);
  });

  it('cat of an unknown name is still an error after the fallback', () => {
    expect(outputOf('cat experiences')).toEqual([
      { type: 'error', text: 'cat: experiences: No such file or directory' },
    ]);
  });

  it('cat README explains how to navigate', () => {
    expect(outputOf('cat README')).toEqual(README);
  });

  it('cat experience (concise) shows three highlights at most per job and no stack', () => {
    expect(outputOf('cat experience', { cwd: '~/resume' })).toEqual(EXPERIENCE_CONCISE);
  });

  it('cat experience -v shows all highlights and the stack', () => {
    expect(outputOf('cat experience -v', { cwd: '~/resume' })).toEqual(EXPERIENCE_VERBOSE);
  });

  it('cat experience follows the verbose state detail', () => {
    expect(outputOf('cat experience', { cwd: '~/resume', detail: 'verbose' })).toEqual(EXPERIENCE_VERBOSE);
  });

  it('cat accepts a path from another directory', () => {
    expect(outputOf('cat ~/resume/experience')).toEqual(EXPERIENCE_CONCISE);
  });

  it('cat projects (concise) shows description, highlights, stack and repo link', () => {
    expect(outputOf('cat projects', { cwd: '~/resume' })).toEqual(PROJECTS_CONCISE);
  });

  it('cat projects --verbose uses descriptionVerbose where it exists', () => {
    expect(outputOf('cat projects --verbose', { cwd: '~/resume' })).toEqual(PROJECTS_VERBOSE);
  });

  it('cat skills prints one line per skill group', () => {
    expect(outputOf('cat skills', { cwd: '~/resume' })).toEqual(SKILLS);
  });

  it('cat education prints degree, field, institution and dates', () => {
    expect(outputOf('cat education', { cwd: '~/resume' })).toEqual(EDUCATION);
  });

  it('cat contact prints email and profile links', () => {
    expect(outputOf('cat contact', { cwd: '~/resume' })).toEqual(CONTACT);
  });
});

describe('run: open and download', () => {
  it('open email links to mailto and opens it', () => {
    const result = exec('open email');
    expect(result.output).toEqual([{ type: 'link', label: 'alex@example.com', href: 'mailto:alex@example.com' }]);
    expect(result.effects).toEqual([{ type: 'open-url', url: 'mailto:alex@example.com' }]);
  });

  it('open github shows the URL and opens it', () => {
    const result = exec('open github');
    expect(result.output).toEqual([
      { type: 'link', label: 'https://github.com/alex-example', href: 'https://github.com/alex-example' },
    ]);
    expect(result.effects).toEqual([{ type: 'open-url', url: 'https://github.com/alex-example' }]);
  });

  it('open linkedin shows the URL and opens it', () => {
    const result = exec('open linkedin');
    expect(result.output).toEqual([
      {
        type: 'link',
        label: 'https://www.linkedin.com/in/alex-example',
        href: 'https://www.linkedin.com/in/alex-example',
      },
    ]);
    expect(result.effects).toEqual([{ type: 'open-url', url: 'https://www.linkedin.com/in/alex-example' }]);
  });

  it('open resume.pdf triggers a download', () => {
    const result = exec('open resume.pdf');
    expect(result.output).toEqual([{ type: 'text', text: 'Downloading resume.pdf' }]);
    expect(result.effects).toEqual([{ type: 'download', href: '/resume.pdf' }]);
  });

  it('open with an unknown target is an error with no effects', () => {
    const result = exec('open twitter');
    expect(result.output).toEqual([
      { type: 'error', text: 'open: twitter: unknown target. Try: email, github, linkedin, resume.pdf' },
    ]);
    expect(result.effects).toEqual([]);
  });

  it('open without a target is an error', () => {
    expect(outputOf('open')).toEqual([
      { type: 'error', text: 'open: missing target. Try: email, github, linkedin, resume.pdf' },
    ]);
  });

  it('download triggers a download', () => {
    const result = exec('download');
    expect(result.output).toEqual([{ type: 'text', text: 'Downloading resume.pdf' }]);
    expect(result.effects).toEqual([{ type: 'download', href: '/resume.pdf' }]);
  });
});

describe('run: view, detail and theme', () => {
  it('resume switches to the Resume view', () => {
    const result = exec('resume');
    expect(result.output).toEqual([]);
    expect(result.effects).toEqual([{ type: 'set-view', view: 'resume' }]);
  });

  it('exit switches to the Resume view', () => {
    expect(exec('exit').effects).toEqual([{ type: 'set-view', view: 'resume' }]);
  });

  it('verbose sets the detail level', () => {
    const result = exec('verbose');
    expect(result.output).toEqual([{ type: 'text', text: 'Detail: verbose' }]);
    expect(result.effects).toEqual([{ type: 'set-detail', detail: 'verbose' }]);
    expect(result.state.detail).toBe('verbose');
  });

  it('concise sets the detail level', () => {
    const result = exec('concise', { detail: 'verbose' });
    expect(result.output).toEqual([{ type: 'text', text: 'Detail: concise' }]);
    expect(result.effects).toEqual([{ type: 'set-detail', detail: 'concise' }]);
    expect(result.state.detail).toBe('concise');
  });

  it('theme with no argument shows the current theme', () => {
    const result = exec('theme');
    expect(result.output).toEqual([{ type: 'text', text: 'theme: modern' }]);
    expect(result.effects).toEqual([]);
  });

  it('theme classic sets the theme', () => {
    const result = exec('theme classic');
    expect(result.output).toEqual([{ type: 'text', text: 'theme: classic' }]);
    expect(result.effects).toEqual([{ type: 'set-theme', theme: 'classic' }]);
    expect(result.state.theme).toBe('classic');
  });

  it('theme modern sets the theme', () => {
    const result = exec('theme modern', { theme: 'classic' });
    expect(result.effects).toEqual([{ type: 'set-theme', theme: 'modern' }]);
    expect(result.state.theme).toBe('modern');
  });

  it('theme with an invalid name is an error and keeps the theme', () => {
    const result = exec('theme neon');
    expect(result.output).toEqual([{ type: 'error', text: 'theme: neon: unknown theme. Try: classic, modern' }]);
    expect(result.effects).toEqual([]);
    expect(result.state.theme).toBe('modern');
  });
});

describe('run: clear, history, easter eggs, unknown', () => {
  it('clear emits the clear effect and no output', () => {
    const result = exec('clear');
    expect(result.output).toEqual([]);
    expect(result.effects).toEqual([{ type: 'clear' }]);
  });

  it('history lists previous commands, numbered from 1, excluding itself', () => {
    const result = exec('history', { history: ['help', 'pwd'] });
    expect(result.output).toEqual([{ type: 'list', items: ['1  help', '2  pwd'] }]);
    expect(result.state.history).toEqual(['help', 'pwd', 'history']);
  });

  it('history with nothing before it lists nothing', () => {
    expect(outputOf('history')).toEqual([{ type: 'list', items: [] }]);
  });

  it('sudo prints Nice try.', () => {
    expect(outputOf('sudo')).toEqual([{ type: 'text', text: 'Nice try.' }]);
  });

  it('sudo ignores its arguments', () => {
    expect(outputOf('sudo rm -rf /')).toEqual([{ type: 'text', text: 'Nice try.' }]);
  });

  it('an unknown command with no close match is just an error', () => {
    expect(outputOf('foo')).toEqual([{ type: 'error', text: "command not found: foo. Try 'help'." }]);
  });

  it('an unknown command close to a known one adds a suggestion', () => {
    expect(outputOf('whoam')).toEqual([
      { type: 'error', text: "command not found: whoam. Try 'help'." },
      { type: 'text', text: "Did you mean 'whoami'?" },
    ]);
  });

  it('the unknown-command message keeps the lowercased command', () => {
    expect(outputOf('FOO')).toEqual([{ type: 'error', text: "command not found: foo. Try 'help'." }]);
  });
});

describe('hidden commands', () => {
  it('COMMANDS lists only public commands (no exit or sudo)', () => {
    expect(COMMANDS).toEqual([
      'cat', 'cd', 'clear', 'concise', 'download', 'help', 'history', 'ls', 'open', 'pwd', 'resume', 'theme', 'verbose', 'whoami',
    ]);
  });

  it.each(['exit', 'sudo'])('help never lists %s', (name) => {
    const list = outputOf('help').find((block) => block.type === 'list');
    const names = list?.type === 'list' ? list.items.map((item) => item.split(' ')[0]) : [];
    expect(names).toHaveLength(14);
    expect(names.includes(name)).toBe(false);
  });

  it.each(['e', 's', 'ex', 'su'])('completing %j never offers hidden commands', (line) => {
    const { options, line: completed } = complete(line, initialState());
    expect([...options, completed.trim()].some((value) => value === 'exit' || value === 'sudo')).toBe(false);
  });
});

// Spec §7 / review of milestone 2: link hrefs must be safe even if content validation is bypassed.
describe('href safety', () => {
  const ALL_INPUTS = [
    'help', 'whoami', 'whoami -v', 'ls', 'ls resume', 'pwd', 'cat README', 'history', 'download', 'theme', 'concise', 'verbose',
    ...['experience', 'projects', 'skills', 'education', 'contact'].flatMap((s) => [`cat ${s}`, `cat ${s} -v`]),
    ...['email', 'github', 'linkedin', 'resume.pdf'].map((t) => `open ${t}`),
  ];

  it('every link and open-url emitted for the example content is already safe', () => {
    const hrefs = ALL_INPUTS.flatMap((input) => {
      const { output, effects } = exec(input);
      return [
        ...output.flatMap((block) => (block.type === 'link' ? [block.href] : [])),
        ...effects.flatMap((effect) => (effect.type === 'open-url' ? [effect.url] : effect.type === 'download' ? [effect.href] : [])),
      ];
    });
    // projects 2+2, contact 3+3, open email/github/linkedin link+effect 3x2, open resume.pdf 1, download 1 = 18
    expect(hrefs).toHaveLength(18);
    expect(hrefs.filter((href) => safeHref(href) !== href)).toEqual([]);
  });

  // A typed Resume that skipped parseResume (e.g. a future loader bug) carrying a hostile URL.
  const hostile: Resume = {
    ...resume,
    basics: {
      ...resume.basics,
      profiles: [{ network: 'GitHub', username: 'x', url: 'javascript:alert(1)' }, ...resume.basics.profiles.slice(1)],
    },
    projects: [{ ...resume.projects[0]!, repo: 'javascript:alert(2)' }],
  };

  it('cat contact drops a hostile profile link', () => {
    expect(run('cat contact', initialState(), hostile).output).toEqual([
      { type: 'link', label: 'Email', href: 'mailto:alex@example.com' },
      { type: 'link', label: 'LinkedIn', href: 'https://www.linkedin.com/in/alex-example' },
    ]);
  });

  it('cat projects drops a hostile repo link', () => {
    const output = run('cat projects', initialState(), hostile).output;
    expect(output.filter((block) => block.type === 'link')).toEqual([]);
  });

  it('open refuses a hostile URL with an error and no effect', () => {
    const result = run('open github', initialState(), hostile);
    expect(result.output).toEqual([{ type: 'error', text: 'open: github: link blocked (unsafe URL)' }]);
    expect(result.effects).toEqual([]);
  });
});
