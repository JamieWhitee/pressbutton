// Professional approach: Design tokens (variables for consistent styling)

export const designTokens = {
  // Color system - based on Material Design
  colors: {
    primary: {
      50: '#fce4ec',
      100: '#f8bbd9',
      500: '#e91e63',  // Your current primary
      600: '#d81b60',
      900: '#880e4f'
    },
    secondary: {
      500: '#9c27b0',  // Your current secondary
    },
    accent: {
      500: '#ff9800',  // Your current accent
    },
    neutral: {
      white: '#ffffff',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        500: '#6b7280',
        900: '#111827'
      }
    }
  },

  // Typography scale
  typography: {
    fontFamily: {
      primary: '"Inter", "Roboto", system-ui, -apple-system, sans-serif'
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px  
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem' // 30px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Spacing system (8px grid)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem'    // 48px
  },

  // Border radius
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.25rem', // 20px
    full: '9999px'   // Fully rounded
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  }
};

// Professional component styles using design tokens
export const buttonStyles = {
  // Primary button (your submit button)
  primary: {
    base: {
      width: '100%',
      padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
      borderRadius: designTokens.borderRadius['2xl'],
      border: 'none',
      background: `linear-gradient(135deg, ${designTokens.colors.primary[500]}, ${designTokens.colors.secondary[500]}, ${designTokens.colors.accent[500]})`,
      color: designTokens.colors.neutral.white,
      fontSize: designTokens.typography.fontSize.base,
      fontWeight: designTokens.typography.fontWeight.bold,
      fontFamily: designTokens.typography.fontFamily.primary,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Professional easing
      boxShadow: designTokens.shadows.lg,
      marginBottom: designTokens.spacing.sm
    },
    hover: {
      transform: 'scale(1.02) translateY(-1px)', // Subtle lift effect
      boxShadow: designTokens.shadows.xl
    },
    disabled: {
      cursor: 'not-allowed',
      opacity: 0.6,
      transform: 'none'
    }
  },

  // Secondary button (your "Create Account" button)  
  secondary: {
    base: {
      width: '100%',
      padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
      borderRadius: designTokens.borderRadius['2xl'],
      border: `2px solid ${designTokens.colors.primary[500]}`,
      background: 'transparent',
      color: designTokens.colors.primary[500],
      fontSize: designTokens.typography.fontSize.base,
      fontWeight: designTokens.typography.fontWeight.bold,
      fontFamily: designTokens.typography.fontFamily.primary,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'none'
    },
    hover: {
      background: designTokens.colors.primary[500],
      color: designTokens.colors.neutral.white,
      transform: 'scale(1.02) translateY(-1px)'
    },
    disabled: {
      cursor: 'not-allowed',
      opacity: 0.6,
      transform: 'none'
    }
  }
};
