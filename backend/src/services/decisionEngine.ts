/**
 * Decision Engine
 * --------------------------------------------------------------
 * The core "smart routing" brain of VoteWise AI.
 *
 * Input:  raw user prompt + UserContext
 * Output: { intent, userType, recommendedAction, nextStep, confidence, safetyStatus }
 *
 * The engine:
 *   1) Runs the prompt through neutrality guardrails.
 *   2) Classifies intent via keyword + role-aware rules.
 *   3) Maps (intent × role × learningStage) to a concrete action plan.
 *   4) Emits a confidence score (0-1) so the UI can show fallback hints.
 *
 * Designed to be RAG-ready: `recommendedAction` can be replaced
 * with a vector-search + LLM call later without changing callers.
 */

import { checkNeutrality, NeutralityResult } from './neutralityGuard';
import type { UserRole, LearningStage, Language } from '../config/constants';

export interface UserContext {
  role?: UserRole;
  language?: Language;
  learningStage?: LearningStage;
  checklistProgress?: number;
  quizScore?: number;
  chatHistorySummary?: string;
}

export type Intent =
  | 'greeting'
  | 'registration'
  | 'eligibility'
  | 'voting_process'
  | 'documents_needed'
  | 'polling_booth'
  | 'mcc'
  | 'evm_vvpat'
  | 'counting'
  | 'officer_duty'
  | 'candidate_filing'
  | 'admin'
  | 'quiz'
  | 'reminder'
  | 'unknown';

export interface DecisionResult {
  intent: Intent;
  userType: UserRole | 'guest';
  recommendedAction: string;
  nextStep: { label: string; route: string; cta: string };
  confidence: number;
  safetyStatus: NeutralityResult['status'];
  refusalMessage?: string;
  references: string[];
}

interface IntentRule {
  intent: Intent;
  patterns: RegExp[];
  weight: number;
}

const INTENT_RULES: IntentRule[] = [
  { intent: 'greeting', patterns: [/\b(hi|hello|hey|namaste|good\s+(morning|evening))\b/i], weight: 0.6 },
  { intent: 'registration', patterns: [/\bregister|registration|enroll|epic|voter\s+id|form\s*6\b/i], weight: 0.95 },
  { intent: 'eligibility', patterns: [/\beligib|qualif|age|18\s*years|citizen\b/i], weight: 0.9 },
  { intent: 'voting_process', patterns: [/\bhow\s+to\s+vote|voting\s+process|cast\s+a?\s*vote|ballot\b/i], weight: 0.95 },
  { intent: 'documents_needed', patterns: [/\bdocument|id\s+proof|aadhaar|pan|passport|driving\b/i], weight: 0.9 },
  { intent: 'polling_booth', patterns: [/\bpolling\s+booth|polling\s+station|where\s+to\s+vote|nearest\s+booth\b/i], weight: 0.9 },
  { intent: 'mcc', patterns: [/\bmodel\s+code\s+of\s+conduct|\bmcc\b/i], weight: 0.95 },
  { intent: 'evm_vvpat', patterns: [/\bevm|vvpat|electronic\s+voting|voting\s+machine\b/i], weight: 0.95 },
  { intent: 'counting', patterns: [/\bcounting|result|tally|declare\s+winner\b/i], weight: 0.9 },
  { intent: 'officer_duty', patterns: [/\bpresiding\s+officer|polling\s+officer|duty|training\b/i], weight: 0.9 },
  { intent: 'candidate_filing', patterns: [/\bnomination|file\s+nomination|candidate|deposit|scrutiny\b/i], weight: 0.9 },
  { intent: 'admin', patterns: [/\badmin|dashboard|manage\s+faqs?\b/i], weight: 0.85 },
  { intent: 'quiz', patterns: [/\bquiz|test|score|certificate\b/i], weight: 0.9 },
  { intent: 'reminder', patterns: [/\bremind|reminder|calendar|notify\s+me\b/i], weight: 0.9 },
];

const detectIntent = (prompt: string): { intent: Intent; confidence: number } => {
  let best: { intent: Intent; confidence: number } = { intent: 'unknown', confidence: 0.2 };
  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((re) => re.test(prompt))) {
      if (rule.weight > best.confidence) {
        best = { intent: rule.intent, confidence: rule.weight };
      }
    }
  }
  return best;
};

