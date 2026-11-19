// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import example from '../../content/resume.example.json';
import { parseResume } from '../lib/resume/schema';
import { PREFS_EVENT } from '../lib/effects';
import { COMMANDS } from '../lib/terminal/commands';
import { CHIPS, Terminal } from './Terminal';
import type { TerminalState } from '../lib/terminal/types';

const resume = parseResume(example);
const PROMPT = 'visitor@craigrushon:~$';
const SUMMARY =
  'Backend-leaning full-stack engineer who builds reliable product systems and AI-assisted developer tooling.';
const SUMMARY_VERBOSE =
  'Backend-leaning full-stack engineer with a decade of shipping product systems: payments, internal tools and data pipelines. Lately focused on AI-assisted developer workflows, where an orchestrator hands real tickets to specialised agents with human approval gates, measured cost and test-first guardrails.';

/**
 * Layout contract: the log holds welcome lines, echo lines (ONE element each, text `${prompt} ${input}`)
 * and output blocks. The live prompt + input sit OUTSIDE the log.
 */
function setup(initialState?: Partial<TerminalState>) {
  const onEffect = vi.fn();
  const user = userEvent.setup();
  render(<Terminal resume={resume} initialState={initialState} onEffect={onEffect} />);
  const input = screen.getByRole('textbox', { name: 'Terminal command' });
  const log = screen.getByRole('log', { name: 'Terminal output' });
  const run = async (command: string) => {
    await user.type(input, `${command}{Enter}`);
  };
  return { onEffect, user, input, log, run };
}

