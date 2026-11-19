import { PDF_HREF } from './values';

// Conservative address check: no whitespace, no query/fragment, one @, a dot in the domain.
const MAILTO_ADDRESS = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/;

/**
 * Allow-list for every href the terminal emits (links and open-url effects).
 * Defence in depth: content is already validated (https-only) by the resume schema, but
 * the React island renders these hrefs directly, so the terminal never trusts them blindly.
 * Returns the href unchanged when allowed, otherwise null.
 */
export function safeHref(href: string): string | null {
  if (href === PDF_HREF) return href;
  if (href.startsWith('mailto:')) return MAILTO_ADDRESS.test(href.slice('mailto:'.length)) ? href : null;
  if (!href.startsWith('https://')) return null;
  try {
    const url = new URL(href);
    return url.protocol === 'https:' && url.hostname !== '' ? href : null;
  } catch {
    return null;
  }
}
