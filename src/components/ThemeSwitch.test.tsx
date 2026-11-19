// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeSwitch } from './ThemeSwitch';

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe('ThemeSwitch', () => {
  it('renders a Theme group, Modern then Classic, Modern checked by default', () => {
    render(<ThemeSwitch onEffect={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.getAttribute('value'))).toEqual(['modern', 'classic']);
    expect(screen.getByRole('radio', { name: 'Modern' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Classic' })).not.toBeChecked();
    expect(radios[0]).toHaveAttribute('name', 'theme');
  });

  it('emits set-theme when Classic is chosen', async () => {
    const onEffect = vi.fn();
    render(<ThemeSwitch onEffect={onEffect} initial="modern" />);
    await userEvent.setup().click(screen.getByRole('radio', { name: 'Classic' }));
    expect(onEffect.mock.calls).toEqual([[{ type: 'set-theme', theme: 'classic' }]]);
  });

  it('reads <html data-theme> after mount', () => {
    document.documentElement.dataset.theme = 'classic';
    render(<ThemeSwitch onEffect={vi.fn()} />);
    expect(screen.getByRole('radio', { name: 'Classic' })).toBeChecked();
  });
});
