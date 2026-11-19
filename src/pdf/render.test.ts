import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractText, getDocumentProxy } from 'unpdf';
import { parseResume } from '../lib/resume/schema';
import { GET } from '../pages/resume.pdf';
import { renderResumePdf } from './render';

const resume = parseResume(JSON.parse(readFileSync(new URL('../../content/resume.example.json', import.meta.url), 'utf8')));
const ascii = (bytes: Uint8Array): string => new TextDecoder('latin1').decode(bytes.slice(0, 5));

async function textOf(bytes: Uint8Array): Promise<string> {
  const { text } = await extractText(await getDocumentProxy(new Uint8Array(bytes)), { mergePages: true });
  return text;
}

describe('renderResumePdf', () => {
  it('produces a PDF', async () => {
    expect(ascii(await renderResumePdf(resume))).toBe('%PDF-');
  });

  it('contains name, label, every company and the four section headings', async () => {
    const text = await textOf(await renderResumePdf(resume));
    const expected = [
      resume.basics.name,
      resume.basics.label,
      ...resume.work.map((job) => job.name),
      'Experience',
      'Projects',
      'Skills',
      'Education',
    ];
    expect(expected.filter((s) => !text.includes(s))).toEqual([]);
  });

  it('is concise only: verbose highlights are absent', async () => {
    const text = await textOf(await renderResumePdf(resume));
    const verbose = ['dead-letter', 'Mentored three engineers', 'weekly triage'];
    expect(verbose.filter((s) => text.includes(s))).toEqual([]);
  });

  it('sets the document title to "<name>: Resume"', async () => {
    const proxy = await getDocumentProxy(new Uint8Array(await renderResumePdf(resume)));
    const { info } = await proxy.getMetadata();
    expect((info as { Title?: string }).Title).toBe('Alex Example: Resume');
  });
});

describe('GET /resume.pdf', () => {
  it('serves the PDF inline with the right headers', async () => {
    const response = await GET();
    expect([response.status, response.headers.get('Content-Type'), response.headers.get('Content-Disposition')]).toEqual([
      200,
      'application/pdf',
      'inline; filename="resume.pdf"',
    ]);
    expect(ascii(new Uint8Array(await response.arrayBuffer()))).toBe('%PDF-');
  });
});
