import { Github, Heart, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { useLocalizedTexts } from '../hooks/useLocalizedTexts';

const FOOTER_COPY = [
  'A neutral, AI-powered learning companion for the election process. We never recommend candidates, parties, or how to vote.',
  'Resources',
  'Neutrality Pledge',
  'VoteWise AI explains the process — not the politics. All content is verified against official ECI publications. Suggest a correction via the admin dashboard.',
  'Built with',
  'for civic education · MIT',
  'Source',
] as const;

export const Footer = () => {
  const t = useLocalizedTexts(FOOTER_COPY);
  const [tagline, resources, pledgeTitle, pledgeBody, builtWith, builtSuffix, source] = t;

  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <Logo size="md" />
          <p className="mt-3 text-sm text-slate-400 max-w-xs">{tagline}</p>
        </div>
        <div className="text-sm">
          <h3 className="text-slate-200 font-semibold mb-3">{resources}</h3>
          <ul className="space-y-2 text-slate-400">
            <li><a className="hover:text-white" href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">Election Commission of India</a></li>
            <li><a className="hover:text-white" href="https://nvsp.in" target="_blank" rel="noopener noreferrer">National Voter Service Portal</a></li>
            <li><a className="hover:text-white" href="https://electoralsearch.in" target="_blank" rel="noopener noreferrer">Electoral Search</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-1.5">
            <ShieldCheck size={14} /> {pledgeTitle}
          </h3>
          <p className="text-slate-400">{pledgeBody}</p>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            {builtWith} <Heart size={12} className="text-accent-pink" /> {builtSuffix}
          </span>
          <a
            href="https://github.com"
            className="flex items-center gap-1 hover:text-slate-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={14} /> {source}
          </a>
        </div>
      </div>
    </footer>
  );
};
