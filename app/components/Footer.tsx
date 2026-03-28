'use client';

import Link from 'next/link';

const footerLinks = {
    'المنتج': [
        { title: 'المميزات', href: '/features' },
        { title: 'الأسعار', href: '/pricing' },
        { title: 'المتجر', href: '/explore' },
    ],
    'الشركة': [
        { title: 'حول المنصة', href: '/about' },
        { title: 'المدونة', href: '/blog' },
        { title: 'تواصل معنا', href: '/contact' },
    ],
    'قانوني': [
        { title: 'شروط الاستخدام', href: '/terms' },
        { title: 'سياسة الخصوصية', href: '/privacy' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center text-white text-xs font-bold">
                                ت
                            </div>
                            <span className="text-base font-bold text-ink">تمالين</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            بع منتجاتك الرقمية من مكان واحد.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-ink mb-4">{category}</h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-500 hover:text-ink transition-colors"
                                        >
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} تمالين. جميع الحقوق محفوظة.
                    </p>
                    <div className="flex gap-4 text-xs text-gray-400">
                        <Link href="/terms" className="hover:text-ink transition-colors">الشروط</Link>
                        <Link href="/privacy" className="hover:text-ink transition-colors">الخصوصية</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
