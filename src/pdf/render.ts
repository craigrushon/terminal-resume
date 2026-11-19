import type { Resume } from '../lib/resume/schema';

export async function renderResumePdf(resume: Resume): Promise<Uint8Array> {
  throw new Error(`not implemented: renderResumePdf(${resume.basics.name})`);
}
