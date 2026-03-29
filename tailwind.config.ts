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
                'ink': '#1A1A1A',

                // Accent — ONE blue, used sparingly
                'accent': {
                    DEFAULT: '#2563EB',
                    hover: '#1D4ED8',
                    light: '#EFF6FF',
                    muted: '#93C5FD',
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },

                // Surface grays
                'surface': '#FFFFFF',
                'subtle': '#F9FAFB',
                'muted': '#6B7280',
                'border-color': '#E5E7EB',

                // Semantic
                'success': { DEFAULT: '#16A34A', light: '#F0FDF4' },
                'warning': { DEFAULT: '#D97706', light: '#FFFBEB' },
                'danger': { DEFAULT: '#DC2626', light: '#FEF2F2' },

                // ── Backward compatible aliases (NOW ALIASED TO V2 ELITE) ──
                'primary-charcoal': '#1A1A1A',
                'action-blue': {
                    DEFAULT: '#2563EB',
                    hover: '#1D4ED8',
                    light: '#EFF6FF',
                },
                'action-secondary': {
                    DEFAULT: '#1D4ED8',
                    hover: '#1E40AF',
                    light: '#DBEAFE',
                },
                'success-green': {
                    DEFAULT: '#16A34A',
                    light: '#F0FDF4',
                },
                'bg-light': '#F9FAFB',
                'card-white': '#FFFFFF',
                'text-muted': '#6B7280',
                'border-glass': 'rgba(0, 0, 0, 0.05)',
                'bg-glass': 'rgba(255, 255, 255, 0.9)',

                // Re-mapping EVERYTHING to follow the NEW ACCENT
                'brand': {
                    50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD',
                    400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8',
                    800: '#1E40AF', 900: '#1E3A8A', 950: '#172554',
                },
                'navy': {
                    50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB',
                    400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151',
                    800: '#1F2937', 900: '#111827', 950: '#030712',
                },
                primary: {
                    50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD',
                    400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8',
                    800: '#1E40AF', 900: '#1E3A8A',
                },
                'primary-indigo': {
                    50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD',
                    400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8',
                    800: '#1E40AF', 900: '#1E3A8A', 950: '#172554',
                },
            },
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
                'md': '0 4px 12px rgba(0, 0, 0, 0.06)',
                'lg': '0 8px 24px rgba(0, 0, 0, 0.06)',
                'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.08)',
                'glass': '0 4px 16px rgba(0, 0, 0, 0.04)',
                'glow': 'none',
                'gold': 'none',
            },
            fontFamily: {
                sans: ['var(--font-ibm)', 'system-ui', 'sans-serif'],
                heading: ['var(--font-ibm)', 'system-ui', 'sans-serif'],
                inter: ['var(--font-inter)', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
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
