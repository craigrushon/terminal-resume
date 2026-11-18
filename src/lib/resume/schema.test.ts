import { describe, expect, it } from 'vitest';
import example from '../../../content/resume.example.json';
import { parseResume, ResumeSchema, type Resume } from './schema';

// Minimal valid resume used to probe individual rules.
const minimal: Resume = {
  basics: {
    name: 'Test Person',
    label: 'Engineer',
    summary: 'Builds things.',
    location: { city: 'Montréal', region: 'QC', country: 'CA' },
    profiles: [],
  },
  work: [],
  projects: [],
  skills: [],
  education: [],
};

describe('example content', () => {
  it('parses against the schema', () => {
    const resume = parseResume(example);
    expect(resume.basics.name).toBe('Alex Example');
    expect(resume.work).toHaveLength(3);
    expect(resume.projects).toHaveLength(2);
    expect(resume.skills).toHaveLength(4);
    expect(resume.education).toHaveLength(1);
  });

  it('has exactly one current role (no endDate), listed first', () => {
    const resume = parseResume(example);
    const current = resume.work.filter((w) => w.endDate === undefined);
    expect(current).toHaveLength(1);
    expect(resume.work[0]?.endDate).toBeUndefined();
  });
});

describe('schema rules', () => {
  it('accepts the minimal resume', () => {
    expect(ResumeSchema.safeParse(minimal).success).toBe(true);
  });

  // Privacy (spec §3): JSON Resume allows basics.phone / location.address; we deliberately do not.
  it.each([
    ['basics.phone', { ...minimal, basics: { ...minimal.basics, phone: '555-0100' } }, ['basics']],
    [
      'location.address',
      { ...minimal, basics: { ...minimal.basics, location: { ...minimal.basics.location, address: '1 Main St' } } },
      ['basics', 'location'],
    ],
    ['top-level salary', { ...minimal, salary: '200k' }, []],
  ])('rejects unknown/private field %s', (_label, input, path) => {
    const result = ResumeSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.code).toBe('unrecognized_keys');
    expect(result.error?.issues[0]?.path).toEqual(path);
  });

  it.each(['2021', '2021-1', '2021-13', '2021-00', '21-01', '2021-01-15'])('rejects date %s (must be YYYY-MM)', (date) => {
    const input = {
      ...minimal,
      work: [{ name: 'Co', position: 'Dev', startDate: date, summary: 's', highlights: [] }],
    };
    const result = ResumeSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['work', 0, 'startDate']);
  });

  it.each(['2021-01', '2021-12', '1999-07'])('accepts date %s', (date) => {
    const input = {
      ...minimal,
      work: [{ name: 'Co', position: 'Dev', startDate: date, summary: 's', highlights: [] }],
    };
    expect(ResumeSchema.safeParse(input).success).toBe(true);
  });

  it('rejects endDate before startDate', () => {
    const input = {
      ...minimal,
      work: [{ name: 'Co', position: 'Dev', startDate: '2022-05', endDate: '2022-04', summary: 's', highlights: [] }],
    };
    const result = ResumeSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['work', 0, 'endDate']);
  });

  it('rejects non-https profile URLs', () => {
    const input = {
      ...minimal,
      basics: { ...minimal.basics, profiles: [{ network: 'GitHub', username: 'x', url: 'http://github.com/x' }] },
    };
    const result = ResumeSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['basics', 'profiles', 0, 'url']);
  });

  it('parseResume throws a readable error naming the field', () => {
    expect(() => parseResume({ ...minimal, basics: { ...minimal.basics, name: '' } })).toThrow(
      'Invalid resume content: basics.name',
    );
  });
});
