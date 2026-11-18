import type { Parsed } from './types';

const VERBOSE_FLAGS: readonly string[] = ['-v', '--verbose'];

/** Split on whitespace; double quotes group words; an unterminated quote runs to the end. */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inToken = false;
  let inQuote = false;
  for (const ch of input) {
    if (ch === '"') {
      inQuote = !inQuote;
      inToken = true;
    } else if (!inQuote && /\s/.test(ch)) {
      if (inToken) tokens.push(current);
      current = '';
      inToken = false;
    } else {
      current += ch;
      inToken = true;
    }
  }
  if (inToken) tokens.push(current);
  return tokens;
}

export function parse(input: string): Parsed {
  const [first = '', ...rest] = tokenize(input);
  return {
    cmd: first.toLowerCase(),
    args: rest.filter((token) => !VERBOSE_FLAGS.includes(token)),
    verbose: rest.some((token) => VERBOSE_FLAGS.includes(token)),
  };
}
