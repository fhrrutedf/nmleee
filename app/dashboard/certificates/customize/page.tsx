'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CertificatePreview from '@/components/CertificatePreview';
import { FiSave } from 'react-icons/fi';

export default function CertificateCustomizationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        brandColor: '#4f46e5',
        logoUrl: '',
        signatureUrl: '',
    });

    const [preview, setPreview] = useState({
        studentName: 'أحمد محمد',
        courseName: 'دورة تطوير الويب المتقدمة',
        instructorName: 'محمد علي',
        issueDate: new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        certificateNumber: 'CERT-20260212-SAMPLE',
    });

    const handleSave = async () => {
        // TODO: Save certificate template settings
        alert('سيتم حفظ إعدادات الشهادة');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">تخصيص تصميم الشهادة</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Settings Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">الإعدادات</h2>

                            <div className="space-y-4">
                                {/* Brand Color */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        لون العلامة التجارية
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.brandColor}
                                            onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.brandColor}
                                            onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Logo URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رابط الشعار (اختياري)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.logoUrl}
                                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Signature URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رابط التوقيع (اختياري)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.signatureUrl}
                                        onChange={(e) => setFormData({ ...formData, signatureUrl: e.target.value })}
                                        placeholder="https://example.com/signature.png"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Preview Data */}
                                <div className="pt-4 border-t">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">بيانات المعاينة</h3>

                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={preview.studentName}
                                            onChange={(e) => setPreview({ ...preview, studentName: e.target.value })}
                                            placeholder="اسم الطالب"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        />
                                        <input
                                            type="text"
                                            value={preview.courseName}
                                            onChange={(e) => setPreview({ ...preview, courseName: e.target.value })}
                                            placeholder="اسم الدورة"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        />
                                        <input
                                            type="text"
                                            value={preview.instructorName}
                                            onChange={(e) => setPreview({ ...preview, instructorName: e.target.value })}
                                            placeholder="اسم المدرب"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={handleSave}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <FiSave />
                                    حفظ الإعدادات
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">معاينة</h2>
                            <CertificatePreview
                                {...preview}
                                brandColor={formData.brandColor}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
