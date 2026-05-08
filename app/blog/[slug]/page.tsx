import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiClock, FiShare2, FiArrowRight, FiUser, FiChevronLeft } from 'react-icons/fi';
import NewsletterWidget from '@/components/blog/NewsletterWidget';
import { prisma } from '@/lib/db';
import { Metadata } from 'next';
import { getOptimizedImageUrl } from '@/lib/imagekit';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const post = await prisma.article.findUnique({
        where: { slug: decodedSlug },
    });

    if (!post) {
        return { title: 'مقال غير موجود | منصتك الرقمية' };
    }

    return {
        title: `${post.seoTitle || post.title} | منصتك الرقمية`,
        description: post.seoDesc || post.excerpt || 'قم بقراءة هذا المقال المميز على منصتك الرقمية',
        openGraph: {
            title: post.title,
            description: post.excerpt || '',
            images: post.coverImage ? [post.coverImage] : [],
        },
    };
}

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const post = await prisma.article.findUnique({
        where: { slug: decodedSlug },
        include: {
            author: { select: { name: true, avatar: true } },
            category: { select: { nameAr: true, slug: true } }
        }
    });

    if (!post || post.status !== 'PUBLISHED') {
        notFound();
    }

    // Naive read time
    const words = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(words / 200);

    return (
        <div className="min-h-screen bg-[#060606] text-white selection:bg-emerald-500/30 font-sans" dir="rtl">
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
            </div>

            <header className="relative z-10 border-b border-white/5 bg-[#060606]/80 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Link href="/blog" className="hover:text-emerald-500 transition">المدونة</Link>
                        <FiChevronLeft />
                        <span className="text-slate-300 truncate max-w-[200px]">{post.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-white transition">
                            <FiShare2 />
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
                {/* Meta Info */}
                <div className="text-center mb-12">
                    {post.category && (
                        <Link 
                            href={`/blog?category=${post.category.slug}`}
                            className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold mb-6 hover:bg-emerald-500/20 transition"
                        >
                            {post.category.nameAr}
                        </Link>
                    )}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                        {post.title}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-6 text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <FiUser size={14} />
                            </div>
                            <span className="text-slate-300 font-bold">{post.author?.name || 'الكاتب'}</span>
                        </div>
                        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                        <div className="flex items-center gap-2">
                            <FiCalendar /> {new Date(post.createdAt).toLocaleDateString("ar-SA")}
                        </div>
                        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                        <div className="flex items-center gap-2">
                            <FiClock /> {readTime} دقائق قراءة
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                {post.coverImage && (
                    <div className="mb-16 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl shadow-emerald-500/5">
                        <img 
                            src={getOptimizedImageUrl(post.coverImage, 1200)} 
                            alt={post.title} 
                            className="w-full h-auto object-cover max-h-[600px]" 
                        />
                    </div>
                )}

                {/* Article Content */}
                <article className="max-w-3xl mx-auto">
                    <div 
                        className="prose prose-invert prose-emerald prose-lg max-w-none 
                            prose-headings:font-black prose-headings:tracking-tight
                            prose-p:text-slate-300 prose-p:leading-[1.8] prose-p:mb-8
                            prose-img:rounded-3xl prose-img:border prose-img:border-white/5
                            prose-blockquote:border-r-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-500/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-xl
                            prose-li:text-slate-300 prose-strong:text-white
                            tiptap-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    
                    <style>{`
                        .tiptap-content iframe {
                            width: 100%;
                            aspect-ratio: 16/9;
                            border-radius: 1.5rem;
                            margin: 2rem 0;
                            border: 1px solid rgba(255,255,255,0.05);
                        }
                        .tiptap-content table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 2rem 0;
                            background: rgba(255,255,255,0.02);
                            border-radius: 1rem;
                            overflow: hidden;
                        }
                        .tiptap-content th, .tiptap-content td {
                            border: 1px solid rgba(255,255,255,0.05);
                            padding: 1rem;
                            text-align: right;
                        }
                        .tiptap-content th {
                            background: rgba(255,255,255,0.05);
                            color: #10b981;
                        }
                    `}</style>
                </article>

                {/* Footer Section */}
                <div className="mt-20 pt-12 border-t border-white/5">
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2rem] p-8 md:p-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
                            <div className="flex-1">
                                <h3 className="text-2xl md:text-4xl font-black mb-4 leading-tight text-white">هل أعجبك المقال؟ 🚀</h3>
                                <p className="text-emerald-50/80 text-lg mb-0">انضم إلينا الآن وابدأ رحلتك في بناء منتجاتك الرقمية الخاصة.</p>
                            </div>
                            <Link 
                                href="/register" 
                                className="px-10 py-4 bg-white text-emerald-700 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-black/20"
                            >
                                اشترك مجاناً
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-[#0A0A0A] border-t border-white/5 py-12">
                <div className="max-w-4xl mx-auto px-6">
                    <NewsletterWidget />
                </div>
            </footer>
        </div>
    );
}
