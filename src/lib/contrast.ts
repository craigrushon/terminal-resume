/** WCAG 2.x relative luminance of #rgb / #rrggbb (case-insensitive). Throws Error('Invalid hex colour: <input>'). */
export function relativeLuminance(hex: string): number {
  throw new Error(`not implemented: relativeLuminance(${hex})`);
}

/** (L1 + 0.05) / (L2 + 0.05), lighter over darker, unrounded. */
export function contrastRatio(a: string, b: string): number {
  throw new Error(`not implemented: contrastRatio(${a}, ${b})`);
}
