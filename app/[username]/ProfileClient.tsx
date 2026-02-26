'use client';

import { useState } from 'react';
import { FiMapPin, FiLink, FiFacebook, FiInstagram, FiTwitter, FiStar, FiShoppingCart, FiClock, FiCheckCircle, FiShare2, FiMonitor, FiGrid, FiPackage, FiVideo } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProfileClientProps {
    creator: any;
    products: any[];
}

export default function ProfileClient({ creator, products }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'products' | 'courses' | 'consultations'>('all');

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            toast.success('تم نسخ رابط المتجر بنجاح!');
        }
    };

    const brandColor = creator.brandColor || '#0ea5e9'; // Default to action-blue if not set

    const hasCourses = products.some(p => p.category === 'courses' || p.category === 'course');
    const hasDigital = products.some(p => p.category !== 'courses' && p.category !== 'course');
    const hasConsultation = creator.consultationPrice !== undefined;

    const filteredProducts = products.filter(product => {
        if (activeTab === 'all') return true;
        if (activeTab === 'courses') return product.category === 'courses' || product.category === 'course';
        if (activeTab === 'products') return product.category !== 'courses' && product.category !== 'course';
        return false;
    });

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
                {/* Overlay Gradients for smooth blending */}
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
                    {/* Decorative accent glow depending on brand color */}
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
                                <img
                                    src={creator.avatar}
                                    alt={creator.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl font-black text-white" style={{ backgroundColor: brandColor }}>
                                    {creator.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </motion.div>

                        {/* Creator Info */}
                        <div className="flex-1 w-full space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black text-primary-charcoal dark:text-white mb-2 flex items-center justify-center md:justify-start gap-2 tracking-tight">
                                        {creator.name}
                                        <FiCheckCircle title="متجر موثق" style={{ color: brandColor }} className="text-2xl drop-shadow-sm" />
                                    </h1>
                                    <p className="font-bold tracking-wider font-mono ltr flex justify-center md:justify-start" style={{ color: brandColor }}>@{creator.username}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                    <div className="flex gap-2">
                                        {creator.facebook && (
                                            <a href={creator.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg hover:text-white" style={{ '--hover-bg': brandColor } as any} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                                <FiFacebook size={20} />
                                            </a>
                                        )}
                                        {creator.twitter && (
                                            <a href={creator.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg hover:text-white" style={{ '--hover-bg': brandColor } as any} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                                <FiTwitter size={20} />
                                            </a>
                                        )}
                                        {creator.instagram && (
                                            <a href={creator.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg hover:text-white" style={{ '--hover-bg': brandColor } as any} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                                <FiInstagram size={20} />
                                            </a>
                                        )}
                                    </div>
                                    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-3 rounded-xl justify-center transition-all bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-md font-medium">
                                        <FiShare2 /> مشاركة
                                    </button>
                                </div>
                            </div>

                            {creator.bio && (
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl text-lg md:text-xl font-medium">
                                    {creator.bio}
                                </p>
                            )}

                            {creator.website && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-semibold pb-2">
                                    <FiLink style={{ color: brandColor }} />
                                    <a href={creator.website} target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors block truncate max-w-xs" style={{ color: brandColor }}>
                                        {creator.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}

                            {/* Book Consultation Section (If enabled) */}
                            {creator.consultationPrice !== undefined && (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="mt-6 p-6 sm:p-5 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-black/20 rounded-2xl shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 text-white rounded-2xl shadow-inner" style={{ backgroundColor: brandColor }}>
                                            <FiClock className="text-2xl" />
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <span className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 tracking-wide">جلسة استشارية خاصة</span>
                                            <span className="font-black text-2xl text-primary-charcoal dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                                                {creator.consultationPrice > 0 ? `${creator.consultationPrice} ج.م` : 'متاحة مجاناً للطلاب'}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/${creator.username}/book`}
                                        className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all hover:opacity-90 active:scale-95 text-lg flex items-center justify-center gap-2"
                                        style={{ backgroundColor: brandColor, boxShadow: `0 10px 25px -5px ${brandColor}66` }}
                                    >
                                        <FiMonitor />
                                        حجز موعد الآن
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Products Grid */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
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
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'all' ? 'text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            style={activeTab === 'all' ? { backgroundColor: brandColor } : {}}
                        >
                            <FiGrid /> الكل
                        </button>
                        {hasDigital && (
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'products' ? 'text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                style={activeTab === 'products' ? { backgroundColor: brandColor } : {}}
                            >
                                <FiPackage /> المنتجات الرقمية
                            </button>
                        )}
                        {hasCourses && (
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'courses' ? 'text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                style={activeTab === 'courses' ? { backgroundColor: brandColor } : {}}
                            >
                                <FiVideo /> الدورات التدريبية
                            </button>
                        )}
                        {hasConsultation && (
                            <button
                                onClick={() => setActiveTab('consultations')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'consultations' ? 'text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                style={activeTab === 'consultations' ? { backgroundColor: brandColor } : {}}
                            >
                                <FiMonitor /> الجلسات الاستشارية
                            </button>
                        )}
                    </div>

                    {activeTab === 'consultations' ? (
                        <div className="bg-white/50 dark:bg-card-white/50 backdrop-blur-sm rounded-3xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiMonitor className="text-4xl" style={{ color: brandColor }} />
                            </div>
                            <h3 className="text-2xl font-bold text-primary-charcoal dark:text-white mb-4">احجز جلستك الخاصة مع {creator.name}</h3>
                            <p className="text-gray-500 font-medium mb-8 text-lg">احصل على استشارة مخصصة تلبي احتياجاتك وترد على استفساراتك بشكل مباشر عبر لقاء مرئي.</p>
                            <Link
                                href={`/${creator.username}/book`}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all hover:opacity-90 active:scale-95 text-lg"
                                style={{ backgroundColor: brandColor, boxShadow: `0 10px 25px -5px ${brandColor}66` }}
                            >
                                <FiClock /> حجز موعد ({creator.consultationPrice > 0 ? `${creator.consultationPrice} ج.م` : 'متاحة مجاناً'})
                            </Link>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="bg-white/50 dark:bg-card-white/50 backdrop-blur-sm rounded-3xl shadow-sm p-16 text-center border border-gray-100 dark:border-gray-800">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiStar className="text-4xl text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-primary-charcoal dark:text-white mb-2">في هذا القسم قريباً</h3>
                            <p className="text-gray-500 font-medium">لا توجد منتجات مطابقة لهذا التبويب حالياً.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    key={product.id}
                                    className="h-full"
                                >
                                    <Link href={product.category === 'courses' ? `/courses/${product.slug || product.id}` : `/product/${product.id}`} className="group relative block h-full">
                                        <div className="absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10" style={{ backgroundColor: brandColor }}></div>
                                        <div className="bg-white dark:bg-card-white rounded-3xl h-full border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-300 flex flex-col group-hover:-translate-y-1">
                                            {/* Image Area */}
                                            <div className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex justify-center items-center">
                                                        {product.category === 'courses' ? <FiVideo className="text-4xl text-gray-300" /> : <FiPackage className="text-4xl text-gray-300" />}
                                                    </div>
                                                )}

                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    {product.isFree && (
                                                        <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                                            مجاني
                                                        </span>
                                                    )}
                                                    {product.category === 'courses' && (
                                                        <span className="bg-white/90 dark:bg-black/90 text-action-blue dark:text-white backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                                                            <FiVideo /> دورة
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Details Area */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <h3 className="font-bold text-xl text-primary-charcoal dark:text-white mb-3 line-clamp-2 group-hover:text-action-blue transition-colors">
                                                    {product.title}
                                                </h3>

                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium gap-1">
                                                        <FiShoppingCart />
                                                        <span>{product.soldCount || 0}</span>
                                                    </div>
                                                    <span className="font-black text-lg" style={{ color: brandColor }}>
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
            </div>
        </div>
    );
}
