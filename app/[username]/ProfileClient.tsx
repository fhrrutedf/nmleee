'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
    FiLink, FiFacebook, FiInstagram, FiTwitter, FiStar,
    FiShoppingCart, FiClock, FiCheckCircle, FiShare2,
    FiGrid, FiPackage, FiVideo, FiCopy, FiChevronDown,
    FiChevronUp, FiSearch, FiMail, FiMessageCircle,
    FiZap, FiUsers, FiCalendar, FiAward, FiArrowLeft,
    FiBell, FiBellOff, FiHeart, FiTag, FiTrendingUp,
    FiDollarSign, FiPercent, FiList, FiArrowDown,
    FiChevronRight, FiShield
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiDelete, handleApiError } from '@/lib/safe-fetch';

interface ProfileClientProps {
    creator: any;
    products: any[];
    bundles?: any[];
    stats: {
        totalSold: number;
        averageRating: number;
        totalReviews: number;
        totalRevenue: number;
    };
    coupons?: any[];
}

// ─── Brand Helpers ──────────────────────────────────────────────────────────

/** Returns hex color with alpha (0–1) as 2-digit hex suffix */
function alpha(hex: string, a: number): string {
    const n = Math.round(a * 255).toString(16).padStart(2, '0');
    return hex + n;
}

/** Border-radius based on brandButtonStyle */
function getBtnRadius(style: string): string {
    if (style === 'pill') return '9999px';
    if (style === 'square') return '4px';
    return '12px'; // rounded (default)
}

/** Card radius */
function getCardRadius(style: string): string {
    if (style === 'pill') return '24px';
    if (style === 'square') return '4px';
    return '16px';
}

/** Font family based on brandFont */
function getFontFamily(font: string): string {
    switch (font) {
        case 'modern': return "'Inter', 'Cairo', sans-serif";
        case 'elegant': return "'Playfair Display', 'Cairo', serif";
        case 'bold': return "'Montserrat', 'Cairo', sans-serif";
        default: return "'Cairo', 'Inter', sans-serif";
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function stripHtml(html: string | null | undefined): string {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function isValidImage(url: string | null | undefined): boolean {
    if (!url || url === '' || url === 'null' || url === 'undefined') return false;
    if (url.includes('/dashboard/') || url.includes('localhost')) return false;
    try { new URL(url); return true; } catch { return false; }
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ rating, count, size = 'sm', color }: { rating: number; count?: number; size?: 'xs' | 'sm' | 'md'; color: string }) {
    const px = size === 'xs' ? 12 : size === 'sm' ? 15 : 18;
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                    <FiStar
                        key={s}
                        style={{ width: px, height: px, color: s <= Math.round(rating) ? '#FBBF24' : '#374151', fill: s <= Math.round(rating) ? '#FBBF24' : 'none' }}
                    />
                ))}
            </div>
            {count !== undefined && <span style={{ fontSize: 11, color: '#6B7280' }}>({count})</span>}
        </div>
    );
}

// ─── Wishlist Button ──────────────────────────────────────────────────────────
function WishlistButton({ productId, courseId, brandColor }: { productId?: string; courseId?: string; brandColor: string }) {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function check() {
            try {
                const p = new URLSearchParams();
                if (productId) p.append('productId', productId);
                if (courseId) p.append('courseId', courseId);
                const res = await apiGet(`/api/wishlist?${p}`);
                setIsInWishlist(res?.isInWishlist);
            } catch (_) {}
        }
        check();
    }, [productId, courseId]);

    const toggle = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsLoading(true);
        try {
            if (isInWishlist) {
                const p = new URLSearchParams();
                if (productId) p.append('productId', productId);
                if (courseId) p.append('courseId', courseId);
                await apiDelete(`/api/wishlist?${p}`);
                setIsInWishlist(false); toast.success('تمت الإزالة من المفضلة');
            } else {
                await apiPost('/api/wishlist', { productId, courseId });
                setIsInWishlist(true); toast.success('تمت الإضافة للمفضلة');
            }
        } catch(error) { toast.error(handleApiError(error) || 'يجب تسجيل الدخول أولاً'); } finally { setIsLoading(false); }
    };

    return (
        <button onClick={toggle} disabled={isLoading}
            style={{ padding: 8, borderRadius: 8, transition: 'all 0.2s', color: isInWishlist ? '#ef4444' : '#9CA3AF', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <FiHeart style={{ width: 16, height: 16, fill: isInWishlist ? '#ef4444' : 'none', opacity: isLoading ? 0.5 : 1 }} />
        </button>
    );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard({ cardRadius }: { cardRadius: string }) {
    return (
        <div style={{ borderRadius: cardRadius, overflow: 'hidden', background: '#111', animation: 'pulse 1.5s infinite' }}>
            <div style={{ aspectRatio: '4/3', background: '#1a1a1a' }} />
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ height: 14, background: '#1a1a1a', borderRadius: 6, width: '75%' }} />
                <div style={{ height: 11, background: '#1a1a1a', borderRadius: 6, width: '100%' }} />
                <div style={{ height: 11, background: '#1a1a1a', borderRadius: 6, width: '60%' }} />
            </div>
        </div>
    );
}

