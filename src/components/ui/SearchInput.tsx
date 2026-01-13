/**
 * SearchInput Component
 * Search input with icon and clear button
 */
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import MaterialIcon from './MaterialIcon';

export interface SearchInputProps {
  /** Current search value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Submit handler (on Enter key) */
  onSubmit?: (value: string) => void;
  /** Clear handler */
  onClear?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export interface SearchInputRef {
  focus: () => void;
  clear: () => void;
}

const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(
  (
    {
      value: controlledValue,
      onChange,
      onSubmit,
      onClear,
      placeholder = 'Search...',
      disabled = false,
      className = '',
      autoFocus = false,
      size = 'md',
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const hasValue = value.length > 0;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (controlledValue === undefined) {
          setInternalValue('');
        }
        onClear?.();
      },
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    const handleClear = () => {
      if (controlledValue === undefined) {
        setInternalValue('');
      }
      onClear?.();
      inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSubmit) {
        onSubmit(value);
      }
      if (e.key === 'Escape') {
        handleClear();
      }
    };

    // Size classes
    const sizeClasses = {
      sm: 'py-1.5 pl-8 pr-8 text-sm',
      md: 'py-2.5 pl-10 pr-10 text-base',
      lg: 'py-3 pl-12 pr-12 text-lg',
    };

    const iconSizes = {
      sm: 'md' as const,
      md: 'lg' as const,
      lg: 'xl' as const,
    };

    const iconPositions = {
      sm: 'left-2',
      md: 'left-3',
      lg: 'left-4',
    };

    const clearPositions = {
      sm: 'right-1',
      md: 'right-2',
      lg: 'right-3',
    };

    return (
      <div className={`relative ${className}`}>
        {/* Search Icon */}
        <div
          className={`absolute ${iconPositions[size]} top-1/2 transform -translate-y-1/2 text-text/50 pointer-events-none`}
        >
          <MaterialIcon name="search" size={iconSizes[size]} decorative />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`w-full ${sizeClasses[size]} bg-surface border-3 border-border rounded font-body text-text placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Search"
        />

        {/* Clear Button */}
        {hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute ${clearPositions[size]} top-1/2 transform -translate-y-1/2 text-text/50 hover:text-text transition-colors p-1`}
            aria-label="Clear search"
          >
            <MaterialIcon name="close" size={iconSizes[size]} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
