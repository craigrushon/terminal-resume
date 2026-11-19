// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PREFS_EVENT } from '../lib/effects';
import type { View } from '../lib/terminal/types';
import { usePref } from './usePref';

function Probe({ initial }: { initial?: View }): React.JSX.Element {
  return <output>{usePref('view', 'terminal', initial)}</output>;
}

afterEach(() => {
  delete document.documentElement.dataset.view;
  vi.restoreAllMocks();
});

describe('usePref', () => {
  it('first render ignores <html> and returns the fallback (server-equal)', () => {
    document.documentElement.dataset.view = 'resume';
    expect(renderToString(<Probe />)).toBe('<output>terminal</output>');
  });

  it('reads <html data-view> after mount', () => {
    document.documentElement.dataset.view = 'resume';
    render(<Probe />);
    expect(screen.getByRole('status')).toHaveTextContent('resume');
  });

  it('initial pins the value and skips the <html> read', () => {
    document.documentElement.dataset.view = 'resume';
    render(<Probe initial="terminal" />);
    expect(screen.getByRole('status')).toHaveTextContent('terminal');
  });

  it('updates from PREFS_EVENT', () => {
    render(<Probe />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { view: 'resume' } }));
    });
    expect(screen.getByRole('status')).toHaveTextContent('resume');
  });

  it('stops listening after unmount: no throw, no console.error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<Probe />);
    unmount();
    expect(() => window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { view: 'resume' } }))).not.toThrow();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
