import React from 'react';
import { designTokens, buttonStyles } from '../styles/designTokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

/**
 * Professional Button component using design tokens
 *
 * Features:
 * - Consistent styling using design system
 * - Smooth hover animations with professional easing curves
 * - Loading states with proper accessibility
 * - Built-in responsive behavior
 *
 * @param variant - 'primary' for main actions, 'secondary' for alternative actions
 * @param isLoading - Shows loading state and disables interaction
 */
export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  // Get the appropriate style configuration from design tokens
  const styleConfig = buttonStyles[variant];
  const isDisabled = disabled || isLoading;

  // Professional hover effect handlers
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      // Apply hover styles from design tokens
      Object.assign(e.currentTarget.style, styleConfig.hover);
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      // Reset to base styles
      Object.assign(e.currentTarget.style, styleConfig.base);
    }
    onMouseLeave?.(e);
  };

  // Combine base styles with any custom styles passed as props
  const combinedStyle = {
    ...styleConfig.base,
    ...(isDisabled && styleConfig.disabled),
    ...style
  };

  return (
    <button
      style={combinedStyle}
      disabled={isDisabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Loading spinner - professional implementation */}
      {isLoading && (
        <svg
          style={{
            animation: 'spin 1s linear infinite',
            marginRight: designTokens.spacing.sm,
            width: '16px',
            height: '16px'
          }}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            style={{ opacity: 0.25 }}
          />
          <path
            fill="currentColor"
            style={{ opacity: 0.75 }}
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {/* Show different text based on loading state */}
      {isLoading && variant === 'primary' ? 'Loading...' : children}
    </button>
  );
}
