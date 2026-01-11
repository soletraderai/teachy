import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Small delay to trigger enter animation
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 50);

    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const typeStyles = {
    success: 'bg-success',
    error: 'bg-error text-white',
    info: 'bg-secondary',
  };

  // Animation classes: slide in from right, slide out to right
  const animationClass = isEntering
    ? 'translate-x-full opacity-0'
    : isExiting
    ? 'translate-x-full opacity-0'
    : 'translate-x-0 opacity-100';

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-out ${animationClass}`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`${typeStyles[type]} border-3 border-border shadow-brutal px-6 py-3 font-heading font-semibold flex items-center gap-3`}
      >
        <span>{message}</span>
        <button
          onClick={handleDismiss}
          className="hover:opacity-70 transition-opacity"
          aria-label="Dismiss notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
