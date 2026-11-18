import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isExampleContent, resume } from './source';

const hasRealContent = existsSync(new URL('../../../content/resume.json', import.meta.url));

describe('resume source', () => {
  it.runIf(!hasRealContent)('falls back to the example content when content/resume.json is absent', () => {
    expect(isExampleContent).toBe(true);
    expect(resume.basics.name).toBe('Alex Example');
  });

  it.runIf(hasRealContent)('uses content/resume.json when present', () => {
    expect(isExampleContent).toBe(false);
    expect(resume.basics.name).not.toBe('Alex Example');
  });
});
