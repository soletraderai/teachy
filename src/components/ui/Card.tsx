import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat';
  /** Whether the card should have hover lift effect (default false) */
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', hoverable = false, children, ...props }, ref) => {
    const variants = {
      default: 'brutal-card',
      elevated: 'brutal-card shadow-brutal-hover',
      flat: 'bg-surface border-3 border-border',
    };

    const hoverClass = hoverable ? 'card-hoverable' : '';

    return (
      <div
        ref={ref}
        className={`${variants[variant]} ${hoverClass} p-6 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
