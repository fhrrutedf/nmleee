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
    '/product',
    '/products',
    '/course',
    '/courses',
    '/learn',
    '/cart',
    '/checkout',
    '/success'
];

// All top-level known public routes
const KNOWN_PUBLIC_PATHS = [
    '', '/', '/about', '/api', '/blog', '/book-appointment', '/cancel', '/cart',
    '/certificates', '/checkout', '/contact', '/courses', '/creator', 
    '/demo', '/explore', '/features', '/learn', '/my-appointments', 
    '/my-courses', '/my-purchases', '/pricing', '/privacy', '/products', 
    '/quiz', '/showcase', '/success', '/support', '/terms'
];

export default function NavbarWrapper() {
    const pathname = usePathname();

    // Hide if it's explicitly in HIDDEN_PATHS
    const isExplicitlyHidden = HIDDEN_PATHS.some(path => pathname.startsWith(path));
    // Check if it's a seller route (/@username or /username)
    const firstSegment = `/${pathname.split('/')[1] || ''}`;
    const isUnknownRoute = !KNOWN_PUBLIC_PATHS.includes(firstSegment);
    
    // Check if path starts with /@
    const isAtUsername = pathname.startsWith('/@');

    if (isExplicitlyHidden || isUnknownRoute || isAtUsername) return null;

    return <Navbar />;
}
