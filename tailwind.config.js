/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主色调 - 暖赭红，像和纸上的朱印
        primary: {
          50: '#fdf5f2',
          100: '#f9e8e0',
          200: '#f2cfc1',
          300: '#e8ad96',
          400: '#db8566',
          500: '#c75b39', // 主色
          600: '#b54d30',
          700: '#963e28',
          800: '#7d3526',
          900: '#662f23',
        },
        // 中性色 - 暖灰系，带微暖色调
        neutral: {
          50: '#faf9f7',
          100: '#f5f3ef',
          200: '#e8e4dd',
          300: '#d4cfc5',
          400: '#b5afa3',
          500: '#9a9285',
          600: '#7d766b',
          700: '#5e5850',
          800: '#3f3b36',
          900: '#262421',
          950: '#1a1816',
        },
        // 表面色
        surface: {
          light: '#faf9f7',
          DEFAULT: '#f5f3ef',
          dark: '#1a1816',
        },
        // 语义色
        success: {
          light: '#e8f5e9',
          DEFAULT: '#4a7c59',
          dark: '#2d5a3d',
        },
        warning: {
          light: '#fff3e0',
          DEFAULT: '#b3873e',
          dark: '#8a6630',
        },
        error: {
          light: '#fce8e8',
          DEFAULT: '#b54a4a',
          dark: '#8a3535',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        // 精简的字号系统，使用 1.25 比例
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.375rem' }],
        base: ['1rem', { lineHeight: '1.75rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.15' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      spacing: {
        // 4pt 基准系统
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
        'soft': '0 4px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
        'medium': '0 8px 24px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)',
        'lift': '0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-sine': 'cubic-bezier(0.37, 0, 0.63, 1)',
      },
      transitionDuration: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 400ms ease-out-quart forwards',
        'fade-in-up': 'fade-in-up 500ms ease-out-quart forwards',
        'scale-in': 'scale-in 300ms ease-out-quart forwards',
        'slide-in-right': 'slide-in-right 300ms ease-out-quart forwards',
      },
      maxWidth: {
        'prose': '65ch',
      },
    },
  },
  plugins: [],
}
