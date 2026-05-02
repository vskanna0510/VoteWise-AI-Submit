import { Link } from 'react-router-dom';

export const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const px = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const text = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="VoteWise AI home">
      <div
        className="relative rounded-xl bg-gradient-to-br from-brand-500 to-accent-pink shadow-glow group-hover:shadow-[0_0_30px_-6px_rgba(236,72,153,0.6)] transition-all"
        style={{ width: px, height: px }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full p-2">
          <path
            d="M14 22 l13 22 l19 -28"
            stroke="#fff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`font-display font-bold ${text} text-white`}>
          Vote<span className="gradient-text">Wise</span> AI
        </span>
        {size !== 'sm' && (
          <span className="text-[10px] uppercase tracking-widest text-slate-400">
            neutral · accessible · informed
          </span>
        )}
      </div>
    </Link>
  );
};
