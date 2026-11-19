// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PREFS_EVENT } from '../lib/effects';
import { DetailSwitch } from './DetailSwitch';

afterEach(() => {
  delete document.documentElement.dataset.detail;
});

describe('DetailSwitch', () => {
  it('renders a Detail group with Concise checked by default', () => {
    render(<DetailSwitch onEffect={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Detail' })).toBeInTheDocument();
    const concise = screen.getByRole('radio', { name: 'Concise' });
    const detailed = screen.getByRole('radio', { name: 'Detailed' });
    expect(concise).toBeChecked();
    expect(concise).toHaveAttribute('value', 'concise');
    expect(concise).toHaveAttribute('name', 'detail');
    expect(detailed).not.toBeChecked();
    expect(detailed).toHaveAttribute('value', 'verbose');
  });

  it('emits set-detail when Detailed is chosen', async () => {
    const onEffect = vi.fn();
    render(<DetailSwitch onEffect={onEffect} initial="concise" />);
    await userEvent.setup().click(screen.getByRole('radio', { name: 'Detailed' }));
    expect(onEffect.mock.calls).toEqual([[{ type: 'set-detail', detail: 'verbose' }]]);
  });

  it('checks Detailed when a PREFS_EVENT announces it, without emitting', () => {
    const onEffect = vi.fn();
    render(<DetailSwitch onEffect={onEffect} initial="concise" />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { detail: 'verbose' } }));
    });
    expect(screen.getByRole('radio', { name: 'Detailed' })).toBeChecked();
    expect(onEffect).not.toHaveBeenCalled();
  });
});
