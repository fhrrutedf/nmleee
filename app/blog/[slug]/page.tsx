'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiUser, FiClock, FiShare2, FiArrowRight, FiFacebook, FiTwitter, FiLinkedin } from 'react-icons/fi';

export default function BlogPostPage() {
    const params = useParams();
    // In a real app, verify `params.slug` exists or is valid string
    const slug = typeof params?.slug === 'string' ? params.slug : '';

    // Mock Data (Ideally this comes from an API based on slug)
    const post = {
        title: 'كيف تبدأ بيع المنتجات الرقمية: دليلك الشامل لعام 2024',
        content: `
            <p class="lead text-xl text-gray-600 mb-8 font-medium">
                هل تفكر في تحويل مهاراتك ومعرفتك إلى دخل سلبي؟ المنتجات الرقمية هي الطريق الأمثل لذلك. في هذا الدليل، سنأخذك خطوة بخطوة.
            </p>

            <h2 class="text-2xl font-bold mb-4 mt-8 text-primary-charcoal">ما هي المنتجات الرقمية؟</h2>
            <p class="mb-6 text-gray-700 leading-relaxed">
                المنتج الرقمي هو أي منتج غير ملموس يمكنك بيعه وتوزيعه عبر الإنترنت دون الحاجة لمخزون أو شحن. تشمل الأمثلة: الكتب الإلكترونية، الدورات التدريبية، التصاميم، القوالب، والاستشارات.
            </p>

            <h2 class="text-2xl font-bold mb-4 mt-8 text-primary-charcoal">لماذا يجب أن تبدأ الآن؟</h2>
            <ul class="list-disc list-inside mb-6 space-y-2 text-gray-700">
                <li><strong>هامش ربح عالي:</strong> لا توجد تكاليف تصنيع أو شحن.</li>
                <li><strong>قابلية التوسع:</strong> يمكنك بيع نفس المنتج لآلاف العملاء.</li>
                <li><strong>حرية المكان:</strong> أدر عملك من أي مكان في العالم.</li>
            </ul>

            <h2 class="text-2xl font-bold mb-4 mt-8 text-primary-charcoal">الخطوة 1: حدد مهارتك</h2>
            <p class="mb-6 text-gray-700 leading-relaxed">
                ابدأ بما تعرفه. هل أنت مصمم جرافيك؟ كاتب؟ مبرمج؟ أو حتى طباخ ماهر؟ كل مهارة يمكن تحويلها لمنتج.
            </p>

            <blockquote class="border-r-4 border-action-blue pr-4 my-8 italic text-gray-600 bg-gray-50 py-4 rounded-l-lg">
                "أفضل منتج يمكنك بيعه هو الحل لمشكلة كنت تعاني منها سابقاً."
            </blockquote>

            <h2 class="text-2xl font-bold mb-4 mt-8 text-primary-charcoal">الخطوة 2: أنشئ المحتوى</h2>
            <p class="mb-6 text-gray-700 leading-relaxed">
                استخدم أدوات بسيطة. يمكنك كتابة كتاب إلكتروني باستخدام Google Docs، أو تسجيل دورة باستخدام هاتفك الذكي. الجودة في المحتوى أهم من أدوات الإنتاج.
            </p>

            <h2 class="text-2xl font-bold mb-4 mt-8 text-primary-charcoal">الخاتمة</h2>
            <p class="mb-6 text-gray-700 leading-relaxed">
                البدء هو أصعب خطوة. لا تنتظر الكمال، ابدأ بمنتج صغير اليوم وطوره مع الوقت.
            </p>
        `,
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
        author: 'سارة أحمد',
        authorRole: 'خبيرة تجارة إلكترونية',
        date: '15 فبراير 2024',
        readTime: '5 دقائق',
        category: 'دليل المبتدئين'
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Breadcrumb */}
            <div className="bg-gray-50 py-8 border-b border-gray-100">
                <div className="container-custom">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-action-blue">الرئيسية</Link>
                        <span>/</span>
                        <Link href="/blog" className="hover:text-action-blue">المدونة</Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium truncate max-w-xs">{post.title}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container-custom py-12">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Article Column */}
                    <div className="lg:col-span-8">
                        {/* Article Header */}
                        <div className="mb-8">
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-action-blue text-sm font-bold mb-4">
                                {post.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold text-primary-charcoal mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex items-center gap-6 text-gray-500 text-sm border-b border-gray-100 pb-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Author" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{post.author}</p>
                                        <p className="text-xs">{post.authorRole}</p>
                                    </div>
                                </div>
                                <span className="h-4 w-px bg-gray-300"></span>
                                <span className="flex items-center gap-2"><FiCalendar /> {post.date}</span>
                                <span className="h-4 w-px bg-gray-300"></span>
                                <span className="flex items-center gap-2"><FiClock /> {post.readTime}</span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="rounded-2xl overflow-hidden mb-10 shadow-lg">
                            <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
                        </div>

                        {/* Content */}
                        <article
                            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-primary-charcoal prose-p:text-gray-700 prose-a:text-action-blue prose-img:rounded-xl"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Share Section */}
                        <div className="mt-12 py-8 border-t border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FiShare2 /> شارك المقال:
                            </h3>
                            <div className="flex gap-3">
                                <button className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <FiFacebook />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <FiTwitter />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <FiLinkedin />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Newsletter Widget */}
                        <div className="bg-primary-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-action-blue rounded-full mix-blend-overlay filter blur-2xl opacity-20"></div>
                            <h3 className="text-xl font-bold mb-4 relative z-10">تحديثات أسبوعية</h3>
                            <p className="text-gray-300 mb-6 text-sm relative z-10">
                                اشترك في القائمة البريدية ليصلك كل جديد في عالم التجارة الرقمية.
                            </p>
                            <input type="email" placeholder="بريدك الإلكتروني" className="w-full py-3 px-4 rounded-lg bg-gray-800 border border-gray-700 text-white mb-3 focus:outline-none focus:border-action-blue relative z-10" />
                            <button className="w-full py-3 bg-action-blue rounded-lg font-bold hover:bg-blue-600 transition-colors relative z-10">
                                اشتراك
                            </button>
                        </div>

                        {/* Recent Posts Widget */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6 border-r-4 border-action-blue pr-3">مقالات ذات صلة</h3>
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4 group cursor-pointer">
                                        <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={`https://source.unsplash.com/random/200x200?sig=${i}`} alt="post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm mb-1 leading-snug group-hover:text-action-blue transition-colors">
                                                5 خطوات عملية لتحسين مبيعاتك في منصة تمكين
                                            </h4>
                                            <span className="text-xs text-gray-500">10 فبراير 2024</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
