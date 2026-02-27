'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

// Pages where we DON'T want to show the public Footer
const HIDDEN_PATHS = [
    '/dashboard',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/admin',
];

export default function FooterWrapper() {
    const pathname = usePathname();

    // Check if current path starts with any of the hidden paths or starts with /@
    const shouldHide = HIDDEN_PATHS.some(path => pathname.startsWith(path)) || pathname.startsWith('/@');

    if (shouldHide) return null;

    return <Footer />;
}
