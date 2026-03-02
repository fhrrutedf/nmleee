'use client';

import { useEffect } from 'react';

/**
 * Sets a --real-vh CSS variable to window.innerHeight / 100.
 * This bypasses the broken 100vh on mobile browsers (Chrome/Safari)
 * where the address bar shrinking causes layout jumps.
 *
 * Usage in CSS:  height: calc(var(--real-vh, 1vh) * 100);
 */
export function useViewportHeight() {
    useEffect(() => {
        function setVh() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--real-vh', `${vh}px`);
        }

        setVh();

        window.addEventListener('resize', setVh);
        window.addEventListener('orientationchange', setVh);

        return () => {
            window.removeEventListener('resize', setVh);
            window.removeEventListener('orientationchange', setVh);
        };
    }, []);
}
