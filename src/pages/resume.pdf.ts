import { resume } from '../lib/resume/source';
import { renderResumePdf } from '../pdf/render';

export const prerender = true;

export async function GET(): Promise<Response> {
  const bytes = await renderResumePdf(resume);
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="resume.pdf"' },
  });
}
