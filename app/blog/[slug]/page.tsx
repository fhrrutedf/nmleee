import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiUser, FiClock, FiShare2, FiArrowRight, FiFacebook, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { prisma } from '@/lib/db';
import { Metadata } from 'next';

// 1. Generate Metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    let post = await prisma.blogPost.findUnique({
        where: { slug },
    });

    if (!post && slug === 'choosing-winning-digital-product-idea-2026') {
        post = {
            id: 'maher-post-1',
            title: "فن اختيار المنتج الرقمي: كيف تلاقي فكرة يدفع الناس لأجلها؟",
            slug: "choosing-winning-digital-product-idea-2026",
            content: `أسمع الكثير من المدربين يقولون: "عندي فكرة كورس خرافية، لكن لا أحد يشتري". الحقيقة المرة التي لا يحب أحد سماعها هي أن جمهورك لا يهتم بـ "فكرتك"، بل يهتم بـ "مشكلته"...`,
            excerpt: "الفكرة ليست هي الكنز.. الاحتياج هو الكنز الحقيقي. تعلم كيف تكتشف ما يحتاجه جمهورك فعلياً وتحوله إلى أرباح مستدامة.",
            coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
            category: "تحليلات",
            authorName: "ماهر",
            status: 'PUBLISHED',
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'maher-id',
        } as any;
    }

    if (!post) {
        return {
            title: 'مقال غير موجود | تمالين',
        };
    }

    return {
        title: `${post.title} | تمالين`,
        description: post.excerpt || 'قم بقراءة هذا المقال المميز على تمالين',
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

    let post = await prisma.blogPost.findUnique({
        where: { slug },
        include: {
            user: {
                select: { name: true, avatar: true }
            }
        }
    });

    if (!post && slug === 'choosing-winning-digital-product-idea-2026') {
        post = {
            id: 'maher-post-1',
            title: "فن اختيار المنتج الرقمي: كيف تلاقي فكرة يدفع الناس لأجلها؟",
            slug: "choosing-winning-digital-product-idea-2026",
            content: `أسمع الكثير من المدربين يقولون: "عندي فكرة كورس خرافية، لكن لا أحد يشتري". الحقيقة المرة التي لا يحب أحد سماعها هي أن جمهورك لا يهتم بـ "فكرتك"، بل يهتم بـ "مشكلته"...`,
            excerpt: "الفكرة ليست هي الكنز.. الاحتياج هو الكنز الحقيقي. تعلم كيف تكتشف ما يحتاجه جمهورك فعلياً وتحوله إلى أرباح مستدامة.",
            coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
            category: "تحليلات",
            authorName: "ماهر",
            status: 'PUBLISHED',
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'maher-id',
            user: { name: "ماهر", avatar: null }
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
    const authorName = post.authorName || post.user?.name || 'الكاتب';
    const postDate = new Date(post.createdAt).toLocaleDateString("ar");

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            {/* Header / Breadcrumb */}
            <div className="bg-gray-50 py-8 border-b border-gray-100">
                <div className="container-custom px-4 mx-auto max-w-7xl">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-emerald-600">الرئيسية</Link>
                        <span>/</span>
                        <Link href="/blog" className="hover:text-emerald-600">المدونة</Link>
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
                            {post.category && (
                                <span className="inline-block py-1 px-3 rounded-xl bg-emerald-600-50 text-emerald-600 text-sm font-bold mb-4">
                                    {post.category}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-5xl font-bold text-ink mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex items-center gap-6 text-gray-500 text-sm border-b border-gray-100 pb-8 mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 shrink-0">
                                        {post.user?.avatar ? (
                                            <img src={post.user.avatar} alt="Author" className="w-full h-full object-cover" />
                                        ) : (
                                            <FiUser size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{authorName}</p>
                                    </div>
                                </div>
                                <span className="h-4 w-px bg-gray-300"></span>
                                <span className="flex items-center gap-2"><FiCalendar /> {postDate}</span>
                                <span className="h-4 w-px bg-gray-300"></span>
                                <span className="flex items-center gap-2"><FiClock /> {readTime}</span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        {post.coverImage && (
                            <div className="rounded-xl overflow-hidden mb-10 shadow-sm border border-gray-100">
                                <img src={post.coverImage} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
                            </div>
                        )}

                        {/* Content */}
                        <article
                            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-ink prose-p:text-gray-700 prose-a:text-emerald-600 prose-img:rounded-xl prose-p:leading-relaxed mb-20"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Conversion CTA Block */}
                        <div className="bg-ink rounded-xl p-8 md:p-12 text-white shadow-sm shadow-accent/20 relative overflow-hidden group">
                           {/* Decorative background elements */}
                           <div className="absolute top-0 right-0 w-64 h-64 bg-surface/10 rounded-xl -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                           <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-xl translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                           
                           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                               <div className="flex-1 text-center md:text-right">
                                   <h3 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">جاهز لتحويل خبرتك إلى أرباح؟ 🚀</h3>
                                   <p className="text-white/80 text-lg font-medium max-w-lg mb-8">انضم لآلاف المبدعين العرب الذين يبيعون منتجاتهم الرقمية ودوراتهم التدريبية عبر تمالين بكل سهولة.</p>
                                   <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                       <Link href="/register" className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-xl shadow-sm hover:scale-105 transition-transform text-center">
                                           أنشئ متجرك مجاناً
                                       </Link>
                                       <Link href="/explore" className="px-8 py-4 bg-surface/10 text-white border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-all text-center">
                                           استكشف المنتجات
                                       </Link>
                                   </div>
                               </div>
                               <div className="hidden lg:block shrink-0">
                                    <div className="w-48 h-48 bg-white/20 rounded-xl flex items-center justify-center p-4  border border-white/30 rotate-12">
                                        <div className="w-full h-full bg-white rounded-xl flex items-center justify-center text-emerald-600 text-6xl shadow-inner">💰</div>
                                    </div>
                               </div>
                           </div>
                        </div>

                        {/* Share Section Removed to comply with constraints */}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Newsletter Widget */}
                        <div className="bg-primary-900 text-white rounded-xl p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 rounded-xl mix-blend-overlay filter blur-2xl opacity-20"></div>
                            <h3 className="text-xl font-bold mb-4 relative z-10">تحديثات أسبوعية</h3>
                            <p className="text-gray-300 mb-6 text-sm relative z-10">
                                اشترك في القائمة البريدية ليصلك كل جديد في عالم التجارة الرقمية.
                            </p>
                            <input type="email" placeholder="بريدك الإلكتروني" className="w-full py-3 px-4 rounded-lg bg-gray-800 border border-gray-700 text-white mb-3 focus:outline-none focus:border-emerald-600 relative z-10" />
                            <button className="w-full py-3 bg-emerald-600 rounded-lg font-bold hover:bg-emerald-600-600 transition-colors relative z-10">
                                اشتراك
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
