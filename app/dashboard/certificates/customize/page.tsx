'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CertificatePreview from '@/components/CertificatePreview';
import { FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import FileUploader from '@/components/ui/FileUploader';

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
        toast.success('سيتم حفظ إعدادات الشهادة قريباً');
    };

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-light py-8 px-4">
            <div className="max-w-7xl mx-auto pb-12">
                <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-white mb-8">تخصيص تصميم الشهادة</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Settings Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-card-white rounded-xl shadow-lg shadow-emerald-600/20 border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-emerald-600 dark:text-white mb-4">الإعدادات</h2>

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
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                        />
                                    </div>
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الشعار (اختياري)
                                    </label>
                                    {formData.logoUrl ? (
                                        <div className="relative group inline-block">
                                            <img src={formData.logoUrl} alt="شعار" className="h-20 object-contain rounded-lg border border-gray-200" />
                                            <button type="button" onClick={() => setFormData({ ...formData, logoUrl: '' })} className="absolute -top-2 -left-2 bg-red-500 text-white rounded-xl w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">✕</button>
                                        </div>
                                    ) : (
                                        <FileUploader
                                            onUploadSuccess={(urls) => { if (urls.length > 0) setFormData({ ...formData, logoUrl: urls[0] }); }}
                                            maxFiles={1}
                                            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg'] }}
                                            maxSize={5 * 1024 * 1024}
                                        />
                                    )}
                                </div>

                                {/* Signature Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        التوقيع (اختياري)
                                    </label>
                                    {formData.signatureUrl ? (
                                        <div className="relative group inline-block">
                                            <img src={formData.signatureUrl} alt="توقيع" className="h-16 object-contain rounded-lg border border-gray-200" />
                                            <button type="button" onClick={() => setFormData({ ...formData, signatureUrl: '' })} className="absolute -top-2 -left-2 bg-red-500 text-white rounded-xl w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">✕</button>
                                        </div>
                                    ) : (
                                        <FileUploader
                                            onUploadSuccess={(urls) => { if (urls.length > 0) setFormData({ ...formData, signatureUrl: urls[0] }); }}
                                            maxFiles={1}
                                            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg'] }}
                                            maxSize={5 * 1024 * 1024}
                                        />
                                    )}
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
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    <FiSave />
                                    حفظ الإعدادات
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-card-white rounded-xl shadow-lg shadow-emerald-600/20 border border-gray-100 dark:border-gray-800 p-4 sm:p-8">
                            <h2 className="text-lg font-bold text-emerald-600 dark:text-white mb-6">معاينة الشهادة</h2>
                            <div className="overflow-x-auto pb-4">
                                <div className="min-w-[600px] lg:min-w-0">
                                    <CertificatePreview
                                        {...preview}
                                        brandColor={formData.brandColor}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-text-muted mt-4 text-center italic">
                                * هذه معاينة تقريبية، قد يختلف الملف النهائي قليلاً عند التحميل كـ PDF.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
