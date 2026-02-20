'use client';

import Link from 'next/link';
import { FiLayers } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

// Magnetic Button
const MagneticButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    const { x, y } = position;
    return (
        <motion.div
            style={{ position: "relative" }}
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default function Navbar() {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass-effect sticky top-0 z-50 shadow-sm border-b border-gray-100/50 bg-white/80 backdrop-blur-xl"
        >
            <nav className="container-custom py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="text-2xl font-bold text-primary-charcoal flex items-center gap-2 group">
                            <motion.span
                                whileHover={{ rotate: 180, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-action-blue to-purple-600 flex items-center justify-center text-white shadow-lg shadow-action-blue/20"
                            >
                                <FiLayers className="text-xl" />
                            </motion.span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">منصتي الرقمية</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {['المتجر', 'المميزات', 'الأسعار', 'حول المنصة', 'المدونة', 'تواصل معنا'].map((item, idx) => {
                                const hrefs: Record<string, string> = {
                                    'المتجر': '/explore',
                                    'المميزات': '/features',
                                    'الأسعار': '/pricing',
                                    'حول المنصة': '/about',
                                    'المدونة': '/blog',
                                    'تواصل معنا': '/contact'
                                };
                                return (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ y: -3 }}
                                    >
                                        <Link href={hrefs[item] || '/'} className="text-gray-600 hover:text-action-blue font-bold transition-colors relative group py-2">
                                            {item}
                                            <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-action-blue transition-all duration-300 group-hover:w-full ease-out"></span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <MagneticButton>
                            <Link href="/login"
                                className="inline-block px-6 py-2.5 rounded-full font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                دخول
                            </Link>
                        </MagneticButton>
                        <MagneticButton>
                            <Link href="/register"
                                className="inline-block px-6 py-2.5 rounded-full font-bold bg-action-blue text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden relative group"
                            >
                                <motion.span className="relative z-10 flex items-center gap-2">
                                    ابدأ مجاناً
                                    <motion.span
                                        initial={{ x: 0 }}
                                        animate={{ x: [-2, 2, -2] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        🚀
                                    </motion.span>
                                </motion.span>
                                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 left-0 ease-out"></span>
                            </Link>
                        </MagneticButton>
                    </div>
                </div>
            </nav>
        </motion.header>
    );
}
