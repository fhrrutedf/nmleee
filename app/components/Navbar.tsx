'use client';

import Link from 'next/link';
import { FiLayers, FiMenu, FiX, FiChevronLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MagneticButton } from '@/components/animations/MagneticButton';
import CartDrawer from '@/components/CartDrawer';
import { usePathname } from 'next/navigation';

const navLinks = [
    { title: 'المتجر', href: '/explore' },
    { title: 'المميزات', href: '/#features' },
    { title: 'الأسعار', href: '/pricing' },
    { title: 'حول المنصة', href: '/about' },
    { title: 'المدونة', href: '/blog' },
    { title: 'تواصل معنا', href: '/contact' }
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Scroll lock
    useEffect(() => {
        if (isMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
    }, [isMenuOpen]);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50"
        >
            <nav className="container-custom py-4">
                <div className="flex items-center justify-between">
                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-12">
                        <Link href="/" className="text-xl md:text-2xl font-bold font-heading text-primary-charcoal flex items-center gap-2 group">
                            <motion.span
                                whileHover={{ rotate: 180, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-action-blue to-purple-600 flex items-center justify-center text-white shadow-lg shadow-action-blue/20"
                            >
                                <FiLayers className="text-xl" />
                            </motion.span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">تمالين</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link, idx) => (
                                <motion.div key={idx} whileHover={{ y: -2 }}>
                                    <Link 
                                        href={link.href} 
                                        className={`font-bold transition-all relative group py-2 ${pathname === link.href ? 'text-action-blue' : 'text-gray-500 hover:text-action-blue'}`}
                                    >
                                        {link.title}
                                        <span className={`absolute bottom-0 right-0 h-0.5 bg-action-blue transition-all duration-300 ease-out ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Actions & Mobile Toggle */}
                    <div className="flex gap-2 md:gap-4 items-center">
                        <div className="flex items-center gap-1 md:gap-3">
                            <CartDrawer />
                            
                            <div className="hidden sm:flex items-center gap-2">
                                <MagneticButton>
                                    <Link href="/login" className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                        دخول
                                    </Link>
                                </MagneticButton>
                                <MagneticButton>
                                    <Link href="/register" className="px-6 py-2.5 rounded-xl bg-action-blue text-white font-black shadow-lg shadow-action-blue/20 hover:shadow-action-blue/40 transition-all">
                                        ابدأ مجاناً
                                    </Link>
                                </MagneticButton>
                            </div>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2.5 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 rounded-xl transition-all text-gray-600"
                        >
                            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[51] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-full max-w-xs bg-white z-[52] lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <span className="font-black text-xl text-primary-charcoal">القائمة</span>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                                {navLinks.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.href}
                                        className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${pathname === link.href ? 'bg-action-blue/10 text-action-blue' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {link.title}
                                        <FiChevronLeft className={pathname === link.href ? 'opacity-100' : 'opacity-30'} />
                                    </Link>
                                ))}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
                                <Link 
                                    href="/register" 
                                    className="w-full py-4 bg-action-blue text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-action-blue/20"
                                >
                                    أنشئ متجرك مجاناً
                                </Link>
                                <Link 
                                    href="/login" 
                                    className="w-full py-4 text-center font-bold text-gray-500 hover:text-primary-charcoal transition-colors"
                                >
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
