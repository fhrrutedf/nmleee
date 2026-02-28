'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiShoppingCart, FiStar, FiClock, FiVideo, FiCheckCircle, FiBook, FiEye, FiPlayCircle, FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';
import 'react-quill-new/dist/quill.snow.css';
import { apiGet, apiPost, handleApiError } from '@/lib/safe-fetch';
import VideoPlayer from '@/components/ui/VideoPlayer';
import showToast from '@/lib/toast';

const stripHtml = (html: string) => {
    if (!html) return '';
    // استبدال &nbsp; بمسافة عادية أولاً
    html = html.replace(/&nbsp;/g, ' ');
    return html;
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlBrandColor = searchParams.get('brand'); // brand color passed from profile page
    const [product, setProduct] = useState<any>(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buyingNow, setBuyingNow] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });
    const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

    useEffect(() => {
        if (id) {
            fetchProduct();
            fetchReviews();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const data = await apiGet(`/api/products/${id}`);
            setProduct(data);
            if (data.trailerUrl) {
                setActiveMedia({ type: 'video', url: data.trailerUrl });
            } else if (data.image) {
                setActiveMedia({ type: 'image', url: data.image });
            }
        } catch (error) {
            console.error('Error fetching product:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const data = await apiGet(`/api/reviews?productId=${id}`);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', handleApiError(error));
        }
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiPost('/api/reviews', {
                ...newReview,
                productId: id
            });

            setNewReview({ rating: 5, comment: '', name: '' });
            fetchReviews();
            showToast.success('شكرًا لتقييمك!');
        } catch (error) {
            console.error('Error submitting review:', handleApiError(error));
            showToast.error('فشل إضافة التقييم. حاول لاحقاً');
        }
    };

    const addToCartItem = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((item: any) => item.id === product.id);
        if (!existing) {
            cart.push({
                id: product.id,
                type: 'product',
                title: product.title,
                price: product.isFree ? 0 : product.price,
                image: product.image,
                brandColor: product.user?.brandColor
            });
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        return !existing;
    };

    const addToCart = async () => {
        setAddingToCart(true);
        const added = addToCartItem();
        await new Promise(r => setTimeout(r, 400));
        setAddingToCart(false);
        if (added) showToast.success('تمت الإضافة للسلة بنجاح!');
        else showToast.error('المنتج موجود بالفعل في سلتك');
    };

    const buyNow = async () => {
        setBuyingNow(true);
        addToCartItem();
        await new Promise(r => setTimeout(r, 600));
        router.push('/cart');
    };

    if (loading) {
        const spinColor = urlBrandColor || '#D41295';
        return (
            <div className="flex items-center justify-center min-h-[70vh] bg-bg-light dark:bg-bg-dark">
                <div
                    className="animate-spin rounded-full h-14 w-14 border-4 border-transparent"
                    style={{ borderBottomColor: spinColor, borderLeftColor: `${spinColor}60` }}
                />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[70vh] bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-4 text-center">
                <FiBook className="text-6xl text-gray-300 dark:text-gray-700 mb-6" />
                <h1 className="text-2xl font-bold mb-4 text-primary-charcoal dark:text-gray-200">المنتج الذي تبحث عنه غير موجود أو تم حذفه</h1>
                <Link href="/" className="btn btn-primary mt-4">
                    العودة لصفحة المتجر
                </Link>
            </div>
        );
    }

    // Media array for gallery
    const mediaItems = [];
    if (product.trailerUrl) mediaItems.push({ type: 'video', url: product.trailerUrl });
    if (product.image) mediaItems.push({ type: 'image', url: product.image });
    if (product.images && product.images.length > 0) {
        product.images.forEach((img: string) => {
            if (img !== product.image) mediaItems.push({ type: 'image', url: img });
        });
    }

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-4 pb-24">
            {product.user?.brandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-action-blue { color: ${product.user.brandColor} !important; }
                    .bg-action-blue { background-color: ${product.user.brandColor} !important; }
                    .border-action-blue { border-color: ${product.user.brandColor} !important; }
                    .ring-action-blue { --tw-ring-color: ${product.user.brandColor} !important; }
                    .from-action-blue { --tw-gradient-from: ${product.user.brandColor} !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
                    .hover\\:text-action-blue:hover { color: ${product.user.brandColor} !important; filter: brightness(0.9); }
                    .hover\\:bg-action-blue:hover { background-color: ${product.user.brandColor} !important; filter: brightness(0.9); }
                    .shadow-action-blue\\/20 { --tw-shadow-color: ${product.user.brandColor}33 !important; }
                    `
                }} />
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Breadcrumb Navigation - Modern Minimal */}
                <div className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
                    <Link href="/" className="hover:text-action-blue transition-colors flex items-center gap-1"><FiStar /> الرئيسية</Link>
                    <span className="text-gray-300 dark:text-gray-700">/</span>
                    <Link href="/explore" className="hover:text-action-blue transition-colors">تصفح المنتجات</Link>
                    <span className="text-gray-300 dark:text-gray-700">/</span>
                    <span className="text-primary-charcoal dark:text-gray-200 truncate max-w-[200px] sm:max-w-md">{product.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Product Info Card (Sticky) */}
                    <div className="lg:col-span-5 order-2 lg:order-1 relative">
                        <div className="sticky top-24 bg-white dark:bg-card-white rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden border border-gray-100 dark:border-gray-800 animate-fade-in-up">

                            {/* Decorative Header */}
                            <div className="h-6 w-full bg-gradient-to-r from-action-blue via-purple-500 to-pink-500"></div>

                            <div className="p-8 sm:p-10">
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {product.category && (
                                        <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-action-blue dark:text-blue-400 rounded-lg text-sm font-black tracking-wide border border-blue-100 dark:border-blue-900/30">
                                            {product.category === 'courses' ? '👨‍🏫 دورة متكاملة' : product.category === 'ebooks' ? '📚 كتاب إلكتروني' : product.category}
                                        </span>
                                    )}
                                    {product.isFree && (
                                        <span className="px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-black tracking-wide border border-green-100 dark:border-green-900/30">
                                            🎁 مجاني
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary-charcoal dark:text-white mb-6 leading-tight tracking-tight">
                                    {product.title}
                                </h1>

                                {/* Stats Overview */}
                                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('reviews')}>
                                        <div className="flex items-center text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded-lg">
                                            <FiStar className="fill-yellow-500 mr-1" />
                                            <span className="font-bold">{product.averageRating?.toFixed(1) || '5.0'}</span>
                                        </div>
                                        <span className="text-gray-500 dark:text-gray-400 font-medium text-sm group-hover:text-action-blue transition-colors">({product.reviewCount || 0} تقييم)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm">
                                        <FiShoppingCart className="text-gray-400" />
                                        <span>{product.soldCount || 0} مبيعة</span>
                                    </div>
                                </div>

                                {/* Price Reveal */}
                                <div className="mb-10 flex items-end gap-3">
                                    <span className="text-5xl sm:text-6xl font-black bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent transform transition-transform hover:scale-105 origin-right">
                                        {product.price > 0 ? product.price.toFixed(2) : '0.00'}
                                    </span>
                                    <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2 font-serif">ج.م</span>

                                    {/* Discount Logic Display could be added here if product had discount fields */}
                                </div>

                                {/* Call to Actions */}
                                <div className="space-y-4">
                                    <button
                                        onClick={buyNow}
                                        disabled={buyingNow}
                                        className="w-full btn btn-primary text-xl py-5 rounded-2xl shadow-xl shadow-action-blue/20 hover:shadow-action-blue/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 font-black disabled:opacity-80 disabled:cursor-not-allowed"
                                        style={product.user?.brandColor ? { backgroundColor: product.user.brandColor, borderColor: product.user.brandColor } : {}}
                                    >
                                        {buyingNow ? (
                                            <>
                                                <span className="w-6 h-6 rounded-full border-3 border-white border-t-transparent animate-spin inline-block" style={{ borderWidth: '3px' }} />
                                                <span>جاري التحويل...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiShoppingCart className="text-2xl" />
                                                <span>اشتري الآن ←</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={addToCart}
                                            disabled={addingToCart}
                                            className="w-full btn text-lg py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-transparent text-primary-charcoal dark:text-gray-200 font-bold hover:border-action-blue hover:text-action-blue dark:hover:border-action-blue transition-colors disabled:opacity-60"
                                        >
                                            {addingToCart ? (
                                                <span className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" />
                                            ) : 'أضف للسلة'}
                                        </button>

                                        {product.previewFileUrl && (
                                            <a
                                                href={product.previewFileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full btn bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors font-bold border border-purple-100 dark:border-purple-800/30"
                                            >
                                                <FiEye className="text-xl" />
                                                <span>معاينة للدرس</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Secure Guarantee Badge */}
                                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium bg-green-50 dark:bg-green-900/10 py-3 rounded-xl border border-green-100 dark:border-green-900/20">
                                    <FiCheckCircle size={18} />
                                    <span>دفع آمن واستلام فوري للرابط عبر البريد</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Media & Details */}
                    <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-10">
                        {/* 1. Media Showcase */}
                        <div className="group relative">
                            {/* Decorative backdrop glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-action-blue to-purple-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                            <div className="relative bg-black rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-gray-900/10 dark:ring-white/10 aspect-[16/10] sm:aspect-video flex items-center justify-center animate-fade-in-up">
                                {activeMedia?.type === 'video' ? (
                                    <div className="w-full h-full">
                                        <VideoPlayer
                                            src={activeMedia.url}
                                            videoId={product.id}
                                            title={product.title}
                                            poster={product.image}
                                        />
                                    </div>
                                ) : activeMedia?.type === 'image' ? (
                                    <img
                                        src={activeMedia.url}
                                        alt={product.title}
                                        className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-gray-500">
                                        <FiBook className="text-8xl mb-4 opacity-50" />
                                        <span className="font-medium tracking-widest uppercase text-sm">No Preview Available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Thumbnails Gallery */}
                        {mediaItems.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x px-2">
                                {mediaItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMedia(item as any)}
                                        className={`relative shrink-0 w-32 h-20 sm:w-40 sm:h-24 rounded-2xl overflow-hidden transition-all duration-300 snap-start shadow-sm
                                            ${activeMedia?.url === item.url
                                                ? 'ring-4 ring-action-blue scale-105 z-10'
                                                : 'ring-1 ring-gray-200 dark:ring-gray-700 opacity-60 hover:opacity-100 filter grayscale hover:grayscale-0'
                                            }`}
                                    >
                                        {item.type === 'video' ? (
                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                                <img src={product.image || ''} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" alt="thumb video" />
                                                <div className="absolute inset-0 bg-black/20" />
                                                <FiPlayCircle className="text-3xl text-white relative z-10 drop-shadow-lg" />
                                                <div className="absolute bottom-1 right-2 text-[10px] font-bold text-white uppercase tracking-wider">Video</div>
                                            </div>
                                        ) : (
                                            <img src={item.url} className="w-full h-full object-cover" alt={`Gallery thumbnail ${idx}`} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Seller / Creator Spotlight Card */}
                        <div className="mt-8 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-l from-action-blue/5 to-transparent pointer-events-none"></div>
                            <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto">
                                <Link href={`/${product.user?.username || 'seller'}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-action-blue to-purple-600 rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                    {product.user?.avatar ? (
                                        <img src={product.user.avatar} className="w-full h-full object-cover" alt={product.user.name} />
                                    ) : (
                                        product.user?.name?.charAt(0) || <FiStar />
                                    )}
                                </Link>
                                <div>
                                    <p className="text-xs font-bold tracking-widest uppercase text-action-blue mb-1">صانع المحتوى</p>
                                    <Link href={`/${product.user?.username || 'seller'}`}>
                                        <h3 className="font-black text-2xl text-gray-900 dark:text-white mb-2 hover:text-action-blue transition-colors">{product.user?.name || 'البائع'}</h3>
                                    </Link>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">المبدع وراء هذا العمل الرائع. اكتشف المزيد من إبداعاته.</p>
                                </div>
                            </div>
                            <Link href={`/${product.user?.username || 'seller'}`} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-primary-charcoal dark:text-white font-bold border-2 border-gray-100 dark:border-gray-700 hover:border-action-blue dark:hover:border-action-blue transition-colors text-center shadow-sm relative z-10 whitespace-nowrap">
                                تصفح جميع أعماله
                            </Link>
                        </div>

                        {/* Features Highlights Blocks */}
                        {(product.features?.length > 0 || product.duration || product.sessions) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {product.duration && (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-5 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm">
                                        <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm text-action-blue"><FiClock className="text-2xl" /></div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-gray-100 text-lg">{product.duration}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">إجمالي المدة</p>
                                        </div>
                                    </div>
                                )}
                                {product.sessions && (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-5 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm">
                                        <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm text-purple-500"><FiVideo className="text-2xl" /></div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-gray-100 text-lg">{product.sessions} جلسة/درس</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">محتوى تفصيلي</p>
                                        </div>
                                    </div>
                                )}

                                {product.features?.map((feature: string, index: number) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm">
                                        <FiCheckCircle className="text-green-500 text-2xl flex-shrink-0" />
                                        <p className="font-bold text-gray-700 dark:text-gray-300 leading-tight">{feature}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Interactive Content Tabs */}
                        <div className="bg-white dark:bg-card-white rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mt-4">
                            <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 scrollbar-hide">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`flex-1 min-w-[150px] py-6 px-4 font-black text-lg transition-colors flex justify-center items-center gap-2 relative ${activeTab === 'description'
                                        ? 'text-action-blue'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 bg-gray-50/50 dark:bg-gray-800/20'
                                        }`}
                                >
                                    <FiBook className={activeTab === 'description' ? "text-action-blue" : "text-gray-400"} />
                                    محتوى وتفاصيل
                                    {activeTab === 'description' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-action-blue rounded-t-full"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`flex-1 min-w-[150px] py-6 px-4 font-black text-lg transition-colors flex justify-center items-center gap-2 relative ${activeTab === 'reviews'
                                        ? 'text-action-blue'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 bg-gray-50/50 dark:bg-gray-800/20'
                                        }`}
                                >
                                    <FiMessageSquare className={activeTab === 'reviews' ? "text-action-blue" : "text-gray-400"} />
                                    تجارب المشترين
                                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">{reviews.length}</span>
                                    {activeTab === 'reviews' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-action-blue rounded-t-full"></div>
                                    )}
                                </button>
                            </div>

                            <div className="p-6 sm:p-10">
                                {activeTab === 'description' ? (
                                    <div className="prose prose-lg sm:prose-xl max-w-none dark:prose-invert break-words overflow-hidden">
                                        <div dangerouslySetInnerHTML={{ __html: stripHtml(product.description) }} className="text-gray-600 dark:text-gray-300 leading-relaxed ql-editor px-0" />
                                    </div>
                                ) : (
                                    <div className="space-y-10 animate-fade-in-up">
                                        {/* Review Input Box */}
                                        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-inner">
                                            <h3 className="font-black text-xl mb-6 text-gray-900 dark:text-white flex items-center gap-2"><FiStar className="text-yellow-400" /> قيم تجربتك</h3>
                                            <form onSubmit={submitReview} className="space-y-5">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسمك الأول</label>
                                                        <input
                                                            type="text"
                                                            value={newReview.name}
                                                            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-action-blue outline-none transition-all placeholder:font-normal"
                                                            placeholder="يكفي الاسم الأول فقط"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">التقييم من 5</label>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                                    className={`flex-1 bg-white dark:bg-gray-900 border ${star <= newReview.rating ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 flex items-center justify-center transition-all transform active:scale-95`}
                                                                >
                                                                    <FiStar className={`text-xl ${star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">تعليقك وتقييمك (بصدق)</label>
                                                    <textarea
                                                        value={newReview.comment}
                                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-action-blue outline-none transition-all resize-none placeholder:font-normal"
                                                        rows={3}
                                                        placeholder="كيف كانت تجربتك؟ وهل استفدت من المادة؟"
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary px-8 py-3 rounded-xl font-bold shadow-lg shadow-action-blue/20">
                                                    إرسال التقييم
                                                </button>
                                            </form>
                                        </div>

                                        {/* Reviews List */}
                                        <div className="space-y-6">
                                            {reviews.length === 0 ? (
                                                <div className="text-center py-12 px-4">
                                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600">
                                                        <FiMessageSquare size={36} />
                                                    </div>
                                                    <h4 className="font-bold text-xl text-gray-500 dark:text-gray-400">لا توجد تعليقات بعد</h4>
                                                    <p className="text-gray-400 dark:text-gray-500 mt-2">كن أول من يشاركنا تجربته الثرية</p>
                                                </div>
                                            ) : (
                                                reviews.map((review: any) => (
                                                    <div key={review.id} className="relative group">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-yellow-400 transition-colors"></div>
                                                        <div className="pl-6 pb-2">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center font-black text-gray-500 dark:text-gray-400 border border-white dark:border-gray-800 shadow-sm">
                                                                    {review.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <h4 className="font-bold text-lg text-primary-charcoal dark:text-white">{review.name}</h4>
                                                                        <div className="flex items-center gap-0.5">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <FiStar
                                                                                    key={i}
                                                                                    className={`text-sm ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-[11px] text-gray-400 font-bold tracking-wider">{new Date(review.createdAt).toLocaleDateString('ar-EG')}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-medium bg-gray-50 dark:bg-gray-900/50 p-5 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl">
                                                                {review.comment}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="mt-16 py-8 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    مدعوم من <a href="https://tmleen.com" className="text-primary-600 font-bold hover:underline">منصة تقانة</a>
                </p>
            </footer>
        </div>
    );
}