const ACTION_LIBRARY: Record<Intent, Record<string, string>> = {
  registration: {
    first_time_voter:
      "Welcome! As a first-time voter, here's your 4-step registration:\n\n1. Visit the **NVSP / Voter Helpline app**.\n2. Fill **Form 6** with your photo, address, and Aadhaar (optional but recommended).\n3. Upload an age & address proof.\n4. Track your application — your EPIC (Voter ID) usually arrives in 2-4 weeks.\n\nWould you like a checklist you can tick off?",
    student:
      "Quick & simple: if you're 18+, you can register online via the **NVSP portal** using Form 6. If you live away from home, you can register in either your home or hostel constituency — but only one. Want me to open the checklist for you?",
    existing_voter:
      "If you've moved or your details changed, use **Form 8** to update your address, name, or photo. You stay on the rolls; only the entry is corrected.",
    election_officer:
      "For officer-side registration management you'll work with **Form 6, 7, 8** under the ERMS system. I can list each form's purpose if you'd like.",
    candidate:
      "Candidates don't 'register' as voters through the candidate process — you must already be on the electoral roll. Verify your entry first via NVSP.",
    admin:
      "Admin: registration analytics live in your dashboard under **Users → Roll Updates**.",
    default:
      "To register as a voter, fill **Form 6** on the NVSP portal or the Voter Helpline app. You'll need an age proof and address proof.",
  },
  eligibility: {
    default:
      "You can register to vote in India if you are:\n\n• A **citizen of India**\n• **18 years or older** on the qualifying date (Jan 1)\n• An **ordinary resident** of the constituency\n• **Not disqualified** under any law\n\nWant the document checklist next?",
  },
  voting_process: {
    first_time_voter:
      "Here's exactly how voting day works:\n\n1. Reach your **assigned polling booth**.\n2. Officers verify your **EPIC / accepted ID**.\n3. They mark your finger with **indelible ink**.\n4. You go to the **EVM** and press the button next to your choice.\n5. The **VVPAT** shows a printed slip for 7 seconds — confirm it.\n\nThat's it. The whole thing takes about 2-3 minutes.",
    default:
      "Voting uses an **EVM + VVPAT** system. You verify your identity, get inked, press the button, and confirm via the VVPAT slip. Total time ~3 minutes.",
  },
  documents_needed: {
    default:
      "Accepted photo IDs at the polling booth include:\n\n• EPIC (Voter ID)\n• Aadhaar\n• Passport\n• Driving licence\n• PAN card\n• Govt./PSU service ID\n• Bank/Post Office passbook with photo\n• MNREGA job card\n• Smart card by RGI under NPR\n\nYou need **one** of these along with your name on the electoral roll.",
  },
  polling_booth: {
    default:
      "You can find your polling booth via the **Voter Helpline app** or the **electoralsearch.in** site. Enter your EPIC number or your name + state. I can also open the booth locator map for you.",
  },
  mcc: {
    default:
      "The **Model Code of Conduct (MCC)** is a set of guidelines issued by the **Election Commission of India** that comes into force the moment elections are announced. It governs speeches, polling day conduct, manifestos, and the use of govt. machinery — to ensure a free and fair election.",
  },
  evm_vvpat: {
    default:
      "An **EVM (Electronic Voting Machine)** records your vote electronically. The **VVPAT (Voter Verifiable Paper Audit Trail)** prints a slip showing your selection so you can verify it before it falls into a sealed box. EVMs are not connected to the internet — they are **standalone, tamper-evident** devices.",
  },
  counting: {
    default:
      "Counting starts on result day at designated counting centres under heavy observation. Postal ballots are counted first, followed by EVM votes round-by-round. Results are announced after the **Returning Officer** signs Form 21C/E.",
  },
  officer_duty: {
    election_officer:
      "Polling-duty checklist for officers:\n\n1. Collect EVM/VVPAT and forms from the dispatch centre.\n2. Reach booth ≥ 1 hour before poll opens.\n3. Conduct **mock poll** with polling agents.\n4. Manage queue, verify ID, ink the finger.\n5. Seal EVM after close of poll, deposit at collection centre.\n6. Submit **Form 17A & 17C** with signatures.",
    default:
      "Polling officer duties involve setup, mock poll, voter verification, EVM management, and end-of-day sealing. Officers receive multiple training rounds before deployment.",
  },
  candidate_filing: {
    candidate:
      "Candidate nomination flow:\n\n1. File **Form 2A/2B** with the Returning Officer.\n2. Submit **affidavit (Form 26)** with assets, criminal record, education.\n3. Pay security deposit (₹25,000 for LS / ₹10,000 for Assembly; half for SC/ST).\n4. Scrutiny → withdrawal window → final list.\n5. Get your symbol allotted.",
    default:
      "A candidate files nomination through Forms 2A/2B + affidavit (Form 26), pays a security deposit, undergoes scrutiny, and gets a symbol assigned. The whole window is usually 7-10 days.",
  },
  admin: {
    admin:
      "Open the **Admin Dashboard** to manage FAQs, edit timeline steps, and view chat analytics. You can also export logs as CSV.",
    default:
      "Admin tools require an admin account. If you're an admin, log in and visit **/admin**.",
  },
  quiz: {
    student:
      "Take the **VoteWise Quiz** — 10 MCQs, 2 minutes. Score 70%+ to earn a downloadable certificate.",
    default:
      "Try the quiz to test what you've learned. You can earn a certificate at 70%+ score.",
  },
  reminder: {
    default:
      "I can add an election-day or registration-deadline reminder to your **Google Calendar**. Open the Voter Checklist and tap the calendar icon next to any task.",
  },
  greeting: {
    default:
      "Hello! I'm **VoteWise AI**, your neutral guide to the election process. I can help you understand registration, voting, the timeline, polling booth procedures, and more. What would you like to know?",
  },
  unknown: {
    default:
      "I focus on the **election process** — registration, voting, timelines, EVMs, MCC, and similar topics. Could you rephrase your question, or pick one of the suggested prompts?",
  },
};

