import { renderToBuffer } from '@react-pdf/renderer';
import type { Resume } from '../lib/resume/schema';
import { ResumeDocument } from './ResumeDocument';

export async function renderResumePdf(resume: Resume): Promise<Uint8Array> {
  const buffer = await renderToBuffer(ResumeDocument({ resume }));
  return new Uint8Array(buffer);
}
