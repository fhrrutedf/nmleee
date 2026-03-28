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
                // ══════════════════════════════════════
                // Tmleen Brand System v1.0
                // ══════════════════════════════════════

                // Primary: Deep Emerald — Growth, Success, High Value
                'brand': {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B', // PRIMARY BRAND COLOR
                    950: '#022c22',
                },

                // Secondary: Midnight Navy — Authority, Professionalism
                'navy': {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A', // SECONDARY BRAND COLOR
                    950: '#020617',
                },

                // Accent: Burnt Gold — CTA Only
                'gold': {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309', // ACCENT CTA COLOR
                    800: '#92400E',
                    900: '#78350F',
                },

                // Utility: Sage Green — Success States
                'sage': {
                    DEFAULT: '#10B981',
                    light: '#34D399',
                    dark: '#059669',
                },

                // Semantic aliases (backward-compatible)
                'primary-charcoal': '#0F172A',
                'action-blue': {
                    DEFAULT: '#064E3B',
                    hover: '#065F46',
                },
                'action-secondary': {
                    DEFAULT: '#047857',
                    hover: '#065F46',
                    light: '#A7F3D0',
                },
                'success-green': {
                    DEFAULT: '#10B981',
                    light: '#D1FAE5',
                },
                'bg-light': '#F8FAFC',
                'card-white': '#FFFFFF',
                'text-muted': '#64748B',
                'border-glass': 'rgba(255, 255, 255, 0.1)',
                'bg-glass': 'rgba(255, 255, 255, 0.7)',

                // Legacy primary kept for any remaining references
                primary: {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                },

                // Map old indigo references to emerald
                'primary-indigo': {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                    950: '#022c22',
                },
            },
            boxShadow: {
                'premium': '0 20px 50px -12px rgba(6, 78, 59, 0.08)',
                'glass': '0 8px 32px 0 rgba(6, 78, 59, 0.05)',
                'glow': '0 0 20px rgba(6, 78, 59, 0.15)',
                'gold': '0 4px 14px rgba(180, 83, 9, 0.25)',
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
