import { formatRange, formatYearMonth } from '../format/dates';
import { selectHighlights } from '../format/detail';
import { safeHref } from '../terminal/href';
import type { Resume } from './schema';

export interface LinkView {
  label: string;
  href: string;
}
export interface WorkView {
  position: string;
  company: string;
  dates: string;
  summary: string;
  highlights: string[];
  more: string[];
  stack: string[];
}
export interface ProjectView {
  name: string;
  description: string;
  descriptionVerbose?: string;
  highlights: string[];
  stack: string[];
  link?: LinkView;
}
export interface ResumeView {
  name: string;
  label: string;
  summary: string;
  summaryVerbose?: string;
  /** `${city}, ${region}, ${country}` */
  location: string;
  /** Email (mailto) first, then each profile. Unsafe hrefs are dropped. */
  contact: LinkView[];
  work: WorkView[];
  projects: ProjectView[];
  skills: { name: string; keywords: string[] }[];
  /** title = `${studyType}, ${area}` */
  education: { title: string; institution: string; dates?: string }[];
}

function link(label: string, href: string): LinkView[] {
  const allowed = safeHref(href);
  return allowed === null ? [] : [{ label, href: allowed }];
}

function educationDates(start?: string, end?: string): string | undefined {
  if (start) return formatRange(start, end);
  return end ? formatYearMonth(end) : undefined;
}

export function buildResumeView(resume: Resume): ResumeView {
  const { basics } = resume;
  return {
    name: basics.name,
    label: basics.label,
    summary: basics.summary,
    summaryVerbose: basics.summaryVerbose,
    location: `${basics.location.city}, ${basics.location.region}, ${basics.location.country}`,
    contact: [
      ...(basics.email ? link('Email', `mailto:${basics.email}`) : []),
      ...basics.profiles.flatMap((profile) => link(profile.network, profile.url)),
    ],
    work: resume.work.map((job) => {
      const highlights = selectHighlights(job, 'concise');
      return {
        position: job.position,
        company: job.name,
        dates: formatRange(job.startDate, job.endDate),
        summary: job.summary,
        highlights,
        more: selectHighlights(job, 'verbose').slice(highlights.length),
        stack: job.stack ?? [],
      };
    }),
    projects: resume.projects.map((project) => {
      // Readable link text (screen readers, wrapping); the terminal keeps showing raw URLs.
      const [projectLink] = project.repo
        ? link(`Source code: ${project.name}`, project.repo)
        : project.url
          ? link(`Website: ${project.name}`, project.url)
          : [];
      return {
        name: project.name,
        description: project.description,
        descriptionVerbose: project.descriptionVerbose,
        highlights: project.highlights,
        stack: project.stack,
        link: projectLink,
      };
    }),
    skills: resume.skills.map((skill) => ({ name: skill.name, keywords: skill.keywords })),
    education: resume.education.map((entry) => ({
      title: `${entry.studyType}, ${entry.area}`,
      institution: entry.institution,
      dates: educationDates(entry.startDate, entry.endDate),
    })),
  };
}