const NEXT_STEP_LIBRARY: Record<Intent, { label: string; route: string; cta: string }> = {
  registration: { label: 'Open the Voter Checklist', route: '/checklist', cta: 'Start checklist' },
  eligibility: { label: 'See full eligibility rules', route: '/timeline', cta: 'View timeline' },
  voting_process: { label: 'Try the Election Simulator', route: '/simulator', cta: 'Simulate voting' },
  documents_needed: { label: 'Open the Voter Checklist', route: '/checklist', cta: 'Tick off documents' },
  polling_booth: { label: 'Open booth locator map', route: '/assistant?tool=maps', cta: 'Find my booth' },
  mcc: { label: 'View Timeline → MCC step', route: '/timeline#mcc', cta: 'Read MCC' },
  evm_vvpat: { label: 'Watch EVM walkthrough', route: '/simulator', cta: 'Try the EVM' },
  counting: { label: 'Timeline → Counting step', route: '/timeline#counting', cta: 'View counting' },
  officer_duty: { label: 'Open the Officer Checklist', route: '/checklist?role=election_officer', cta: 'View duty list' },
  candidate_filing: { label: 'Timeline → Nomination', route: '/timeline#nomination', cta: 'View nomination' },
  admin: { label: 'Go to Admin Dashboard', route: '/admin', cta: 'Open admin' },
  quiz: { label: 'Take the VoteWise Quiz', route: '/quiz', cta: 'Start quiz' },
  reminder: { label: 'Open Voter Checklist', route: '/checklist', cta: 'Add reminders' },
  greeting: { label: 'Browse the Timeline', route: '/timeline', cta: 'Explore' },
  unknown: { label: 'Try the AI Assistant', route: '/assistant', cta: 'Ask again' },
};

const REFERENCES: Record<Intent, string[]> = {
  registration: ['ECI Form 6', 'NVSP Portal', 'Voter Helpline App'],
  eligibility: ['Representation of the People Act, 1950'],
  voting_process: ['ECI Voter Guide'],
  documents_needed: ['ECI accepted ID list'],
  polling_booth: ['electoralsearch.in', 'Voter Helpline App'],
  mcc: ['ECI Model Code of Conduct'],
  evm_vvpat: ['ECI EVM/VVPAT Manual'],
  counting: ['Conduct of Election Rules, 1961'],
  officer_duty: ['ECI Handbook for Polling Personnel'],
  candidate_filing: ['ECI Handbook for Candidates'],
  admin: ['Internal admin docs'],
  quiz: ['VoteWise Quiz Library'],
  reminder: ['Google Calendar API'],
  greeting: [],
  unknown: ['ECI Knowledge Base'],
};

const pickAction = (intent: Intent, role: UserRole | 'guest'): string => {
  const lib = ACTION_LIBRARY[intent] ?? ACTION_LIBRARY.unknown;
  return lib[role] ?? lib.default ?? lib[Object.keys(lib)[0]!]!;
};

export const decide = (prompt: string, ctx: UserContext = {}): DecisionResult => {
  const safety = checkNeutrality(prompt);
  const role: UserRole | 'guest' = ctx.role ?? 'guest';

  if (safety.status === 'refused') {
    return {
      intent: 'unknown',
      userType: role,
      recommendedAction: safety.refusalMessage ?? 'I cannot help with that request.',
      nextStep: NEXT_STEP_LIBRARY.unknown,
      confidence: 1,
      safetyStatus: 'refused',
      refusalMessage: safety.refusalMessage,
      references: [],
    };
  }

  const { intent, confidence } = detectIntent(prompt);
  const action = pickAction(intent, role);

  // Light personalisation suffix based on context
  let personalised = action;
  if (intent !== 'greeting' && intent !== 'unknown') {
    if ((ctx.checklistProgress ?? 0) > 0 && (ctx.checklistProgress ?? 0) < 100) {
      personalised += `\n\n_You're at **${ctx.checklistProgress}%** on your checklist — keep going!_`;
    }
    if (ctx.learningStage === 'discover') {
      personalised += `\n\n_Tip: head to the **Timeline** to see how this fits in the bigger picture._`;
    }
  }

  return {
    intent,
    userType: role,
    recommendedAction: personalised,
    nextStep: NEXT_STEP_LIBRARY[intent],
    confidence,
    safetyStatus: safety.status,
    references: REFERENCES[intent] ?? [],
  };
};
