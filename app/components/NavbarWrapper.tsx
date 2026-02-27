'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

// Pages where we DON'T want to show the public Navbar & Footer
const HIDDEN_PATHS = [
    '/dashboard',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/admin',
];

export default function NavbarWrapper() {
    const pathname = usePathname();

    // Check if current path starts with any of the hidden paths or starts with /@
    const shouldHide = HIDDEN_PATHS.some(path => pathname.startsWith(path)) || pathname.startsWith('/@');

    if (shouldHide) return null;

    return <Navbar />;
}
