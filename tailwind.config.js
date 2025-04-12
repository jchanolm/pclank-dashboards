/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Palantir-inspired color palette
          primary: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
          },
          dark: {
            DEFAULT: '#0a0a0e',
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#0a0a0e',
          },
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
        fontFamily: {
          sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
          mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'grid-pattern': 'url("/grid.svg")',
        },
        boxShadow: {
          card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'card-hover': '0 4px 20px rgba(0, 0, 0, 0.2)',
        },
        borderColor: {
          dim: 'rgba(255, 255, 255, 0.1)',
          bright: 'rgba(255, 255, 255, 0.2)',
        },
        backdropBlur: {
          xs: '2px',
        },
      },
    },
    plugins: [],
  }