import { describe, it, expect, vi } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../src/components/Navbar';
import { UserContextProvider } from '../src/hooks/useUserContext';

vi.mock('../src/hooks/useLocalizedTexts', () => ({
  useLocalizedTexts: (labels: readonly string[]) => [...labels],
}));

function wrap(ui: ReactElement) {
  return (
    <MemoryRouter>
      <UserContextProvider>{ui}</UserContextProvider>
    </MemoryRouter>
  );
}

describe('<Navbar /> accessibility', () => {
  it('exposes main navigation landmark', () => {
    render(wrap(<Navbar onOpenA11y={() => {}} />));
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('has an accessible control for settings', () => {
    render(wrap(<Navbar onOpenA11y={() => {}} />));
    expect(
      screen.getByRole('button', { name: /open accessibility settings/i }),
    ).toBeInTheDocument();
  });
});
