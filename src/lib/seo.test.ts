import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseResume, type Resume } from './resume/schema';
import { pageMeta, personJsonLd, robotsTxt, serializeJsonLd } from './seo';

const resume = parseResume(JSON.parse(readFileSync(new URL('../../content/resume.example.json', import.meta.url), 'utf8')));
const SITE = 'https://craigrushon.com';
const withSummary = (summary: string): Resume => ({ ...resume, basics: { ...resume.basics, summary } });

describe('pageMeta', () => {
  const meta = () => pageMeta(resume, SITE, { isExample: true });

  it('builds the title from name and label', () => {
    expect(meta().title).toBe('Alex Example: Senior Software Engineer');
  });

  it('passes a short summary through as the description', () => {
    expect(meta().description).toBe(resume.basics.summary);
  });

  it('truncates a long summary at a word boundary with an ellipsis, max 160 chars', () => {
    const long = Array.from({ length: 60 }, (_, i) => `word${i}`).join(' ');
    const { description } = pageMeta(withSummary(long), SITE, { isExample: false });
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description.endsWith('…')).toBe(true);
    const body = description.slice(0, -1);
    expect(long.startsWith(body)).toBe(true);
    expect(long[body.length]).toBe(' ');
  });

  it('collapses whitespace in the description', () => {
    const { description } = pageMeta(withSummary('  Builds \n\t  things   well. '), SITE, { isExample: false });
    expect(description).toBe('Builds things well.');
  });

  it('makes canonical and og image absolute', () => {
    expect(meta().canonical).toBe('https://craigrushon.com/');
    expect(meta().ogImage).toBe('https://craigrushon.com/og.png');
  });

  it('describes the og image', () => {
    expect(meta().ogImageAlt).toBe('Alex Example, Senior Software Engineer');
  });

  it('sets noindex from isExample', () => {
    expect(meta().noindex).toBe(true);
    expect(pageMeta(resume, SITE, { isExample: false }).noindex).toBe(false);
  });
});

describe('personJsonLd', () => {
  const ld = () => personJsonLd(resume, SITE);

  it('is a schema.org Person with name, job title, description and url', () => {
    expect(ld()['@context']).toBe('https://schema.org');
    expect(ld()['@type']).toBe('Person');
    expect(ld().name).toBe('Alex Example');
    expect(ld().jobTitle).toBe('Senior Software Engineer');
    expect(ld().description).toBe(resume.basics.summary);
    expect(ld().url).toBe('https://craigrushon.com/');
  });

  it('lists profile URLs as sameAs', () => {
    expect(ld().sameAs).toEqual(['https://github.com/alex-example', 'https://www.linkedin.com/in/alex-example']);
  });

  it('drops unsafe or non-https profile URLs and omits an empty sameAs', () => {
    const profiles = [{ network: 'X', username: 'x', url: 'http://insecure.example/x' }];
    const bad = { ...resume, basics: { ...resume.basics, profiles } } as Resume;
    expect('sameAs' in personJsonLd(bad, SITE)).toBe(false);
    const mixed = { ...resume, basics: { ...resume.basics, profiles: [...profiles, ...resume.basics.profiles.slice(0, 1)] } } as Resume;
    expect(personJsonLd(mixed, SITE).sameAs).toEqual(['https://github.com/alex-example']);
  });

  it('includes a PostalAddress from location', () => {
    expect(ld().address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Montréal', addressRegion: 'QC', addressCountry: 'CA' });
  });

  it('never includes email or telephone', () => {
    expect(resume.basics.email).toBeTruthy();
    const json = JSON.stringify(ld());
    expect(json).not.toContain('alex@example.com');
    expect(ld()).not.toHaveProperty('email');
    expect(ld()).not.toHaveProperty('telephone');
  });
});

describe('serializeJsonLd', () => {
  it('escapes script-closing and other unsafe characters', () => {
    const out = serializeJsonLd({ a: '</script><b>&amp;' });
    expect(out).not.toMatch(/[<>&]/);
    expect(out).toContain('\\u003c/script\\u003e');
  });

  it('escapes U+2028 and U+2029', () => {
    const out = serializeJsonLd({ a: 'x\u2028y\u2029z' });
    expect(out).not.toContain('\u2028');
    expect(out).not.toContain('\u2029');
    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
  });

  it('round-trips through JSON.parse', () => {
    const data = { a: '</script> & <b> \u2028 \u2029', n: [1, { k: 'v' }] };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});

describe('robotsTxt', () => {
  it('disallows everything for example content, with no sitemap', () => {
    expect(robotsTxt(SITE, { isExample: true })).toBe('User-agent: *\nDisallow: /\n');
  });

  it('allows and points at the sitemap index for real content', () => {
    expect(robotsTxt(SITE, { isExample: false })).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://craigrushon.com/sitemap-index.xml\n',
    );
  });
});
