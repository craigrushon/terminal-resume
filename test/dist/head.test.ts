import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { parseResume } from '../../src/lib/resume/schema';
import { pageMeta } from '../../src/lib/seo';
import { SITE } from '../../src/lib/site';

const root = (p: string): URL => new URL(`../../${p}`, import.meta.url);
const dist = (p: string): URL => root(`dist/${p}`);

if (!existsSync(dist('index.html'))) {
  throw new Error('Run `pnpm build` before `pnpm test:dist`');
}

// Same selection logic as src/lib/resume/source.ts (which relies on import.meta.glob):
// real content/resume.json wins over the example.
const isExample = !existsSync(root('content/resume.json'));
const resume = parseResume(JSON.parse(readFileSync(root(isExample ? 'content/resume.example.json' : 'content/resume.json'), 'utf8')));
const expected = pageMeta(resume, SITE, { isExample });
const TITLE = expected.title;
const DESC = expected.description;
const NAME = resume.basics.name;
const OG_ALT = expected.ogImageAlt;

const html = readFileSync(dist('index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const attr = (sel: string, name: string): string | null | undefined => doc.querySelector(sel)?.getAttribute(name);
const meta = (key: string, value: string): string | null | undefined =>
  attr(`meta[${key}="${value}"]`, 'content');

describe('dist/index.html head', () => {
  it('has title, description and canonical', () => {
    expect(doc.title).toBe(TITLE);
    expect(meta('name', 'description')).toBe(DESC);
    expect(attr('link[rel="canonical"]', 'href')).toBe(`${SITE}/`);
  });

  it(isExample ? 'is noindex (example content)' : 'is not noindex (real content)', () => {
    if (isExample) expect(meta('name', 'robots')).toBe('noindex');
    else expect(doc.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('has Open Graph tags', () => {
    expect(meta('property', 'og:type')).toBe('website');
    expect(meta('property', 'og:site_name')).toBe(NAME);
    expect(meta('property', 'og:title')).toBe(TITLE);
    expect(meta('property', 'og:description')).toBe(DESC);
    expect(meta('property', 'og:url')).toBe(`${SITE}/`);
    expect(meta('property', 'og:image')).toBe(`${SITE}/og.png`);
    expect(meta('property', 'og:image:type')).toBe('image/png');
    expect(meta('property', 'og:image:width')).toBe('1200');
    expect(meta('property', 'og:image:height')).toBe('630');
    expect(meta('property', 'og:image:alt')).toBe(OG_ALT);
  });

  it('has Twitter card tags, theme-color and favicon', () => {
    expect(meta('name', 'twitter:card')).toBe('summary_large_image');
    expect(meta('name', 'twitter:title')).toBe(TITLE);
    expect(meta('name', 'twitter:description')).toBe(DESC);
    expect(meta('name', 'twitter:image')).toBe(`${SITE}/og.png`);
    expect(meta('name', 'twitter:image:alt')).toBe(OG_ALT);
    expect(meta('name', 'theme-color')).toBeTruthy();
    expect(attr('link[rel="icon"]', 'href')).toBe('/favicon.svg');
  });

  it('has exactly one parseable Person JSON-LD block without email', () => {
    const blocks = doc.querySelectorAll('script[type="application/ld+json"]');
    expect(blocks).toHaveLength(1);
    const data = JSON.parse(blocks[0]!.textContent ?? '');
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe(NAME);
    expect(data).not.toHaveProperty('email');
    if (resume.basics.email) expect(blocks[0]!.textContent).not.toContain(resume.basics.email);
  });
});

describe('dist files', () => {
  it('robots.txt matches the content mode', () => {
    const expectedBody = isExample
      ? 'User-agent: *\nDisallow: /\n'
      : `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap-index.xml\n`;
    expect(readFileSync(dist('robots.txt'), 'utf8')).toBe(expectedBody);
  });

  it('og.png is a 1200x630 PNG', () => {
    const png = readFileSync(dist('og.png'));
    expect(Array.from(png.subarray(0, 8))).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });

  it('favicon.svg exists', () => {
    expect(existsSync(dist('favicon.svg'))).toBe(true);
  });
});
