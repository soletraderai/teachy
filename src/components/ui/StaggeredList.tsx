import { ReactNode, Children, isValidElement } from 'react';
import { motion, Variants } from 'framer-motion';

interface StaggeredListProps {
  children: ReactNode;
  /** Base delay in seconds before first item animates */
  baseDelay?: number;
  /** Delay between each item in seconds */
  staggerDelay?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** CSS class name for the container */
  className?: string;
  /** Whether to animate on mount */
  animateOnMount?: boolean;
}

// Container variants for orchestrating children
const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0,
    },
  },
};

// Item variants for individual animations
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: 0.3,
    },
  },
};

/**
 * StaggeredList - Animates children with a staggered entrance effect using Framer Motion.
 * Each child will fade/slide in with an increasing delay.
 */
export default function StaggeredList({
  children,
  baseDelay = 0,
  staggerDelay = 0.075,
  duration = 0.3,
  className = '',
  animateOnMount = true,
}: StaggeredListProps) {
  const childArray = Children.toArray(children);

  // Custom variants with user-specified timing
  const customContainerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: baseDelay,
      },
    },
  };

  const customItemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'tween',
        ease: 'easeOut',
        duration,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={customContainerVariants}
      initial={animateOnMount ? 'hidden' : 'visible'}
      animate="visible"
    >
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <motion.div
            key={child.key || index}
            variants={customItemVariants}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/**
 * StaggeredItem - Individual staggered item for more control.
 * Use this when you need to wrap specific elements with stagger animation.
 */
export function StaggeredItem({
  children,
  index = 0,
  baseDelay = 0,
  staggerDelay = 0.075,
  duration = 0.3,
  className = '',
}: {
  children: ReactNode;
  index?: number;
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}) {
  const delay = baseDelay + index * staggerDelay;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'tween',
        ease: 'easeOut',
        duration,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedList - A simpler staggered list using default variants.
 * Good for quick implementations without custom timing.
 */
export function AnimatedList({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const childArray = Children.toArray(children);

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <motion.div key={child.key || index} variants={itemVariants}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/**
 * FadeInWhenVisible - Animates children when they enter the viewport.
 * Uses Framer Motion's whileInView for scroll-triggered animations.
 */
export function FadeInWhenVisible({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        type: 'tween',
        ease: 'easeOut',
        duration: 0.4,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
