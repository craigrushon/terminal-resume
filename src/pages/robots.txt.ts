import { isExampleContent } from '../lib/resume/source';
import { robotsTxt } from '../lib/seo';

export const prerender = true;

const SITE = 'https://craigrushon.com'; // keep in sync with `site` in astro.config.mjs

export function GET(): Response {
  return new Response(robotsTxt(SITE, { isExample: isExampleContent }), {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
