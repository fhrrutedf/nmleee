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
        <footer className="bg-emerald-600 text-white py-20 border-t border-white/5 selection:bg-emerald-600/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
                    
                    {/* Brand Identifier */}
                    <div className="md:col-span-4 max-w-sm">
                        <div className="flex items-center gap-3 mb-8 group cursor-default">
                             <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-600/20 shadow-accent/20 transition-transform group-hover:scale-110">
                                ت
                            </div>
                            <span className="text-2xl font-bold tracking-tighter">تمالين</span>
                        </div>
                        <p className="text-gray-400 text-sm font-bold leading-relaxed mb-10">
                            البنية التحتية المتكاملة لبيع المنتجات الرقمية والدورات التدريبية في الوطن العربي. نحن نمكّن المبدعين من بناء إمبراطورياتهم الخاصة بسهولة وأمان.
                        </p>
                        
                        {/* Newsletter Mini */}
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Join our ecosystem</span>
                            <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-xl max-w-sm">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="bg-transparent border-none focus:ring-0 text-xs font-bold px-3 flex-1 text-white"
                                />
                                <button className="px-4 py-2 bg-white text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category}>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-8">{category}</h4>
                                <ul className="space-y-4">
                                    {links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm font-bold text-gray-400 hover:text-white transition-all inline-block hover:translate-x-[-4px]"
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
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            © {new Date().getFullYear()} TMLEEN INFRASTRUCTURE. All Rights Reserved.
                        </p>
                        <div className="hidden md:flex gap-4 items-center">
                            <span className="w-1 h-1 bg-surface/10 rounded-xl"></span>
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-xl bg-emerald-600 "></span> Service Operational
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms of service</Link>
                        <Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
                        <Link href="/cookies" className="hover:text-emerald-600 transition-colors">Tracking</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
