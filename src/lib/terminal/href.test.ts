import { describe, expect, it } from 'vitest';
import { safeHref } from './href';

describe('safeHref', () => {
  it.each([
    ['https://github.com/alex-example', 'https://github.com/alex-example'],
    ['https://www.linkedin.com/in/alex-example', 'https://www.linkedin.com/in/alex-example'],
    ['mailto:alex@example.com', 'mailto:alex@example.com'],
    ['/resume.pdf', '/resume.pdf'],
  ])('allows %s', (input, expected) => {
    expect(safeHref(input)).toBe(expected);
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'http://github.com/alex-example',
    '//evil.example.com',
    '/other.pdf',
    'mailto:alex@example.com?subject=x',
    'mailto:not-an-email',
    'https://',
    '',
  ])('blocks %j', (input) => {
    expect(safeHref(input)).toBeNull();
  });
});
