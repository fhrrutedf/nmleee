'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiShoppingCart, FiStar, FiDownload, FiClock, FiVideo, FiCheckCircle, FiBook, FiEye, FiPlayCircle, FiImage } from 'react-icons/fi';
import Link from 'next/link';
import 'react-quill/dist/quill.snow.css';
import { apiGet, apiPost, handleApiError } from '@/lib/safe-fetch';
import VideoPlayer from '@/components/ui/VideoPlayer';

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });
    const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchProduct();
            fetchReviews();
        }
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const data = await apiGet(`/api/products/${params.id}`);
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
            const data = await apiGet(`/api/reviews?productId=${params.id}`);
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
                productId: params.id
            });

            setNewReview({ rating: 5, comment: '', name: '' });
            fetchReviews();
            alert('تم إضافة تقييمك بنجاح!');
        } catch (error) {
            console.error('Error submitting review:', handleApiError(error));
            alert('فشل إضافة التقييم: ' + handleApiError(error));
        }
    };

    const addToCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((item: any) => item.id === product.id);

        if (!existing) {
            cart.push({
                id: product.id,
                type: 'product',
                title: product.title,
                price: product.price,
                image: product.image
            });
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('تم إضافة المنتج لسلة المشتريات!');
        } else {
            alert('المنتج موجود بالفعل في السلة');
        }
    };

    const buyNow = () => {
        addToCart();
        router.push('/checkout');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-blue border-t-transparent"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center flex flex-col items-center">
                <h1 className="text-3xl font-bold mb-4 text-primary-charcoal">المنتج غير موجود</h1>
                <Link href="/" className="btn btn-primary mt-4">العودة للرئيسية</Link>
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
        <div className="min-h-screen bg-bg-light dark:bg-bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted mb-8 font-medium">
                    <Link href="/" className="hover:text-action-blue transition-colors">الرئيسية</Link>
                    <span>/</span>
                    <Link href="/explore" className="hover:text-action-blue transition-colors">المتجر</Link>
                    <span>/</span>
                    <span className="text-primary-charcoal dark:text-white truncate max-w-[200px] sm:max-w-md">{product.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
                    {/* Product Media Gallery */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative group">
                            {activeMedia?.type === 'video' ? (
                                <VideoPlayer
                                    src={activeMedia.url}
                                    videoId={product.id}
                                    title={product.title}
                                    poster={product.image}
                                />
                            ) : activeMedia?.type === 'image' ? (
                                <img
                                    src={activeMedia.url}
                                    alt={product.title}
                                    className="w-full aspect-video object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                    <FiBook className="text-8xl text-gray-300 dark:text-gray-700" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {mediaItems.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                {mediaItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMedia(item as any)}
                                        className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all snap-start ${activeMedia?.url === item.url
                                            ? 'border-action-blue ring-2 ring-action-blue/20'
                                            : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        {item.type === 'video' ? (
                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                                <img src={product.image || ''} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" alt="thumb" />
                                                <FiPlayCircle className="text-2xl text-white relative z-10" />
                                            </div>
                                        ) : (
                                            <img src={item.url} className="w-full h-full object-cover" alt={`thumb ${idx}`} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex-1">
                            <div className="mb-6">
                                {product.category && (
                                    <span className="inline-block px-4 py-1.5 bg-action-blue/10 text-action-blue rounded-full text-sm font-semibold mb-4">
                                        {product.category === 'courses' ? 'دورة تدريبية' : product.category === 'ebooks' ? 'كتاب إلكتروني' : product.category}
                                    </span>
                                )}
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-charcoal dark:text-white mb-4 leading-tight">{product.title}</h1>

                                {/* Rating */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar
                                                key={i}
                                                className={`text-lg ${i < Math.floor(product.averageRating || 0)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-200 dark:text-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-text-muted font-medium">
                                        ({product.reviewCount || 0} تقييم)
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center flex-wrap gap-4">
                                    <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-action-blue to-purple-600 bg-clip-text text-transparent">
                                        {product.price.toFixed(2)} ج.م
                                    </span>
                                    {product.isFree && (
                                        <span className="px-4 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-sm font-bold shadow-sm">
                                            مجاني بالكامل
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            {product.features && product.features.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="font-bold text-lg text-primary-charcoal dark:text-white mb-4">مميزات المنتج:</h3>
                                    <ul className="space-y-3">
                                        {product.features.map((feature: string, index: number) => (
                                            <li key={index} className="flex items-start gap-3 text-text-muted font-medium">
                                                <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0 text-xl" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Course Details (if any are saved to product) */}
                            {(product.duration || product.sessions) && (
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {product.duration && (
                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-bg-light p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><FiClock className="text-action-blue text-xl" /></div>
                                            <div>
                                                <p className="text-xs text-text-muted font-medium mb-1">المدة الاستغراب</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{product.duration}</p>
                                            </div>
                                        </div>
                                    )}
                                    {product.sessions && (
                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-bg-light p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><FiVideo className="text-action-blue text-xl" /></div>
                                            <div>
                                                <p className="text-xs text-text-muted font-medium mb-1">عدد الجلسات</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{product.sessions} جلسة</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-4">
                                <button
                                    onClick={buyNow}
                                    className="w-full btn btn-primary text-lg py-4 shadow-xl shadow-action-blue/20 hover:shadow-2xl hover:shadow-action-blue/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 font-bold"
                                >
                                    <FiShoppingCart className="text-xl" />
                                    <span>شراء الان</span>
                                </button>

                                <div className="flex gap-4">
                                    <button
                                        onClick={addToCart}
                                        className="w-full btn btn-outline text-lg py-4 bg-white dark:bg-card-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        أضف للسلة
                                    </button>

                                    {product.previewFileUrl && (
                                        <a
                                            href={product.previewFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full btn bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-lg py-4 flex items-center justify-center gap-2 transition-colors font-medium"
                                        >
                                            <FiEye />
                                            <span>معاينة مجانية</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="mt-6 bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between">
                            <Link
                                href={`/${product.user?.username || 'seller'}`}
                                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-action-blue to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                                    {product.user?.name?.charAt(0) || 'م'}
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted mb-1 font-medium">البائع / المدرب</p>
                                    <p className="font-bold text-primary-charcoal dark:text-white text-lg">{product.user?.name || 'البائع'}</p>
                                </div>
                            </Link>
                            <Link href={`/${product.user?.username || 'seller'}`} className="text-action-blue bg-action-blue/10 p-3 rounded-xl hover:bg-action-blue hover:text-white transition-colors">
                                <FiStar />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    <div className="border-b border-gray-100 dark:border-gray-800 mb-8">
                        <nav className="flex gap-8">
                            {['description', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 px-2 border-b-2 font-bold text-lg transition-colors ${activeTab === tab
                                        ? 'border-action-blue text-action-blue'
                                        : 'border-transparent text-text-muted hover:text-primary-charcoal dark:hover:text-gray-300'
                                        }`}
                                >
                                    {tab === 'description' ? 'وصف المنتج والتفاصيل' : `تقييمات العملاء (${reviews.length})`}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {activeTab === 'description' ? (
                        <div className="prose prose-lg max-w-none dark:prose-invert">
                            {/* Render safely from RichTextEditor output */}
                            <div dangerouslySetInnerHTML={{ __html: product.description }} className="text-gray-700 dark:text-gray-300 leading-relaxed ql-editor px-0 px-2" />
                        </div>
                    ) : (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            {/* Add Review Form */}
                            <form onSubmit={submitReview} className="bg-gray-50 dark:bg-bg-light rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold text-xl mb-6 text-primary-charcoal dark:text-white">أضف تقييمك للمنتج</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">الاسم</label>
                                        <input
                                            type="text"
                                            value={newReview.name}
                                            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                            className="input w-full bg-white dark:bg-gray-800 text-lg"
                                            placeholder="اكتب اسمك ليظهر في التقييم"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">مستوى التقييم</label>
                                        <div className="flex gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl inline-flex border border-gray-100 dark:border-gray-700 shadow-sm">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                    className="text-3xl transition-transform hover:scale-110 active:scale-95"
                                                >
                                                    <FiStar
                                                        className={star <= newReview.rating ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' : 'text-gray-200 dark:text-gray-600'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">رأيك</label>
                                        <textarea
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                            className="input w-full bg-white dark:bg-gray-800 resize-none text-lg"
                                            rows={4}
                                            placeholder="شاركنا تجربتك مع هذا المنتج..."
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary px-8 py-3 text-lg font-bold">
                                        نشر التقييم
                                    </button>
                                </div>
                            </form>

                            {/* Reviews List */}
                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-16 bg-gray-50 dark:bg-bg-light rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                            <FiStar size={30} />
                                        </div>
                                        <p className="text-gray-500 font-medium text-lg">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج الرائع!</p>
                                    </div>
                                ) : (
                                    reviews.map((review: any) => (
                                        <div key={review.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300">
                                                        {review.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-lg text-primary-charcoal dark:text-white">{review.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 px-3 py-1.5 rounded-full">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar
                                                            key={i}
                                                            className={`text-sm ${i < review.rating
                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                : 'text-yellow-200 dark:text-yellow-800'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
