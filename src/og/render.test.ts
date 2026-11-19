import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseResume } from '../lib/resume/schema';
import { ogCard, renderOgImage } from './render';

const resume = parseResume(JSON.parse(readFileSync(new URL('../../content/resume.example.json', import.meta.url), 'utf8')));

describe('ogCard', () => {
  it('contains the name and label text', () => {
    const json = JSON.stringify(ogCard(resume));
    expect(json).toContain('Alex Example');
    expect(json).toContain('Senior Software Engineer');
  });
});

describe('renderOgImage', () => {
  it('returns a 1200x630 PNG', async () => {
    const png = await renderOgImage(resume);
    expect(Array.from(png.slice(0, 8))).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect(view.getUint32(16)).toBe(1200);
    expect(view.getUint32(20)).toBe(630);
  });
});
