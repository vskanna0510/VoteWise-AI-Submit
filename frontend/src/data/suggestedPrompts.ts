import type { UserRole } from './types';

export const SUGGESTED_PROMPTS: Record<UserRole | 'guest', string[]> = {
  guest: [
    'How do I register as a voter in India?',
    'What documents do I need on polling day?',
    'How does an EVM work?',
    'What is the Model Code of Conduct?',
  ],
  first_time_voter: [
    'I just turned 18 — how do I register?',
    'Walk me through voting day step by step.',
    'What if my name is not on the roll?',
    'How do I find my polling booth?',
  ],
  existing_voter: [
    'I moved cities — how do I update my address?',
    'Can I vote without my EPIC card?',
    'What is the silence period?',
    'How is the result declared?',
  ],
  student: [
    'Explain the election process in simple terms.',
    'Quiz me on voter eligibility.',
    'What is the difference between EVM and VVPAT?',
    'Should I register at home or hostel?',
  ],
  election_officer: [
    'Give me the polling-day duty checklist.',
    'How do I conduct a mock poll?',
    'Which forms must I submit at end of poll?',
    'How are EVMs sealed?',
  ],
  candidate: [
    'Walk me through the nomination process.',
    'What goes in the Form 26 affidavit?',
    'What is the expenditure ceiling?',
    'How do I get my symbol allotted?',
  ],
  admin: [
    'Show me current intent distribution.',
    'How do I add a new FAQ?',
    'Refresh the timeline data.',
    'Export today\'s chat logs.',
  ],
};
