import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../src/components/ProgressBar';

describe('<ProgressBar />', () => {
  it('clamps value into 0..100 and exposes ARIA', () => {
    render(<ProgressBar value={150} label="Done" />);
    const bar = screen.getByRole('progressbar', { name: 'Done' });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('rounds the displayed percentage', () => {
    render(<ProgressBar value={42.7} label="P" />);
    expect(screen.getByText('43%')).toBeInTheDocument();
  });
});
