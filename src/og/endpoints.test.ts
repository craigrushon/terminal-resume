import { describe, expect, it } from 'vitest';

// Lives outside src/pages (Astro would treat it as a route). Endpoints are loaded via a variable path so `astro check` passes before and after they exist.
const load = async (name: string): Promise<{ GET: () => Promise<Response> | Response }> => {
  const path = `../pages/${name}`;
  return import(/* @vite-ignore */ path);
};

describe('prerendered endpoints', () => {
  it('og.png serves image/png', async () => {
    const res = await (await load('og.png')).GET();
    expect(res.headers.get('Content-Type')).toBe('image/png');
  });

  it('robots.txt serves text/plain; charset=utf-8', async () => {
    const res = await (await load('robots.txt')).GET();
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });
});
