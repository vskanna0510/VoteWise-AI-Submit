import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) => (
  <motion.header
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-8 flex flex-wrap items-end justify-between gap-4"
  >
    <div className="max-w-3xl">
      {eyebrow && (
        <span className="chip mb-3 text-brand-200 border-brand-500/40 bg-brand-500/10">
          {eyebrow}
        </span>
      )}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-slate-300 text-base sm:text-lg max-w-2xl">{subtitle}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </motion.header>
);
