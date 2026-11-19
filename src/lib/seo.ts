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

export function pageMeta(_resume: Resume, _site: string | URL, _opts: SeoOptions): PageMeta {
  throw new Error('not implemented');
}

export function personJsonLd(_resume: Resume, _site: string | URL): PersonJsonLd {
  throw new Error('not implemented');
}

export function serializeJsonLd(_data: unknown): string {
  throw new Error('not implemented');
}

export function robotsTxt(_site: string | URL, _opts: SeoOptions): string {
  throw new Error('not implemented');
}
