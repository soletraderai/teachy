import { forwardRef, ReactNode, MouseEventHandler } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'outline'
  | 'pop-violet'
  | 'pop-pink'
  | 'pop-lime'
  | 'pop-orange'
  | 'pop-cyan'
  | 'pop-lemon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  'aria-label'?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading = false, disabled, children, type = 'button', onClick, ...props }, ref) => {
    const baseStyles = 'font-heading font-semibold border-3 border-border transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed';

    const variantStyles: Record<ButtonVariant, string> = {
      // Legacy variants
      primary: 'bg-primary hover:shadow-brutal-hover active:shadow-brutal-sm active:translate-y-0.5',
      secondary: 'bg-secondary hover:shadow-brutal-hover active:shadow-brutal-sm active:translate-y-0.5',
      danger: 'bg-error text-white hover:shadow-brutal-hover active:shadow-brutal-sm active:translate-y-0.5',
      ghost: 'bg-surface hover:bg-primary hover:shadow-brutal active:shadow-brutal-sm',
      outline: 'bg-transparent border-border hover:bg-surface hover:shadow-brutal active:shadow-brutal-sm',

      // Pop-Brutalism variants
      'pop-violet': 'bg-eg-violet text-white border-eg-ink shadow-pop-violet hover:shadow-pop-violet-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-pop-violet-pressed active:translate-x-0.5 active:translate-y-0.5',
      'pop-pink': 'bg-eg-pink text-white border-eg-ink shadow-pop-pink hover:shadow-pop-pink-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-pop-pink-pressed active:translate-x-0.5 active:translate-y-0.5',
      'pop-lime': 'bg-eg-lime text-eg-ink border-eg-ink shadow-pop-lime hover:shadow-pop-lime-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-pop-lime-pressed active:translate-x-0.5 active:translate-y-0.5',
      'pop-orange': 'bg-eg-orange text-white border-eg-ink shadow-pop-orange hover:shadow-pop-orange-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-pop-orange-pressed active:translate-x-0.5 active:translate-y-0.5',
      'pop-cyan': 'bg-eg-cyan text-white border-eg-ink shadow-pop-cyan hover:shadow-pop-cyan-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-pop-cyan-pressed active:translate-x-0.5 active:translate-y-0.5',
      'pop-lemon': 'bg-eg-lemon text-eg-ink border-eg-ink shadow-pop-lemon hover:shadow-pop-lemon-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-pop-lemon-pressed active:translate-x-0.5 active:translate-y-0.5',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    // Pop variants include their own shadow styles; legacy variants need shadow-brutal
    const isPopVariant = variant.startsWith('pop-');
    const isGhostOrOutline = variant === 'ghost' || variant === 'outline';
    const shadowStyles = !isPopVariant && !isGhostOrOutline ? 'shadow-brutal' : '';

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizes[size]} ${shadowStyles} ${className}`}
        disabled={disabled || loading}
        type={type}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
