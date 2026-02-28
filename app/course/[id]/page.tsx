'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiShoppingCart, FiStar, FiClock, FiVideo, FiUsers, FiCheckCircle, FiBook, FiAward, FiMessageCircle } from 'react-icons/fi';
import Link from 'next/link';

const stripHtml = (html: string) => {
    if (!html) return '';
    // استبدال &nbsp; بمسافة عادية أولاً
    html = html.replace(/&nbsp;/g, ' ');
    return html;
};

export default function CoursePage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        if (params.id) {
            fetchCourse();
            fetchReviews();
        }
    }, [params.id]);

    const fetchCourse = async () => {
        try {
            const res = await fetch(`/api/courses/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setCourse(data);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const addToCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((item: any) => item.id === course.id);

        if (!existing) {
            cart.push({
                id: course.id,
                type: 'course',
                title: course.title,
                price: course.price,
                image: course.image,
                brandColor: course.user?.brandColor
            });
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('تم إضافة الدورة لسلة المشتريات!');
        } else {
            alert('الدورة موجودة بالفعل في السلة');
        }
    };

    const enrollNow = () => {
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

    if (!course) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">الدورة غير موجودة</h1>
                <Link href="/courses" className="btn btn-primary">العودة للدورات</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {course.user?.brandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-primary-600 { color: ${course.user.brandColor} !important; }
                    .bg-primary-600 { background-color: ${course.user.brandColor} !important; }
                    .border-primary-600 { border-color: ${course.user.brandColor} !important; }
                    .ring-primary-600 { --tw-ring-color: ${course.user.brandColor} !important; }
                    .hover\\:bg-primary-700:hover { background-color: ${course.user.brandColor} !important; filter: brightness(0.9); }
                    .hover\\:text-primary-500:hover { color: ${course.user.brandColor} !important; filter: brightness(1.1); }
                    .bg-primary-50 { background-color: ${course.user.brandColor}15 !important; }
                    .text-primary-700 { color: ${course.user.brandColor} !important; filter: brightness(0.8); }
                    `
                }} />
            )}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
                    <span>/</span>
                    <Link href="/courses" className="hover:text-primary-600">الدورات</Link>
                    <span>/</span>
                    <span className="text-gray-900">{course.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Course Video/Image */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                            {course.image ? (
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-[400px] object-cover"
                                />
                            ) : (
                                <div className="w-full h-[400px] bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
                                    <FiVideo className="text-8xl text-blue-400" />
                                </div>
                            )}
                        </div>

                        {/* Course Details */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

                            {/* Rating */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar
                                            key={i}
                                            className={`text-lg ${i < Math.floor(course.averageRating || 0)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600">
                                    ({course.reviewCount || 0} تقييم)
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {course.duration && (
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <FiClock className="text-2xl text-primary-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">المدة</p>
                                        <p className="font-bold">{course.duration}</p>
                                    </div>
                                )}
                                {course.sessions && (
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <FiVideo className="text-2xl text-primary-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">الجلسات</p>
                                        <p className="font-bold">{course.sessions} جلسة</p>
                                    </div>
                                )}
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <FiAward className="text-2xl text-primary-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">الشهادة</p>
                                    <p className="font-bold">معتمدة</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="flex gap-6">
                                    {['description', 'features', 'reviews'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`pb-4 px-2 border-b-2 font-medium transition-colors ${activeTab === tab
                                                ? 'border-primary-600 text-primary-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {tab === 'description' ? 'الوصف' :
                                                tab === 'features' ? 'محتوى الدورة' :
                                                    `التقييمات (${reviews.length})`}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'description' && (
                                <div className="prose max-w-none dark:prose-invert break-words overflow-hidden">
                                    <div
                                        dangerouslySetInnerHTML={{ __html: stripHtml(course.description) }}
                                        className="text-gray-700 dark:text-gray-300 leading-relaxed ql-editor px-0"
                                    />
                                </div>
                            )}

                            {activeTab === 'features' && (
                                <div>
                                    {course.features && course.features.length > 0 ? (
                                        <ul className="space-y-3">
                                            {course.features.map((feature: string, index: number) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">لا توجد مميزات مدرجة</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-4">
                                    {reviews.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">لا توجد تقييمات بعد</p>
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
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Enrollment Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold text-primary-600 mb-2">
                                    {course.price.toFixed(2)} ج.م
                                </div>
                                {course.isFree && (
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        مجاني
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={enrollNow}
                                    className="w-full btn btn-primary text-lg py-4"
                                >
                                    سجّل الآن
                                </button>
                                <button
                                    onClick={addToCart}
                                    className="w-full btn btn-outline text-lg py-4"
                                >
                                    أضف للسلة
                                </button>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiCheckCircle className="text-green-500" />
                                    <span>الوصول مدى الحياة</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiCheckCircle className="text-green-500" />
                                    <span>شهادة إتمام</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiCheckCircle className="text-green-500" />
                                    <span>دعم فني متواصل</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiCheckCircle className="text-green-500" />
                                    <span>ضمان استرجاع 30 يوم</span>
                                </div>
                            </div>

                            {/* Instructor */}
                            {course.user && (
                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-sm text-gray-500 mb-2">المدرب</p>
                                    <Link
                                        href={`/${course.user.username || 'instructor'}`}
                                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {course.user.name?.charAt(0) || 'M'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{course.user.name || 'المدرب'}</p>
                                            <p className="text-sm text-gray-500">مدرب معتمد</p>
                                        </div>
                                    </Link>
                                </div>
                            )}
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
