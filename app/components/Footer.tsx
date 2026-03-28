'use client';

import Link from 'next/link';
import { FiTwitter, FiLinkedin, FiFacebook, FiInstagram, FiArrowUpRight, FiMapPin } from 'react-icons/fi';
import { motion } from 'framer-motion';

const footerLinks = [
    {
        title: 'المنتج',
        links: [
            { name: 'استكشف المنتجات', href: '/explore' },
            { name: 'المميزات', href: '/#features' },
            { name: 'خطط الأسعار', href: '/pricing' },
            { name: 'المدونة', href: '/blog' }
        ]
    },
    {
        title: 'الدعم',
        links: [
            { name: 'مركز المساعدة', href: '/help' },
            { name: 'تواصل معنا', href: '/contact' },
            { name: 'الأسئلة الشائعة', href: '/faq' },
            { name: 'حالة النظام', href: '/status' }
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
        <footer className="bg-navy-900 text-slate-400 py-24 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-800/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-800/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/3" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-3 group">
                                <motion.div 
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.6, ease: "circOut" }}
                                    className="w-12 h-12 rounded-2xl bg-brand-900 flex items-center justify-center text-white shadow-xl shadow-emerald-900/20"
                                >
                                    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M8 32 L20 8 L32 32" />
                                        <path d="M14 22 H26" />
                                    </svg>
                                </motion.div>
                                <span className="text-3xl font-black text-white tracking-tighter">تمالين</span>
                            </Link>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-medium max-w-sm text-lg">
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
                                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-brand-900 hover:text-white hover:border-brand-900 hover:-translate-y-1.5 transition-all duration-500"
                                >
                                    {social.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerLinks.map((section, i) => (
                        <div key={i} className="space-y-8">
                            <h4 className="text-white font-black text-sm tracking-widest uppercase opacity-50">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <Link 
                                            href={link.href} 
                                            className="text-slate-400 hover:text-white flex items-center gap-1 group transition-all duration-300 font-bold"
                                        >
                                            {link.name}
                                            <FiArrowUpRight className="opacity-0 group-hover:opacity-100 -translate-y-1 translate-x-1 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-sm font-bold">
                        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} تمالين.</p>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="hover:text-white transition-colors">الخصوصية</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">الشروط</Link>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 text-sm font-bold bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                            <FiMapPin className="text-brand-500" />
                            <span className="text-slate-300">المنطقة العربية، العالم</span>
                        </div>
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
                             صنع بكل <span className="text-red-500 animate-pulse">❤️</span> للمبدعين
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
