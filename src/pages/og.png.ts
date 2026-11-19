import { resume } from '../lib/resume/source';
import { renderOgImage } from '../og/render';

export const prerender = true;

export async function GET(): Promise<Response> {
  const png = await renderOgImage(resume);
  return new Response(png as unknown as BodyInit, { status: 200, headers: { 'Content-Type': 'image/png' } });
}
