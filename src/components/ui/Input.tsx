import { InputHTMLAttributes, forwardRef, ReactNode, useEffect, useState, useRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [shouldShake, setShouldShake] = useState(false);
    const prevErrorRef = useRef<string | undefined>(undefined);

    // Trigger shake animation when error appears or changes
    useEffect(() => {
      if (error && error !== prevErrorRef.current) {
        setShouldShake(true);
        const timer = setTimeout(() => setShouldShake(false), 400);
        return () => clearTimeout(timer);
      }
      prevErrorRef.current = error;
    }, [error]);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-heading font-semibold text-text mb-2"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2 border-3 border-border bg-surface font-body text-text
            focus:outline-none focus:shadow-brutal transition-shadow
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error ? 'border-error input-error-highlight' : ''}
            ${shouldShake ? 'input-error-shake' : ''}
            ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-error font-body"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-sm text-text/70 font-body"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
