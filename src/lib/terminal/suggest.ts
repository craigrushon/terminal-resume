const MAX_DISTANCE = 2;

function levenshtein(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row.push(Math.min((previous[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (previous[j - 1] ?? 0) + cost));
    }
    previous = row;
  }
  return previous[b.length] ?? 0;
}

/** Closest known name within 2 edits (ties alphabetical); null for exact matches or nothing close. */
export function suggest(input: string, known: string[]): string | null {
  if (known.includes(input)) return null;
  const [best] = known
    .map((name) => ({ name, distance: levenshtein(input, name) }))
    .filter(({ distance }) => distance <= MAX_DISTANCE)
    .sort((x, y) => x.distance - y.distance || (x.name < y.name ? -1 : x.name > y.name ? 1 : 0));
  return best?.name ?? null;
}
