import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // New Design System Colors - Refined for 2026
                'primary-charcoal': '#0f172a', // Deeper navy for better contrast
                'primary-indigo': {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1', // Main Indigo Brand Color
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                'action-blue': {
                    DEFAULT: '#2563eb', // More vibrant blue
                    hover: '#1d4ed8',
                },
                'action-secondary': { // Electric Purple
                    DEFAULT: '#8b5cf6',
                    hover: '#7c3aed',
                    light: '#c4b5fd',
                },
                'success-green': {
                    DEFAULT: '#10b981',
                    light: '#d1fae5',
                },
                'bg-light': '#f8fafc', 
                'card-white': '#ffffff',
                'text-muted': '#64748b',
                'border-glass': 'rgba(255, 255, 255, 0.1)',
                'bg-glass': 'rgba(255, 255, 255, 0.7)',

                // Existing colors kept for backward compatibility
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
            },
            boxShadow: {
                'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.08)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
            },
            fontFamily: {
                sans: ['var(--font-ibm)', 'system-ui', 'sans-serif'],
                heading: ['var(--font-ibm)', 'system-ui', 'sans-serif'],
                inter: ['var(--font-inter)', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
