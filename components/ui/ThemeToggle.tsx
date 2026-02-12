'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" />; // Prevent hydration mismatch
    }

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative w-12 h-7 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-blue"
            aria-label="Toggle Dark Mode"
        >
            <motion.div
                className="absolute left-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center transform"
                animate={{
                    x: isDark ? 20 : 0,
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF'
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
                {isDark ? (
                    <FiMoon className="text-yellow-400 text-xs" />
                ) : (
                    <FiSun className="text-orange-400 text-xs" />
                )}
            </motion.div>
        </button>
    );
}
