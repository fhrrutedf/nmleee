'use client';

import Link from 'next/link';
import { FiSearch, FiCalendar, FiUser, FiArrowLeft, FiTag, FiClock } from 'react-icons/fi';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedImageUrl } from '@/lib/imagekit';

export default function BlogListClient({ 
    initialPosts, 
    categories 
}: { 
    initialPosts: any[], 
    categories: any[] 
}) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);

    const filteredPosts = initialPosts.filter(post => {
        const matchesCategory = selectedCategory === 'all' || post.categorySlug === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const visiblePosts = filteredPosts.slice(0, visibleCount);

    return (
        <div className="min-h-screen bg-[#060606] text-white selection:bg-emerald-500/30" dir="rtl">
            {/* Hero Section */}
            <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-widest uppercase mb-6">
                            المدونة الرسمية
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                            اكتشف أسرار <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">النمو الرقمي</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                            مقالات حصرية واستراتيجيات مجربة لمساعدتك في بناء وتوسيع مشروعك الرقمي في العالم العربي.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center bg-[#111111] border border-white/10 rounded-2xl p-1.5 focus-within:border-emerald-500/50 transition-all shadow-2xl">
                                <FiSearch className="mr-5 text-slate-500 text-xl" />
                                <input
                                    type="text"
                                    placeholder="ابحث عن موضوع معين..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent py-4 text-white placeholder:text-slate-600 outline-none pr-4 text-lg"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filter Section */}
            <div className="sticky top-0 z-40 bg-[#060606]/80 backdrop-blur-xl border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto hide-scrollbar">
                    <div className="flex items-center gap-2 py-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => {
                                    setSelectedCategory(cat.slug);
                                    setVisibleCount(6);
                                }}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                    selectedCategory === cat.slug
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                        : 'bg-[#111111] text-slate-400 border border-white/5 hover:bg-[#1a1a1a] hover:text-white'
                                }`}
                            >
                                {cat.nameAr}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6">
                    {filteredPosts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <AnimatePresence mode="popLayout">
                                    {visiblePosts.map((post, index) => (
                                        <motion.article 
                                            key={post.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                            className="group flex flex-col bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2"
                                        >
                                            {/* Image Container */}
                                            <Link href={`/blog/${post.slug}`} className="relative h-60 overflow-hidden block">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                <span className="absolute top-4 right-4 z-20 bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                                    {post.categoryName}
                                                </span>
                                                <img
                                                    src={getOptimizedImageUrl(post.coverImage, 600, 400)}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </Link>
                                            
                                            {/* Content Container */}
                                            <div className="p-7 flex-1 flex flex-col">
                                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                                                    <span className="flex items-center gap-1.5"><FiCalendar className="text-emerald-500" /> {new Date(post.createdAt).toLocaleDateString("ar-SA")}</span>
                                                    <span className="flex items-center gap-1.5"><FiClock className="text-emerald-500" /> 5 دقائق قراءة</span>
                                                </div>
                                                
                                                <Link href={`/blog/${post.slug}`}>
                                                    <h2 className="text-xl font-bold mb-4 text-white leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
                                                        {post.title}
                                                    </h2>
                                                </Link>
                                                
                                                <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed">
                                                    {post.excerpt || 'تعلم استراتيجيات النمو المتقدمة لبناء علامتك التجارية الشخصية والمالية.'}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                                            <FiUser size={14} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-300">{post.authorName}</span>
                                                    </div>
                                                    <Link href={`/blog/${post.slug}`} className="text-emerald-500 font-bold text-xs flex items-center gap-2 group/link">
                                                        اقرأ المزيد <FiArrowLeft className="group-hover/link:-translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.article>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Load More */}
                            {visibleCount < filteredPosts.length && (
                                <div className="mt-20 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 6)}
                                        className="px-10 py-4 bg-[#111111] border border-white/10 text-white font-bold rounded-2xl hover:bg-emerald-600 hover:border-emerald-600 transition-all shadow-xl active:scale-95"
                                    >
                                        تحميل المزيد من المقالات
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-32 bg-[#0A0A0A] rounded-[3rem] border border-dashed border-white/10 px-8">
                            <div className="w-20 h-20 bg-[#111111] rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-600">
                                <FiSearch size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">لا توجد مقالات في هذا القسم</h3>
                            <p className="text-slate-400 mb-8 max-w-sm mx-auto">حاول اختيار تصنيف آخر أو البحث بكلمات مختلفة.</p>
                            <button
                                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all"
                            >
                                عرض كل المقالات
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
