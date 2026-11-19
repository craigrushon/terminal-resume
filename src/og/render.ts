import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { Resume } from '../lib/resume/schema';

/** satori element tree: { type, props: { style?, children? } } */
export interface OgNode {
  type: string;
  props: { style?: Record<string, string | number>; children?: OgNode | string | Array<OgNode | string> };
}

// Modern theme palette (src/styles/themes.css)
const BG = '#1e1e2e';
const FG = '#cdd6f4';
const MUTED = '#a6adc8';
const ACCENT = '#89b4fa';

const el = (type: string, style: Record<string, string | number>, children?: OgNode['props']['children']): OgNode => ({
  type,
  props: children === undefined ? { style } : { style, children },
});

const dot = (color: string): OgNode => el('div', { width: 20, height: 20, borderRadius: 10, backgroundColor: color, marginRight: 12 });

export function ogCard(resume: Resume): OgNode {
  const { name, label } = resume.basics;
  const host = resume.basics.url ? new URL(resume.basics.url).host : 'craigrushon.com';
  return el(
    'div',
    { display: 'flex', flexDirection: 'column', width: 1200, height: 630, backgroundColor: BG, color: FG, fontFamily: 'JetBrains Mono', padding: 60 },
    [
      el('div', { display: 'flex', alignItems: 'center' }, [dot('#f38ba8'), dot('#f9e2af'), dot('#a6e3a1')]),
      el('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }, [
        el('div', { display: 'flex', fontSize: 32, color: MUTED, marginBottom: 24 }, [
          el('span', { color: ACCENT }, 'visitor@craigrushon:~$'),
          el('span', { marginLeft: 16 }, 'whoami'),
        ]),
        el('div', { display: 'flex', fontSize: 84, fontWeight: 700, color: FG }, name),
        el('div', { display: 'flex', fontSize: 40, color: ACCENT, marginTop: 16 }, label),
      ]),
      el('div', { display: 'flex', fontSize: 28, color: MUTED }, host),
    ],
  );
}

function font(weight: 400 | 700): Buffer {
  const pkg = createRequire(import.meta.url).resolve('@fontsource/jetbrains-mono/package.json');
  return readFileSync(join(dirname(pkg), 'files', `jetbrains-mono-latin-${weight}-normal.woff`));
}

export async function renderOgImage(resume: Resume): Promise<Uint8Array> {
  const svg = await satori(ogCard(resume) as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'JetBrains Mono', data: font(400), weight: 400, style: 'normal' },
      { name: 'JetBrains Mono', data: font(700), weight: 700, style: 'normal' },
    ],
  });
  return new Uint8Array(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
