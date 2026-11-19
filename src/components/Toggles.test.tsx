// @vitest-environment jsdom
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
