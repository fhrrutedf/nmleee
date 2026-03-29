'use client';

import Link from 'next/link';
import { FiSearch, FiCalendar, FiUser, FiArrowLeft, FiTag, FiClock } from 'react-icons/fi';
import { useState } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = ['الكل', 'دليل المبتدئين', 'تسويق', 'مبيعات', 'أدوات', 'قصص نجاح', 'تحليلات', 'تقنية', 'عام'];

export default function BlogListClient({ initialPosts }: { initialPosts: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);

    const filteredPosts = initialPosts.filter(post => {
        const matchesCategory = selectedCategory === 'الكل' || post.category === selectedCategory || (!post.category && selectedCategory === 'عام');
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const visiblePosts = filteredPosts.slice(0, visibleCount);

    return (
        <div className="min-h-screen bg-white selection:bg-emerald-600/20" dir="rtl">
            {/* Minimalist Corporate Blog Hero */}
            <section className="bg-ink text-white py-24 md:py-32 relative overflow-hidden border-b border-white/5">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-600/5 rounded-xl blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] mb-10 text-emerald-600 shadow-sm">
                            <FiTag size={14} /> Knowledge & Insights Hub
                        </div>
                        <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter leading-[1.1]">
                            مدونة <span className="text-emerald-600 underline underline-offset-[12px] decoration-accent/20 decoration-4 text-white">تمالين</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-bold leading-relaxed mb-12">
                            مقالات استراتيجية مكتوبة بعناية لتساعدك في بناء وتنمية إمبراطوريتك الرقمية في الوطن العربي.
                        </p>

                        {/* High-Contrast Search Bar */}
                        <div className="max-w-2xl mx-auto relative group">
                            <FiSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-emerald-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="عن ماذا تبحث اليوم؟"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-5 pl-8 pr-16 rounded-xl bg-white text-ink font-bold placeholder:font-bold placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-accent/20 transition-all border-none shadow-sm"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Category Filter - Structural Styling */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-20 border-b border-gray-50 pb-10">
                        {CATEGORIES.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${selectedCategory === cat
                                    ? 'bg-ink text-white shadow-sm shadow-ink/10 -translate-y-1'
                                    : 'bg-white text-gray-400 border border-gray-100 hover:border-ink hover:text-ink'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Posts Grid - Architectural Layout */}
                    {filteredPosts.length > 0 ? (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {visiblePosts.map((post) => (
                                    <article key={post.id} className="group flex flex-col bg-white border border-gray-100 rounded-[2.5rem] p-4 transition-all duration-500 hover:border-emerald-600/20 hover:shadow-sm hover:shadow-gray-200/50">
                                        <div className="h-64 overflow-hidden rounded-[2rem] relative bg-gray-50 mb-8 border border-gray-50">
                                            <div className="absolute top-4 right-4 z-10">
                                                <span className="bg-white px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-ink shadow-sm shadow-black/5 flex items-center gap-2 outline outline-1 outline-gray-50">
                                                    <FiTag className="text-emerald-600" /> {post.category || 'Insights'}
                                                </span>
                                            </div>
                                            <img
                                                src={post.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60'}
                                                alt={post.title}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                        
                                        <div className="px-4 pb-4 flex-1 flex flex-col">
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                                <span className="flex items-center gap-1.5"><FiCalendar className="text-emerald-600" /> {new Date(post.createdAt).toLocaleDateString("ar")}</span>
                                                <span className="flex items-center gap-1.5"><FiClock className="text-emerald-600" /> 5 MIN READ</span>
                                            </div>
                                            
                                            <h2 className="text-2xl font-bold mb-4 text-ink leading-[1.2] tracking-tighter group-hover:text-emerald-600 transition-colors">
                                                {post.title}
                                            </h2>
                                            
                                            <p className="text-gray-400 font-bold text-sm mb-8 line-clamp-2 leading-relaxed h-10">
                                                {post.excerpt || 'تعلم استراتيجيات النمو المتقدمة لبناء علامتك التجارية الشخصية والمالية.'}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent transition-all">
                                                        <FiUser size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-ink uppercase tracking-wider">{post.authorName || 'Maher'}</span>
                                                </div>
                                                <Link href={`/blog/${post.slug}`} className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 group-hover:gap-5 transition-all outline-none">
                                                    Read Article <FiArrowLeft className="rotate-180" size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Load More Button - Clean Institutional Style */}
                            {visibleCount < filteredPosts.length && (
                                <div className="mt-20 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 6)}
                                        className="px-12 py-5 bg-white border border-gray-200 text-ink font-bold text-xs uppercase tracking-[0.25em] rounded-xl hover:border-ink hover:text-ink transition-all shadow-sm hover:shadow-sm active:scale-95"
                                    >
                                        Load More Insights
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-40 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 p-8">
                             <div className="w-20 h-20 bg-white rounded-xl shadow-sm shadow-gray-200/50 flex items-center justify-center mx-auto mb-8 text-gray-200">
                                <FiSearch size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-ink mb-2 tracking-tight">لا توجد نتائج مطابقة لفلترك</h3>
                            <p className="text-gray-400 font-bold mb-10 max-w-sm mx-auto">حاول استخدام كلمات مختلفة أو ابحث في تصنيف آخر.</p>
                            <button
                                onClick={() => { setSelectedCategory('الكل'); setSearchQuery(''); }}
                                className="px-10 py-4 bg-ink text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-sm shadow-ink/10"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
