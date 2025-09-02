import React from "react";
import type { FieldError } from "react-hook-form";

/**
 * 可复用的表单输入组件，采用Instagram风格设计
 * Reusable Input component for forms with Instagram-inspired styling
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;                    // 标签文本 | Label text
  error?: FieldError;              // 错误信息 | Error message
  textColor?: string;              // 文本颜色 | Text color
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = "text", placeholder, error, textColor = '#374151', ...rest }, ref) => {
    // 样式常量 | Style constants
    const baseStyle = {
      input: {
        width: '100%',
        padding: '12px 16px',
        border: `2px solid ${error ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '12px',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.3s ease',
        backgroundColor: '#ffffff',
        color: textColor
      },
      label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: textColor,
        fontSize: '14px'
      },
      error: {
        marginTop: '4px',
        fontSize: '14px',
        color: '#ef4444'
      }
    };

    // 焦点处理函数 | Focus handlers
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = textColor;
      e.target.style.boxShadow = `0 0 0 3px ${textColor}20`;
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
      e.target.style.boxShadow = 'none';
    };

    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={baseStyle.label}>
          {label}
        </label>
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          style={baseStyle.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {error && (
          <p style={baseStyle.error}>
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
