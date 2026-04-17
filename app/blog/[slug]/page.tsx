import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiClock, FiShare2, FiArrowRight, FiFacebook, FiTwitter, FiLinkedin } from 'react-icons/fi';
import NewsletterWidget from '@/components/blog/NewsletterWidget';
import { prisma } from '@/lib/db';
import { Metadata } from 'next';

// 1. Generate Metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    let post = await prisma.article.findUnique({
        where: { slug: decodedSlug },
    });

    if (!post && decodedSlug === 'choosing-winning-digital-product-idea-2026') {
        post = {
            id: 'maher-post-1',
            title: "فن اختيار المنتج الرقمي: كيف تلاقي فكرة يدفع الناس لأجلها؟",
            slug: "choosing-winning-digital-product-idea-2026",
            content: `أسمع الكثير من المدربين يقولون: "عندي فكرة كورس خرافية، لكن لا أحد يشتري". الحقيقة المرة التي لا يحب أحد سماعها هي أن جمهورك لا يهتم بـ "فكرتك"، بل يهتم بـ "مشكلته"...`,
            excerpt: "الفكرة ليست هي الكنز.. الاحتياج هو الكنز الحقيقي. تعلم كيف تكتشف ما يحتاجه جمهورك فعلياً وتحوله إلى أرباح مستدامة.",
            coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
            status: 'PUBLISHED',
            tags: ["تحليلات"],
            createdAt: new Date(),
            updatedAt: new Date(),
            authorId: 'maher-id',
        } as any;
    }

    if (!post) {
        return {
            title: 'مقال غير موجود | منصتك الرقمية',
        };
    }

    return {
        title: `${post.title} | منصتك الرقمية`,
        description: post.excerpt || 'قم بقراءة هذا المقال المميز على منصتك الرقمية',
        openGraph: {
            title: post.title,
            description: post.excerpt || '',
            images: post.coverImage ? [post.coverImage] : [],
        },
    };
}

export const revalidate = 60; // SSR with ISR

// 2. Server Component setup
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    let post = await prisma.article.findUnique({
        where: { slug: decodedSlug },
        include: {
            author: {
                select: { name: true, avatar: true }
            }
        }
    });

    if (!post && decodedSlug === 'choosing-winning-digital-product-idea-2026') {
        post = {
            id: 'maher-post-1',
            title: "فن اختيار المنتج الرقمي: كيف تلاقي فكرة يدفع الناس لأجلها؟",
            slug: "choosing-winning-digital-product-idea-2026",
            content: `أسمع الكثير من المدربين يقولون: "عندي فكرة كورس خرافية، لكن لا أحد يشتري". الحقيقة المرة التي لا يحب أحد سماعها هي أن جمهورك لا يهتم بـ "فكرتك"، بل يهتم بـ "مشكلته"...`,
            excerpt: "الفكرة ليست هي الكنز.. الاحتياج هو الكنز الحقيقي. تعلم كيف تكتشف ما يحتاجه جمهورك فعلياً وتحوله إلى أرباح مستدامة.",
            coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
            status: 'PUBLISHED',
            tags: ["تحليلات"],
            createdAt: new Date(),
            updatedAt: new Date(),
            authorId: 'maher-id',
            author: { name: "ماهر", avatar: null }
        } as any;
    }

    if (!post || post.status !== 'PUBLISHED') {
        notFound();
    }

    // Function to calculate read time naively (200 words per minute)
    const calculateReadTime = (text: string) => {
        const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} دقائق`;
    };

    const readTime = calculateReadTime(post.content);
    const authorName = post.author?.name || 'الكاتب';
    const postDate = new Date(post.createdAt).toLocaleDateString("ar");

    return (
        <div className="min-h-screen bg-[#0A0A0A]" dir="rtl">
            {/* Header / Breadcrumb */}
            <div className="bg-[#111111] py-8 border-b border-white/10">
                <div className="container-custom px-4 mx-auto max-w-7xl">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-[#10B981]">الرئيسية</Link>
                        <span>/</span>
                        <Link href="/blog" className="hover:text-[#10B981]">المدونة</Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium truncate max-w-xs">{post.title}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container-custom px-4 mx-auto max-w-7xl py-12">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Article Column */}
                    <div className="lg:col-span-8">
                        {/* Article Header */}
                        <div className="mb-8">
                            {post.tags && post.tags.length > 0 && (
                                <span className="inline-block py-1 px-3 rounded-xl bg-emerald-700 text-white-50 text-[#10B981] text-sm font-bold mb-4">
                                    {post.tags[0]}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-5xl font-bold text-[#10B981] mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex items-center gap-6 text-gray-500 text-sm border-b border-white/10 pb-8 mt-6">
                                <span className="flex items-center gap-2"><FiCalendar /> {postDate}</span>
                                <span className="h-4 w-px bg-gray-300"></span>
                                <span className="flex items-center gap-2"><FiClock /> {readTime}</span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        {post.coverImage && (
                            <div className="rounded-xl overflow-hidden mb-10 shadow-lg shadow-[#10B981]/20 border border-white/10">
                                <img src={post.coverImage} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
                            </div>
                        )}

                        {/* Content */}
                        <article
                            className="prose prose-lg prose-invert max-w-none prose-headings:font-bold prose-headings:text-[#10B981] prose-p:text-gray-300 prose-a:text-[#10B981] prose-img:rounded-xl prose-li:text-gray-300 prose-ul:list-disc prose-ol:list-decimal prose-ul:mr-6 prose-ol:mr-6 prose-strong:text-emerald-400 prose-p:leading-relaxed mb-20"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Conversion CTA Block */}
                        <div className="bg-emerald-700 text-white rounded-xl p-8 md:p-12 text-white shadow-lg shadow-[#10B981]/20 shadow-accent/20 relative overflow-hidden group">
                           {/* Decorative background elements */}
                           <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A0A0A]/10 rounded-xl -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                           <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-xl translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                           
                           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                               <div className="flex-1 text-center md:text-right">
                                   <h3 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">جاهز لتحويل خبرتك إلى أرباح؟ 🚀</h3>
                                   <p className="text-white/80 text-lg font-medium max-w-lg mb-8">انضم لآلاف المبدعين العرب الذين يبيعون منتجاتهم الرقمية ودوراتهم التدريبية عبر منصتك الرقمية بكل سهولة.</p>
                                   <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                       <Link href="/register" className="px-8 py-4 bg-[#0A0A0A] text-[#10B981] rounded-xl font-bold text-xl shadow-lg shadow-[#10B981]/20 hover:scale-105 transition-transform text-center">
                                           أنشئ متجرك مجاناً
                                       </Link>
                                       <Link href="/explore" className="px-8 py-4 bg-[#0A0A0A]/10 text-white border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-all text-center">
                                           استكشف المنتجات
                                       </Link>
                                   </div>
                               </div>
                               <div className="hidden lg:block shrink-0">
                                    <div className="w-48 h-48 bg-white/20 rounded-xl flex items-center justify-center p-4  border border-white/30 rotate-12">
                                        <div className="w-full h-full bg-[#0A0A0A] rounded-xl flex items-center justify-center text-[#10B981] text-6xl shadow-inner">💰</div>
                                    </div>
                               </div>
                           </div>
                        </div>

                        {/* Share Section Removed to comply with constraints */}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        <NewsletterWidget />
                    </aside>
                </div>
            </main>
        </div>
    );
}
