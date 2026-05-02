import { motion } from 'framer-motion';

export const BackgroundOrbs = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <motion.div
      className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full blur-3xl opacity-30 bg-brand-600"
      animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full blur-3xl opacity-25 bg-accent-pink"
      animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full blur-3xl opacity-20 bg-accent-cyan"
      animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
      transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);
