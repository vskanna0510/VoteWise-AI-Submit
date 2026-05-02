export interface MythFact {
  id: string;
  myth: string;
  fact: string;
  source: string;
}

export const MYTHS: MythFact[] = [
  {
    id: 'm1',
    myth: 'EVMs in India can be hacked over the internet.',
    fact: 'EVMs are standalone, tamper-evident devices with no networking. They cannot be hacked remotely. The VVPAT adds a paper audit trail.',
    source: 'Election Commission of India',
  },
  {
    id: 'm2',
    myth: 'You must have an Aadhaar card to vote.',
    fact: 'Aadhaar is not mandatory. Any of the 12 ECI-accepted IDs (EPIC, passport, PAN, driving licence, etc.) is valid at the booth.',
    source: 'ECI Voter Guide',
  },
  {
    id: 'm3',
    myth: 'NOTA cancels the election if it wins.',
    fact: "NOTA records the voter's preference for none, but the candidate with the highest valid votes still wins — even if NOTA is highest.",
    source: 'PUCL v. Union of India (2013)',
  },
  {
    id: 'm4',
    myth: 'You can vote in any constituency you visit.',
    fact: 'You can only vote at the polling booth where your name appears on the electoral roll. Service voters & migrants have separate provisions.',
    source: 'ECI Voter Helpline',
  },
  {
    id: 'm5',
    myth: 'Indelible ink fades within hours.',
    fact: 'The phosphoric-acid based ink leaves a mark that lasts 2-4 weeks and is supplied solely by Mysore Paints & Varnish Ltd.',
    source: 'Mysore Paints',
  },
  {
    id: 'm6',
    myth: 'Online voting is allowed for everyone.',
    fact: 'Postal ballots & ETPBS are limited to service personnel, NRIs (in pilot), and absentee categories. General online voting is not permitted.',
    source: 'Conduct of Election Rules, 1961',
  },
  {
    id: 'm7',
    myth: 'You need to know how to read English to vote.',
    fact: 'Ballot units show every candidate name in the regional language plus the symbol — designed to be usable by non-readers.',
    source: 'ECI EVM Manual',
  },
  {
    id: 'm8',
    myth: 'A first-time voter has to pay a fee to register.',
    fact: 'Voter registration via Form 6 is free of cost. Anyone asking for money is committing fraud.',
    source: 'NVSP Portal',
  },
];
