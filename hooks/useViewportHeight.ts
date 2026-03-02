'use client';

import { useEffect } from 'react';

/**
 * DEFINITIVE FIX for the 100vh mobile browser bug.
 *
 * On Chrome/Safari mobile, `100vh` includes the address bar height,
 * causing sidebars to be taller than the visible screen. When the
 * address bar disappears, overflow is visible as a white gap.
 *
 * This hook measures `window.innerHeight` (the ACTUAL visible height)
 * and stores it as --real-vh on the html element.
 *
 * Usage in JSX:  style={{ height: 'calc(var(--real-vh, 1vh) * 100)' }}
 */
export function useViewportHeight() {
    useEffect(() => {
        function update() {
            // window.innerHeight reflects the CURRENT visible area
            // (excludes the address bar when it's shown)
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--real-vh', `${vh}px`);
        }

        // Set immediately on mount
        update();

        // Re-measure on resize (orientation change, address bar toggle)
        window.addEventListener('resize', update);

        // Also listen to visualViewport which fires when address bar hides/shows
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', update);
        }

        return () => {
            window.removeEventListener('resize', update);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', update);
            }
        };
    }, []);
}
