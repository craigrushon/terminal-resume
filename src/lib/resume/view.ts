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

export function buildResumeView(_resume: Resume): ResumeView {
  throw new Error('not implemented');
}
