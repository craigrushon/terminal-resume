import type { Resume } from '../lib/resume/schema';

/** satori element tree: { type, props: { style?, children? } } */
export interface OgNode {
  type: string;
  props: { style?: Record<string, string | number>; children?: OgNode | string | Array<OgNode | string> };
}

export function ogCard(_resume: Resume): OgNode {
  throw new Error('not implemented');
}

export async function renderOgImage(_resume: Resume): Promise<Uint8Array> {
  throw new Error('not implemented');
}
