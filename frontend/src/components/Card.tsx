import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  glow?: boolean;
  children: ReactNode;
}

export const Card = ({ hover = true, glow = false, children, className, ...rest }: CardProps) => (
  <motion.div
    whileHover={hover ? { y: -4, scale: 1.005 } : undefined}
    transition={{ type: 'spring', stiffness: 250, damping: 20 }}
    className={cn(
      'glass rounded-3xl p-6',
      glow && 'shadow-glow',
      className as string | undefined
    )}
    {...rest}
  >
    {children}
  </motion.div>
);
