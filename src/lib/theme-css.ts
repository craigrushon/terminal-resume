export type ThemeName = 'modern' | 'classic';
export type ThemeVar = 'bg' | 'fg' | 'muted' | 'accent' | 'error';
export type ThemeColors = Record<ThemeName, Record<ThemeVar, string>>;

/**
 * Finds each block by its `[data-theme="X"]` selector and reads `--name: #hex;` declarations.
 * Throws if a theme or variable is missing.
 */
export function parseThemeColors(css: string): ThemeColors {
  throw new Error(`not implemented: parseThemeColors(${css.length} chars)`);
}
