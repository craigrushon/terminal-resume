// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { PREFS_EVENT } from '../lib/effects';
import { ViewTabs, type ViewTabsProps } from './ViewTabs';

afterEach(() => {
  delete document.documentElement.dataset.view;
});

function setup(props: ViewTabsProps = {}) {
  const onEffect = vi.fn();
  const user = userEvent.setup();
  render(<ViewTabs onEffect={onEffect} {...props} />);
  const terminal = screen.getByRole('tab', { name: 'Terminal' });
  const resume = screen.getByRole('tab', { name: 'Resume' });
  return { onEffect, user, terminal, resume };
}

describe('ViewTabs', () => {
  it('renders a labelled tablist with two wired tabs', () => {
    const { terminal, resume } = setup();
    expect(screen.getByRole('tablist', { name: 'View' })).toBeInTheDocument();
    expect(terminal).toHaveAttribute('id', 'tab-terminal');
    expect(terminal).toHaveAttribute('aria-controls', 'panel-terminal');
    expect(terminal).toHaveAttribute('type', 'button');
    expect(resume).toHaveAttribute('id', 'tab-resume');
    expect(resume).toHaveAttribute('aria-controls', 'panel-resume');
    expect(resume).toHaveAttribute('type', 'button');
  });

  it('marks the initial tab selected with roving tabindex', () => {
    const { terminal, resume } = setup({ initial: 'resume' });
    expect(resume).toHaveAttribute('aria-selected', 'true');
    expect(resume).toHaveAttribute('tabindex', '0');
    expect(terminal).toHaveAttribute('aria-selected', 'false');
    expect(terminal).toHaveAttribute('tabindex', '-1');
  });

  it('click emits set-view and moves selection', async () => {
    const { onEffect, user, terminal, resume } = setup({ initial: 'terminal' });
    await user.click(resume);
    expect(onEffect.mock.calls).toEqual([[{ type: 'set-view', view: 'resume' }]]);
    expect(resume).toHaveAttribute('aria-selected', 'true');
    expect(terminal).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking the selected tab emits nothing', async () => {
    const { onEffect, user, terminal } = setup({ initial: 'terminal' });
    await user.click(terminal);
    expect(onEffect).not.toHaveBeenCalled();
  });

  // Review: modifier + arrow is browser navigation (Alt+← back, Cmd+← on macOS); the tabs must not swallow it.
  it.each(['{Alt>}{ArrowRight}{/Alt}', '{Meta>}{ArrowLeft}{/Meta}', '{Control>}{ArrowRight}{/Control}'])(
    'ignores %s (no selection change, default not prevented)',
    async (keys) => {
      const { onEffect, user, terminal } = setup({ initial: 'terminal' });
      terminal.focus();
      const notPrevented: boolean[] = [];
      terminal.addEventListener('keydown', (event) => queueMicrotask(() => notPrevented.push(!event.defaultPrevented)));
      await user.keyboard(keys);
      expect(terminal).toHaveAttribute('aria-selected', 'true');
      expect(onEffect.mock.calls).toEqual([]);
      expect(notPrevented.filter((value) => value === false)).toEqual([]);
    },
  );

  it('ArrowRight from Terminal selects and focuses Resume', async () => {
    const { onEffect, user, terminal, resume } = setup({ initial: 'terminal' });
    terminal.focus();
    await user.keyboard('{ArrowRight}');
    expect(resume).toHaveAttribute('aria-selected', 'true');
    expect(resume).toHaveFocus();
    expect(onEffect.mock.calls).toEqual([[{ type: 'set-view', view: 'resume' }]]);
  });

  it('ArrowRight from Resume wraps to Terminal', async () => {
    const { onEffect, user, terminal, resume } = setup({ initial: 'resume' });
    resume.focus();
    await user.keyboard('{ArrowRight}');
    expect(terminal).toHaveAttribute('aria-selected', 'true');
    expect(terminal).toHaveFocus();
    expect(onEffect.mock.calls).toEqual([[{ type: 'set-view', view: 'terminal' }]]);
  });

  it.each([
    { key: '{Home}', from: 'resume', to: 'terminal' },
    { key: '{End}', from: 'terminal', to: 'resume' },
  ] as const)('$key from $from selects and focuses $to', async ({ key, from, to }) => {
    const { onEffect, user } = setup({ initial: from });
    const name = (v: string) => (v === 'terminal' ? 'Terminal' : 'Resume');
    screen.getByRole('tab', { name: name(from) }).focus();
    await user.keyboard(key);
    const target = screen.getByRole('tab', { name: name(to) });
    expect(target).toHaveAttribute('aria-selected', 'true');
    expect(target).toHaveFocus();
    expect(onEffect.mock.calls).toEqual([[{ type: 'set-view', view: to }]]);
  });

  it('selects Resume when a PREFS_EVENT announces it, without emitting', () => {
    const { onEffect, resume } = setup();
    act(() => {
      window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { view: 'resume' } }));
    });
    expect(resume).toHaveAttribute('aria-selected', 'true');
    expect(onEffect).not.toHaveBeenCalled();
  });
});

describe('ViewTabs hydration', () => {
  it('hydrates server markup without a mismatch and ends on the <html> view', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<ViewTabs onEffect={vi.fn()} />);
    document.body.appendChild(container);
    document.documentElement.dataset.view = 'resume';
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable: unknown[] = [];
    let root: Root | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, <ViewTabs onEffect={vi.fn()} />, { onRecoverableError: (error) => recoverable.push(error) });
      });
      expect(consoleError).not.toHaveBeenCalled();
      expect(recoverable).toEqual([]);
      expect(screen.getByRole('tab', { name: 'Resume' })).toHaveAttribute('aria-selected', 'true');
    } finally {
      act(() => root?.unmount());
      container.remove();
      consoleError.mockRestore();
    }
  });
});
