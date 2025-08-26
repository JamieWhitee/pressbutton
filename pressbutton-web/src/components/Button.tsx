import React from "react";

/**
 * Basic reusable Button component for forms and actions.
 * Keep it simple and let specific pages handle custom styling via style prop or className.
 *
 * Props:
 * - type: button type ("button", "submit", "reset")
 * - children: button content (usually text)
 * - loading: optional, shows loading state
 * - disabled: optional, disables the button
 * - className: optional, for custom Tailwind or CSS classes
 * - style: optional, for inline styles (use this for specific page designs)
 * - ...rest: any other button props (onClick, etc.)
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  children,
  loading = false,
  disabled,
  className = "",
  style,
  ...rest
}) => {
  // Basic default styles - can be overridden by className or style prop
  const defaultStyle: React.CSSProperties = {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#3b82f6',
    color: 'white',
    opacity: disabled || loading ? 0.6 : 1,
    ...style // Allow style prop to override defaults
  };

  return (
    <button
      type={type}
      className={className}
      style={defaultStyle}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
