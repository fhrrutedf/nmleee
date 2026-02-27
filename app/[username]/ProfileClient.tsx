'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMapPin, FiLink, FiFacebook, FiInstagram, FiTwitter, FiStar, FiShoppingCart, FiClock, FiCheckCircle, FiShare2, FiMonitor, FiGrid, FiPackage, FiVideo, FiCopy, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProfileClientProps {
    creator: any;
    products: any[];
}

export default function ProfileClient({ creator, products }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'products' | 'courses' | 'consultations'>('all');
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

    const handleShare = async () => {
        const url = window.location.href;
        
        // Use native Web Share API on mobile
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
            try {
                await navigator.share({
                    title: `متجر ${creator.name} | منصة تمكين`,
                    url: url
                });
            } catch (err) {
                console.error('Error sharing', err);
            }
        } else {
            // Show dropdown on desktop
            setShowShareMenu(!showShareMenu);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ رابط المتجر بنجاح!');
        setShowShareMenu(false);
    };

    const brandColor = creator.brandColor || '#0ea5e9';

    const hasCourses = products.some(p => p.category === 'courses' || p.category === 'course');
    const hasDigital = products.some(p => p.category !== 'courses' && p.category !== 'course');
    const hasConsultation = creator.consultationPrice !== undefined;

    const filteredProducts = products.filter(product => {
        if (activeTab === 'all') return true;
        if (activeTab === 'courses') return product.category === 'courses' || product.category === 'course';
        if (activeTab === 'products') return product.category !== 'courses' && product.category !== 'course';
        return false;
    });

    const getValidImageUrl = (url: string | null | undefined, type: 'course' | 'product') => {
        if (!url || url === '' || url === '/dashboard/products/new' || url === 'null' || url === 'undefined') {
            return type === 'course' 
                ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop';
        }
        return url;
    };

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark pb-32 font-sans selection:bg-black/10 dark:selection:bg-white/10" style={{ '--brand-color': brandColor } as React.CSSProperties}>

            {/* Spectacular Cover Image Area */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="h-[40vh] sm:h-[50vh] relative overflow-hidden bg-gradient-to-br"
                style={{
                    background: creator.coverImage
                        ? `url(${creator.coverImage}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${brandColor}dd, ${brandColor}44)`
                }}
            >
                <div className="absolute inset-0 bg-black/20 dark:bg-black/40 mix-blend-overlay"></div>
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg-light dark:from-bg-dark to-transparent"></div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10">
                {/* Profile Card */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                    className="bg-white/80 dark:bg-card-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/40 p-6 md:p-10 mb-16 border border-white/40 dark:border-white/5 relative overflow-hidden"
                >
                    <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: brandColor }}></div>
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: brandColor }}></div>

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-right relative z-10">
                        {/* Avatar */}
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl border-4 border-white dark:border-card-white shadow-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 -mt-20 sm:-mt-28 relative group z-20"
                        >
                            {creator.avatar ? (
                                <Image
                                    src={creator.avatar}
                                    alt={creator.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl font-black text-white" style={{ backgroundColor: brandColor }}>
                                    {creator.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </motion.div>

                        {/* Creator Info */}
                        <div className="flex-1 w-full space-y-5 relative">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black text-primary-charcoal dark:text-white mb-2 flex items-center justify-center md:justify-start gap-2 tracking-tight">
                                        {creator.name}
                                        <FiCheckCircle title="متجر موثق" style={{ color: brandColor }} className="text-2xl drop-shadow-sm" />
                                    </h1>
                                    <p className="font-bold tracking-wider font-mono ltr flex justify-center md:justify-start" style={{ color: brandColor }}>@{creator.username}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center relative">
                                    <div className="flex gap-2">
                                        {creator.facebook && (
                                            <a href={creator.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:text-white" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                                <FiFacebook size={20} />
                                            </a>
                                        )}
                                        {creator.twitter && (
                                            <a href={creator.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:text-white" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                                <FiTwitter size={20} />
                                            </a>
                                        )}
                                        {creator.instagram && (
                                            <a href={creator.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:text-white" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                                <FiInstagram size={20} />
                                            </a>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <button onClick={handleShare} className="flex items-center gap-2 px-4 py-3 rounded-xl justify-center transition-all bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-md font-medium">
                                            <FiShare2 /> مشاركة
                                        </button>
                                        
                                        <AnimatePresence>
                                            {showShareMenu && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50 overflow-hidden"
                                                >
                                                    <button onClick={copyLink} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-right">
                                                        <FiCopy /> نسخ رابط المتجر
                                                    </button>
                                                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(`اكتشف أفضل المنتجات من ${creator.name}`)}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-[#e8f5fd] dark:hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] rounded-lg transition-colors text-right">
                                                        <FiTwitter /> شارك عبر تويتر
                                                    </a>
                                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-[#e8f0fe] dark:hover:bg-[#1877f2]/10 hover:text-[#1877f2] rounded-lg transition-colors text-right">
                                                        <FiFacebook /> شارك عبر فيسبوك
                                                    </a>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {creator.bio && (
                                <div>
                                    <p className={`text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl text-lg md:text-xl font-medium ${!isBioExpanded ? 'line-clamp-2' : ''}`}>
                                        {creator.bio}
                                    </p>
                                    {creator.bio.length > 100 && (
                                        <button 
                                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                                            className="text-sm font-bold mt-2 flex items-center gap-1 hover:opacity-80 transition-opacity"
                                            style={{ color: brandColor }}
                                        >
                                            {isBioExpanded ? 'إخفاء التفاصيل' : 'قراءة المزيد'} 
                                            {isBioExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                        </button>
                                    )}
                                </div>
                            )}

                            {creator.website && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-semibold pb-2">
                                    <FiLink style={{ color: brandColor }} />
                                    <a href={creator.website} target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors block truncate max-w-xs" style={{ color: brandColor }}>
                                        {creator.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}

                            {/* Book Consultation Section */}
                            {creator.consultationPrice !== undefined && (
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="mt-6 p-6 sm:p-5 border-2 border-transparent hover:border-action-blue/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-l from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-900/50 rounded-2xl shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 text-white rounded-2xl shadow-inner bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, ${brandColor}, ${brandColor}dd)` }}>
                                            <FiClock className="text-3xl" />
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <span className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 tracking-wide uppercase">مباشر 1-على-1</span>
                                            <span className="font-black text-2xl text-primary-charcoal dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                                                احجز جلسة استشارية خاصة
                                            </span>
                                            <span className="font-bold mt-1 inline-block" style={{ color: brandColor }}>
                                                {creator.consultationPrice > 0 ? `${creator.consultationPrice} ج.م` : 'متاحة مجاناً'}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/${creator.username}/book`}
                                        className="w-full sm:w-auto px-10 py-5 rounded-xl font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95 text-xl flex items-center justify-center gap-3 tracking-wide"
                                        style={{ backgroundColor: brandColor, boxShadow: `0 10px 30px -5px ${brandColor}80` }}
                                    >
                                        <FiMonitor className="text-2xl" />
                                        احجز موعدك الآن
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Products Grid */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-primary-charcoal dark:text-white flex items-center gap-3">
                                المنتجات والدورات
                                <span className="text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: brandColor }}>{products.length}</span>
                            </h2>
                            <p className="text-text-muted font-medium mt-3 text-lg">استكشف خبرات ومنتجات <strong>{creator.name}</strong> المتاحة للاقتناء.</p>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide border-b border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`relative flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'all' ? 'text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                            style={activeTab === 'all' ? { backgroundColor: brandColor } : {}}
                        >
                            <FiGrid /> الكل
                        </button>
                        {hasDigital && (
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`relative flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'products' ? 'text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                style={activeTab === 'products' ? { backgroundColor: brandColor } : {}}
                            >
                                <FiPackage /> المنتجات الرقمية
                            </button>
                        )}
                        {hasCourses && (
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`relative flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'courses' ? 'text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                style={activeTab === 'courses' ? { backgroundColor: brandColor } : {}}
                            >
                                <FiVideo /> الدورات التدريبية
                            </button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {filteredProducts.length === 0 ? (
                                <div className="bg-white/50 dark:bg-card-white/50 backdrop-blur-sm rounded-3xl shadow-sm p-16 text-center border border-gray-100 dark:border-gray-800">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FiStar className="text-4xl text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-primary-charcoal dark:text-white mb-2">في هذا القسم قريباً</h3>
                                    <p className="text-gray-500 font-medium">لا توجد منتجات مطابقة لهذا التبويب حالياً.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredProducts.map((product, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4, delay: 0.05 * index }}
                                            key={product.id}
                                            className="h-full"
                                        >
                                            <Link href={product.category === 'courses' ? `/courses/${product.slug || product.id}` : `/product/${product.id}`} className="group relative block h-full">
                                                <div className="bg-white dark:bg-card-white rounded-2xl h-full flex flex-col border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                                    
                                                    {/* Image Area with 16:9 Aspect Ratio built-in */}
                                                    <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                                                        
                                                        {/* Static Badge at top-left explicitly */}
                                                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                                                            {product.isFree ? (
                                                                <span className="bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-md border border-green-400">
                                                                    مجاني
                                                                </span>
                                                            ) : (
                                                                <span className="bg-gray-900/80 backdrop-blur-md text-white border border-white/10 text-xs font-black px-3 py-1.5 rounded-lg shadow-md">
                                                                    مدفوع
                                                                </span>
                                                            )}
                                                            {product.category === 'courses' && (
                                                                <span className="bg-white/90 dark:bg-black/90 text-action-blue dark:text-white backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-700">
                                                                    <FiVideo /> دورة
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Skeleton loading state */}
                                                        {!loadedImages[product.id] && (
                                                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse z-0"></div>
                                                        )}

                                                        <Image
                                                            src={getValidImageUrl(product.image, product.category === 'courses' ? 'course' : 'product')}
                                                            alt={product.title}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            className={`object-cover transform group-hover:scale-105 transition-all duration-500 z-1 w-full h-full ${loadedImages[product.id] ? 'opacity-100' : 'opacity-0'}`}
                                                            onLoad={() => setLoadedImages(prev => ({ ...prev, [product.id]: true }))}
                                                            loading={index > 6 ? "lazy" : "eager"}
                                                            priority={index <= 6}
                                                        />
                                                    </div>

                                                    {/* Details Area that expands to push footer to bottom */}
                                                    <div className="p-5 flex flex-col flex-grow">
                                                        <h3 className="font-bold text-lg leading-snug text-primary-charcoal dark:text-white mb-2 line-clamp-2 group-hover:text-action-blue transition-colors flex-grow">
                                                            {product.title}
                                                        </h3>

                                                        {/* Social Proof Counter */}
                                                        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-4 bg-gray-50 dark:bg-gray-800/50 inline-table px-3 py-1.5 rounded-lg self-start">
                                                            {product.category === 'courses' ? (
                                                                `(${product.soldCount || 0} طالب)`
                                                            ) : (
                                                                `(${product.soldCount || 0} مبيعة)`
                                                            )}
                                                        </div>

                                                        {/* Price Footer */}
                                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium gap-1">
                                                                <FiShoppingCart />
                                                                <span>إضافة</span>
                                                            </div>
                                                            <span className="font-black text-xl" style={{ color: brandColor }}>
                                                                {product.isFree || product.price === 0 ? 'مجاني' : `${product.price} ج.م`}
                                                            </span>
                                                        </div>
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
            </div>
        </div>
    );
}
