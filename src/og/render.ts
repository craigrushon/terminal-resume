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

export interface OgFontFile {
  weight: 400 | 700;
  subset: 'latin' | 'latin-ext';
  file: string;
}

export const OG_FONT_FILES: readonly OgFontFile[] = [400, 700].flatMap((weight) =>
  (['latin', 'latin-ext'] as const).map((subset) => ({
    weight: weight as 400 | 700,
    subset,
    file: `jetbrains-mono-${subset}-${weight}-normal.woff`,
  })),
);

// The package's `exports` map doesn't expose package.json, so resolve the (exported) main entry and use its directory.
function fontsDir(): string {
  const entry = createRequire(join(process.cwd(), 'noop.js')).resolve('@fontsource/jetbrains-mono');
  return join(dirname(entry), 'files');
}

function loadFonts() {
  const dir = fontsDir();
  return OG_FONT_FILES.map((f) => ({
    name: 'JetBrains Mono',
    data: readFileSync(join(dir, f.file)),
    weight: f.weight,
    style: 'normal' as const,
  }));
}

export async function renderOgImage(resume: Resume): Promise<Uint8Array> {
  const svg = await satori(ogCard(resume) as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: loadFonts(),
  });
  return new Uint8Array(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
