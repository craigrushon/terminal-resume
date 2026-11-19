import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';

const dist = (p: string): URL => new URL(`../../dist/${p}`, import.meta.url);
const html = readFileSync(dist('index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const attr = (sel: string, name: string): string | null | undefined => doc.querySelector(sel)?.getAttribute(name);
const meta = (key: string, value: string): string | null | undefined =>
  attr(`meta[${key}="${value}"]`, 'content');

const SITE = 'https://craigrushon.com';
const TITLE = 'Alex Example: Senior Software Engineer';
const DESC = 'Backend-leaning full-stack engineer who builds reliable product systems and AI-assisted developer tooling.';

describe('dist/index.html head', () => {
  it('has title, description, canonical and noindex (example content)', () => {
    expect(doc.title).toBe(TITLE);
    expect(meta('name', 'description')).toBe(DESC);
    expect(attr('link[rel="canonical"]', 'href')).toBe(`${SITE}/`);
    expect(meta('name', 'robots')).toBe('noindex');
  });

  it('has Open Graph tags', () => {
    expect(meta('property', 'og:type')).toBe('website');
    expect(meta('property', 'og:site_name')).toBe('Alex Example');
    expect(meta('property', 'og:title')).toBe(TITLE);
    expect(meta('property', 'og:description')).toBe(DESC);
    expect(meta('property', 'og:url')).toBe(`${SITE}/`);
    expect(meta('property', 'og:image')).toBe(`${SITE}/og.png`);
    expect(meta('property', 'og:image:width')).toBe('1200');
    expect(meta('property', 'og:image:height')).toBe('630');
    expect(meta('property', 'og:image:alt')).toBe('Alex Example, Senior Software Engineer');
  });

  it('has Twitter card tags, theme-color and favicon', () => {
    expect(meta('name', 'twitter:card')).toBe('summary_large_image');
    expect(meta('name', 'twitter:title')).toBe(TITLE);
    expect(meta('name', 'twitter:description')).toBe(DESC);
    expect(meta('name', 'twitter:image')).toBe(`${SITE}/og.png`);
    expect(meta('name', 'theme-color')).toBeTruthy();
    expect(attr('link[rel="icon"]', 'href')).toBe('/favicon.svg');
  });

  it('has exactly one parseable Person JSON-LD block without email', () => {
    const blocks = doc.querySelectorAll('script[type="application/ld+json"]');
    expect(blocks).toHaveLength(1);
    const data = JSON.parse(blocks[0]!.textContent ?? '');
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('Alex Example');
    expect(data).not.toHaveProperty('email');
    expect(blocks[0]!.textContent).not.toContain('alex@example.com');
  });
});

describe('dist files', () => {
  it('robots.txt disallows everything for example content', () => {
    expect(readFileSync(dist('robots.txt'), 'utf8')).toContain('Disallow: /');
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
