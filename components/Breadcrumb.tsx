/**
 * Breadcrumb component مع JSON-LD Schema
 * يدعم التنقل الهرمي ويُحسن ظهور الموقع في نتائج البحث
 */

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    const SITE_URL = 'https://manasadigital.com';

    // JSON-LD Schema للـ Breadcrumb
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'الرئيسية',
                item: SITE_URL,
            },
            ...items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 2,
                name: item.label,
                ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
            })),
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <nav
                aria-label="مسار التنقل"
                className={`flex items-center gap-1.5 text-sm text-gray-500 flex-wrap ${className}`}
                dir="rtl"
            >
                <a
                    href="/"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    الرئيسية
                </a>

                {items.map((item, index) => (
                    <span key={index} className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        {item.href && index < items.length - 1 ? (
                            <a href={item.href} className="hover:text-emerald-400 transition-colors">
                                {item.label}
                            </a>
                        ) : (
                            <span className="text-gray-300">{item.label}</span>
                        )}
                    </span>
                ))}
            </nav>
        </>
    );
}
