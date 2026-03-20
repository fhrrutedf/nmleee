'use client';

import Link from 'next/link';
import { FiLayers, FiTwitter, FiLinkedin, FiFacebook, FiInstagram, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { motion } from 'framer-motion';

const footerLinks = [
    {
        title: 'المنتج',
        links: [
            { name: 'المتجر', href: '/explore' },
            { name: 'المميزات', href: '/#features' },
            { name: 'الأسعار', href: '/pricing' },
            { name: 'المدونة', href: '/blog' }
        ]
    },
    {
        title: 'الشركة',
        links: [
            { name: 'عن المنصة', href: '/about' },
            { name: 'تواصل معنا', href: '/contact' },
            { name: 'الأسئلة الشائعة', href: '/faq' }
        ]
    },
    {
        title: 'قانوني',
        links: [
            { name: 'سياسة الخصوصية', href: '/privacy' },
            { name: 'الشروط والأحكام', href: '/terms' },
            { name: 'سياسة الاسترجاع', href: '/refund' }
        ]
    }
];

export default function Footer() {
    return (
        <footer className="bg-primary-charcoal text-gray-400 py-20 border-t border-gray-800/50 relative z-10 overflow-hidden">
            {/* Top Gradient Line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-action-blue to-transparent opacity-50"></div>
            
            <div className="container-custom relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-3 group">
                                <motion.div 
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-12 h-12 rounded-xl bg-action-blue flex items-center justify-center text-white shadow-lg shadow-action-blue/20"
                                >
                                    <FiLayers size={24} />
                                </motion.div>
                                <span className="text-2xl font-black text-white tracking-tight">منصتي الرقمية</span>
                            </Link>
                        </div>
                        <p className="text-gray-400 leading-relaxed font-medium max-w-sm text-lg">
                            قوتك في عالم التجارة الرقمية. نوفر لك أفضل الأدوات لإنشاء متجرك الخاص وبيع خبراتك ومنتجاتك للعالم العربي بكل سهولة وأمان.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { icon: <FiFacebook />, href: '#' },
                                { icon: <FiInstagram />, href: '#' },
                                { icon: <FiTwitter />, href: '#' },
                                { icon: <FiLinkedin />, href: '#' }
                            ].map((social, i) => (
                                <Link 
                                    key={i} 
                                    href={social.href}
                                    className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-action-blue hover:text-white hover:border-action-blue hover:-translate-y-1 transition-all duration-300"
                                >
                                    {social.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerLinks.map((section, i) => (
                        <div key={i} className="space-y-8">
                            <h4 className="text-white font-black text-lg tracking-wide uppercase">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <Link 
                                            href={link.href} 
                                            className="text-gray-400 hover:text-action-blue hover:translate-x-[-8px] flex items-center transition-all duration-300 font-bold"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-sm font-bold">
                        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} منصتي الرقمية.</p>
                        <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-700"></span>
                        <p className="flex items-center gap-2">
                             صنع بكل ❤️ في المنطقة العربية
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-sm">
                            <FiMapPin className="text-action-blue" />
                            <span>دبي، الإمارات العربية المتحدة</span>
                        </div>
                        <Link href="/contact" className="text-white font-black hover:text-action-blue transition-colors flex items-center gap-2">
                             المركز التعليمي <FiInstagram />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
