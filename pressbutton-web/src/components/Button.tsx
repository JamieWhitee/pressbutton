import React from 'react';

/**
 * 专业按钮组件，采用简洁设计风格
 * Professional Button component with clean design
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;       // 按钮内容 | Button content
  variant?: 'primary' | 'secondary'; // 按钮类型 | Button variant
  isLoading?: boolean;             // 加载状态 | Loading state
}

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  // 按钮样式配置 | Button style configuration
  const baseStyles = {
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    minHeight: '48px'
  };

  // 根据variant选择颜色方案 | Color scheme based on variant
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)'
    },
    secondary: {
      background: '#ffffff',
      color: '#666666',
      border: '2px solid #e0e0e0',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }
  };

  // 禁用状态样式 | Disabled state styles
  const disabledStyles = {
    opacity: 0.6,
    cursor: 'not-allowed'
  };

  // 组合最终样式 | Combine final styles
  const finalStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...(disabled || isLoading ? disabledStyles : {}),
    ...style
  };

  // 加载动画样式 | Loading animation styles
  const spinnerStyles = {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <>
      {/* CSS动画定义 | CSS animation definition */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <button
        style={finalStyles}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* 加载指示器 | Loading indicator */}
        {isLoading && <div style={spinnerStyles} />}

        {/* 按钮文本 | Button text */}
        {isLoading ? 'Loading...' : children}
      </button>
    </>
  );
}
