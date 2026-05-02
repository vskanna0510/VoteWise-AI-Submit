import type { UserRole } from './types';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  reminderTitle: string;
}

export const CHECKLISTS: Record<UserRole, ChecklistItem[]> = {
  first_time_voter: [
    { id: 'ftv1', title: 'Confirm I am 18+ on Jan 1', description: 'Check eligibility against the qualifying date.', reminderTitle: 'Voter Eligibility Check' },
    { id: 'ftv2', title: 'Fill Form 6 on NVSP', description: 'Complete the online application for inclusion.', reminderTitle: 'Submit Form 6' },
    { id: 'ftv3', title: 'Upload age & address proof', description: 'A recent photo, age proof, address proof.', reminderTitle: 'Upload voter documents' },
    { id: 'ftv4', title: 'Track EPIC delivery', description: 'Voter ID typically arrives in 2-4 weeks.', reminderTitle: 'Check EPIC status' },
    { id: 'ftv5', title: 'Locate my polling booth', description: 'Use Voter Helpline app or electoralsearch.in.', reminderTitle: 'Find polling booth' },
    { id: 'ftv6', title: 'Carry valid ID on poll day', description: 'EPIC preferred; 11 alternates accepted.', reminderTitle: 'Carry voter ID to booth' },
    { id: 'ftv7', title: 'Vote and verify VVPAT slip', description: 'Watch the slip for 7 seconds before it drops.', reminderTitle: 'Election Day - Vote!' },
  ],
  existing_voter: [
    { id: 'ev1', title: 'Verify name on the roll', description: 'Search electoralsearch.in for your record.', reminderTitle: 'Verify electoral roll' },
    { id: 'ev2', title: 'Update Form 8 if anything changed', description: 'Address, name, photo updates use Form 8.', reminderTitle: 'Submit Form 8' },
    { id: 'ev3', title: 'Locate booth & route', description: 'Plan transport ahead of poll day.', reminderTitle: 'Plan booth route' },
    { id: 'ev4', title: 'Carry approved photo ID', description: 'EPIC or any accepted alternate.', reminderTitle: 'Carry voter ID' },
    { id: 'ev5', title: 'Vote', description: 'Cast your vote and verify the VVPAT slip.', reminderTitle: 'Election Day - Vote!' },
  ],
  student: [
    { id: 'st1', title: 'Confirm constituency (home or hostel)', description: 'You can register only in one constituency.', reminderTitle: 'Choose voter constituency' },
    { id: 'st2', title: 'Fill Form 6 / Form 8', description: 'Form 6 if new, Form 8 to update.', reminderTitle: 'Submit voter form' },
    { id: 'st3', title: 'Take VoteWise quiz', description: 'Test your understanding of the process.', reminderTitle: 'Take the VoteWise quiz' },
    { id: 'st4', title: 'Earn certificate', description: 'Score 70%+ to download a certificate.', reminderTitle: 'Earn voter certificate' },
    { id: 'st5', title: 'Vote on poll day', description: 'Carry ID and follow booth instructions.', reminderTitle: 'Election Day - Vote!' },
  ],
  election_officer: [
    { id: 'eo1', title: 'Attend all training sessions', description: 'Mandatory before deployment.', reminderTitle: 'Officer training' },
    { id: 'eo2', title: 'Collect EVM/VVPAT & forms', description: 'Verify seals at the dispatch centre.', reminderTitle: 'Collect EVM kit' },
    { id: 'eo3', title: 'Reach booth 1+ hour early', description: 'Setup, signage, queue management.', reminderTitle: 'Reach polling booth early' },
    { id: 'eo4', title: 'Conduct mock poll with agents', description: 'Demonstrate fairness before voting opens.', reminderTitle: 'Conduct mock poll' },
    { id: 'eo5', title: 'Submit Form 17A & 17C', description: 'Complete and sign all statutory forms.', reminderTitle: 'Submit polling forms' },
    { id: 'eo6', title: 'Seal & deposit EVMs', description: 'Hand over to collection centre with PAs.', reminderTitle: 'Deposit EVMs' },
  ],
  candidate: [
    { id: 'c1', title: 'Verify enrolment on electoral roll', description: 'You must already be a registered voter.', reminderTitle: 'Verify voter enrolment' },
    { id: 'c2', title: 'File Form 2A/2B nomination', description: 'Submit to Returning Officer in window.', reminderTitle: 'File nomination' },
    { id: 'c3', title: 'Submit Form 26 affidavit', description: 'Disclose assets, education, criminal cases.', reminderTitle: 'Submit affidavit' },
    { id: 'c4', title: 'Pay security deposit', description: '₹25,000 (LS) or ₹10,000 (Assembly).', reminderTitle: 'Pay nomination deposit' },
    { id: 'c5', title: 'Attend scrutiny day', description: 'Returning Officer reviews papers.', reminderTitle: 'Attend nomination scrutiny' },
    { id: 'c6', title: 'Maintain expenditure register', description: 'Daily entries; observers will inspect.', reminderTitle: 'Update expenditure register' },
  ],
  admin: [
    { id: 'a1', title: 'Review chat-log analytics', description: 'Check refusal rate & top intents.', reminderTitle: 'Review analytics' },
    { id: 'a2', title: 'Audit FAQs for accuracy', description: 'Cross-check with latest ECI sources.', reminderTitle: 'Audit FAQs' },
    { id: 'a3', title: 'Update timeline if dates change', description: 'Adjust durations & long descriptions.', reminderTitle: 'Update timeline' },
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  first_time_voter: 'First-time Voter',
  existing_voter: 'Existing Voter',
  student: 'Student',
  election_officer: 'Election Officer',
  candidate: 'Candidate',
  admin: 'Admin',
};

/** Stable order for role pickers / translated labels. */
export const ROLE_DISPLAY_ORDER: UserRole[] = [
  'first_time_voter',
  'existing_voter',
  'student',
  'election_officer',
  'candidate',
  'admin',
];

export const ROLE_DISPLAY_ENGLISH = ROLE_DISPLAY_ORDER.map((r) => ROLE_LABELS[r]);
