'use client';

import Link from 'next/link';
import { FiMenu, FiX, FiChevronLeft, FiLayers } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import CartDrawer from '@/components/CartDrawer';
import { usePathname } from 'next/navigation';

const navLinks = [
    { title: 'المتجر', href: '/explore' },
    { title: 'المميزات', href: '/#features' },
    { title: 'الأسعار', href: '/pricing' },
    { title: 'المدونة', href: '/blog' },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => { setIsMenuOpen(false); }, [pathname]);
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
                <div className="flex items-center justify-between">
                    {/* Logo & Nav */}
                    <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2 group transition-all">
                        <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:bg-accent group-hover:scale-105 transition-all duration-500">
                            <FiLayers size={22} className="group-hover:rotate-12 transition-transform" />
                        </div>
                        <span className="text-xl font-black text-ink tracking-tighter">
                            TMLEEN<span className="text-accent font-light">.</span>
                        </span>
                    </Link>

                        <div className="hidden lg:flex items-center gap-6">
                            {navLinks.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-ink' : 'text-gray-500 hover:text-ink'}`}
                                >
                                    {link.title}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 items-center">
                        <CartDrawer />

                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/login" className="px-6 py-2.5 text-[10px] font-black text-gray-400 hover:text-accent transition-colors uppercase tracking-[0.2em]">
                            Portal
                        </Link>
                        <Link
                            href="/register"
                            className="bg-ink text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm shadow-black/5 hover:bg-accent hover:shadow-accent/20 active:scale-95 transition-all"
                        >
                            Establish Account
                        </Link>
                    </div>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:text-ink"
                        >
                            {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 z-[51] lg:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-white z-[52] lg:hidden flex flex-col shadow-sm">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-bold text-ink">القائمة</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-ink">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {navLinks.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.href}
                                    className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? 'bg-accent-light text-accent' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {link.title}
                                    <FiChevronLeft className="opacity-30" />
                                </Link>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-100 space-y-2">
                            <Link
                                href="/register"
                                className="w-full py-3 bg-ink text-white rounded-lg flex items-center justify-center font-semibold text-sm"
                            >
                                ابدأ مجاناً
                            </Link>
                            <Link
                                href="/login"
                                className="w-full py-3 text-center text-sm font-medium text-gray-500"
                            >
                                تسجيل الدخول
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
