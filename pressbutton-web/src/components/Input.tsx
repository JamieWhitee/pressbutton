import React from "react";
import type { FieldError } from "react-hook-form";

/**
 * Reusable Input component for forms with Instagram-inspired styling
 */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError | undefined;
  textColor?: string; // direct text color
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = "text", placeholder, error, textColor, ...rest }, ref) => (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '600',
          color: textColor || '#374151',
          fontSize: '14px'
        }}
      >
        {label}
      </label>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: error ? '2px solid #ef4444' : '2px solid #d1d5db',
          borderRadius: '12px',
          fontSize: '16px',
          outline: 'none',
          transition: 'all 0.3s ease',
          backgroundColor: '#ffffff',
          color: textColor || '#111827'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = textColor || '#3b82f6';
          e.target.style.boxShadow = `0 0 0 3px ${textColor ? textColor + '20' : '#3b82f620'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
          e.target.style.boxShadow = 'none';
        }}
        {...rest}
      />
      {error && (
        <p style={{ marginTop: '4px', fontSize: '14px', color: '#ef4444' }}>
          {error.message}
        </p>
      )}
    </div>
  )
);

Input.displayName = "Input";
export default Input;
