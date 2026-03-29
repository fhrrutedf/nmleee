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
                // Tmleen Brand System v2.1 (Ink & Accent Elite)
                // ══════════════════════════════════════

                // Ink — near-black for text & primary buttons
                'ink': '#0A0A0A',

                // Accent — ONE blue, used sparingly
                'accent': {
                    DEFAULT: '#10B981',
                    hover: '#064e3b',
                    light: '#ECFDF5',
                    muted: '#93C5FD',
                    50: '#ECFDF5',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#065f46',
                    700: '#064e3b',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },

                // Surface grays
                'surface': '#FFFFFF',
                'subtle': '#F9FAFB',
                'muted': '#6B7280',
                'border-color': 'rgba(255, 255, 255, 0.1)',

                // Semantic
                'success': { DEFAULT: '#10B981', light: '#F0FDF4' },
                'warning': { DEFAULT: '#10B981', light: '#FFFBEB' },
                'danger': { DEFAULT: '#10B981', light: '#FEF2F2' },

                // ── Backward compatible aliases (NOW ALIASED TO V2 ELITE) ──
                'primary-charcoal': '#0A0A0A',
                'action-blue': {
                    DEFAULT: '#10B981',
                    hover: '#064e3b',
                    light: '#ECFDF5',
                },
                'action-secondary': {
                    DEFAULT: '#10B981',
                    hover: '#1E40AF',
                    light: '#DBEAFE',
                },
                'success-green': {
                    DEFAULT: '#10B981',
                    light: '#F0FDF4',
                },
                'bg-light': '#0A0A0A',
                'card-white': '#FFFFFF',
                'text-muted': '#6B7280',
                'border-glass': 'rgba(255, 255, 255, 0.1)',
                'bg-glass': 'rgba(10, 10, 10, 0.9)',

                // Re-mapping EVERYTHING to follow the NEW ACCENT
                'brand': {
                    50: '#ECFDF5', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD',
                    400: '#60A5FA', 500: '#3B82F6', 600: '#065f46', 700: '#064e3b',
                    800: '#1E40AF', 900: '#1E3A8A', 950: '#172554',
                },
                'navy': {
                    50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB',
                    400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151',
                    800: '#1F2937', 900: '#111827', 950: '#030712',
                },
                primary: {
                    50: '#ECFDF5', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD',
                    400: '#60A5FA', 500: '#3B82F6', 600: '#065f46', 700: '#064e3b',
                    800: '#1E40AF', 900: '#1E3A8A',
                },
                'primary-indigo': {
                    50: '#ECFDF5', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD',
                    400: '#60A5FA', 500: '#3B82F6', 600: '#065f46', 700: '#064e3b',
                    800: '#1E40AF', 900: '#1E3A8A', 950: '#172554',
                },
            },
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
                'md': '0 4px 12px rgba(0, 0, 0, 0.06)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
                'glass': '0 4px 16px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 20px rgba(6, 95, 70, 0.3)',
                'gold': 'none',
            },
            fontFamily: {
                sans: ['var(--font-ibm)', 'system-ui', 'sans-serif'],
                heading: ['var(--font-ibm)', 'system-ui', 'sans-serif'],
                inter: ['var(--font-inter)', 'sans-serif'],
            },
            animation: { 'fade-in': 'fadeIn 0.2s ease-out' },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
