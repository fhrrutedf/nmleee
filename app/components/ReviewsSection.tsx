'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiStar } from 'react-icons/fi';

export default function ReviewsSection({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: '',
        name: '',
    });

    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?productId=${productId}`);
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    productId,
                }),
            });

            if (response.ok) {
                alert('تم إضافة تقييمك بنجاح! ✅');
                setShowForm(false);
                setFormData({ rating: 5, comment: '', name: '' });
                fetchReviews();
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const renderStars = (rating: number, interactive = false, onClick?: (rating: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && onClick?.(star)}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
                        disabled={!interactive}
                    >
                        <FiStar
                            className={`text-xl ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-primary-charcoal dark:text-white">التقييمات والمراجعات</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                            {renderStars(parseFloat(averageRating))}
                        </div>
                        <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{hasMounted ? averageRating : '5.0'}</span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">({hasMounted ? reviews.length : 0} تقييم)</span>
                    </div>
                </div>

                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary px-6 py-3 font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                        أضف تقييمك
                    </button>
                )}
            </div>

            {/* Add Review Form */}
            {showForm && (
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-inner">
                    <h3 className="font-black text-xl mb-6 text-gray-900 dark:text-white flex items-center gap-2"><FiStar className="text-yellow-400" /> قيم تجربتك</h3>
                    <form onSubmit={handleSubmit} className="space-y-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الاسم *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-action-blue outline-none transition-all placeholder:font-normal text-gray-800 dark:text-gray-200"
                                    placeholder="أدخل اسمك"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">التقييم *</label>
                                <div className="flex gap-2 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className={`flex-1 bg-white dark:bg-gray-900 border ${star <= formData.rating ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 flex items-center justify-center transition-all transform active:scale-95`}
                                        >
                                            <FiStar className={`text-xl ${star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">التعليق *</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-action-blue outline-none transition-all resize-none placeholder:font-normal text-gray-800 dark:text-gray-200"
                                placeholder="شارك رأيك عن المنتج..."
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button type="submit" className="btn btn-primary flex-1 py-3 text-lg font-bold shadow-lg shadow-action-blue/20">
                                إرسال التقييم
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex-1 py-3 text-lg font-bold transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {loading || !hasMounted ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-action-blue border-t-transparent mx-auto"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600 shadow-sm">
                            <FiStar size={36} />
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
    );
}
