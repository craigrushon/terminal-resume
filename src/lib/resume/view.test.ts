import { describe, expect, it } from 'vitest';
import example from '../../../content/resume.example.json';
import { parseResume, type Resume } from './schema';
import { buildResumeView, type ResumeView } from './view';

const resume = parseResume(example);

const EXPECTED: ResumeView = {
  name: 'Alex Example',
  label: 'Senior Software Engineer',
  summary: 'Backend-leaning full-stack engineer who builds reliable product systems and AI-assisted developer tooling.',
  summaryVerbose:
    'Backend-leaning full-stack engineer with a decade of shipping product systems: payments, internal tools and data pipelines. Lately focused on AI-assisted developer workflows, where an orchestrator hands real tickets to specialised agents with human approval gates, measured cost and test-first guardrails.',
  location: 'Montréal, QC, CA',
  contact: [
    { label: 'Email', href: 'mailto:alex@example.com' },
    { label: 'GitHub', href: 'https://github.com/alex-example' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alex-example' },
  ],
  work: [
    {
      position: 'Senior Software Engineer',
      company: 'Example Payments Co.',
      dates: 'Mar 2022 \u2013 Present',
      summary: 'Own the payout reconciliation service and the internal tools used by the operations team.',
      highlights: [
        'Cut payout reconciliation time from hours to minutes by moving matching into an idempotent job pipeline',
        'Led the migration of money values from floats to integer cents across 40 endpoints',
        'Introduced characterization tests before refactors; zero money regressions in two years',
      ],
      more: [
        'Designed the dead-letter and replay flow so failed matches are retried safely and visible to operations',
        'Mentored three engineers through their first on-call rotations',
        'Built an agent workflow that drafts test plans for tickets, reviewed by a human before any code is written',
      ],
      stack: ['TypeScript', 'Node.js', 'PostgreSQL', 'React'],
    },
    {
      position: 'Software Developer',
      company: 'Sample Learning Platform',
      dates: 'Jun 2018 \u2013 Feb 2022',
      summary: 'Built course commerce and team-permission features for a learning platform.',
      highlights: [
        'Shipped team pages with role-based permissions used by 2,000+ organisations',
        'Rebuilt the checkout tax calculation with exhaustive tests across 12 regions',
      ],
      more: ['Moved support-escalated bugs into a weekly triage that halved repeat tickets'],
      stack: ['Ruby on Rails', 'React', 'MySQL'],
    },
    {
      position: 'Support Engineer',
      company: 'Demo Support Team',
      dates: 'Sep 2015 \u2013 May 2018',
      summary: "Resolved technical escalations and built the scripts that became the team's first internal tools.",
      highlights: ['Automated the five most common account fixes, saving roughly ten hours a week'],
      more: [],
      stack: ['Python', 'SQL'],
    },
  ],
  projects: [
    {
      name: 'Property ROI Calculator',
      description: 'Real-estate ROI calculator with mortgage, HELOC and cash financing.',
      descriptionVerbose:
        'Next.js app that models cash flow, cash-on-cash return and appreciation for rental properties, with characterization tests pinning the financial maths before each refactor.',
      highlights: ['Pinned the ROI maths with independently recomputed characterization tests'],
      stack: ['Next.js', 'TypeScript', 'Prisma', 'Vitest'],
      link: {
        label: 'Source code: Property ROI Calculator', // review: readable link text, not the raw URL
        href: 'https://github.com/alex-example/property-roi',
      },
    },
    {
      name: 'Agent workflow',
      description: 'Orchestrator plus specialised subagents that take real tickets from plan to reviewed pull request.',
      highlights: ['Three merged pull requests at under one dollar each, with human approval gates'],
      stack: ['TypeScript', 'LLM agents', 'Linear API'],
      link: {
        label: 'Source code: Agent workflow',
        href: 'https://github.com/alex-example/agent-workflow',
      },
    },
  ],
  skills: [
    { name: 'Languages', keywords: ['TypeScript', 'Ruby', 'Python', 'SQL'] },
    { name: 'Backend', keywords: ['Node.js', 'Rails', 'PostgreSQL', 'Event-driven pipelines'] },
    { name: 'Frontend', keywords: ['React', 'Next.js', 'Astro'] },
    { name: 'Practices', keywords: ['Test-first development', 'Characterization testing', 'AI-assisted workflows'] },
  ],
  education: [
    {
      title: 'Bachelor of Science, Computer Science',
      institution: 'Example University',
      dates: 'Sep 2011 \u2013 May 2015',
    },
  ],
};

describe('buildResumeView', () => {
  it('builds the whole view for the example resume', () => {
    expect(buildResumeView(resume)).toEqual(EXPECTED);
  });

  it('labels a project website (url without repo) by name', () => {
    const withSite: Resume = { ...resume, projects: [{ name: 'Demo', description: 'd', url: 'https://demo.example.com', highlights: [], stack: [] }] };
    expect(buildResumeView(withSite).projects[0]?.link).toEqual({ label: 'Website: Demo', href: 'https://demo.example.com' });
  });

  it('drops unsafe profile and project links', () => {
    const hostile: Resume = {
      ...resume,
      basics: {
        ...resume.basics,
        email: undefined,
        profiles: [{ network: 'Evil', username: 'x', url: 'javascript:alert(1)' }],
      },
      projects: [
        {
          name: 'P',
          description: 'D',
          repo: 'javascript:alert(2)',
          highlights: [],
          stack: [],
        },
      ],
    };
    const view = buildResumeView(hostile);
    expect(view.contact).toEqual([]);
    expect(view.projects).toEqual([{ name: 'P', description: 'D', highlights: [], stack: [] }]);
  });

  it('gives more: [] for a work item with no verbose highlights and at most three highlights', () => {
    const view = buildResumeView(resume);
    expect(view.work[2]?.more).toEqual([]);
  });
});
