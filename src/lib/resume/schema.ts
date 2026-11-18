import { z } from 'zod';

/**
 * Resume content schema: a strict subset of JSON Resume (jsonresume.org) plus optional
 * `*Verbose` fields. Strict objects reject unknown keys so private data (phone, address,
 * salary, notes) can't slip onto the public site through an extra field. See docs/spec.md §3-4.
 */

/** `YYYY-MM`, month 01-12. */
export const YearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected a date in YYYY-MM format');

const HttpsUrl = z.url({ protocol: /^https$/, error: 'Expected an https:// URL' });
const NonEmpty = z.string().trim().min(1);

const Profile = z.strictObject({
  network: NonEmpty,
  username: NonEmpty,
  url: HttpsUrl,
});

const Location = z.strictObject({
  city: NonEmpty,
  region: NonEmpty,
  country: NonEmpty,
});

const Basics = z.strictObject({
  name: NonEmpty,
  label: NonEmpty,
  summary: NonEmpty,
  summaryVerbose: NonEmpty.optional(),
  location: Location,
  email: z.email().optional(),
  url: HttpsUrl.optional(),
  profiles: z.array(Profile),
});

/** Shared start/end date rule: endDate (if present) must not be before startDate. */
function withDateOrder<T extends z.ZodObject>(schema: T) {
  return schema.superRefine((value, ctx) => {
    const { startDate, endDate } = value as { startDate?: string; endDate?: string };
    // YYYY-MM strings compare correctly as strings.
    if (startDate && endDate && endDate < startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'endDate is before startDate' });
    }
  });
}

const Work = withDateOrder(
  z.strictObject({
    name: NonEmpty,
    position: NonEmpty,
    url: HttpsUrl.optional(),
    startDate: YearMonth,
    endDate: YearMonth.optional(),
    summary: NonEmpty,
    highlights: z.array(NonEmpty),
    highlightsVerbose: z.array(NonEmpty).optional(),
    stack: z.array(NonEmpty).optional(),
  }),
);

const Project = z.strictObject({
  name: NonEmpty,
  description: NonEmpty,
  descriptionVerbose: NonEmpty.optional(),
  url: HttpsUrl.optional(),
  repo: HttpsUrl.optional(),
  highlights: z.array(NonEmpty),
  stack: z.array(NonEmpty),
});

const Skill = z.strictObject({
  name: NonEmpty,
  keywords: z.array(NonEmpty),
});

const Education = withDateOrder(
  z.strictObject({
    institution: NonEmpty,
    area: NonEmpty,
    studyType: NonEmpty,
    startDate: YearMonth.optional(),
    endDate: YearMonth.optional(),
  }),
);

export const ResumeSchema = z.strictObject({
  basics: Basics,
  work: z.array(Work),
  projects: z.array(Project),
  skills: z.array(Skill),
  education: z.array(Education),
});

export type Resume = z.infer<typeof ResumeSchema>;
export type WorkItem = Resume['work'][number];
export type ProjectItem = Resume['projects'][number];

/** Parse unknown content, throwing an error that names the first offending field. */
export function parseResume(input: unknown): Resume {
  const result = ResumeSchema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join('.') || '(root)';
    throw new Error(`Invalid resume content: ${path}: ${issue?.message ?? 'unknown error'}`);
  }
  return result.data;
}
