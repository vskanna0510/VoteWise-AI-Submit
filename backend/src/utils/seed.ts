/**
 * Seed script — populates DB with timeline, FAQs, quiz questions, default admin.
 * Run with:  npm run seed
 */

import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { logger } from './logger';
import { User } from '../models/User';
import { FAQ } from '../models/FAQ';
import { TimelineStep } from '../models/TimelineStep';
import { QuizQuestion } from '../models/QuizQuestion';

const TIMELINE = [
  {
    order: 1,
    key: 'announcement',
    title: 'Election Announcement',
    shortDescription: 'The Election Commission of India announces the schedule.',
    longDescription:
      'The ECI announces poll dates, phases, and the date the Model Code of Conduct comes into force. Press conference is held at Nirvachan Sadan, New Delhi.',
    durationDays: 1,
    icon: 'Megaphone',
    color: '#8b5cf6',
    resources: [{ label: 'ECI Press Note', url: 'https://eci.gov.in' }],
  },
  {
    order: 2,
    key: 'mcc',
    title: 'Model Code of Conduct',
    shortDescription: 'MCC takes effect immediately on announcement.',
    longDescription:
      'The MCC governs the conduct of parties, candidates, and the government — speeches, rallies, polling-day behaviour, and use of state machinery. Violations can attract disqualification.',
    durationDays: 30,
    icon: 'ShieldCheck',
    color: '#a855f7',
  },
  {
    order: 3,
    key: 'nomination',
    title: 'Nomination',
    shortDescription: 'Candidates file nomination forms with the Returning Officer.',
    longDescription:
      'Candidates submit Form 2A/2B and Form 26 (affidavit) along with security deposit. Window typically open for 7 working days.',
    durationDays: 7,
    icon: 'FileSignature',
    color: '#c026d3',
  },
  {
    order: 4,
    key: 'scrutiny',
    title: 'Scrutiny & Withdrawal',
    shortDescription: 'Returning Officer verifies nominations; withdrawal window opens.',
    longDescription:
      'The RO scrutinises every nomination on the day after the deadline. Candidates can withdraw within the next 2 days. Final list is published with allotted symbols.',
    durationDays: 3,
    icon: 'ClipboardCheck',
    color: '#d946ef',
  },
  {
    order: 5,
    key: 'campaign',
    title: 'Campaign Period',
    shortDescription: 'Public meetings, door-to-door, media — under MCC.',
    longDescription:
      'Campaigning ends 48 hours before polling (silence period). Expenditure is monitored by ECI observers and capped per constituency.',
    durationDays: 14,
    icon: 'Megaphone',
    color: '#ec4899',
  },
  {
    order: 6,
    key: 'polling',
    title: 'Polling Day',
    shortDescription: 'Voters cast their ballot on EVM + VVPAT.',
    longDescription:
      'Booths open 7 AM – 6 PM (state-dependent). Voters verify identity, get inked, press the button, and confirm via VVPAT slip. Standalone EVMs are not connected to the internet.',
    durationDays: 1,
    icon: 'Vote',
    color: '#f43f5e',
  },
  {
    order: 7,
    key: 'counting',
    title: 'Counting',
    shortDescription: 'Postal ballots first, then EVMs round-by-round.',
    longDescription:
      'Counting happens at designated centres in the presence of candidates/agents and ECI observers. VVPAT slips of 5 randomly chosen booths per assembly segment are matched against EVM totals.',
    durationDays: 1,
    icon: 'Calculator',
    color: '#f97316',
  },
  {
    order: 8,
    key: 'result',
    title: 'Result Declaration',
    shortDescription: 'Returning Officer declares the winner via Form 21C/E.',
    longDescription:
      'After all rounds, the RO signs Form 21C/E and hands the certificate to the elected candidate. Results are uploaded live to results.eci.gov.in.',
    durationDays: 1,
    icon: 'Trophy',
    color: '#eab308',
  },
];

const FAQS = [
  {
    question: 'Who can register as a voter in India?',
    answer:
      'Any Indian citizen who is 18 years or older on January 1 of the year of revision and is an ordinary resident of the constituency.',
    category: 'eligibility',
    tags: ['eligibility', 'age', 'citizen'],
  },
  {
    question: 'What is Form 6?',
    answer: 'Form 6 is the application for inclusion of a name in the electoral roll for first-time voters or those shifting constituency.',
    category: 'registration',
    tags: ['form6', 'registration'],
  },
  {
    question: 'What documents do I need on polling day?',
    answer: 'Your EPIC (Voter ID) is preferred. ECI also accepts Aadhaar, passport, driving licence, PAN, MNREGA card, and 8 other photo IDs.',
    category: 'voting',
    tags: ['documents', 'id'],
  },
  {
    question: 'What is VVPAT?',
    answer: 'Voter Verifiable Paper Audit Trail — a printer attached to the EVM that prints a slip showing your selection so you can verify it before it falls into a sealed box.',
    category: 'voting',
    tags: ['vvpat', 'evm'],
  },
  {
    question: 'How can I find my polling booth?',
    answer: 'Use the Voter Helpline app or visit electoralsearch.in and enter your EPIC number or name + state.',
    category: 'voting',
    tags: ['booth', 'location'],
  },
  {
    question: 'What is the Model Code of Conduct?',
    answer: 'A set of guidelines issued by the ECI that comes into force on election announcement and governs the conduct of parties, candidates, and government.',
    category: 'process',
    tags: ['mcc'],
  },
];

