/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7fc',
          100: '#e0eff7',
          200: '#b8daf0',
          300: '#7bbce3',
          400: '#3499d1',
          DEFAULT: '#005B94', // Precise GM Engineering Blue
          600: '#005b94',
          700: '#004978',
          800: '#003e65',
          900: '#063454',
          950: '#042137',
        },
        healthy: {
          DEFAULT: '#10B981', // Emerald 500
          light: '#E6F4EA',
          dark: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber 500
          light: '#FEF3C7',
          dark: '#92400E',
        },
        critical: {
          DEFAULT: '#EF4444', // Red 500
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        canvas: {
          DEFAULT: '#F8FAFC', // Slate 50
        },
        surface: {
          DEFAULT: '#FFFFFF', // White
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        premium: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        premiumHover: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
