import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function GlassCard({ children, accent = '#9146FF', className = '', style }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`glass ${className}`}
      style={{ position: 'relative', ['--accent' as string]: accent, ...style }}
    >
      <span className="bracket tl" style={{ borderColor: accent }} />
      <span className="bracket tr" style={{ borderColor: accent }} />
      <span className="bracket bl" style={{ borderColor: accent }} />
      <span className="bracket br" style={{ borderColor: accent }} />
      {children}
    </motion.div>
  );
}
