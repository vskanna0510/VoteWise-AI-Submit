import { describe, it, expect, vi } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityPanel } from '../src/components/AccessibilityPanel';
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

describe('<AccessibilityPanel />', () => {
  it('shows dialog landmark with accessible name when panel is visible', async () => {
    const noop = (): void => {
      /* */
    };
    render(wrap(<AccessibilityPanel open={true} onClose={noop} />));
    const dialog = await screen.findByRole('dialog', { name: 'Accessibility settings' });
    expect(dialog).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Close accessibility panel' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss backdrop' })).toBeInTheDocument();
  });
});
