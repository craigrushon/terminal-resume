export type ThemeName = 'modern' | 'classic';
export type ThemeVar = 'bg' | 'fg' | 'muted' | 'accent' | 'error';
export type ThemeColors = Record<ThemeName, Record<ThemeVar, string>>;

const THEMES: ThemeName[] = ['modern', 'classic'];
const VARS: ThemeVar[] = ['bg', 'fg', 'muted', 'accent', 'error'];

/** The declarations inside the `{ ... }` that follows a selector containing `[data-theme="name"]`. */
function blockOf(css: string, theme: ThemeName): string {
  const start = css.indexOf(`[data-theme="${theme}"]`);
  const open = start === -1 ? -1 : css.indexOf('{', start);
  const close = open === -1 ? -1 : css.indexOf('}', open);
  if (close === -1) throw new Error(`Missing ${theme} theme`);
  return css.slice(open + 1, close);
}

/**
 * Finds each block by its `[data-theme="X"]` selector and reads `--name: #hex;` declarations.
 * Throws if a theme or variable is missing.
 */
export function parseThemeColors(css: string): ThemeColors {
  const result = { modern: {}, classic: {} } as ThemeColors;
  for (const theme of THEMES) {
    const block = blockOf(css, theme);
    for (const name of VARS) {
      const value = new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(block)?.[1];
      if (!value) throw new Error(`Missing --${name} in ${theme} theme`);
      result[theme][name] = value;
    }
  }
  return result;
}
