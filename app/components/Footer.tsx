'use client';

import Link from 'next/link';

const footerLinks = {
    'المنتجات': [
        { title: 'استكشف المتجر', href: '/explore' },
        { title: 'مميزات المنصة', href: '/features' },
        { title: 'خطط الأسعار', href: '/pricing' },
        { title: 'نسخة تجريبية', href: '/demo' },
    ],
    'الموارد': [
        { title: 'مركز المساعدة', href: '/help' },
        { title: 'المدونة الرقمية', href: '/blog' },
        { title: 'قصص النجاح', href: '/cases' },
        { title: 'الأسئلة الشائعة', href: '/faq' },
    ],
    'قانوني': [
        { title: 'تواصل معنا', href: '/contact' },
        { title: 'شروط الخدمة', href: '/terms' },
        { title: 'سياسة الخصوصية', href: '/privacy' },
        { title: 'سياسة الكوكيز', href: '/cookies' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-[#0A0A0A] text-white py-24 border-t border-white/10 selection:bg-emerald-500 text-white/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                    
                    {/* Brand Identifier */}
                    <div className="md:col-span-4 max-w-sm">
                        <div className="flex items-center gap-4 mb-10 group cursor-default">
                             <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-500/20 transition-all group-hover:scale-110 group-hover:shadow-glow">
                                ت
                            </div>
                            <span className="text-3xl font-black tracking-tighter">تمالين</span>
                        </div>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-12">
                            البنية التحتية المتكاملة لبيع المنتجات الرقمية والدورات التدريبية في الوطن العربي. نحن نمكّن المبدعين من بناء إمبراطورياتهم الخاصة بسهولة وأمان.
                        </p>
                        
                        {/* Newsletter Mini */}
                        <div className="flex flex-col gap-5">
                            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#10B981]">Join our ecosystem</span>
                            <div className="flex gap-2 p-2 bg-emerald-900/40 border border-emerald-500/20 rounded-2xl max-w-sm focus-within:border-emerald-500/50 transition-colors">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="bg-transparent border-none focus:ring-0 text-xs font-semibold px-4 flex-1 text-white placeholder:text-gray-400"
                                />
                                <button className="px-6 py-2.5 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 transition-all hover:shadow-glow">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category}>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#10B981] mb-10">{category}</h4>
                                <ul className="space-y-5">
                                    {links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm font-semibold text-gray-500 hover:text-white transition-all inline-block hover:translate-x-[-4px]"
                                            >
                                                {link.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fine Print / Bottom Bar */}
                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            © {new Date().getFullYear()} TMLEEN INFRASTRUCTURE. All Rights Reserved.
                        </p>
                        <div className="hidden md:flex gap-6 items-center">
                            <span className="w-1.5 h-1.5 bg-white/10 rounded-full"></span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white shadow-glow animate-pulse"></span> Service Operational
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <Link href="/terms" className="hover:text-[#10B981] transition-colors">Terms of service</Link>
                        <Link href="/privacy" className="hover:text-[#10B981] transition-colors">Privacy Policy</Link>
                        <Link href="/cookies" className="hover:text-[#10B981] transition-colors">Tracking</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