describe('Terminal', () => {
  it('renders a polite log region', () => {
    const { log } = setup();
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('prints the welcome lines on mount', () => {
    const { log } = setup();
    expect(within(log).getByText('Alex Example: Senior Software Engineer')).toBeInTheDocument();
    expect(within(log).getByText("Type 'help' to see commands, or try: cat experience")).toBeInTheDocument();
  });

  it('labels the input and turns off browser assists', () => {
    const { input } = setup();
    expect(screen.getByLabelText('Terminal command')).toBe(input);
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('autocapitalize', 'off');
    expect(input).toHaveAttribute('spellcheck', 'false');
  });

  it('shows a prompt that follows the working directory', async () => {
    const { run } = setup();
    expect(screen.getByText(PROMPT)).toBeInTheDocument();
    await run('cd resume');
    expect(screen.getByText('visitor@craigrushon:~/resume$')).toBeInTheDocument();
  });

  it('echoes the command and renders text blocks as paragraphs', async () => {
    const { log, run } = setup();
    await run('whoami');
    expect(within(log).getByText(`${PROMPT} whoami`)).toBeInTheDocument();
    expect(within(log).getByText(SUMMARY).tagName).toBe('P');
  });

  it('renders heading blocks as h3 and list blocks as ul/li', async () => {
    const { log, run } = setup();
    await run('cat experience');
    expect(
      within(log).getByRole('heading', {
        level: 3,
        name: 'Senior Software Engineer @ Example Payments Co. (Mar 2022 – Present)',
      }),
    ).toBeInTheDocument();
    const [firstList] = within(log).getAllByRole('list');
    const items = within(firstList as HTMLElement).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveTextContent('Led the migration of money values from floats to integer cents across 40 endpoints');
  });

  it('renders link blocks as safe new-tab anchors', async () => {
    const { log, run } = setup();
    await run('open linkedin');
    const link = within(log).getByRole('link', { name: 'https://www.linkedin.com/in/alex-example' });
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/alex-example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders error blocks as paragraphs with the error class', async () => {
    const { log, run } = setup();
    await run('foo');
    const error = within(log).getByText("command not found: foo. Try 'help'.");
    expect(error.tagName).toBe('P');
    expect(error).toHaveClass('error');
  });

  it('clears the input after Enter', async () => {
    const { input, run } = setup();
    await run('pwd');
    expect(input).toHaveValue('');
  });

  it('passes effects to onEffect in order', async () => {
    const { onEffect, run } = setup();
    await run('theme classic');
    await run('verbose');
    expect(onEffect).toHaveBeenCalledTimes(2);
    expect(onEffect).toHaveBeenNthCalledWith(1, { type: 'set-theme', theme: 'classic' });
    expect(onEffect).toHaveBeenNthCalledWith(2, { type: 'set-detail', detail: 'verbose' });
  });

  it('clear empties the log and still reports the effect', async () => {
    const { log, onEffect, run } = setup();
    await run('pwd');
    await run('clear');
    expect(log).toBeEmptyDOMElement();
    expect(onEffect).toHaveBeenCalledWith({ type: 'clear' });
  });

  it('Ctrl+L empties the log, welcome included', async () => {
    const { log, user, input } = setup();
    await user.click(input);
    await user.keyboard('{Control>}l{/Control}');
    expect(log).toBeEmptyDOMElement();
  });

  it('walks history with ArrowUp and ArrowDown', async () => {
    const { input, user, run } = setup();
    await run('pwd');
    await run('whoami');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('whoami');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('pwd');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveValue('whoami');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveValue('');
  });

  // RED fix: completion is strict to cwd (spec §6, decision B), so start in ~/resume.
  it('Tab completes a single match', async () => {
    const { input, user } = setup({ cwd: '~/resume' });
    await user.type(input, 'cat ex');
    await user.tab();
    expect(input).toHaveValue('cat experience ');
  });

  it('Tab lists several matches as one line and keeps the common prefix', async () => {
    const { input, log, user } = setup();
    await user.type(input, 'c');
    await user.tab();
    expect(within(log).getByText('cat cd clear concise')).toBeInTheDocument();
    expect(input).toHaveValue('c');
  });

  it('Tab keeps focus in the input', async () => {
    const { input, user } = setup();
    await user.type(input, 'zzz');
    await user.tab();
    expect(input).toHaveFocus();
  });

  it('Ctrl+C echoes ^C, clears the input and records nothing', async () => {
    const { input, log, user, run } = setup();
    await user.type(input, 'whoami');
    await user.keyboard('{Control>}c{/Control}');
    expect(within(log).getByText(`${PROMPT} whoami^C`)).toBeInTheDocument();
    expect(within(log).queryByText(SUMMARY)).not.toBeInTheDocument();
    expect(input).toHaveValue('');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('');
    await run('pwd');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('pwd');
  });

  // Review of milestone 3: refocusing must not steal clicks on links or interrupt text selection.
  it('does not move focus to the input when a link in the log is clicked', async () => {
    const { input, user } = setup();
    await user.type(input, 'cat contact{Enter}');
    const link = screen.getByRole('link', { name: 'https://github.com/alex-example' });
    link.addEventListener('click', (event) => event.preventDefault()); // jsdom: don't navigate
    await user.click(link);
    expect(input).not.toHaveFocus();
  });

  it('does not move focus to the input while text in the log is selected', () => {
    const { input, log } = setup();
    const range = document.createRange();
    range.selectNodeContents(log);
    window.getSelection()?.removeAllRanges(); // addRange is ignored if a range already exists
    window.getSelection()?.addRange(range);
    expect(window.getSelection()?.isCollapsed).toBe(false);
    // fireEvent, not user.click: user-event's pointer press would collapse the selection itself.
    fireEvent.click(log);
    expect(input).not.toHaveFocus();
    window.getSelection()?.removeAllRanges();
  });

  it('focuses the input when the log is clicked', async () => {
    const { input, log, user } = setup();
    expect(input).not.toHaveFocus();
    await user.click(log);
    expect(input).toHaveFocus();
  });

  it('offers suggested-command chips that run like typed commands', async () => {
    const { log, user } = setup();
    const nav = screen.getByRole('navigation', { name: 'Suggested commands' });
    const names = within(nav)
      .getAllByRole('button')
      .map((button) => button.textContent);
    expect(names).toEqual(['help', 'whoami', 'cat experience', 'cat projects', 'open linkedin', 'resume']);
    await user.click(within(nav).getByRole('button', { name: 'whoami' }));
    expect(within(log).getByText(`${PROMPT} whoami`)).toBeInTheDocument();
    expect(within(log).getByText(SUMMARY)).toBeInTheDocument();
  });

  it('echoes only the prompt for an empty Enter', async () => {
    const { log, user, input } = setup();
    await user.type(input, '{Enter}');
    expect(within(log).getAllByText(PROMPT)).toHaveLength(1);
  });

  it('keeps detail across commands', async () => {
    const { log, run } = setup();
    await run('verbose');
    await run('whoami');
    expect(within(log).getByText(SUMMARY_VERBOSE)).toBeInTheDocument();
  });

  it('starts with the detail from document.documentElement.dataset.detail', async () => {
    document.documentElement.dataset.detail = 'verbose';
    try {
      const { log, run } = setup();
      await run('whoami');
      expect(within(log).getByText(SUMMARY_VERBOSE)).toBeInTheDocument();
    } finally {
      delete document.documentElement.dataset.detail;
    }
  });

  it('syncs detail from a PREFS_EVENT without emitting an effect', async () => {
    const { log, onEffect, run } = setup();
    act(() => {
      window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { detail: 'verbose' } }));
    });
    await run('whoami');
    expect(within(log).getByText(SUMMARY_VERBOSE)).toBeInTheDocument();
    expect(onEffect).not.toHaveBeenCalled();
  });

  it('renders only the anchor when a link label equals its href', async () => {
    const { log, run } = setup();
    await run('open linkedin');
    const link = within(log).getByRole('link', { name: 'https://www.linkedin.com/in/alex-example' });
    expect(link.parentElement?.textContent).toBe('https://www.linkedin.com/in/alex-example');
  });

  it('keeps "label href" when a link label differs from its href', async () => {
    const { log, run } = setup();
    await run('cat contact');
    const link = within(log).getByRole('link', { name: 'mailto:alex@example.com' });
    expect(link.parentElement?.textContent).toBe('Email mailto:alex@example.com');
  });

  it('suggests only runnable commands', () => {
    expect(CHIPS.map((chip) => chip.split(' ')[0])).toEqual(
      CHIPS.map((chip) => COMMANDS.find((command) => command === chip.split(' ')[0])),
    );
  });
});
