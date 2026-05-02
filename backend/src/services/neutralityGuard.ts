/**
 * Neutrality Guardrails
 * --------------------------------------------------------------
 * Detects political-persuasion / bias / propaganda intents
 * before any prompt reaches the LLM. Returns a structured result
 * so the chat controller can refuse politely.
 *
 * Pure function, no side effects, fully unit-testable.
 */

const PERSUASION_PATTERNS: RegExp[] = [
  /\bwhich\s+(party|candidate|leader|politician)\s+(should|must)\s+i\s+(vote|support|choose|pick)\b/i,
  /\bwho\s+(should|do you think)\s+i\s+vote\b/i,
  /\b(best|worst)\s+(party|candidate|politician|leader)\b/i,
  /\b(support|recommend|endorse|prefer)\s+(party|candidate|leader)\b/i,
  /\bwho\s+is\s+(better|stronger|smarter|more honest)\b.*\b(party|candidate|leader)\b/i,
  /\b(propaganda|campaign\s+for|vote\s+for)\b/i,
  /\bmy\s+(party|candidate)\s+is\s+(best|right)\b/i,
];

const PARTY_NAMES_GENERIC: RegExp[] = [
  /\b(bjp|congress|aap|inc|tmc|sp|bsp|dmk|aiadmk|cpi|cpm|shiv\s*sena|jdu|rjd|ncp|ysrcp|trs|brs)\b/i,
];

const HATE_PATTERNS: RegExp[] = [
  /\b(kill|attack|harm)\b.*\b(voter|candidate|community|religion|caste)\b/i,
  /\bvote\s+rigging|booth\s+capturing|fake\s+vote\b/i,
];

export type SafetyStatus = 'safe' | 'refused' | 'flagged';

export interface NeutralityResult {
  status: SafetyStatus;
  reason?: string;
  refusalMessage?: string;
}

const REFUSAL = (reason: string): string =>
  `I'm here to help you understand the **election process** in a neutral, factual way. ` +
  `I can't ${reason}. ` +
  `Instead, I can explain how to register, how voting works, what an EVM is, the role of the ECI, the model code of conduct, and more. ` +
  `What would you like to learn?`;

export const checkNeutrality = (prompt: string): NeutralityResult => {
  const text = prompt.trim();

  for (const re of HATE_PATTERNS) {
    if (re.test(text)) {
      return {
        status: 'refused',
        reason: 'unsafe-content',
        refusalMessage: REFUSAL('discuss content that promotes harm or illegal activity'),
      };
    }
  }

  for (const re of PERSUASION_PATTERNS) {
    if (re.test(text)) {
      return {
        status: 'refused',
        reason: 'political-persuasion',
        refusalMessage: REFUSAL('recommend candidates, parties, or who you should vote for'),
      };
    }
  }

  for (const re of PARTY_NAMES_GENERIC) {
    if (re.test(text)) {
      // Mention of a party isn't automatically refused, but flag for caution.
      return {
        status: 'flagged',
        reason: 'party-mention',
      };
    }
  }

  return { status: 'safe' };
};
