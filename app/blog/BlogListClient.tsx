'use client';

import Link from 'next/link';
import { FiSearch, FiCalendar, FiUser, FiArrowLeft, FiTag } from 'react-icons/fi';
import { useState } from 'react';

const CATEGORIES = ['الكل', 'دليل المبتدئين', 'تسويق', 'مبيعات', 'أدوات', 'قصص نجاح', 'تحليلات', 'تقنية', 'عام'];

export default function BlogListClient({ initialPosts }: { initialPosts: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(6); // Pagination / Load More

    const filteredPosts = initialPosts.filter(post => {
        const matchesCategory = selectedCategory === 'الكل' || post.category === selectedCategory || (!post.category && selectedCategory === 'عام');
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const visiblePosts = filteredPosts.slice(0, visibleCount);

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Hero Section */}
            <section className="bg-primary-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="container-custom relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-800 text-primary-200 text-sm font-bold mb-4 border border-primary-700">
                        للمبدعين وصناع المحتوى
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading">
                        مدونة <span className="text-action-blue">المعرفة</span>
                    </h1>
                    <p className="text-xl opacity-80 max-w-2xl mx-auto mb-10 text-gray-300">
                        اكتشف أحدث المقالات، النصائح، والاستراتيجيات لتنمية أعمالك الرقمية وتحقيق النجاح.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative">
                        <input
                            type="text"
                            placeholder="ابحث في المقالات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-4 pl-12 pr-6 rounded-full text-gray-800 shadow-xl focus:outline-none focus:ring-2 focus:ring-action-blue"
                        />
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16">
                <div className="container-custom px-4 mx-auto max-w-7xl">
                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {CATEGORIES.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                                    ? 'bg-action-blue text-white shadow-md transform scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Posts Grid */}
                    {filteredPosts.length > 0 ? (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {visiblePosts.map((post) => (
                                    <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group relative">
                                        <div className="h-48 overflow-hidden relative bg-gray-100">
                                            <div className="absolute top-4 right-4 z-10">
                                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-primary-700 shadow-sm flex items-center gap-1">
                                                    <FiTag /> {post.category || 'عام'}
                                                </span>
                                            </div>
                                            <img
                                                src={post.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60'}
                                                alt={post.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                                <span className="flex items-center gap-1"><FiCalendar /> {new Date(post.createdAt).toLocaleDateString("ar")}</span>
                                            </div>
                                            <h2 className="text-xl font-bold mb-3 text-primary-charcoal group-hover:text-action-blue transition-colors leading-tight">
                                                {post.title}
                                            </h2>
                                            <p className="text-gray-500 mb-6 text-sm line-clamp-3">
                                                {post.excerpt || 'اقرأ المزيد عن هذا الموضوع المثير من خلال النقر على متابعة القراءة.'}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                        <FiUser />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{post.authorName || post.user?.name || 'الكاتب'}</span>
                                                </div>
                                                <Link href={`/blog/${post.slug}`} className="text-action-blue font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                                    اقرأ المزيد <FiArrowLeft />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Load More Button */}
                            {visibleCount < filteredPosts.length && (
                                <div className="mt-12 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 6)}
                                        className="px-8 py-3 bg-white border border-gray-200 text-primary-charcoal font-bold rounded-xl hover:bg-gray-50 hover:text-action-blue transition-colors shadow-sm"
                                    >
                                        تحميل المزيد
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <h3 className="text-2xl font-bold text-gray-400 mb-2">لا توجد نتائج</h3>
                            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تغيير التصنيف.</p>
                            <button
                                onClick={() => { setSelectedCategory('الكل'); setSearchQuery(''); }}
                                className="mt-4 text-action-blue font-bold px-6 py-2 bg-blue-50 rounded-lg hover:bg-blue-100"
                            >
                                إزالة الفلاتر
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
