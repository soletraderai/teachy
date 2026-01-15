import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  showCount?: boolean;
  /** Whether to animate the progress bar fill (default true) */
  animated?: boolean;
}

export default function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  showCount = true,
  animated = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="font-heading font-semibold text-text">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="font-mono text-sm text-text/70">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="h-6 border-3 border-border bg-surface overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showCount && (
        <div className="mt-1 text-sm font-body text-text/70">
          {current} of {total}
        </div>
      )}
    </div>
  );
}
