'use client';

import Link from 'next/link';
import { FiLayers } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <footer className="bg-primary-charcoal text-gray-400 py-16 border-t border-gray-800/50 relative z-10 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-action-blue to-transparent opacity-50"></div>

            <div className="container-custom relative z-10">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                                <FiLayers className="text-action-blue" />
                            </motion.div>
                            منصتي الرقمية
                        </div>
                        <p className="leading-relaxed mb-6 font-medium">الشريك التقني الأول لصناع المحتوى العربي. نمنحك أفضل الأدوات لتكبر وتنتشر وتزيد أرباحك.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 text-lg tracking-wider">المنتج</h4>
                        <ul className="space-y-4">
                            {['المميزات', 'الأسعار', 'المدونة'].map((link, i) => (
                                <li key={i}>
                                    <Link href={link === 'المميزات' ? '/features' : link === 'الأسعار' ? '/pricing' : link === 'المدونة' ? '/blog' : '/'} className="hover:text-white hover:-translate-x-2 inline-block transition-all duration-300">{link}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 text-lg tracking-wider">الشركة</h4>
                        <ul className="space-y-4">
                            {['عن المنصة', 'تواصل معنا'].map((link, i) => (
                                <li key={i}>
                                    <Link href={link === 'عن المنصة' ? '/about' : link === 'تواصل معنا' ? '/contact' : '/'} className="hover:text-white hover:-translate-x-2 inline-block transition-all duration-300">{link}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 text-lg tracking-wider">قانوني</h4>
                        <ul className="space-y-4">
                            {['سياسة الخصوصية', 'الشروط والأحكام'].map((link, i) => (
                                <li key={i}>
                                    <Link href={link === 'سياسة الخصوصية' ? '/privacy' : link === 'الشروط والأحكام' ? '/terms' : '/'} className="hover:text-white hover:-translate-x-2 inline-block transition-all duration-300">{link}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 text-center flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-medium">جميع الحقوق محفوظة &copy; {new Date().getFullYear()} منصتي الرقمية.</p>
                    <div className="flex gap-4">
                        {/* Placeholder for social links */}
                        <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-action-blue flex items-center justify-center transition-colors cursor-pointer text-white">X</div>
                        <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-action-blue flex items-center justify-center transition-colors cursor-pointer text-white">in</div>
                        <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-action-blue flex items-center justify-center transition-colors cursor-pointer text-white">Fb</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
