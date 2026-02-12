'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiVideo, FiStar, FiSearch, FiClock, FiUsers } from 'react-icons/fi';

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses');
            if (res.ok) {
                const data = await res.json();
                setCourses(data.filter((c: any) => c.isActive));
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter((course: any) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold gradient-text mb-4">الدورات التدريبية</h1>
                    <p className="text-xl text-gray-600">تعلم مهارات جديدة مع خبراء المجال</p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="relative max-w-xl mx-auto">
                        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن دورة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pr-10 w-full"
                        />
                    </div>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length === 0 ? (
                    <div className="text-center py-12">
                        <FiVideo className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد دورات متاحة حالياً</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map((course: any) => (
                            <Link
                                key={course.id}
                                href={`/product/${course.id}`}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all group"
                            >
                                {course.image ? (
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-56 bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
                                        <FiVideo className="text-6xl text-blue-400" />
                                    </div>
                                )}

                                <div className="p-6">
                                    <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {course.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                                        {course.duration && (
                                            <div className="flex items-center gap-1">
                                                <FiClock />
                                                <span>{course.duration}</span>
                                            </div>
                                        )}
                                        {course.sessions && (
                                            <div className="flex items-center gap-1">
                                                <FiVideo />
                                                <span>{course.sessions} جلسة</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    className={`text-sm ${i < Math.floor(course.averageRating || 0)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-2xl font-bold text-primary-600">
                                            {course.price.toFixed(0)} ج.م
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
