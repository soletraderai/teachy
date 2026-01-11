import { useEffect, useState, useRef } from 'react';

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
  const [displayPercentage, setDisplayPercentage] = useState(animated ? 0 : percentage);
  const prevPercentageRef = useRef(percentage);
  const hasAnimatedInitial = useRef(false);

  // Animate progress bar on mount and when percentage changes
  useEffect(() => {
    if (!animated) {
      setDisplayPercentage(percentage);
      return;
    }

    // Initial mount animation - animate from 0
    if (!hasAnimatedInitial.current) {
      hasAnimatedInitial.current = true;
      // Small delay to ensure CSS transition is applied
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 50);
      return () => clearTimeout(timer);
    }

    // Subsequent updates - animate from previous value
    if (prevPercentageRef.current !== percentage) {
      setDisplayPercentage(percentage);
      prevPercentageRef.current = percentage;
    }
  }, [percentage, animated]);

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
        <div
          className="h-full w-full bg-primary progress-bar-fill origin-left"
          style={{ transform: `scaleX(${displayPercentage / 100})` }}
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