const QUIZ = [
  {
    question: 'What is the minimum age to vote in India?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correctIndex: 1,
    explanation: 'The 61st Constitutional Amendment Act (1988) lowered the voting age to 18.',
    difficulty: 'easy',
    topic: 'eligibility',
  },
  {
    question: 'Which form is used by a first-time voter to enrol?',
    options: ['Form 6', 'Form 7', 'Form 8', 'Form 26'],
    correctIndex: 0,
    explanation: 'Form 6 is for new electors to be added to the roll.',
    difficulty: 'easy',
    topic: 'registration',
  },
  {
    question: 'Who conducts elections to the Lok Sabha and State Assemblies?',
    options: ['Parliament', 'Supreme Court', 'Election Commission of India', 'Cabinet Secretariat'],
    correctIndex: 2,
    explanation: 'Article 324 vests this power in the ECI — an autonomous constitutional authority.',
    difficulty: 'easy',
    topic: 'process',
  },
  {
    question: 'What does VVPAT stand for?',
    options: [
      'Verified Vote Paper And Tally',
      'Voter Verifiable Paper Audit Trail',
      'Voting Verification Paper Audit Total',
      'Vote Validation Paper Auditing Tool',
    ],
    correctIndex: 1,
    explanation: 'VVPAT prints a 7-second visible slip confirming your selection.',
    difficulty: 'medium',
    topic: 'evm',
  },
  {
    question: 'When does the Model Code of Conduct come into effect?',
    options: [
      'After voting ends',
      'When results are declared',
      'Immediately after the ECI announces the schedule',
      'On nomination day',
    ],
    correctIndex: 2,
    explanation: 'MCC kicks in the moment the ECI announces dates and stays till the process ends.',
    difficulty: 'medium',
    topic: 'mcc',
  },
  {
    question: 'How long before polling does the campaign silence period begin?',
    options: ['12 hours', '24 hours', '48 hours', '72 hours'],
    correctIndex: 2,
    explanation: 'Section 126 of the RP Act bans public campaigning in the 48 hours before poll close.',
    difficulty: 'medium',
    topic: 'campaign',
  },
  {
    question: 'Which form is the candidate affidavit (assets, criminal record)?',
    options: ['Form 2A', 'Form 26', 'Form 21C', 'Form 17A'],
    correctIndex: 1,
    explanation: 'Form 26 mandates disclosure of assets, liabilities, education, and criminal cases.',
    difficulty: 'hard',
    topic: 'nomination',
  },
  {
    question: 'Who declares the result of an election?',
    options: ['Prime Minister', 'Chief Election Commissioner', 'Returning Officer', 'President'],
    correctIndex: 2,
    explanation: 'The RO signs Form 21C/E and declares the winner.',
    difficulty: 'medium',
    topic: 'counting',
  },
  {
    question: 'EVMs in India are connected to the internet.',
    options: ['True', 'False'],
    correctIndex: 1,
    explanation: 'EVMs are standalone, tamper-evident devices with no network connectivity.',
    difficulty: 'easy',
    topic: 'evm',
  },
  {
    question: 'How many VVPAT slips per assembly segment are randomly cross-verified?',
    options: ['1', '3', '5', '10'],
    correctIndex: 2,
    explanation: 'Per the 2019 Supreme Court order, 5 random booths per assembly segment are matched.',
    difficulty: 'hard',
    topic: 'counting',
  },
];

const seedAdminAndDemo = async (): Promise<void> => {
  const exists = await User.findOne({ email: env.DEFAULT_ADMIN_EMAIL });
  if (!exists) {
    const passwordHash = await bcrypt.hash(env.DEFAULT_ADMIN_PASSWORD, env.BCRYPT_SALT_ROUNDS);
    await User.create({
      name: env.DEFAULT_ADMIN_NAME,
      email: env.DEFAULT_ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      learningStage: 'mastery',
    });
    logger.info(`Created default admin: ${env.DEFAULT_ADMIN_EMAIL}`);
  }
  const demoEmail = 'voter@votewise.ai';
  const demo = await User.findOne({ email: demoEmail });
  if (!demo) {
    const passwordHash = await bcrypt.hash('Voter@123', env.BCRYPT_SALT_ROUNDS);
    await User.create({
      name: 'Demo Voter',
      email: demoEmail,
      passwordHash,
      role: 'first_time_voter',
    });
    logger.info(`Created demo voter: ${demoEmail}`);
  }
};

const run = async (): Promise<void> => {
  await connectDB();
  logger.info('Seeding database…');

  await seedAdminAndDemo();

  for (const step of TIMELINE) {
    await TimelineStep.updateOne({ key: step.key }, { $set: step }, { upsert: true });
  }
  logger.info(`Upserted ${TIMELINE.length} timeline steps`);

  for (const f of FAQS) {
    await FAQ.updateOne({ question: f.question }, { $set: f }, { upsert: true });
  }
  logger.info(`Upserted ${FAQS.length} FAQs`);

  for (const q of QUIZ) {
    await QuizQuestion.updateOne({ question: q.question }, { $set: q }, { upsert: true });
  }
  logger.info(`Upserted ${QUIZ.length} quiz questions`);

  await disconnectDB();
  logger.info('✅ Seed complete.');
  process.exit(0);
};

run().catch((err) => {
  logger.error('Seed failed', err);
  process.exit(1);
});
