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

    useEffect(() => {
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
            {/* Reviews Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">التقييمات والمراجعات</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                            {renderStars(parseFloat(averageRating))}
                        </div>
                        <span className="font-bold text-lg">{averageRating}</span>
                        <span className="text-gray-600">({reviews.length} تقييم)</span>
                    </div>
                </div>

                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                    >
                        أضف تقييمك
                    </button>
                )}
            </div>

            {/* Add Review Form */}
            {showForm && (
                <div className="card bg-gray-50">
                    <h3 className="text-xl font-bold mb-4">أضف تقييمك</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">التقييم *</label>
                            {renderStars(formData.rating, true, (rating) =>
                                setFormData({ ...formData, rating })
                            )}
                        </div>

                        <div>
                            <label className="label">الاسم *</label>
                            <input
                                type="text"
                                required
                                className="input"
                                placeholder="أدخل اسمك"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">التعليق *</label>
                            <textarea
                                required
                                rows={4}
                                className="input"
                                placeholder="شارك رأيك عن المنتج..."
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary flex-1">
                                إرسال التقييم
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn btn-outline flex-1"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="card text-center py-12 bg-gray-50">
                        <FiStar className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">لا توجد تقييمات بعد</p>
                        <p className="text-sm text-gray-500 mt-1">كن أول من يقيّم هذا المنتج!</p>
                    </div>
                ) : (
                    reviews.map((review: any) => (
                        <div key={review.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {renderStars(review.rating)}
                                    </div>
                                    <h4 className="font-bold">{review.name}</h4>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
