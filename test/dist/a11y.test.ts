import { readFileSync } from 'node:fs';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

describe('dist/index.html accessibility (axe-core)', () => {
  it('has no violations (colour contrast excluded; covered by theme contrast test + Lighthouse)', async () => {
    const html = readFileSync(new URL('../../dist/index.html', import.meta.url), 'utf8');
    const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
    dom.window.eval(axe.source);
    const results = await (dom.window as any).axe.run(dom.window.document.documentElement, {
      rules: { 'color-contrast': { enabled: false } },
    });
    const summary = results.violations.map(
      (v: { id: string; nodes: { target: unknown[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
    );
    expect(summary, `axe violations:\n${summary.join('\n')}`).toEqual([]);
  });
});
