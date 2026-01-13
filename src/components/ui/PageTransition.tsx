import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -8,
  },
};

// Transition configuration
const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.2,
};

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="page-transition"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Fade-only variant for simpler transitions
export function FadeTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Slide transition for modals/panels
export function SlideTransition({
  children,
  direction = 'right'
}: PageTransitionProps & { direction?: 'left' | 'right' | 'up' | 'down' }) {
  const offsets = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, ...offsets[direction] }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, ...offsets[direction] }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
