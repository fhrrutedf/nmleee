'use client';

import Link from 'next/link';
import { FiSearch, FiCalendar, FiUser, FiArrowLeft, FiTag } from 'react-icons/fi';
import { useState } from 'react';

// Mock Data for Blog Posts
const BLOG_POSTS = [
    {
        id: 1,
        slug: 'how-to-start-selling-digital-products',
        title: 'كيف تبدأ بيع المنتجات الرقمية: دليلك الشامل لعام 2024',
        excerpt: 'اكتشف الخطوات الأساسية لتحويل مهاراتك إلى منتجات رقمية مربحة، من الفكرة إلى أول عملية بيع.',
        category: 'دليل المبتدئين',
        author: 'سارة أحمد',
        date: '15 فبراير 2024',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60',
        readTime: '5 دقائق'
    },
    {
        id: 2,
        slug: 'marketing-strategies-for-creators',
        title: '5 استراتيجيات تسويقية لا غنى عنها لصناع المحتوى',
        excerpt: 'تعلم كيف تسوق لمنتجاتك بذكاء باستخدام وسائل التواصل الاجتماعي وقوائم البريد الإلكتروني.',
        category: 'تسويق',
        author: 'محمد علي',
        date: '10 فبراير 2024',
        image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&auto=format&fit=crop&q=60',
        readTime: '7 دقائق'
    },
    {
        id: 3,
        slug: 'pricing-your-course-correctly',
        title: 'كيف تسعر دورتك التدريبية بشكل صحيح؟',
        excerpt: 'هل تبيع بسعر رخيص جداً أم غالٍ جداً؟ إليك المعادلة الذهبية لتسعير منتجاتك المعرفية.',
        category: 'مبيعات',
        author: 'خالد عمر',
        date: '05 فبراير 2024',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60',
        readTime: '4 دقائق'
    },
    {
        id: 4,
        slug: 'tools-every-creator-needs',
        title: 'أدوات تقنية يحتاجها كل صانع محتوى في حقيبته',
        excerpt: 'استعراض لأفضل الأدوات والبرامج التي ستوفر عليك الوقت والجهد في إنتاج المحتوى.',
        category: 'أدوات',
        author: 'نور الهدى',
        date: '01 فبراير 2024',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60',
        readTime: '6 دقائق'
    },
    {
        id: 5,
        slug: 'success-story-ahmed',
        title: 'قصة نجاح: كيف حقق أحمد 10,000$ في شهر واحد',
        excerpt: 'مقابلة حصرية مع أحد شركاء النجاح في منصتنا، يشارك فيها أسراره وتحدياته.',
        category: 'قصص نجاح',
        author: 'فريق التحرير',
        date: '28 يناير 2024',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=60',
        readTime: '8 دقائق'
    },
    {
        id: 6,
        slug: 'future-of-e-learning',
        title: 'مستقبل التعليم الإلكتروني في العالم العربي',
        excerpt: 'تحليل للاتجاهات الحالية والمستقبلية في سوق التعليم عن بعد والمنتجات الرقمية.',
        category: 'تحليلات',
        author: 'د. سامي',
        date: '20 يناير 2024',
        image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=60',
        readTime: '5 دقائق'
    }
];

const CATEGORIES = ['الكل', 'دليل المبتدئين', 'تسويق', 'مبيعات', 'أدوات', 'قصص نجاح', 'تحليلات'];

export default function BlogPage() {
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPosts = BLOG_POSTS.filter(post => {
        const matchesCategory = selectedCategory === 'الكل' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50">
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
                            className="w-full py-4 px-6 pr-12 rounded-full text-gray-800 shadow-xl focus:outline-none focus:ring-2 focus:ring-action-blue"
                        />
                        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16">
                <div className="container-custom">
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
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post) => (
                                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group">
                                    <div className="h-48 overflow-hidden relative">
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-primary-700 shadow-sm flex items-center gap-1">
                                                <FiTag /> {post.category}
                                            </span>
                                        </div>
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1"><FiCalendar /> {post.date}</span>
                                            <span>•</span>
                                            <span>{post.readTime} قراءة</span>
                                        </div>
                                        <h2 className="text-xl font-bold mb-3 text-primary-charcoal group-hover:text-action-blue transition-colors leading-tight">
                                            {post.title}
                                        </h2>
                                        <p className="text-text-muted mb-6 text-sm line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    <FiUser />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{post.author}</span>
                                            </div>
                                            <Link href={`/blog/${post.slug}`} className="text-action-blue font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                                اقرأ المزيد <FiArrowLeft />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
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

                    {/* Pagination (Visual Only) */}
                    {filteredPosts.length > 0 && (
                        <div className="mt-16 flex justify-center gap-2">
                            <button className="w-10 h-10 rounded-lg bg-action-blue text-white font-bold flex items-center justify-center shadow-md">1</button>
                            <button className="w-10 h-10 rounded-lg bg-white text-gray-600 hover:bg-gray-100 font-bold flex items-center justify-center border border-gray-200 transition-colors">2</button>
                            <button className="w-10 h-10 rounded-lg bg-white text-gray-600 hover:bg-gray-100 font-bold flex items-center justify-center border border-gray-200 transition-colors">3</button>
                            <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container-custom max-w-4xl text-center">
                    <div className="bg-gray-900 rounded-3xl p-10 md:p-16 text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-action-blue rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">اشترك في نشرتنا البريدية</h2>
                            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                                احصل على أحدث المقالات والنصائح الحصرية لتنمية مشروعك الرقمي مباشرة في صندوق واردك.
                            </p>
                            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder="بريدك الإلكتروني"
                                    className="flex-1 py-3 px-6 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-action-blue"
                                />
                                <button className="btn bg-action-blue hover:bg-white hover:text-action-blue py-3 px-8 rounded-xl font-bold transition-colors">
                                    اشترك الآن
                                </button>
                            </form>
                            <p className="text-xs text-gray-500 mt-4">نحترم خصوصيتك. لا رسائل مزعجة أبداً.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