import BundleCard from '../components/BundleCard';
import AddToCartButton from '../components/AddToCartButton';
import CartButton from '../components/CartButton';
import CartDrawer from '../components/CartDrawer';
import LowStockBadge from '../components/LowStockBadge';
import CountdownTimer from '../components/CountdownTimer';
import SmartRecommendations from '../components/SmartRecommendations';

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ProfileClient({ creator, products, bundles = [], stats, coupons = [] }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'products' | 'courses'>('all');
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [search, setSearch] = useState('');
    const [featuredExpanded, setFeaturedExpanded] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'priceLow' | 'priceHigh' | 'rated'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [stickyVisible, setStickyVisible] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [showPriceFilter, setShowPriceFilter] = useState(false);

    // Price filter
    const prices = useMemo(() => products.map(p => p.price || 0), [products]);
    const maxPrice = useMemo(() => Math.max(...prices, 0), [prices]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice || 1000]);

    const heroRef = useRef<HTMLDivElement>(null);
    const catalogRef = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 12;

    // ── Brand identity from seller dashboard ──────────────────────────────
    const brandColor = creator.brandColor || '#10B981';
    const brandSecondary = creator.brandSecondaryColor || '#7C3AED';
    const brandFont = creator.brandFont || 'default';
    const brandButtonStyle = creator.brandButtonStyle || 'rounded';
    const brandLayout = creator.brandLayout || 'grid';
    const storeBanner = creator.storeBanner;
    const storeTagline = creator.storeTagline;

    // Computed style tokens — fully dynamic, zero Tailwind color classes
    const btnRadius = getBtnRadius(brandButtonStyle);
    const cardRadius = getCardRadius(brandButtonStyle);
    const fontFamily = getFontFamily(brandFont);
    const brandGrad = `linear-gradient(135deg, ${brandColor}, ${brandSecondary})`;
    const brandGradSoft = `linear-gradient(135deg, ${alpha(brandColor, 0.15)}, ${alpha(brandSecondary, 0.08)})`;

    // ── Effects ────────────────────────────────────────────────────────────
    useEffect(() => { const t = setTimeout(() => setIsLoading(false), 400); return () => clearTimeout(t); }, []);
    useEffect(() => { setPriceRange([0, maxPrice || 1000]); }, [maxPrice]);

    useEffect(() => {
        const handleScroll = () => {
            const hero = heroRef.current;
            if (!hero) return;
            setStickyVisible(window.scrollY > hero.offsetHeight * 0.6);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        async function checkFollowStatus() {
            try {
                const d = await apiGet(`/api/creators/${creator.username}/follow`);
                setIsFollowing(d.isFollowing); setFollowerCount(d.followerCount);
            } catch {}
        }
        checkFollowStatus();
    }, [creator.username]);

    // ── Actions ────────────────────────────────────────────────────────────
    const handleFollow = async () => {
        setIsFollowLoading(true);
        try {
            if (isFollowing) {
                const d = await apiDelete(`/api/creators/${creator.username}/follow`);
                setIsFollowing(d.isFollowing); setFollowerCount(d.followerCount); toast.success(d.message);
            } else {
                const d = await apiPost(`/api/creators/${creator.username}/follow`, {});
                setIsFollowing(d.isFollowing); setFollowerCount(d.followerCount); toast.success(d.message);
            }
        } catch(error: any) { 
            if (error?.status === 401) toast.error('يجب تسجيل الدخول للمتابعة');
            else toast.error(handleApiError(error) || 'حدث خطأ');
        } finally { setIsFollowLoading(false); }
    };

    const copyLink = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ رابط المتجر!');
        setShowShareMenu(false);
    }, []);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) await navigator.share({ title: `متجر ${creator.name}`, url });
        else setShowShareMenu(v => !v);
    };

    const scrollToCatalog = useCallback(() => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    // ── Computed data ──────────────────────────────────────────────────────
    const hasCourses = products.some(p => p.category === 'courses' || p.category === 'course');
    const hasDigital = products.some(p => p.category !== 'courses' && p.category !== 'course');
    const joinYear = new Date(creator.createdAt).getFullYear();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newProducts = products.filter(p => new Date(p.createdAt) > oneWeekAgo).slice(0, 6);
    const bestSellers = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 3);
    const isBestSeller = (id: string) => bestSellers.some(p => p.id === id);

    const filteredProducts = products.filter(p => {
        const matchTab = activeTab === 'all'
            || (activeTab === 'courses' && (p.category === 'courses' || p.category === 'course'))
            || (activeTab === 'products' && p.category !== 'courses' && p.category !== 'course');
        const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
        const matchPrice = (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1];
        return matchTab && matchSearch && matchPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'popular': return (b.soldCount || 0) - (a.soldCount || 0);
            case 'priceLow': return (a.price || 0) - (b.price || 0);
            case 'priceHigh': return (b.price || 0) - (a.price || 0);
            case 'rated': return (b.averageRating || 0) - (a.averageRating || 0);
            default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getImage = (url: string | null | undefined, type: 'course' | 'product') => {
        if (!isValidImage(url)) return type === 'course'
            ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop';
        return url!;
    };

    const featuredProduct = products[0];

    const getSalesLabel = (soldCount: number) => {
        const maxSold = Math.max(...products.map(p => p.soldCount || 0), 1);
        const pct = Math.round((soldCount / maxSold) * 100);
        if (pct >= 80) return { label: 'الأكثر مبيعاً', color: '#ef4444' };
        if (pct >= 60) return { label: 'مبيعات عالية', color: '#f59e0b' };
        if (pct >= 40) return { label: 'مبيعات جيدة', color: '#10b981' };
        return null;
    };

    const gridCols = brandLayout === 'list'
        ? 'grid-cols-1'
        : brandLayout === 'masonry'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

    // ── Inline style objects (brand-aware) ─────────────────────────────────
    const primaryBtn: React.CSSProperties = {
        background: brandGrad,
        color: '#fff',
        borderRadius: btnRadius,
        border: 'none',
        padding: '10px 22px',
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    };

    const outlineBtn: React.CSSProperties = {
        background: 'transparent',
        color: brandColor,
        borderRadius: btnRadius,
        border: `1.5px solid ${brandColor}`,
        padding: '9px 20px',
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    };

    const ghostBtn: React.CSSProperties = {
        background: alpha('#ffffff', 0.07),
        color: '#D1D5DB',
        borderRadius: btnRadius,
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
        padding: '9px 16px',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s',
    };

    // ══════════════════════════════════════════════════════════════════════════
    return (
        <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily, color: '#F9FAFB', direction: 'rtl' }}>

            {/* ── Google Fonts loader ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;600;700&family=Playfair+Display:wght@700;900&family=Montserrat:wght@700;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                .product-card:hover .card-img { transform: scale(1.08); }
                .product-card:hover .card-actions { opacity: 1; transform: translateY(0); }
                .card-img { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
                .card-actions { opacity: 0; transform: translateY(8px); transition: all 0.3s ease; }
                .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -10px ${alpha(brandColor, 0.35)}; }
                .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
                .btn-outline:hover { background: ${alpha(brandColor, 0.1)}; }
                .pill-tag { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:9999px; font-size:12px; font-weight:700; }
                input[type=range] { -webkit-appearance:none; width:100%; height:4px; background: linear-gradient(to right, ${brandColor} var(--val,50%), #333 0); border-radius:9999px; outline:none; }
                input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; background:${brandColor}; border-radius:9999px; cursor:pointer; box-shadow:0 0 0 3px ${alpha(brandColor, 0.25)}; }
                .scrollbar-hide::-webkit-scrollbar { display:none; }
                .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
            `}</style>

            {/* ════════════════════════════════════════════════════════════
                STICKY NAVBAR (appears on scroll)
            ════════════════════════════════════════════════════════════ */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: `rgba(10,10,10,0.85)`,
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${alpha(brandColor, 0.15)}`,
                transform: stickyVisible ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                justifyContent: 'space-between',
            }}>
                {/* Left: avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${brandColor}`, flexShrink: 0 }}>
                        {creator.avatar
                            ? <Image src={creator.avatar} alt={creator.name} width={36} height={36} style={{ objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', background: brandGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>{creator.name?.charAt(0)?.toUpperCase()}</div>
                        }
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: 14, color: '#F9FAFB', lineHeight: 1.2 }}>{creator.name}</p>
                        <p style={{ fontSize: 11, color: brandColor, fontWeight: 600 }}>@{creator.username}</p>
                    </div>
                </div>
                {/* Right: actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CartButton />
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                HERO — Immersive full-bleed cover
            ════════════════════════════════════════════════════════════ */}
            <div ref={heroRef} style={{ position: 'relative', height: 'min(100svh, 680px)', minHeight: 460, overflow: 'hidden' }}>

                {/* Background */}
                {(isValidImage(creator.coverImage) || isValidImage(storeBanner)) ? (
                    <Image
                        src={isValidImage(storeBanner) ? storeBanner : creator.coverImage}
                        alt={creator.name}
                        fill priority
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `radial-gradient(ellipse at 20% 50%, ${alpha(brandColor, 0.6)} 0%, transparent 60%),
                                     radial-gradient(ellipse at 80% 30%, ${alpha(brandSecondary, 0.5)} 0%, transparent 55%),
                                     linear-gradient(180deg, #0A0A0A 0%, #111 100%)`,
                    }} />
                )}

                {/* Gradient overlays */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.95) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(10,10,10,0.5) 0%, transparent 50%)` }} />

                {/* Content */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'flex-end', alignItems: 'flex-start',
                    padding: 'clamp(24px, 5vw, 60px)',
                    paddingBottom: 'clamp(40px, 6vw, 80px)',
                    maxWidth: 1200, margin: '0 auto', right: 0, left: 0,
                }}>
                    {/* Avatar + verified */}
                    <div style={{ marginBottom: 20, position: 'relative', display: 'inline-block' }}>
                        <div style={{
                            width: 'clamp(72px, 10vw, 100px)', height: 'clamp(72px, 10vw, 100px)',
                            borderRadius: cardRadius, overflow: 'hidden',
                            border: `3px solid ${alpha(brandColor, 0.8)}`,
                            boxShadow: `0 0 0 6px ${alpha(brandColor, 0.2)}, 0 20px 40px -8px ${alpha(brandColor, 0.5)}`,
                        }}>
                            {creator.avatar
                                ? <Image src={creator.avatar} alt={creator.name} fill style={{ objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', background: brandGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 36px)' }}>{creator.name?.charAt(0)?.toUpperCase()}</div>
                            }
                        </div>
                        {creator.isVerified && (
                            <div style={{
                                position: 'absolute', bottom: -6, right: -6,
                                width: 28, height: 28, borderRadius: '50%',
                                background: brandGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid #0A0A0A', boxShadow: `0 4px 12px ${alpha(brandColor, 0.5)}`,
                            }}>
                                <FiCheckCircle style={{ width: 14, height: 14, color: '#fff' }} />
                            </div>
                        )}
                    </div>

                    {/* Name + username */}
                    <h1 style={{
                        fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900,
                        lineHeight: 1.05, color: '#fff', marginBottom: 8,
                        textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                    }}>
                        {creator.name}
                    </h1>
                    {storeTagline ? (
                        <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: alpha('#fff', 0.8), marginBottom: 6, fontWeight: 500, maxWidth: 560 }}>
                            {storeTagline}
                        </p>
                    ) : (
                        <p style={{ fontSize: 13, color: brandColor, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
                            @{creator.username}
                        </p>
                    )}

                    {/* Stats pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20, marginBottom: 28 }}>
                        {creator.showProductsCount !== false && (
                            <span style={{ background: alpha('#fff', 0.12), backdropFilter: 'blur(10px)', border: `1px solid ${alpha('#fff', 0.15)}`, color: '#fff', borderRadius: 9999, padding: '6px 16px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiPackage style={{ width: 13, height: 13, color: brandColor }} />
                                {products.length} منتج
                            </span>
                        )}
                        {creator.showSalesCount !== false && stats.totalSold > 0 && (
                            <span style={{ background: alpha('#fff', 0.12), backdropFilter: 'blur(10px)', border: `1px solid ${alpha('#fff', 0.15)}`, color: '#fff', borderRadius: 9999, padding: '6px 16px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiUsers style={{ width: 13, height: 13, color: brandColor }} />
                                {stats.totalSold} عميل
                            </span>
                        )}
                        {creator.showRating !== false && stats.averageRating > 0 && (
                            <span style={{ background: alpha('#fff', 0.12), backdropFilter: 'blur(10px)', border: `1px solid ${alpha('#fff', 0.15)}`, color: '#fff', borderRadius: 9999, padding: '6px 16px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiStar style={{ width: 13, height: 13, color: '#FBBF24', fill: '#FBBF24' }} />
                                {stats.averageRating.toFixed(1)} ({stats.totalReviews})
                            </span>
                        )}
                        <span style={{ background: alpha('#fff', 0.12), backdropFilter: 'blur(10px)', border: `1px solid ${alpha('#fff', 0.15)}`, color: '#fff', borderRadius: 9999, padding: '6px 16px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiCalendar style={{ width: 13, height: 13, color: brandColor }} />
                            منذ {joinYear}
                        </span>
                    </div>

                    {/* CTA buttons row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                        <button onClick={scrollToCatalog} className="btn-primary hover-lift" style={{ ...primaryBtn, padding: '12px 28px', fontSize: 15, boxShadow: `0 8px 24px -4px ${alpha(brandColor, 0.5)}` }}>
                            <FiShoppingCart size={16} /> تصفح المنتجات <FiArrowDown size={14} />
                        </button>



                        {/* Social links */}
                        {[
                            creator.facebook && { href: creator.facebook, icon: <FiFacebook size={16} />, label: 'فيسبوك' },
                            creator.twitter && { href: creator.twitter, icon: <FiTwitter size={16} />, label: 'تويتر' },
                            creator.instagram && { href: creator.instagram, icon: <FiInstagram size={16} />, label: 'انستغرام' },
                            creator.website && { href: creator.website, icon: <FiLink size={16} />, label: 'الموقع' },
                        ].filter(Boolean).map((s: any, i) => (
                            <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                                style={{ ...ghostBtn, padding: '10px 14px', textDecoration: 'none' }}>
                                {s.icon}
                            </a>
                        ))}

                        {/* Share */}
                        <div style={{ position: 'relative' }}>
                            <button onClick={handleShare} style={{ ...ghostBtn, padding: '10px 14px' }}>
                                <FiShare2 size={16} />
                            </button>
                            <AnimatePresence>
                                {showShareMenu && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                        style={{ position: 'absolute', bottom: '120%', left: 0, width: 200, background: '#111', borderRadius: 14, border: `1px solid ${alpha('#fff', 0.1)}`, padding: 8, zIndex: 50, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                                        <button onClick={copyLink} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'transparent', border: 'none', color: '#D1D5DB', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'right' }}>
                                            <FiCopy style={{ color: brandColor }} /> نسخ الرابط
                                        </button>
                                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(`اكتشف متجر ${creator.name}`)}`} target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#D1D5DB', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                                            <FiTwitter style={{ color: '#1DA1F2' }} /> تويتر
                                        </a>
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#D1D5DB', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                                            <FiFacebook style={{ color: '#1877F2' }} /> فيسبوك
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <CartButton />
                    </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    style={{ position: 'absolute', bottom: 24, left: '50%', translateX: '-50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                    animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
                    onClick={scrollToCatalog}
                >
                    <span style={{ fontSize: 11, color: alpha('#fff', 0.5), fontWeight: 600, letterSpacing: 1 }}>تمرير للأسفل</span>
                    <FiChevronDown style={{ color: alpha('#fff', 0.5), width: 18, height: 18 }} />
                </motion.div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                MAIN CONTENT
            ════════════════════════════════════════════════════════════ */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', paddingBottom: 80 }}>

                {/* ── Bio Section ─────────────────────────────────────── */}
                {creator.bio && (
                    <div style={{ marginTop: 40, padding: '28px 32px', background: brandGradSoft, borderRadius: cardRadius, border: `1px solid ${alpha(brandColor, 0.2)}` }}>
                        <p style={{ color: '#D1D5DB', lineHeight: 1.8, fontSize: 15, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: isBioExpanded ? 'unset' : 3, overflow: isBioExpanded ? 'visible' : 'hidden' }}>
                            {creator.bio}
                        </p>
                        {creator.bio.length > 180 && (
                            <button onClick={() => setIsBioExpanded(v => !v)}
                                style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: brandColor, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {isBioExpanded ? <><FiChevronUp size={13} /> إخفاء</> : <><FiChevronDown size={13} /> قراءة المزيد</>}
                            </button>
                        )}
                    </div>
                )}

                {/* ── Active Coupons (horizontal scroll) ──────────────── */}
                {coupons && coupons.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginTop: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: brandGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiTag style={{ width: 15, height: 15, color: '#fff' }} />
                            </div>
                            <h2 style={{ fontWeight: 800, fontSize: 18, color: '#F9FAFB' }}>كوبونات الخصم النشطة</h2>
                        </div>
                        <div className="scrollbar-hide" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                            {coupons.map(coupon => (
                                <div key={coupon.id} style={{
                                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '14px 20px', borderRadius: cardRadius,
                                    background: `repeating-linear-gradient(-45deg, ${alpha(brandColor, 0.05)} 0px, ${alpha(brandColor, 0.05)} 5px, transparent 5px, transparent 15px)`,
                                    border: `1.5px dashed ${alpha(brandColor, 0.4)}`,
                                    cursor: 'pointer', minWidth: 200,
                                }} onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success(`تم نسخ الكود: ${coupon.code}`); }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: brandGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiPercent style={{ width: 18, height: 18, color: '#fff' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: 15, color: '#F9FAFB', letterSpacing: 1 }}>{coupon.code}</p>
                                        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                                            {coupon.type === 'percentage' ? `خصم ${coupon.value}%` : `خصم ${coupon.value}$`}
                                        </p>
                                    </div>
                                    <FiCopy style={{ width: 14, height: 14, color: alpha(brandColor, 0.7), marginRight: 'auto' }} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── New Products (horizontal scroll) ────────────────── */}
                {newProducts.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginTop: 48 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'pulse 1.5s infinite', boxShadow: '0 0 0 4px rgba(34,197,94,0.2)' }} />
                                <h2 style={{ fontWeight: 800, fontSize: 18, color: '#F9FAFB' }}>جديد هذا الأسبوع</h2>
                                <span style={{ background: alpha('#22C55E', 0.15), color: '#22C55E', borderRadius: 9999, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{newProducts.length}</span>
                            </div>
                        </div>
                        <div className="scrollbar-hide" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }}>
                            {newProducts.map(product => (
                                <Link key={product.id}
                                    href={product.category === 'courses' ? `/courses/${product.slug || product.id}` : `/product/${product.id}`}
                                    style={{ flexShrink: 0, width: 180, textDecoration: 'none', borderRadius: cardRadius, overflow: 'hidden', background: '#111', border: `1px solid ${alpha('#22C55E', 0.2)}`, display: 'block', transition: 'all 0.3s' }}
                                    className="hover-lift">
                                    <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
                                        <Image src={getImage(product.image, product.category === 'courses' ? 'course' : 'product')} alt={product.title} fill style={{ objectFit: 'cover' }} className="card-img" />
                                        <span style={{ position: 'absolute', top: 8, right: 8, background: '#22C55E', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 9999 }}>جديد</span>
                                    </div>
                                    <div style={{ padding: '12px 14px' }}>
                                        <p style={{ fontWeight: 700, fontSize: 13, color: '#F9FAFB', overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, lineHeight: 1.4 }}>{product.title}</p>
                                        <p style={{ fontSize: 13, fontWeight: 800, color: brandColor, marginTop: 6 }}>
                                            {product.isFree || product.price === 0 ? 'مجاني' : `${product.price} $`}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Featured Product ─────────────────────────────────── */}
                {featuredProduct && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 56 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: brandGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiZap style={{ width: 15, height: 15, color: '#fff' }} />
                            </div>
                            <h2 style={{ fontWeight: 800, fontSize: 18, color: '#F9FAFB' }}>المنتج المميز</h2>
                        </div>

                        <Link href={(() => {
                            const base = featuredProduct.category === 'courses' ? `/courses/${featuredProduct.slug || featuredProduct.id}` : `/product/${featuredProduct.id}`;
                            return brandColor ? `${base}?brand=${encodeURIComponent(brandColor)}` : base;
                        })()} style={{ textDecoration: 'none', display: 'block', borderRadius: cardRadius, overflow: 'hidden' }} className="product-card hover-lift">
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                background: '#111', border: `1px solid ${alpha(brandColor, 0.2)}`,
                                borderRadius: cardRadius, overflow: 'hidden', minHeight: 280,
                            }}>
                                {/* Image */}
                                <div style={{ position: 'relative', minHeight: 260, overflow: 'hidden' }}>
                                    <Image
                                        src={getImage(featuredProduct.image, featuredProduct.category === 'courses' ? 'course' : 'product')}
                                        alt={featuredProduct.title} fill priority
                                        style={{ objectFit: 'cover' }} className="card-img"
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 60%, #111 100%)' }} />
                                    <span style={{ position: 'absolute', top: 16, right: 16, background: brandGrad, color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 9999, boxShadow: `0 4px 14px ${alpha(brandColor, 0.5)}` }}>
                                        ⭐ مميز
                                    </span>
                                </div>

                                {/* Content */}
                                <div style={{ padding: 'clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: brandColor, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                                        {featuredProduct.category === 'courses' ? '● دورة تدريبية' : '● منتج رقمي'}
                                    </span>
                                    <h3 style={{ fontWeight: 900, fontSize: 'clamp(20px,3vw,30px)', color: '#F9FAFB', lineHeight: 1.2, marginBottom: 14 }}>
                                        {featuredProduct.title}
                                    </h3>
                                    {featuredProduct.description && (() => {
                                        const clean = stripHtml(featuredProduct.description);
                                        if (!clean) return null;
                                        const isLong = clean.length > 160;
                                        return (
                                            <div style={{ marginBottom: 20 }}>
                                                <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7 }}>
                                                    {isLong && !featuredExpanded ? clean.slice(0, 160) + '...' : clean}
                                                </p>
                                                {isLong && <button onClick={e => { e.preventDefault(); setFeaturedExpanded(v => !v); }} style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: brandColor, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                                    {featuredExpanded ? 'إخفاء' : 'قراءة المزيد'}
                                                </button>}
                                            </div>
                                        );
                                    })()}
                                    {featuredProduct.averageRating > 0 && (
                                        <div style={{ marginBottom: 16 }}>
                                            <StarRating rating={featuredProduct.averageRating} count={featuredProduct.reviewCount} color={brandColor} size="sm" />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                        <div>
                                            <p style={{ fontSize: 28, fontWeight: 900, color: brandColor }}>
                                                {featuredProduct.isFree || featuredProduct.price === 0 ? 'مجاني' : `${featuredProduct.price} $`}
                                            </p>
                                            {featuredProduct.originalPrice && featuredProduct.originalPrice > featuredProduct.price && (
                                                <p style={{ fontSize: 13, color: '#6B7280', textDecoration: 'line-through' }}>{featuredProduct.originalPrice} $</p>
                                            )}
                                        </div>
                                        <span style={{ ...primaryBtn, boxShadow: `0 8px 20px -4px ${alpha(brandColor, 0.5)}` }}>
                                            <FiShoppingCart size={15} /> اشتري الآن <FiArrowLeft size={13} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    PRODUCTS CATALOG
                ════════════════════════════════════════════════════════════ */}
                <div ref={catalogRef} style={{ marginTop: 64, scrollMarginTop: 80 }}>

                    {/* Section header */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: brandColor, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>الكتالوج</p>
                            <h2 style={{ fontWeight: 900, fontSize: 26, color: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 12 }}>
                                جميع المنتجات
                                <span style={{ background: brandGrad, color: '#fff', fontSize: 13, fontWeight: 700, padding: '3px 12px', borderRadius: 9999 }}>
                                    {filteredProducts.length}
                                </span>
                            </h2>
                        </div>
                    </div>

                    {/* ── Filters Bar ─────────────────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>

                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#6B7280', width: 16, height: 16 }} />
                            <input
                                type="text"
                                placeholder="ابحث في المنتجات..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                style={{
                                    width: '100%', paddingRight: 44, paddingLeft: 16, paddingTop: 12, paddingBottom: 12,
                                    background: '#111', border: `1.5px solid ${alpha(brandColor, 0.2)}`,
                                    borderRadius: btnRadius, color: '#F9FAFB', fontSize: 14, outline: 'none',
                                    fontFamily,
                                }}
                            />
                        </div>

                        {/* Controls row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

                            {/* Sort */}
                            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                                style={{ padding: '9px 14px', background: '#111', border: `1.5px solid ${alpha(brandColor, 0.2)}`, borderRadius: btnRadius, color: '#9CA3AF', fontSize: 13, cursor: 'pointer', fontFamily, outline: 'none' }}>
                                <option value="newest">الأحدث</option>
                                <option value="popular">الأكثر مبيعاً</option>
                                <option value="rated">الأعلى تقييماً</option>
                                <option value="priceLow">السعر: الأقل أولاً</option>
                                <option value="priceHigh">السعر: الأعلى أولاً</option>
                            </select>

                            {/* Price filter toggle */}
                            <button onClick={() => setShowPriceFilter(v => !v)}
                                style={{ padding: '9px 14px', background: showPriceFilter ? brandColor : '#111', border: `1.5px solid ${showPriceFilter ? brandColor : alpha(brandColor, 0.2)}`, borderRadius: btnRadius, color: showPriceFilter ? '#fff' : '#9CA3AF', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                <FiDollarSign size={13} /> السعر
                                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />}
                            </button>

                            {/* Tabs */}
                            <div style={{ display: 'flex', background: '#111', border: `1.5px solid ${alpha(brandColor, 0.15)}`, borderRadius: btnRadius, padding: 4, gap: 4, marginRight: 'auto' }}>
                                {[
                                    { id: 'all', label: 'الكل', icon: <FiGrid size={12} /> },
                                    hasDigital && { id: 'products', label: 'منتجات', icon: <FiPackage size={12} /> },
                                    hasCourses && { id: 'courses', label: 'دورات', icon: <FiVideo size={12} /> },
                                ].filter(Boolean).map((tab: any) => (
                                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                                            borderRadius: Number(btnRadius.replace('px', '')) - 2 + 'px',
                                            background: activeTab === tab.id ? brandGrad : 'transparent',
                                            color: activeTab === tab.id ? '#fff' : '#6B7280',
                                            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                                        }}>
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price range slider */}
                        <AnimatePresence>
                            {showPriceFilter && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    style={{ background: '#111', borderRadius: cardRadius, padding: '20px 24px', border: `1px solid ${alpha(brandColor, 0.15)}`, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                                        <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>نطاق السعر:</span>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: '#F9FAFB' }}>{priceRange[0]} $ — {priceRange[1]} $</span>
                                    </div>
                                    <input type="range" min={0} max={maxPrice} value={priceRange[1]}
                                        style={{ '--val': `${(priceRange[1] / (maxPrice || 1)) * 100}%` } as any}
                                        onChange={e => { setPriceRange([priceRange[0], parseInt(e.target.value)]); setCurrentPage(1); }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#4B5563' }}>
                                        <span>0 $</span><span>{Math.round(maxPrice / 2)} $</span><span>{maxPrice} $</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Products Grid ────────────────────────────────── */}
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab + search + priceRange.join('-')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            {isLoading ? (
                                <div className={`grid ${gridCols}`} style={{ gap: 24 }}>
                                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} cardRadius={cardRadius} />)}
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                                    <FiSearch style={{ width: 48, height: 48, color: '#374151', margin: '0 auto 16px' }} />
                                    <p style={{ color: '#6B7280', fontWeight: 700, fontSize: 16 }}>لا توجد نتائج</p>
                                    {(search || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                                        <button onClick={() => { setSearch(''); setPriceRange([0, maxPrice]); setCurrentPage(1); }}
                                            style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: brandColor, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                            مسح الفلاتر
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className={`grid ${gridCols}`} style={{ gap: 24 }}>
                                        {paginatedProducts.map((product, idx) => {
                                            const salesLabel = getSalesLabel(product.soldCount || 0);
                                            const productUrl = typeof window !== 'undefined'
                                                ? `${window.location.origin}${product.category === 'courses' ? `/courses/${product.slug || product.id}` : `/product/${product.id}`}`
                                                : '';
                                            const isCourse = product.category === 'courses' || product.category === 'course' || product.type === 'course';
                                            const productLink = (() => {
                                                const base = isCourse ? `/courses/${product.slug || product.id}` : `/product/${product.id}`;
                                                return brandColor ? `${base}?brand=${encodeURIComponent(brandColor)}` : base;
                                            })();

                                            return (
                                                <motion.div key={product.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }}>
                                                    <Link href={productLink} style={{ textDecoration: 'none', display: 'block', height: '100%' }} className="product-card hover-lift">
                                                        <div style={{ background: '#111', borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${alpha('#fff', 0.07)}`, height: '100%', display: 'flex', flexDirection: 'column', transition: 'border-color 0.3s' }}
                                                            onMouseEnter={e => (e.currentTarget.style.borderColor = alpha(brandColor, 0.35))}
                                                            onMouseLeave={e => (e.currentTarget.style.borderColor = alpha('#fff', 0.07))}>

                                                            {/* Image */}
                                                            <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#0D0D0D' }}>
                                                                <Image
                                                                    src={getImage(product.image, product.category === 'courses' ? 'course' : 'product')}
                                                                    alt={product.title} fill
                                                                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                                                                    style={{ objectFit: 'cover' }} className="card-img"
                                                                    loading={idx > 7 ? 'lazy' : 'eager'}
                                                                />

                                                                {/* Top badges */}
                                                                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                                    {product.isFree || product.price === 0
                                                                        ? <span style={{ background: 'rgba(34,197,94,0.9)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 9999 }}>مجاني</span>
                                                                        : <span style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.1)' }}>{product.price} $</span>
                                                                    }
                                                                    {isBestSeller(product.id) && (
                                                                        <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                            <FiTrendingUp size={9} /> الأكثر مبيعاً
                                                                        </span>
                                                                    )}
                                                                    {!isBestSeller(product.id) && salesLabel && (
                                                                        <span style={{ background: salesLabel.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                            <FiTrendingUp size={9} /> {salesLabel.label}
                                                                        </span>
                                                                    )}
                                                                    {(product.category === 'courses' || product.category === 'course') && (
                                                                        <span style={{ background: alpha(brandColor, 0.85), color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(8px)' }}>
                                                                            <FiVideo size={9} /> دورة
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Wishlist overlay */}
                                                                <div className="card-actions" style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                                                                    <WishlistButton
                                                                        productId={product.category !== 'courses' && product.category !== 'course' ? product.id : undefined}
                                                                        courseId={product.category === 'courses' || product.category === 'course' ? product.id : undefined}
                                                                        brandColor={brandColor}
                                                                    />
                                                                </div>

                                                                {/* Gradient overlay */}
                                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, #111 0%, transparent 45%)' }} />
                                                            </div>

                                                            {/* Content */}
                                                            <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                                {/* Category */}
                                                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: brandColor }}>
                                                                    {product.category === 'courses' || product.category === 'course' ? 'دورة تدريبية' : 'منتج رقمي'}
                                                                </span>

                                                                {/* Title */}
                                                                <h3 style={{ fontWeight: 800, fontSize: 15, color: '#F9FAFB', lineHeight: 1.4, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
                                                                    {product.title}
                                                                </h3>

                                                                {/* Description */}
                                                                {product.description && stripHtml(product.description) && (
                                                                    <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
                                                                        {stripHtml(product.description)}
                                                                    </p>
                                                                )}

                                                                {/* Rating */}
                                                                {(product.averageRating || 0) > 0 && (
                                                                    <StarRating rating={product.averageRating} count={product.reviewCount} color={brandColor} size="xs" />
                                                                )}

                                                                {/* Sold count */}
                                                                {(product.soldCount || 0) > 0 && (
                                                                    <p style={{ fontSize: 11, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                        <FiShoppingCart size={10} /> تم بيع {product.soldCount} مرة
                                                                    </p>
                                                                )}

                                                                {/* Extras */}
                                                                {product.stockLimit && <LowStockBadge stockLimit={product.stockLimit} soldCount={product.soldCount || 0} />}
                                                                {product.offerExpiresAt && <CountdownTimer expiresAt={product.offerExpiresAt} brandColor={brandColor} />}

                                                                {/* Price + CTA */}
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: `1px solid ${alpha('#fff', 0.06)}` }}>
                                                                    <div>
                                                                        <p style={{ fontSize: 17, fontWeight: 900, color: brandColor }}>
                                                                            {product.isFree || product.price === 0 ? 'مجاني' : `${product.price} $`}
                                                                        </p>
                                                                        {product.originalPrice && product.originalPrice > product.price && (
                                                                            <p style={{ fontSize: 11, color: '#6B7280', textDecoration: 'line-through' }}>{product.originalPrice} $</p>
                                                                        )}
                                                                    </div>
                                                                    <AddToCartButton
                                                                        product={{ ...product, user: { id: creator.id, name: creator.name, username: creator.username } }}
                                                                        variant="icon"
                                                                        brandColor={brandColor}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
                                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                                style={{ ...ghostBtn, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                                                السابق
                                            </button>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                    let page = i + 1;
                                                    if (totalPages > 5) {
                                                        if (currentPage <= 3) page = i + 1;
                                                        else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                                                        else page = currentPage - 2 + i;
                                                    }
                                                    return (
                                                        <button key={page} onClick={() => setCurrentPage(page)}
                                                            style={{ width: 38, height: 38, borderRadius: btnRadius, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: currentPage === page ? brandGrad : '#111', color: currentPage === page ? '#fff' : '#6B7280', boxShadow: currentPage === page ? `0 4px 12px ${alpha(brandColor, 0.4)}` : 'none' }}>
                                                            {page}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                                style={{ ...ghostBtn, opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
                                                التالي
                                            </button>
                                        </div>
                                    )}

                                    {/* Smart Recommendations */}
                                    {paginatedProducts.length > 0 && (
                                        <div style={{ marginTop: 60 }}>
                                            <SmartRecommendations
                                                currentProductId={paginatedProducts[0]?.id || ''}
                                                sellerId={creator.id}
                                                type="related"
                                                maxItems={4}
                                                brandColor={brandColor}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ── Bundles ──────────────────────────────────────────── */}
                {bundles && bundles.length > 0 && (
                    <div style={{ marginTop: 72 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: brandGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiPackage style={{ width: 15, height: 15, color: '#fff' }} />
                            </div>
                            <h2 style={{ fontWeight: 900, fontSize: 22, color: '#F9FAFB' }}>
                                باقات التوفير
                                <span style={{ background: brandGrad, color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 9999, marginRight: 12 }}>
                                    {bundles.length} باقة
                                </span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 24 }}>
                            {bundles.map(bundle => <BundleCard key={bundle.id} bundle={bundle} brandColor={brandColor} />)}
                        </div>
                    </div>
                )}

                {/* ── Consultation CTA ─────────────────────────────────── */}
                {creator.consultationPrice !== undefined && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        style={{ marginTop: 64, padding: 'clamp(32px, 5vw, 56px)', borderRadius: cardRadius, position: 'relative', overflow: 'hidden', background: brandGrad }}>
                        {/* Decorative blobs */}
                        <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)' }} />
                        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,0,0,0.15)' }} />
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                            <div>
                                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                                    <FiClock style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} /> جلسة 1-على-1
                                </p>
                                <h3 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, color: '#fff', marginBottom: 6 }}>
                                    احجز استشارة خاصة
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
                                    {creator.consultationPrice > 0 ? `${creator.consultationPrice} $ / جلسة` : 'متاحة مجاناً'}
                                </p>
                            </div>
                            <Link href={`/${creator.username}/book`}
                                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: btnRadius, border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', transition: 'all 0.2s' }}
                                className="btn-outline">
                                <FiCalendar size={16} /> احجز الآن ←
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* ── Contact ──────────────────────────────────────────── */}
                {(creator.email || creator.phone) && (
                    <div style={{ marginTop: 48, padding: '32px', borderRadius: cardRadius, background: '#111', border: `1px solid ${alpha('#fff', 0.07)}` }}>
                        <h2 style={{ fontWeight: 800, fontSize: 20, color: '#F9FAFB', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiMessageCircle style={{ color: brandColor }} /> تواصل مع البائع
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                            {creator.phone && (
                                <a href={`https://wa.me/${creator.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                    style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 24px', borderRadius: btnRadius, background: '#22C55E', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 8px 20px -4px rgba(34,197,94,0.4)', transition: 'all 0.2s' }}
                                    className="hover-lift">
                                    <svg style={{ width: 18, height: 18 }} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    واتساب
                                </a>
                            )}
                            {creator.email && (
                                <a href={`mailto:${creator.email}`}
                                    style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 24px', borderRadius: btnRadius, background: 'transparent', color: brandColor, fontWeight: 800, fontSize: 14, textDecoration: 'none', border: `1.5px solid ${brandColor}`, transition: 'all 0.2s' }}
                                    className="btn-outline hover-lift">
                                    <FiMail size={16} /> البريد الإلكتروني
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Cart Drawer ──────────────────────────────────────── */}
                <CartDrawer />

                {/* ── Footer ───────────────────────────────────────────── */}
                <div style={{ marginTop: 56, marginBottom: 24, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: '#111', borderRadius: 9999, border: `1px solid ${alpha(brandColor, 0.15)}` }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: brandGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fff' }}>م</div>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>مدعوم من</span>
                        <Link href="/" style={{ fontSize: 12, fontWeight: 800, color: brandColor, textDecoration: 'none' }}>منصتك الرقمية</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
