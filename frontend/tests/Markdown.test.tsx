import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown } from '../src/components/Markdown';

describe('<Markdown />', () => {
  it('renders bold and code', () => {
    render(<Markdown>{'Use **Form 6** for `registration`.'}</Markdown>);
    expect(screen.getByText('Form 6')).toBeInTheDocument();
    expect(screen.getByText('registration')).toBeInTheDocument();
    const strong = screen.getByText('Form 6');
    expect(strong.tagName).toBe('STRONG');
  });

  it('escapes raw HTML to prevent injection', () => {
    render(<Markdown>{'<script>alert(1)</script>'}</Markdown>);
    // Should not actually inject a <script> tag
    const scripts = document.querySelectorAll('script');
    expect(scripts.length).toBe(0);
  });

  it('renders ordered list items as <li>', () => {
    render(<Markdown>{'1. Step one\n2. Step two'}</Markdown>);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });
});
