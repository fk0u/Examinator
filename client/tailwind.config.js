import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Target body.dark instead of html.dark for Qwik SSR compatibility
  darkMode: ["class", "[class~='dark']"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', DEFAULT: '#3b82f6',
        },
        secondary: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', DEFAULT: '#facc15',
        },
        surface: {
          50: '#ffffff', 100: '#f8fafc', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a',
        },
        accent: {
          100: '#fef3c7', 300: '#fcd34d', 400: '#facc15',
          500: '#f59e0b', 600: '#d97706',
        },
        success: '#10b981', warning: '#f59e0b', danger: '#ef4444', info: '#0ea5e9',
        "background-light": "#f7f5f8", "background-dark": "#171022",
      },
      fontFamily: {
        sans: ["Inter", "Outfit", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"
      },
    },
  },
  plugins: [forms, containerQueries],
};