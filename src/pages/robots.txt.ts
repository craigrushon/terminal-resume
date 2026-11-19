import { isExampleContent } from '../lib/resume/source';
import { SITE } from '../lib/site';
import { robotsTxt } from '../lib/seo';

export const prerender = true;


export function GET(): Response {
  return new Response(robotsTxt(SITE, { isExample: isExampleContent }), {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
