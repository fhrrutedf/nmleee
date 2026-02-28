'use client';

import { useState } from 'react';
import {
    FiLink, FiFacebook, FiInstagram, FiTwitter, FiStar,
    FiShoppingCart, FiClock, FiCheckCircle, FiShare2,
    FiGrid, FiPackage, FiVideo, FiCopy, FiChevronDown,
    FiChevronUp, FiSearch, FiMail, FiMessageCircle,
    FiZap, FiUsers, FiCalendar, FiAward, FiArrowLeft
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProfileClientProps {
    creator: any;
    products: any[];
}

// ─── Helpers ─────────────────────────────────────────────────────────
// Strip HTML tags + decode common HTML entities so we show plain text
function stripHtml(html: string | null | undefined): string {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')          // remove HTML tags
        .replace(/&nbsp;/gi, ' ')           // non-breaking space
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')              // collapse multiple spaces
        .trim();
}

// Valid image URL (not a dashboard route, not broken)
function isValidImage(url: string | null | undefined): boolean {
    if (!url || url === '' || url === 'null' || url === 'undefined') return false;
    if (url.includes('/dashboard/') || url.includes('localhost')) return false;
    try { new URL(url); return true; } catch { return false; }
}

export default function ProfileClient({ creator, products }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'products' | 'courses'>('all');
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [search, setSearch] = useState('');
    const [featuredExpanded, setFeaturedExpanded] = useState(false);

    const brandColor = creator.brandColor || '#D41295';

    const hasCourses = products.some(p => p.category === 'courses' || p.category === 'course');
    const hasDigital = products.some(p => p.category !== 'courses' && p.category !== 'course');
    const totalSold = products.reduce((sum, p) => sum + (p.soldCount || 0), 0);
    const joinYear = new Date(creator.createdAt).getFullYear();

    const filteredProducts = products.filter(p => {
        const matchTab = activeTab === 'all'
            || (activeTab === 'courses' && (p.category === 'courses' || p.category === 'course'))
            || (activeTab === 'products' && p.category !== 'courses' && p.category !== 'course');
        const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const featuredProduct = products[0];

    const getImage = (url: string | null | undefined, type: 'course' | 'product') => {
        if (!isValidImage(url)) {
            return type === 'course'
                ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop';
        }
        return url!;
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
            await navigator.share({ title: `متجر ${creator.name}`, url });
        } else {
            setShowShareMenu(!showShareMenu);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ رابط المتجر!');
        setShowShareMenu(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans" style={{ '--brand': brandColor } as React.CSSProperties}>

            {/* ══════════════════════════════════════════
                HERO: Cover Image
            ══════════════════════════════════════════ */}
            <div
                className="h-56 sm:h-72 md:h-80 w-full relative overflow-hidden"
                style={{
                    background: creator.coverImage
                        ? `url(${creator.coverImage}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${brandColor}ee 0%, ${brandColor}55 60%, #7c3aed44 100%)`
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

                {/* Branded watermark pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 20% 80%, ${brandColor} 0%, transparent 60%),
                                      radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 60%)`
                }} />
            </div>

            {/* ══════════════════════════════════════════
                PROFILE CARD
            ══════════════════════════════════════════ */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/60 dark:shadow-black/40 -mt-16 sm:-mt-20 relative z-10 overflow-hidden">

                    {/* Top accent line */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${brandColor}, #7c3aed)` }} />

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start">

                            {/* Avatar */}
                            <div className="relative flex-shrink-0 -mt-16 sm:-mt-20 z-10">
                                <div
                                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-900"
                                    style={{ boxShadow: `0 0 0 4px ${brandColor}40, 0 20px 40px -8px ${brandColor}60` }}
                                >
                                    {creator.avatar ? (
                                        <Image src={creator.avatar} alt={creator.name} fill className="object-cover" priority />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white" style={{ background: `linear-gradient(135deg, ${brandColor}, #7c3aed)` }}>
                                            {creator.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {/* Verified badge */}
                                <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-md">
                                    <FiCheckCircle className="text-lg" style={{ color: brandColor }} />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center sm:text-right w-full min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{creator.name}</h1>
                                        <p className="text-sm font-bold mt-0.5 font-mono" style={{ color: brandColor }}>@{creator.username}</p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
                                        {[
                                            creator.facebook && { href: creator.facebook, icon: <FiFacebook size={16} />, label: 'فيسبوك' },
                                            creator.twitter && { href: creator.twitter, icon: <FiTwitter size={16} />, label: 'تويتر' },
                                            creator.instagram && { href: creator.instagram, icon: <FiInstagram size={16} />, label: 'انستغرام' },
                                            creator.website && { href: creator.website, icon: <FiLink size={16} />, label: 'الموقع' },
                                        ].filter(Boolean).map((s: any, i) => (
                                            <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                                                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-white transition-all hover:-translate-y-0.5"
                                                style={{ ['--hover-bg' as any]: brandColor }}
                                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = brandColor)}
                                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                                            >
                                                {s.icon}
                                            </a>
                                        ))}

                                        {/* Share */}
                                        <div className="relative">
                                            <button
                                                onClick={handleShare}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold text-sm transition-all"
                                            >
                                                <FiShare2 size={15} /> مشاركة
                                            </button>
                                            <AnimatePresence>
                                                {showShareMenu && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                                        className="absolute left-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50"
                                                    >
                                                        <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-right transition-colors">
                                                            <FiCopy className="text-gray-400" /> نسخ رابط المتجر
                                                        </button>
                                                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(`اكتشف منتجات ${creator.name}`)}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 text-right transition-colors">
                                                            <FiTwitter className="text-gray-400" /> مشاركة على تويتر
                                                        </a>
                                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 text-right transition-colors">
                                                            <FiFacebook className="text-gray-400" /> مشاركة على فيسبوك
                                                        </a>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                {creator.bio && (
                                    <div className="mt-4">
                                        <p className={`text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base ${!isBioExpanded ? 'line-clamp-2' : ''}`}>
                                            {creator.bio}
                                        </p>
                                        {creator.bio.length > 120 && (
                                            <button onClick={() => setIsBioExpanded(!isBioExpanded)}
                                                className="mt-1 text-xs font-bold flex items-center gap-1 transition-opacity hover:opacity-70"
                                                style={{ color: brandColor }}>
                                                {isBioExpanded ? <><FiChevronUp /> إخفاء</> : <><FiChevronDown /> قراءة المزيد</>}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ─── Stats Bar ─── */}
                        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            {[
                                { icon: <FiPackage />, value: products.length, label: 'منتج' },
                                { icon: <FiUsers />, value: totalSold, label: 'عميل' },
                                { icon: <FiCalendar />, value: joinYear, label: 'عضو منذ' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                                        <span style={{ color: brandColor }}>{stat.icon}</span> {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    FEATURED PRODUCT (if any)
                ══════════════════════════════════════════ */}
                {featuredProduct && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <FiZap className="text-lg" style={{ color: brandColor }} />
                            <h2 className="font-black text-lg text-gray-900 dark:text-white">المنتج المميز</h2>
                        </div>

                        <Link href={(() => {
                            const base = featuredProduct.category === 'courses'
                                ? `/courses/${featuredProduct.slug || featuredProduct.id}`
                                : `/product/${featuredProduct.id}`;
                            return brandColor ? `${base}?brand=${encodeURIComponent(brandColor)}` : base;
                        })()}>
                            <div className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row h-auto sm:h-64">

                                {/* Image */}
                                <div className="relative w-full sm:w-80 h-52 sm:h-full flex-shrink-0 overflow-hidden">
                                    <Image
                                        src={getImage(featuredProduct.image, featuredProduct.category === 'courses' ? 'course' : 'product')}
                                        alt={featuredProduct.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-l from-white dark:from-gray-900 via-transparent to-transparent hidden sm:block" />
                                    <div className="absolute top-3 right-3">
                                        <span className="text-xs font-black px-3 py-1.5 rounded-full text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${brandColor}, #7c3aed)` }}>
                                            ⭐ مميز
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex flex-col justify-center p-6 sm:p-8 flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {featuredProduct.category === 'courses'
                                            ? <span className="text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full flex items-center gap-1"><FiVideo size={10} /> دورة تدريبية</span>
                                            : <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full flex items-center gap-1"><FiPackage size={10} /> منتج رقمي</span>
                                        }
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-action-blue transition-colors line-clamp-2">
                                        {featuredProduct.title}
                                    </h3>
                                    {featuredProduct.description && (() => {
                                        const cleanDesc = stripHtml(featuredProduct.description);
                                        const isLong = cleanDesc.length > 140;
                                        return cleanDesc ? (
                                            <div className="mb-4">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                    {isLong && !featuredExpanded ? cleanDesc.slice(0, 140) + '...' : cleanDesc}
                                                </p>
                                                {isLong && (
                                                    <button
                                                        onClick={e => { e.preventDefault(); setFeaturedExpanded(v => !v); }}
                                                        className="text-xs font-bold mt-1 flex items-center gap-1"
                                                        style={{ color: brandColor }}
                                                    >
                                                        {featuredExpanded ? <><FiChevronUp size={12} /> إخفاء</> : <><FiChevronDown size={12} /> قراءة المزيد</>}
                                                    </button>
                                                )}
                                            </div>
                                        ) : null;
                                    })()}
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-2xl font-black" style={{ color: brandColor }}>
                                            {featuredProduct.isFree || featuredProduct.price === 0 ? 'مجاني' : `${featuredProduct.price} ج.م`}
                                        </span>
                                        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg group-hover:scale-105 transition-transform"
                                            style={{ background: `linear-gradient(135deg, ${brandColor}, #7c3aed)` }}>
                                            <FiShoppingCart size={15} /> اشتري الآن <FiArrowLeft size={13} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════
                    PRODUCTS SECTION
                ══════════════════════════════════════════ */}
                <div className="mt-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <FiAward className="text-xl" style={{ color: brandColor }} />
                            <h2 className="font-black text-xl text-gray-900 dark:text-white">
                                جميع المنتجات
                                <span className="mr-2 text-sm font-bold px-2.5 py-0.5 rounded-full text-white" style={{ background: brandColor }}>{products.length}</span>
                            </h2>
                        </div>
                    </div>

                    {/* Search + Tabs row */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="ابحث في منتجات البائع..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pr-9 pl-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 transition-all"
                                style={{ '--tw-ring-color': `${brandColor}40` } as any}
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 flex-shrink-0">
                            {[
                                { id: 'all', label: 'الكل', icon: <FiGrid size={13} /> },
                                hasDigital && { id: 'products', label: 'منتجات', icon: <FiPackage size={13} /> },
                                hasCourses && { id: 'courses', label: 'دورات', icon: <FiVideo size={13} /> },
                            ].filter(Boolean).map((tab: any) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={activeTab === tab.id
                                        ? { background: brandColor, color: '#fff', boxShadow: `0 4px 14px -2px ${brandColor}60` }
                                        : {}}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab + search}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-20">
                                    <FiSearch className="text-5xl text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-500 font-semibold">لا توجد نتائج</p>
                                    {search && <button onClick={() => setSearch('')} className="mt-2 text-sm font-bold" style={{ color: brandColor }}>مسح البحث</button>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredProducts.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, scale: 0.97 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.04 }}
                                        >
                                            <Link
                                                href={(() => {
                                                    const base = product.category === 'courses' ? `/courses/${product.slug || product.id}` : `/product/${product.id}`;
                                                    return brandColor ? `${base}?brand=${encodeURIComponent(brandColor)}` : base;
                                                })()}
                                                className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 h-full">

                                                {/* Image */}
                                                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                    <Image
                                                        src={getImage(product.image, product.category === 'courses' ? 'course' : 'product')}
                                                        alt={product.title}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        loading={index > 4 ? 'lazy' : 'eager'}
                                                    />
                                                    {/* Badges */}
                                                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
                                                        {product.isFree || product.price === 0
                                                            ? <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow">مجاني</span>
                                                            : <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-lg">{product.price} ج.م</span>
                                                        }
                                                        {(product.category === 'courses' || product.category === 'course') && (
                                                            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                                                <FiVideo size={9} /> دورة
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-action-blue transition-colors text-sm leading-snug">
                                                        {product.title}
                                                    </h3>
                                                    {product.description && stripHtml(product.description) && (
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mb-3">
                                                            {stripHtml(product.description)}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                                        {(product.soldCount > 0) && (
                                                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                                <FiUsers size={11} /> {product.soldCount} {product.category === 'courses' ? 'طالب' : 'مبيعة'}
                                                            </span>
                                                        )}
                                                        {!(product.soldCount > 0) && <span />}
                                                        <span className="text-base font-black" style={{ color: brandColor }}>
                                                            {product.isFree || product.price === 0 ? 'مجاني' : `${product.price} ج.م`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ══════════════════════════════════════════
                    BOOK CONSULTATION (if set)
                ══════════════════════════════════════════ */}
                {creator.consultationPrice !== undefined && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-10 p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${brandColor} 0%, #7c3aed 100%)` }}
                    >
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-right">
                            <div>
                                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                                    <FiClock className="text-white/80" />
                                    <span className="text-white/80 text-sm font-bold uppercase tracking-widest">جلسة 1-على-1</span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black mb-1">احجز استشارة خاصة</h3>
                                <p className="text-white/80 text-sm">
                                    {creator.consultationPrice > 0 ? `${creator.consultationPrice} ج.م / جلسة` : 'متاحة مجاناً'}
                                </p>
                            </div>
                            <Link
                                href={`/${creator.username}/book`}
                                className="flex-shrink-0 px-8 py-3.5 bg-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm"
                                style={{ color: brandColor }}
                            >
                                احجز الآن ←
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════
                    CONTACT SECTION
                ══════════════════════════════════════════ */}
                {(creator.email || creator.phone) && (
                    <div className="mt-10 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                        <h2 className="font-black text-xl text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                            <FiMessageCircle style={{ color: brandColor }} />
                            تواصل مع البائع
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {creator.phone && (
                                <a
                                    href={`https://wa.me/${creator.phone.replace(/\D/g, '')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    واتساب
                                </a>
                            )}
                            {creator.email && (
                                <a
                                    href={`mailto:${creator.email}`}
                                    className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 font-bold transition-all hover:-translate-y-0.5"
                                    style={{ borderColor: brandColor, color: brandColor }}
                                    onMouseEnter={e => { e.currentTarget.style.background = brandColor; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = brandColor; }}
                                >
                                    <FiMail size={18} />
                                    البريد الإلكتروني
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════
                    FOOTER
                ══════════════════════════════════════════ */}
                <div className="mt-12 mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-black"
                            style={{ background: `linear-gradient(135deg, ${brandColor}, #7c3aed)` }}>
                            ت
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">مدعوم من </span>
                        <Link href="/" className="text-xs font-black" style={{ color: brandColor }}>منصة تقانة</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
