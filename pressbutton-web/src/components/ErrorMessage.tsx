import React from "react";

/**
 * Basic reusable ErrorMessage component for form validation errors.
 * Keep it simple and consistent across the app.
 *
 * Props:
 * - error: can be a react-hook-form error object, string, or undefined
 * - style: optional inline styles for customization
 * - className: optional CSS classes for customization
 */
interface ErrorMessageProps {
  error?: { message?: string } | string | undefined;
  style?: React.CSSProperties;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  style,
  className = ""
}) => {
  // If there is no error, render nothing
  if (!error) return null;

  // Extract the message from error object or use string directly
  const message = typeof error === "string" ? error : error?.message;

  // Default styling for error messages
  const defaultStyle: React.CSSProperties = {
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '4px',
    display: 'block',
    ...style // Allow style prop to override defaults
  };

  return (
    <p
      className={className}
      style={defaultStyle}
    >
      {message}
    </p>
  );
};

export default ErrorMessage;
