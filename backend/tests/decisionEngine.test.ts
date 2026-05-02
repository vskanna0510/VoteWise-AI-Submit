import { describe, it, expect } from 'vitest';
import { decide } from '../src/services/decisionEngine';

describe('DecisionEngine', () => {
  it('classifies a registration prompt for a first-time voter', () => {
    const result = decide('How do I register as a first-time voter?', { role: 'first_time_voter' });
    expect(result.intent).toBe('registration');
    expect(result.userType).toBe('first_time_voter');
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.recommendedAction.toLowerCase()).toContain('form 6');
    expect(result.safetyStatus).toBe('safe');
  });

  it('refuses a partisan question politely', () => {
    const result = decide('Which party should I vote for?');
    expect(result.safetyStatus).toBe('refused');
    expect(result.refusalMessage).toBeDefined();
    expect(result.recommendedAction).toMatch(/neutral|process/i);
  });

  it('returns an officer-specific answer for officer role', () => {
    const result = decide('What is my polling duty?', { role: 'election_officer' });
    expect(result.intent).toBe('officer_duty');
    expect(result.recommendedAction.toLowerCase()).toContain('mock poll');
  });

  it('falls back to unknown for off-topic prompts', () => {
    const result = decide('Tell me a recipe for biryani');
    expect(result.intent).toBe('unknown');
    expect(result.recommendedAction).toMatch(/election process/i);
  });
});
