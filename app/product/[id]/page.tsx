'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiShoppingCart, FiStar, FiDownload, FiClock, FiVideo, FiUsers, FiCheckCircle, FiBook, FiAward, FiMessageCircle } from 'react-icons/fi';
import Link from 'next/link';
import { apiGet, apiPost, handleApiError } from '@/lib/safe-fetch';

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });

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
        // حفظ في localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((item: any) => item.id === product.id);

        if (!existing) {
            cart.push({
                id: product.id,
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
                <Link href="/" className="btn btn-primary">العودة للرئيسية</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-primary-600">المنتجات</Link>
                    <span>/</span>
                    <span className="text-gray-900">{product.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Image */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-[500px] object-cover"
                            />
                        ) : (
                            <div className="w-full h-[500px] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <FiBook className="text-8xl text-primary-400" />
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="mb-4">
                            {product.category && (
                                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-3">
                                    {product.category}
                                </span>
                            )}
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

                            {/* Rating */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar
                                            key={i}
                                            className={`text-lg ${i < Math.floor(product.averageRating || 0)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600">
                                    ({product.reviewCount || 0} تقييم)
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6 pb-6 border-b">
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-bold text-primary-600">
                                    {product.price.toFixed(2)} ج.م
                                </span>
                                {product.isFree && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        مجاني
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-900 mb-3">ما ستحصل عليه:</h3>
                                <ul className="space-y-2">
                                    {product.features.map((feature: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Course Details */}
                        {(product.duration || product.sessions) && (
                            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                {product.duration && (
                                    <div className="flex items-center gap-2">
                                        <FiClock className="text-primary-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">المدة</p>
                                            <p className="font-medium">{product.duration}</p>
                                        </div>
                                    </div>
                                )}
                                {product.sessions && (
                                    <div className="flex items-center gap-2">
                                        <FiVideo className="text-primary-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">الجلسات</p>
                                            <p className="font-medium">{product.sessions} جلسة</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={buyNow}
                                className="w-full btn btn-primary text-lg py-4 flex items-center justify-center gap-2"
                            >
                                <FiShoppingCart />
                                <span>اشتر الآن</span>
                            </button>
                            <button
                                onClick={addToCart}
                                className="w-full btn btn-outline text-lg py-4"
                            >
                                أضف للسلة
                            </button>
                        </div>

                        {/* Seller Info */}
                        <div className="mt-6 pt-6 border-t">
                            <Link
                                href={`/${product.user?.username || 'seller'}`}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {product.user?.name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">البائع</p>
                                    <p className="font-medium">{product.user?.name || 'البائع'}</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex gap-6">
                            {['description', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 px-2 border-b-2 font-medium transition-colors ${activeTab === tab
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab === 'description' ? 'الوصف' : `التقييمات (${reviews.length})`}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {activeTab === 'description' ? (
                        <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Add Review Form */}
                            <form onSubmit={submitReview} className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-bold text-lg mb-4">أضف تقييمك</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">اسمك</label>
                                        <input
                                            type="text"
                                            value={newReview.name}
                                            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                            className="input w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">التقييم</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                    className="text-2xl"
                                                >
                                                    <FiStar
                                                        className={star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">تعليقك</label>
                                        <textarea
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                            className="input w-full"
                                            rows={4}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        إرسال التقييم
                                    </button>
                                </div>
                            </form>

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
                                ) : (
                                    reviews.map((review: any) => (
                                        <div key={review.id} className="border-b pb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{review.name}</span>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar
                                                            key={i}
                                                            className={`text-sm ${i < review.rating
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-700">{review.comment}</p>
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
