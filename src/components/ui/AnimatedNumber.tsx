import { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  /** The target number to animate to */
  value: number;
  /** Duration of the animation in milliseconds (default 600) */
  duration?: number;
  /** Whether to animate (default true) */
  animated?: boolean;
  /** Optional format function for the number */
  format?: (value: number) => string;
  /** Optional suffix (e.g., "%" or " sessions") */
  suffix?: string;
  /** Optional prefix (e.g., "$" or "+") */
  prefix?: string;
  /** Optional className for styling */
  className?: string;
  /** Number of decimal places (default 0) */
  decimals?: number;
}

/**
 * AnimatedNumber - Displays a number that animates/counts up smoothly.
 * Uses easeOutExpo easing for natural deceleration.
 */
export default function AnimatedNumber({
  value,
  duration = 600,
  animated = true,
  format,
  suffix = '',
  prefix = '',
  className = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);
  const prevValueRef = useRef(value);
  const hasAnimatedInitial = useRef(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    // Cancel any ongoing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = hasAnimatedInitial.current ? prevValueRef.current : 0;
    const endValue = value;
    const startTime = performance.now();

    // Easing function: easeOutExpo
    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
        hasAnimatedInitial.current = true;
      }
    };

    // Small delay for initial animation to ensure component is mounted
    if (!hasAnimatedInitial.current) {
      const timer = setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, 50);
      return () => {
        clearTimeout(timer);
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, animated]);

  // Format the display value
  const formattedValue = format
    ? format(displayValue)
    : decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString();

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
