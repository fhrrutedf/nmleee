'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { FiShoppingCart, FiCheck, FiStar, FiUsers, FiClock, FiVideo, FiBookOpen } from 'react-icons/fi';

interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    image?: string;
    category?: string;
    level?: string;
    duration?: string;
    averageRating?: number;
    reviewCount?: number;
    user: {
        name: string;
        avatar?: string;
    };
    modules?: Array<{
        title: string;
        lessons: Array<{ title: string }>;
    }>;
}

export default function CoursePage() {
    const params = useParams();
    const { addToCart, items } = useCart();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInCart, setIsInCart] = useState(false);

    useEffect(() => {
        fetchCourse();
        trackAffiliateClick();
    }, [params.slug]);

    useEffect(() => {
        if (course) {
            setIsInCart(items.some((item) => item.id === course.id));
        }
    }, [items, course]);

    const trackAffiliateClick = () => {
        const ref = new URLSearchParams(window.location.search).get('ref');
        if (ref) {
            localStorage.setItem('affiliateRef', ref);
            fetch('/api/affiliate/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: ref }),
            }).catch(console.error);
        }
    };

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${params.slug}`);
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
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">الكورس غير موجود</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            {/* Image */}
                            {course.image ? (
                                <div className="relative w-full h-96">
                                    <Image
                                        src={course.image}
                                        alt={course.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                                    <FiVideo size={64} className="text-gray-400" />
                                </div>
                            )}

                            <div className="p-8">
                                {course.category && (
                                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium mb-4">
                                        {course.category}
                                    </span>
                                )}

                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    {course.title}
                                </h1>

                                {/* Rating */}
                                {course.averageRating && (
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    size={20}
                                                    className={
                                                        i < Math.floor(course.averageRating!)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <span className="text-gray-600">
                                            {course.averageRating.toFixed(1)} ({course.reviewCount} تقييم)
                                        </span>
                                    </div>
                                )}

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-6 mb-6 text-gray-600">
                                    {course.level && (
                                        <div className="flex items-center gap-2">
                                            <FiBookOpen />
                                            <span>{course.level}</span>
                                        </div>
                                    )}
                                    {course.duration && (
                                        <div className="flex items-center gap-2">
                                            <FiClock />
                                            <span>{course.duration}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="prose max-w-none text-gray-700">
                                    <h2 className="text-xl font-bold mb-3">عن الكورس</h2>
                                    <p>{course.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Curriculum */}
                        {course.modules && course.modules.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">محتوى الكورس</h2>
                                <div className="space-y-4">
                                    {course.modules.map((module, idx) => (
                                        <div key={idx} className="border rounded-lg p-4">
                                            <h3 className="font-bold text-gray-900 mb-3">{module.title}</h3>
                                            <ul className="space-y-2">
                                                {module.lessons.map((lesson, lessonIdx) => (
                                                    <li key={lessonIdx} className="flex items-center gap-2 text-gray-600">
                                                        <FiCheck className="text-green-600" />
                                                        <span>{lesson.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                            {/* Instructor */}
                            <div className="flex items-center gap-3 mb-6">
                                {course.user.avatar && (
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={course.user.avatar}
                                            alt={course.user.name}
                                            fill
                                            className="object-cover rounded-full"
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500">المدرب</p>
                                    <p className="font-medium text-gray-900">{course.user.name}</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="text-4xl font-bold text-indigo-600 mb-1">
                                    {course.price.toFixed(2)} ج.م
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="space-y-3">
                                {!isInCart ? (
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiShoppingCart />
                                        أضف للسلة
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-3 bg-green-100 text-green-700 rounded-lg font-medium flex items-center justify-center gap-2"
                                    >
                                        <FiCheck />
                                        في السلة
                                    </button>
                                )}
                            </div>

                            {/* Trust Badge */}
                            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                                <p className="text-sm text-indigo-900 font-medium mb-1">
                                    ضمان استرجاع الأموال
                                </p>
                                <p className="text-xs text-indigo-700">
                                    إذا لم تكن راضياً خلال 30 يوم، يمكنك استرجاع أموالك بالكامل.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
