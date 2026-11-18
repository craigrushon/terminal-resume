import example from '../../../content/resume.example.json';
import { parseResume, type Resume } from './schema';

// Real content (gitignored) wins over the fictional example when present. Spec §3.
const real = import.meta.glob<unknown>('../../../content/resume.json', { eager: true, import: 'default' });
const realContent = Object.values(real)[0];

/** True when the site is rendering the fictional example content. */
export const isExampleContent: boolean = realContent === undefined;

/** Validated resume content. Invalid content fails the build with the offending field named. */
export const resume: Resume = parseResume(realContent ?? example);
