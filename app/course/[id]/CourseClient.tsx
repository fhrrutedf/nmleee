'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiStar, FiClock, FiVideo, FiCheckCircle, FiAward, FiMessageCircle } from 'react-icons/fi';
import Link from 'next/link';

const stripHtml = (html: string) => {
    if (!html) return '';
    html = html.replace(/&nbsp;/g, ' ');
    return html;
};

export default function CourseClient({ course, reviews: initialReviews, id }: { course: any, reviews: any[], id: string }) {
    const router = useRouter();
    const [reviews, setReviews] = useState(initialReviews);
    const [activeTab, setActiveTab] = useState('description');

    const addToCartItem = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((item: any) => item.id === course.id);

        if (!existing) {
            cart.push({
                id: course.id,
                type: 'course',
                title: course.title,
                price: course.price,
                image: course.image,
                brandColor: course.user?.brandColor
            });
            localStorage.setItem('cart', JSON.stringify(cart));
            return true;
        }
        return false;
    };

    const addToCart = () => {
        if (addToCartItem()) alert('تم إضافة الدورة لسلة المشتريات!');
        else alert('الدورة موجودة بالفعل في السلة');
    };

    const enrollNow = () => {
        addToCartItem();
        router.push('/cart');
    };

    return (
        <div className="min-h-screen bg-[#111111]">
            {course.user?.brandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-[#10B981] { color: ${course.user.brandColor} !important; }
                    .bg-emerald-700 text-white { background-color: ${course.user.brandColor} !important; }
                    .border-emerald-600 { border-color: ${course.user.brandColor} !important; }
                    .ring-accent { --tw-ring-color: ${course.user.brandColor} !important; }
                    .hover\\:bg-primary-700:hover { background-color: ${course.user.brandColor} !important; filter: brightness(0.9); }
                    .bg-primary-50 { background-color: ${course.user.brandColor}15 !important; }
                    `
                }} />
            )}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-bold">
                    <Link href="/" className="hover:text-[#10B981]">الرئيسية</Link>
                    <span>/</span>
                    <Link href="/explore" className="hover:text-[#10B981]">الدورات</Link>
                    <span>/</span>
                    <span className="text-white truncate max-w-[200px]">{course.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-[#0A0A0A] rounded-xl shadow-lg shadow-[#10B981]/20 overflow-hidden mb-6">
                            {course.image ? (
                                <img src={course.image} alt={course.title} className="w-full h-[400px] object-cover" />
                            ) : (
                                <div className="w-full h-[400px] bg-emerald-700 text-white flex items-center justify-center">
                                    <FiVideo className="text-8xl text-blue-400" />
                                </div>
                            )}
                        </div>

                        <div className="bg-[#0A0A0A] rounded-xl shadow-lg shadow-[#10B981]/20 p-8">
                            <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (<FiStar key={i} className={`text-lg ${i < Math.floor(course.averageRating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}
                                </div>
                                <span className="text-gray-400 font-bold">({reviews.length} تقييم)</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {course.duration && (
                                    <div className="text-center p-4 bg-[#111111] rounded-xl">
                                        <FiClock className="text-2xl text-[#10B981] mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 mb-1">المدة</p>
                                        <p className="font-bold text-sm">{course.duration}</p>
                                    </div>
                                )}
                                {course.sessions && (
                                    <div className="text-center p-4 bg-[#111111] rounded-xl">
                                        <FiVideo className="text-2xl text-[#10B981] mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 mb-1">الجلسات</p>
                                        <p className="font-bold text-sm">{course.sessions} جلسة</p>
                                    </div>
                                )}
                                <div className="text-center p-4 bg-[#111111] rounded-xl">
                                    <FiAward className="text-2xl text-[#10B981] mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 mb-1">الشهادة</p>
                                    <p className="font-bold text-sm">متاحة</p>
                                </div>
                            </div>

                            <div className="border-b border-emerald-500/20 mb-6 flex gap-6 overflow-x-auto scrollbar-hide">
                                {['description', 'features', 'reviews'].map((tab) => (
                                    <button
                                        key={tab} onClick={() => setActiveTab(tab)}
                                        className={`pb-4 px-2 border-b-2 font-bold transition-colors whitespace-nowrap ${activeTab === tab ? 'border-emerald-600 text-[#10B981]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {tab === 'description' ? 'الوصف' : tab === 'features' ? 'محتوى الدورة' : `التقييمات (${reviews.length})`}
                                    </button>
                                ))}
                            </div>

                            <div className="p-2 sm:p-4">
                                {activeTab === 'description' ? (
                                    <div className="prose max-w-none dark:prose-invert ql-editor px-0"><div dangerouslySetInnerHTML={{ __html: stripHtml(course.description) }} /></div>
                                ) : activeTab === 'features' ? (
                                    <ul className="space-y-4">
                                        {course.features?.map((feature: string, index: number) => (
                                            <li key={index} className="flex items-start gap-4 p-4 bg-[#111111] rounded-xl">
                                                <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                                <span className="text-white font-bold">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.length === 0 ? (
                                            <div className="text-center py-12"><FiMessageCircle size={36} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-bold">لا توجد تقييمات لهذه الدورة حتى الآن</p></div>
                                        ) : (
                                            reviews.map((review: any) => (
                                                <div key={review.id} className="p-6 bg-[#111111] rounded-xl">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-bold">{review.name}</span>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (<FiStar key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />))}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-300 font-medium leading-relaxed">{review.comment}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-[#0A0A0A] rounded-xl shadow-lg shadow-[#10B981]/20 p-8 sticky top-6 border border-white/10">
                           <div className="text-center mb-8">
                                <div className="text-5xl font-bold text-[#10B981] mb-2">{course.price.toFixed(2)} $</div>
                                {course.isFree && <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold">مجاني 🎉</span>}
                            </div>
                            <div className="space-y-4 mb-8">
                                <button onClick={enrollNow} className="w-full btn btn-primary text-xl py-5 rounded-xl font-bold shadow-lg shadow-[#10B981]/20 shadow-accent/20">سجّل الآن</button>
                                <button onClick={addToCart} className="w-full btn btn-accent text-xl py-4 rounded-xl border-2 font-bold">أضف للسلة</button>
                            </div>
                            <div className="space-y-3 text-sm font-bold">
                                <div className="flex items-center gap-3 text-gray-300"><FiCheckCircle className="text-green-500 text-lg" /><span>الوصول مدى الحياة</span></div>
                                <div className="flex items-center gap-3 text-gray-300"><FiCheckCircle className="text-green-500 text-lg" /><span>دعم فني وتواصل مباشر</span></div>
                                <div className="flex items-center gap-3 text-gray-300"><FiCheckCircle className="text-green-500 text-lg" /><span>شهادة إتمام معتمدة</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="mt-16 py-8 border-t border-white/10 dark:border-gray-800 text-center"><p className="text-gray-500 dark:text-gray-400 font-medium">مدعوم من <a href="https://tmleen.com" className="text-[#10B981] font-bold hover:underline">منصة تمالين</a></p></footer>
        </div>
    );
}
