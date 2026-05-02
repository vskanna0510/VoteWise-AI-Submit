import { motion } from 'framer-motion';

export const ProgressBar = ({
  value,
  label,
}: {
  value: number;
  label?: string;
}) => {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-slate-300 mb-1.5">
          <span>{label}</span>
          <span className="font-semibold text-white">{Math.round(v)}%</span>
        </div>
      )}
      <div
        className="h-2.5 rounded-full bg-white/10 overflow-hidden"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'progress'}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-brand-500 via-accent-pink to-accent-cyan"
        />
      </div>
    </div>
  );
};
