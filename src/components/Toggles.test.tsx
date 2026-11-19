// @vitest-environment jsdom
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { PREFS_EVENT } from '../lib/effects';
import { Toggles, type TogglesProps } from './Toggles';

afterEach(() => {
  delete document.documentElement.dataset.view;
  delete document.documentElement.dataset.detail;
});

function setup(props: TogglesProps = {}) {
  const onEffect = vi.fn();
  const user = userEvent.setup();
  render(<Toggles onEffect={onEffect} {...props} />);
  const view = screen.getByRole('group', { name: 'View' });
  const detail = screen.getByRole('group', { name: 'Detail' });
  return { onEffect, user, view, detail };
}

describe('Toggles', () => {
  it('renders both groups with the initial choices checked', () => {
    const { view, detail } = setup({ initial: { view: 'resume', detail: 'verbose' } });
    expect(within(view).getByRole('radio', { name: 'Resume' })).toBeChecked();
    expect(within(view).getByRole('radio', { name: 'Terminal' })).not.toBeChecked();
    expect(within(detail).getByRole('radio', { name: 'Verbose' })).toBeChecked();
    expect(within(detail).getByRole('radio', { name: 'Concise' })).not.toBeChecked();
  });

  it('reads document dataset when no initial is given', () => {
    document.documentElement.dataset.view = 'resume';
    document.documentElement.dataset.detail = 'verbose';
    const { view, detail } = setup();
    expect(within(view).getByRole('radio', { name: 'Resume' })).toBeChecked();
    expect(within(detail).getByRole('radio', { name: 'Verbose' })).toBeChecked();
  });

  it('falls back to terminal and concise without initial or dataset', () => {
    const { view, detail } = setup();
    expect(within(view).getByRole('radio', { name: 'Terminal' })).toBeChecked();
    expect(within(detail).getByRole('radio', { name: 'Concise' })).toBeChecked();
  });

  it('emits set-view when Resume is chosen', async () => {
    const { onEffect, user, view } = setup({ initial: { view: 'terminal', detail: 'concise' } });
    await user.click(within(view).getByRole('radio', { name: 'Resume' }));
    expect(onEffect).toHaveBeenCalledTimes(1);
    expect(onEffect).toHaveBeenCalledWith({ type: 'set-view', view: 'resume' });
  });

  it('emits set-detail when Verbose is chosen', async () => {
    const { onEffect, user, detail } = setup({ initial: { view: 'terminal', detail: 'concise' } });
    await user.click(within(detail).getByRole('radio', { name: 'Verbose' }));
    expect(onEffect).toHaveBeenCalledTimes(1);
    expect(onEffect).toHaveBeenCalledWith({ type: 'set-detail', detail: 'verbose' });
  });

  it('checks Resume when a PREFS_EVENT announces it, without emitting', () => {
    const { onEffect, view } = setup({ initial: { view: 'terminal', detail: 'concise' } });
    act(() => {
      window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { view: 'resume' } }));
    });
    expect(within(view).getByRole('radio', { name: 'Resume' })).toBeChecked();
    expect(onEffect).not.toHaveBeenCalled();
  });

  it('selects with arrow keys inside a group and emits the effect', async () => {
    const { onEffect, user, detail } = setup({ initial: { view: 'terminal', detail: 'concise' } });
    within(detail).getByRole('radio', { name: 'Concise' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(within(detail).getByRole('radio', { name: 'Verbose' })).toBeChecked();
    expect(onEffect).toHaveBeenCalledWith({ type: 'set-detail', detail: 'verbose' });
  });
});

// Review of milestone 4: the server can't see <html data-*> prefs, so the first client render must match the
// server's defaults and sync afterwards; otherwise React reports a hydration mismatch.
describe('Toggles hydration', () => {
  it('hydrates server markup without a mismatch when <html> prefs differ from the defaults', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Toggles onEffect={vi.fn()} />); // no data-* yet: server defaults
    document.body.appendChild(container);
    document.documentElement.dataset.view = 'resume';
    document.documentElement.dataset.detail = 'verbose';
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable: unknown[] = [];
    let root: Root | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, <Toggles onEffect={vi.fn()} />, { onRecoverableError: (error) => recoverable.push(error) });
      });
      expect(consoleError).not.toHaveBeenCalled();
      expect(recoverable).toEqual([]);
      // ...and it still ends up showing the pre-paint prefs.
      expect(within(container).getByRole('radio', { name: 'Resume' })).toBeChecked();
      expect(within(container).getByRole('radio', { name: 'Verbose' })).toBeChecked();
    } finally {
      act(() => root?.unmount());
      container.remove();
      consoleError.mockRestore();
      delete document.documentElement.dataset.view;
      delete document.documentElement.dataset.detail;
    }
  });
});

describe('Toggles theme group', () => {
  const initial = { view: 'terminal', detail: 'concise' } as const;
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('renders a Theme group with Modern checked by default', () => {
    render(<Toggles onEffect={vi.fn()} initial={initial} />);
    const theme = screen.getByRole('group', { name: 'Theme' });
    expect(within(theme).getByRole('radio', { name: 'Modern' })).toBeChecked();
    expect(within(theme).getByRole('radio', { name: 'Classic' })).not.toBeChecked();
  });

  it('reads <html data-theme> after mount', () => {
    document.documentElement.dataset.theme = 'classic';
    render(<Toggles onEffect={vi.fn()} />);
    const theme = screen.getByRole('group', { name: 'Theme' });
    expect(within(theme).getByRole('radio', { name: 'Classic' })).toBeChecked();
  });

  it('emits set-theme when Classic is chosen', async () => {
    const onEffect = vi.fn();
    render(<Toggles onEffect={onEffect} initial={initial} />);
    await userEvent.setup().click(within(screen.getByRole('group', { name: 'Theme' })).getByRole('radio', { name: 'Classic' }));
    expect(onEffect.mock.calls).toEqual([[{ type: 'set-theme', theme: 'classic' }]]);
  });

  it('checks Classic when a PREFS_EVENT announces it, without emitting', () => {
    const onEffect = vi.fn();
    render(<Toggles onEffect={onEffect} initial={initial} />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { theme: 'classic' } }));
    });
    expect(within(screen.getByRole('group', { name: 'Theme' })).getByRole('radio', { name: 'Classic' })).toBeChecked();
    expect(onEffect).not.toHaveBeenCalled();
  });
});
