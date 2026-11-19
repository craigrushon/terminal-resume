import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { parseThemeColors } from './theme-css';

const FIXTURE = `
:root, [data-theme="modern"] { --bg: #111111; --fg: #eeeeee; --muted: #cccccc; --accent: #88aaff; --error: #ff8888; }
[data-theme="classic"] {
  --bg: #000000;
  --fg: #33ff33;
  --muted: #22cc22;
  --accent: #66ff66;
  --error: #ff6666;
}`;

describe('parseThemeColors', () => {
  it('reads every variable of both theme blocks', () => {
    expect(parseThemeColors(FIXTURE)).toEqual({
      modern: { bg: '#111111', fg: '#eeeeee', muted: '#cccccc', accent: '#88aaff', error: '#ff8888' },
      classic: { bg: '#000000', fg: '#33ff33', muted: '#22cc22', accent: '#66ff66', error: '#ff6666' },
    });
  });

  it('throws when a variable is missing', () => {
    expect(() => parseThemeColors(FIXTURE.replace('--error: #ff6666;', ''))).toThrow('Missing --error in classic theme');
  });
});

const themesCss = (): string => readFileSync(new URL('../styles/themes.css', import.meta.url), 'utf8');

describe('src/styles/themes.css', () => {
  it.each(['modern', 'classic'] as const)('%s meets 4.5:1 for every text/background pair', (theme) => {
    const c = parseThemeColors(themesCss())[theme];
    const pairs = [
      ['fg', 'bg'],
      ['muted', 'bg'],
      ['accent', 'bg'],
      ['error', 'bg'],
      ['bg', 'accent'], // text on an accent-filled checked toggle
    ] as const;
    const failing = pairs
      .filter(([a, b]) => contrastRatio(c[a], c[b]) < 4.5)
      .map(([a, b]) => `${a} ${c[a]} on ${b} ${c[b]}: ${contrastRatio(c[a], c[b]).toFixed(2)}`);
    expect(failing).toEqual([]);
  });
});
