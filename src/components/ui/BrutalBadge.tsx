import { ReactNode } from 'react';
import MaterialIcon from './MaterialIcon';

export type BadgeColor = 'violet' | 'pink' | 'lime' | 'orange' | 'cyan' | 'lemon' | 'ink';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BrutalBadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Color variant */
  color?: BadgeColor;
  /** Size variant */
  size?: BadgeSize;
  /** Optional Material Icon name to display before text */
  icon?: string;
  /** Additional CSS classes */
  className?: string;
}

// Size-specific styles
const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs uppercase tracking-wide',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

// Icon sizes corresponding to badge sizes
const iconSizes: Record<BadgeSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

/**
 * BrutalBadge - A pill-shaped badge/tag component following Pop-Brutalism design
 *
 * Features:
 * - Pill shape with heavy 2px ink border
 * - Bold Space Grotesk font
 * - Multiple color variants from the Electric Garden palette
 * - Optional leading icon
 * - Three size variants (sm uses uppercase text)
 *
 * @example
 * // Basic usage
 * <BrutalBadge>New</BrutalBadge>
 *
 * // With color variant
 * <BrutalBadge color="lime">Success</BrutalBadge>
 *
 * // With icon
 * <BrutalBadge color="violet" icon="star">Featured</BrutalBadge>
 *
 * // Small uppercase badge
 * <BrutalBadge size="sm" color="pink">Hot</BrutalBadge>
 */
function BrutalBadge({
  children,
  color = 'violet',
  size = 'md',
  icon,
  className = '',
}: BrutalBadgeProps) {
  const colorClass = `pop-badge-${color}`;
  const sizeClass = sizeStyles[size];
  const iconSize = iconSizes[size];

  return (
    <span
      className={`pop-badge ${colorClass} ${sizeClass} ${className}`.trim()}
      role="status"
    >
      {icon && (
        <MaterialIcon
          name={icon}
          size={iconSize}
          decorative
          className="mr-1 -ml-0.5"
        />
      )}
      {children}
    </span>
  );
}

export default BrutalBadge;
