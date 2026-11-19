import { safeHref } from './terminal/href';
import type { Resume } from './resume/schema';

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogImageAlt: string;
  noindex: boolean;
}

export interface PersonJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  sameAs?: string[];
  address?: {
    '@type': 'PostalAddress';
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
  };
}

export interface SeoOptions {
  isExample: boolean;
}

const MAX_DESCRIPTION = 160;

function describe(summary: string): string {
  const text = summary.replace(/\s+/g, ' ').trim();
  if (text.length <= MAX_DESCRIPTION) return text;
  const cut = text.slice(0, MAX_DESCRIPTION - 1);
  const space = cut.lastIndexOf(' ');
  const head = space > 0 && text[MAX_DESCRIPTION - 1] !== ' ' ? cut.slice(0, space) : cut;
  return head.trimEnd() + '…';
}

export function pageMeta(resume: Resume, site: string | URL, opts: SeoOptions): PageMeta {
  const { name, label, summary } = resume.basics;
  return {
    title: name + ': ' + label,
    description: describe(summary),
    canonical: new URL('/', site).href,
    ogImage: new URL('/og.png', site).href,
    ogImageAlt: name + ', ' + label,
    noindex: opts.isExample,
  };
}

export function personJsonLd(resume: Resume, site: string | URL): PersonJsonLd {
  const { name, label, summary, location, profiles } = resume.basics;
  const sameAs = profiles.map((p) => safeHref(p.url)).filter((u): u is string => u !== null && u.startsWith('https://'));
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: label,
    description: summary,
    url: new URL('/', site).href,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.city,
      addressRegion: location.region,
      addressCountry: location.country,
    },
  };
}

const ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => ESCAPES[c] as string);
}

export function robotsTxt(site: string | URL, opts: SeoOptions): string {
  if (opts.isExample) return 'User-agent: *\nDisallow: /\n';
  return 'User-agent: *\nAllow: /\nSitemap: ' + new URL('/sitemap-index.xml', site).href + '\n';
}
