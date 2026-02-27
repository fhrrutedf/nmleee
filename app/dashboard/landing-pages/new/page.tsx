'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiEye } from 'react-icons/fi';
import CountdownTimer from '@/components/CountdownTimer';
import toast from 'react-hot-toast';

export default function CreateLandingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        headline: '',
        subheadline: '',
        heroImage: '',
        features: ['', '', ''],
        testimonials: [{ name: '', content: '', avatar: '' }],
        ctaText: 'اشترك الآن',
        ctaLink: '',
        showCountdown: false,
        countdownEndDate: '',
        discountPercentage: '',
        backgroundColor: '#ffffff',
        primaryColor: '#4f46e5',
    });

    const addFeature = () => {
        setFormData({
            ...formData,
            features: [...formData.features, ''],
        });
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/landing-pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/landing/${data.slug}`);
            } else {
                toast.error('حدث خطأ أثناء إنشاء الصفحة');
            }
        } catch (error) {
            console.error('Error creating landing page:', error);
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">إنشاء صفحة هبوط</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    عنوان الصفحة *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رابط الصورة الرئيسية
                                </label>
                                <input
                                    type="url"
                                    value={formData.heroImage}
                                    onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Headlines */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                العنوان الرئيسي *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.headline}
                                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                placeholder="مثال: احصل على أفضل دورة في تطوير الويب"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                العنوان الفرعي
                            </label>
                            <textarea
                                value={formData.subheadline}
                                onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                                placeholder="وصف مختصر للعرض"
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المميزات
                            </label>
                            <div className="space-y-2">
                                {formData.features.map((feature, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        placeholder={`ميزة ${index + 1}`}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                + إضافة ميزة
                            </button>
                        </div>

                        {/* CTA */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نص زر الإجراء *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.ctaText}
                                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رابط زر الإجراء *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.ctaLink}
                                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Countdown */}
                        <div className="border-t pt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="checkbox"
                                    id="showCountdown"
                                    checked={formData.showCountdown}
                                    onChange={(e) => setFormData({ ...formData, showCountdown: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="showCountdown" className="text-sm font-medium text-gray-700">
                                    إضافة عداد تنازلي للعرض المحدود
                                </label>
                            </div>

                            {formData.showCountdown && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            تاريخ انتهاء العرض
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.countdownEndDate}
                                            onChange={(e) => setFormData({ ...formData, countdownEndDate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            نسبة الخصم (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.discountPercentage}
                                            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-2 gap-4 border-t pt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    لون الخلفية
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={formData.backgroundColor}
                                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.backgroundColor}
                                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اللون الأساسي
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.primaryColor}
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <FiSave />
                                {loading ? 'جاري الحفظ...' : 'حفظ ونشر'}
                            </button>
                            <button
                                type="button"
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <FiEye />
                                معاينة
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
