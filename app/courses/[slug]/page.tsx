'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { FiShoppingCart, FiCheck, FiStar, FiUsers, FiClock, FiVideo, FiBookOpen, FiChevronDown, FiPlayCircle, FiLock, FiMonitor, FiAward, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import showToast from '@/lib/toast';

interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    image?: string;
    category?: string;
    level?: string;
    duration?: string;
    trailerUrl?: string;
    offerExpiresAt?: string;
    averageRating?: number;
    reviewCount?: number;
    user: {
        name: string;
        avatar?: string;
        username?: string;
        brandColor?: string;
    };
    modules?: Array<{
        title: string;
        lessons: Array<{ title: string }>;
    }>;
}

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { addToCart, items } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlBrandColor = searchParams.get('brand');
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInCart, setIsInCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);
    const [activeModule, setActiveModule] = useState<number | null>(0);
    const [trailerSignedUrl, setTrailerSignedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (slug) {
            fetchCourse();
            trackAffiliateClick();
            trackView();
        }
    }, [slug]);

    const trackView = async () => {
        if (typeof window !== 'undefined' && course?.id) {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        courseId: course.id,
                        referrer: document.referrer || 'direct'
                    }),
                });
            } catch (e) {
                console.error('Tracking Error:', e);
            }
        }
    };

    // تتبع المشاهدة فور توفر بيانات الكورس
    useEffect(() => {
        if (course?.id) {
            trackView();
        }
    }, [course?.id]);

    // جلب الـ Trailer URL الموقع من الـ Backend لتجنب خطأ 403 مع Bunny Stream
    useEffect(() => {
        if (course?.trailerUrl) {
            fetch(`/api/courses/${slug}/trailer`)
                .then(r => r.json())
                .then(data => { if (data.trailerUrl) setTrailerSignedUrl(data.trailerUrl); })
                .catch(() => setTrailerSignedUrl(course.trailerUrl ?? null));
        }
    }, [course?.trailerUrl, slug]);

    useEffect(() => {
        if (course) {
            setIsInCart(items.some((item) => item.id === course.id));
        }
    }, [items, course]);

    const trackAffiliateClick = () => {
        if (typeof window !== 'undefined') {
            const ref = new URLSearchParams(window.location.search).get('ref');
            if (ref) {
                localStorage.setItem('affiliateRef', ref);
                fetch('/api/affiliate/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: ref }),
                }).catch(console.error);
            }
        }
    };

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${slug}`);
            if (response.ok) {
                const data = await response.json();
                setCourse(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (course) {
            addToCart({
                id: course.id,
                type: 'course',
                title: course.title,
                price: course.price,
                image: course.image,
                slug: course.slug,
                brandColor: course.user.brandColor
            });
            showToast.success('تمت الإضافة للسلة بنجاح!');
        }
    };

    const buyNow = async () => {
        setBuyingNow(true);
        handleAddToCart();
        await new Promise(r => setTimeout(r, 600));
        router.push('/cart');
    };

    const toggleModule = (index: number) => {
        setActiveModule(activeModule === index ? null : index);
    };

    if (loading) {
        const spinColor = urlBrandColor || '#D41295';
        return (
            <div className="flex items-center justify-center min-h-[70vh] bg-bg-light dark:bg-bg-dark">
                <div
                    className="animate-spin rounded-xl h-14 w-14 border-4 border-transparent"
                    style={{ borderBottomColor: spinColor, borderLeftColor: `${spinColor}60` }}
                />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-[70vh] bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-4 text-center">
                <FiVideo className="text-6xl text-gray-300 dark:text-gray-700 mb-6" />
                <h1 className="text-2xl font-bold mb-4 text-ink dark:text-gray-200">هذه الدورة التدريبية غير موجودة أو تم حذفها</h1>
                <Link href="/courses" className="btn btn-primary mt-4">
                    تصفح الدورات التدريبية
                </Link>
            </div>
        );
    }

    const effectiveBrandColor = course.user.brandColor;

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-4 pb-12 font-sans selection:bg-accent/20 dark:selection:bg-accent/40">
            {effectiveBrandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-accent { color: ${effectiveBrandColor} !important; }
                    .bg-accent { background-color: ${effectiveBrandColor} !important; }
                    .border-accent { border-color: ${effectiveBrandColor} !important; }
                    .shadow-accent\\/20 { --tw-shadow-color: ${effectiveBrandColor}33 !important; }
                    .shadow-accent\\/40 { --tw-shadow-color: ${effectiveBrandColor}66 !important; }
                    .fill-accent { fill: ${effectiveBrandColor} !important; }
                    .hover\\:text-accent:hover { color: ${effectiveBrandColor} !important; }
                    .hover\\:border-accent:hover { border-color: ${effectiveBrandColor} !important; }
                    `
                }} />
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
                    <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1"><FiBookOpen /> الأكاديمية</Link>
                    <span className="text-gray-300 dark:text-gray-700">/</span>
                    <Link href="/courses" className="hover:text-accent transition-colors">الدورات</Link>
                    <span className="text-gray-300 dark:text-gray-700">/</span>
                    <span className="text-ink dark:text-gray-200 truncate max-w-[200px] sm:max-w-md">{course.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Main Content Space - Left Side */}
                    <div className="lg:col-span-8 order-2 lg:order-1 flex flex-col gap-10">
                        {/* Course Hero & Image */}
                        <div className="group relative -up">
                            <div className="absolute -inset-1 bg-ink rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-900/10 dark:ring-white/10 aspect-[16/9] flex items-center justify-center">
                                {course.image ? (
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-overlay"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-ink flex flex-col items-center justify-center text-gray-500">
                                        <FiMonitor className="text-8xl mb-4 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10 flex flex-col gap-3">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {course.category && (
                                            <span className="px-3 py-1 bg-white/20  text-white rounded-lg text-sm font-bold border border-white/20 shadow-sm">
                                                {course.category}
                                            </span>
                                        )}
                                        {course.level && (
                                            <span className="px-3 py-1 bg-black/40  text-white rounded-lg text-sm font-bold border border-white/10 shadow-sm flex items-center gap-1">
                                                <FiBookOpen /> {course.level}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
                                        {course.title}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Trailer Video (If available) */}
                        {course.trailerUrl && (
                            <div className="bg-white dark:bg-card-white rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mt-6">
                                <div className="p-8 sm:p-10 pb-6 border-b border-gray-100 dark:border-gray-800">
                                    <h2 className="text-2xl font-bold text-ink dark:text-white flex items-center gap-2">
                                        <FiPlayCircle className="text-accent" /> فيديو تعريفي
                                    </h2>
                                </div>
                                <div className="relative aspect-video w-full bg-gray-900">
                                    {trailerSignedUrl ? (
                                        <iframe
                                            src={
                                                course.trailerUrl.includes('youtube.com/watch')
                                                    ? course.trailerUrl.replace('watch?v=', 'embed/').split('&')[0]
                                                    : trailerSignedUrl
                                            }
                                            title="Course Trailer"
                                            className="absolute inset-0 w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                                            <div className="animate-spin rounded-xl h-10 w-10 border-2 border-transparent border-b-white/50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Description & Overview */}
                        <div className="bg-white dark:bg-card-white rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-8 sm:p-10">
                                <h2 className="text-2xl font-bold text-ink dark:text-white mb-6 flex items-center gap-2">
                                    <FiBookOpen className="text-accent" /> نظرة عامة
                                </h2>
                                <div
                                    className="prose prose-lg sm:prose-xl max-w-none dark:prose-invert text-gray-600 dark:text-gray-300 leading-relaxed font-medium"
                                    dangerouslySetInnerHTML={{
                                        __html: course.description
                                            ? course.description
                                                .replace(/&nbsp;/g, ' ')
                                                .replace(/<p><\/p>/g, '')
                                                .replace(/<p>\s*<\/p>/g, '')
                                            : ''
                                    }}
                                />

                                {/* Key Highlight Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="text-center">
                                        <div className="text-gray-400 mb-2 flex justify-center"><FiClock size={24} className="text-purple-500" /></div>
                                        <div className="font-bold text-gray-900 dark:text-white">{course.duration || 'مفتوح'}</div>
                                        <div className="text-xs text-gray-500 font-medium">المدة الإجمالية</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-400 mb-2 flex justify-center"><FiVideo size={24} className="text-accent" /></div>
                                        <div className="font-bold text-gray-900 dark:text-white">{course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0}</div>
                                        <div className="text-xs text-gray-500 font-medium">درس تفاعلي</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-400 mb-2 flex justify-center"><FiBookOpen size={24} className="text-green-500" /></div>
                                        <div className="font-bold text-gray-900 dark:text-white">{course.level || 'مبتدئ'}</div>
                                        <div className="text-xs text-gray-500 font-medium">المستوى المطلوب</div>
                                    </div>
                                    {course.modules && course.modules.reduce((acc, m) => acc + m.lessons.length, 0) > 0 && (
                                        <div className="text-center">
                                            <div className="text-gray-400 mb-2 flex justify-center"><FiAward size={24} className="text-yellow-500" /></div>
                                            <div className="font-bold text-gray-900 dark:text-white">نعم</div>
                                            <div className="text-xs text-gray-500 font-medium">شهادة إتمام</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Curriculum / Modules (Accordion) */}
                        {course.modules && course.modules.length > 0 && (
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-ink dark:text-white mb-6 flex items-center gap-3">
                                    محتوى الدورة
                                    <span className="bg-accent/10 text-accent text-sm px-3 py-1 rounded-xl">{course.modules.length} فصول</span>
                                </h2>
                                <div className="space-y-4">
                                    {course.modules.map((module, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:border-accent/30 transition-colors"
                                        >
                                            <button
                                                onClick={() => toggleModule(idx)}
                                                className="w-full flex items-center justify-between p-6 text-right focus:outline-none bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${activeModule === idx ? 'bg-accent text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{module.title}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{module.lessons.length} دروس تعليمية</p>
                                                    </div>
                                                </div>
                                                <div className="text-gray-400">
                                                    <motion.div
                                                        animate={{ rotate: activeModule === idx ? 180 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <FiChevronDown size={24} />
                                                    </motion.div>
                                                </div>
                                            </button>
                                            <AnimatePresence>
                                                {activeModule === idx && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="overflow-hidden bg-white dark:bg-card-white"
                                                    >
                                                        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                                                            <div className="space-y-2">
                                                                {module.lessons.map((lesson, lessonIdx) => (
                                                                    <div key={lessonIdx} className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors">
                                                                        <div className="flex items-center gap-3">
                                                                            <FiPlayCircle className="text-gray-400 group-hover:text-accent transition-colors text-xl" />
                                                                            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{lesson.title}</span>
                                                                        </div>
                                                                        <FiLock className="text-gray-300 dark:text-gray-600 text-sm" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instructor Banner inside content */}
                        <div className="mt-8 bg-ink dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-ink pointer-events-none"></div>
                            <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-ink rounded-xl flex items-center justify-center font-bold text-3xl text-white shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                    {course.user?.avatar ? (
                                        <img src={course.user.avatar} className="w-full h-full object-cover" alt={course.user.name} />
                                    ) : (
                                        course.user?.name?.charAt(0) || <FiStar />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-widest uppercase text-accent mb-1">المدرب</p>
                                    <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">{course.user.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">خبير ومتخصص في هذا المجال ومقدم هذه الدورة التدريبية.</p>
                                </div>
                            </div>
                            <Link href={`/${course.user.username || 'user'}`} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-ink dark:text-white font-bold border-2 border-gray-100 dark:border-gray-700 hover:border-accent dark:hover:border-accent transition-colors text-center shadow-sm relative z-10 whitespace-nowrap">
                                تصفح جميع أعماله
                            </Link>
                        </div>
                    </div>

                    {/* Right Side - Sticky Purchase Card */}
                    <div className="lg:col-span-4 order-1 lg:order-2">
                        <div className="sticky top-24 bg-white dark:bg-card-white rounded-xl shadow-sm shadow-gray-200/50 dark:shadow-black/20 overflow-hidden border border-gray-100 dark:border-gray-800 -up">
                                      <div className="mb-8 pb-8 border-b border-gray-100 dark:border-gray-800 relative">
                                    {course.originalPrice && course.originalPrice > course.price && (
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <span className="text-xl text-gray-400 line-through font-bold">
                                                {course.originalPrice.toFixed(2)} $
                                            </span>
                                            <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-lg">
                                                خصم {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-end gap-2 justify-center text-center mx-auto">
                                        <span className="text-5xl font-bold bg-ink dark:from-white dark:to-gray-400 bg-clip-text text-transparent transform transition-transform hover:scale-105 origin-center">
                                            {course.price > 0 ? course.price.toFixed(2) : 'مجاني 🎉'}
                                        </span>
                                        {course.price > 0 && <span className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-1 font-serif">$</span>}
                                    </div>

                                    {/* Urgency Countdown Banner */}
                                    {course.offerExpiresAt && new Date(course.offerExpiresAt) > new Date() && (
                                        <div className="mt-6 p-4 bg-accent-50 dark:bg-amber-900/10 rounded-xl border border-blue-100 dark:border-amber-900/20 flex items-center gap-3 ">
                                            <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center shadow-sm shadow-amber-500/20">
                                                <FiClock className="text-xl" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-blue-800 dark:text-amber-400 uppercase tracking-widest leading-none mb-1">عرض لفترة محدودة</p>
                                                <p className="text-xs font-bold text-accent dark:text-accent-500">سارع بالاشتراك قبل انتهاء العرض!</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-500 font-bold bg-green-50 dark:bg-green-900/20 py-2 px-4 rounded-xl border border-green-100 dark:border-green-900/30 w-max mx-auto">
                                        <FiCheckCircle size={16} /> وصول كامل ومباشر
                                    </div>
                                </div>

                                {/* Rating block */}
                                {course.averageRating && course.averageRating > 0 ? (
                                    <div className="flex items-center justify-center gap-3 mb-8 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    size={22}
                                                    className={i < Math.floor(course.averageRating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-700'}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-lg">
                                            {course.averageRating.toFixed(1)} <span className="text-sm text-gray-500">({course.reviewCount})</span>
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 mb-8 bg-accent-50 dark:bg-blue-900/20 text-accent dark:text-blue-400 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 font-bold text-sm">
                                        <FiStar className="fill-accent" /> كن أول من يقيم هذه الدورة
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="space-y-4">
                                    <button
                                        onClick={buyNow}
                                        disabled={buyingNow}
                                        className="w-full btn btn-primary text-xl py-5 rounded-xl shadow-sm shadow-accent/20 hover:shadow-accent/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 font-bold disabled:opacity-80"
                                        style={effectiveBrandColor ? { backgroundColor: effectiveBrandColor, borderColor: effectiveBrandColor } : {}}
                                    >
                                        {buyingNow ? (
                                            <>
                                                <span className="w-6 h-6 rounded-xl border-2 border-white border-t-transparent animate-spin inline-block" />
                                                <span>جاري التحويل...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiVideo className="text-2xl" />
                                                <span>اشترك الآن ←</span>
                                            </>
                                        )}
                                    </button>

                                    {!isInCart ? (
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full btn text-lg py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent text-ink dark:text-gray-200 font-bold hover:border-accent hover:text-accent dark:hover:border-accent transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FiShoppingCart /> أضف للسلة
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full btn text-lg py-4 rounded-xl border-2 border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400 font-bold flex items-center justify-center gap-2 transition-colors opacity-90 cursor-default"
                                        >
                                            <FiCheck /> في السلة
                                        </button>
                                    )}
                                </div>

                                {/* Trust / Guarantees */}
                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            <div className="w-8 h-8 rounded-xl bg-accent-50 dark:bg-blue-900/20 text-accent flex items-center justify-center">
                                                <FiMonitor />
                                            </div>
                                            مشاهدة عبر أي جهاز متصل بالانترنت
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center">
                                                <FiCheckCircle />
                                            </div>
                                            محتوى مرئي عالي الجودة ومحدث
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Simple Footer */}
                <footer className="mt-16 py-8 text-center border-t border-gray-100 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        مدعوم من <a href="https://tmleen.com" className="text-accent font-bold hover:underline">منصة تمالين</a>
                    </p>
                </footer>
            </div>
        );
    }
