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
                // Tmleen Brand System v4.2 Elite Emerald
                // ══════════════════════════════════════

                // Global Ink & Emerald Core
                'ink': '#0A0A0A',
                'emerald': {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981', // Main Accent
                    600: '#059669', // Royal Accent
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                    950: '#022C22',
                },

                // Aliases for clean code transition (All mapped to Emerald)
                'accent': {
                    DEFAULT: '#10B981',
                    hover: '#059669',
                    light: '#ECFDF5',
                    muted: '#6EE7B7',
                },
                'primary': {
                    DEFAULT: '#10B981',
                    50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
                    400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857',
                    800: '#065F46', 900: '#064E3B',
                },

                // Backward compatibility (Mapping old color names to Emerald)
                'action-blue': '#10B981',
                'primary-indigo': '#10B981',
                'brand': '#10B981',
                'success': '#10B981',
                'warning': '#10B981',
                'danger': '#EF4444', // Keep danger red but emerald-tinted if possible

                // Surface & Neutrals
                'surface': '#0A0A0A',
                'subtle': '#111111',
                'muted': '#A3A3A3',
                'card-white': '#111111',
                'text-muted': '#A3A3A3',
            },
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
                'md': '0 4px 12px rgba(0, 0, 0, 0.5)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6)',
                'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.8)',
                'glow': '0 0 20px rgba(16, 185, 129, 0.2)',
            },
            fontFamily: {
                sans: ['var(--font-ibm)', 'system-ui', 'sans-serif'],
                heading: ['var(--font-ibm)', 'system-ui', 'sans-serif'],
                inter: ['var(--font-inter)', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
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
